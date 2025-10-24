import prisma from '../prisma.js';
import { verifyAccess } from '../utils/jwt.js';

// Função para extrair o ID do usuário do token
const getUserIdFromToken = (req) => {
  const hdr = req.headers && req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) return null;

  try {
    const token = hdr.slice('Bearer '.length);
    const payload = verifyAccess(token);
    return payload?.userId || payload?.id || null;
  } catch (err) {
    return null;
  }
};

export const createProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, status } = req.body;
    const userId = getUserIdFromToken(req);

    // Debug: log dos dados recebidos
    console.log("Dados recebidos:", req.body);
    console.log("nome:", nome, "type:", typeof nome);
    console.log("preco:", preco, "type:", typeof preco);
    console.log("estoque:", estoque, "type:", typeof estoque);

    if (!userId) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    // Validação mais específica dos campos obrigatórios
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (preco === undefined || preco === null || preco === '' || isNaN(Number(preco))) {
      return res.status(400).json({ error: "Preço é obrigatório e deve ser um número válido" });
    }

    if (estoque === undefined || estoque === null || estoque === '' || isNaN(Number(estoque))) {
      return res.status(400).json({ error: "Estoque é obrigatório e deve ser um número válido" });
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao: descricao || null,
        preco: Number(preco),
        estoque: Number(estoque),
        status: status || "Disponivel",
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Produto criado com sucesso",
      data: produto,
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const listProdutos = async (_, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const listProdutoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "ID do produto deve ser um número válido" });
    }

    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque, status } = req.body;
    const userId = getUserIdFromToken(req);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "ID do produto deve ser um número válido" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    const existingProduto = await prisma.produto.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    if (existingProduto.userId !== userId) {
      return res.status(403).json({ 
        error: "Acesso negado: você só pode alterar produtos que você criou" 
      });
    }

  const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (preco !== undefined) updateData.preco = Number(preco);
    if (estoque !== undefined) updateData.estoque = Number(estoque);
    if (status !== undefined) updateData.status = status;

    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      message: "Produto atualizado com sucesso",
      data: produto,
    });
  } catch (error) {
    if (error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "ID do produto deve ser um número válido" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    const existingProduto = await prisma.produto.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    if (existingProduto.userId !== userId) {
      return res.status(403).json({ 
        error: "Acesso negado: você só pode remover produtos que você criou" 
      });
    }

    await prisma.produto.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    if (error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};