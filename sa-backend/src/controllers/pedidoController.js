import prisma from '../prisma.js';
import { verifyAccess } from '../utils/jwt.js';
import { simuladorService } from '../services/simuladorServices.js';

// Função para extrair o ID do usuário do token
const getUserIdFromToken = (req) => {
  const hdr = req.headers && req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) return null;

  try {
    const token = hdr.slice('Bearer '.length);
    const payload = verifyAccess(token);
    // payload uses 'id' for user identifier in this project
    return payload?.id || null;
  } catch (err) {
    return null;
  }
};

export const listPedidos = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Buscar apenas os pedidos do usuário autenticado
    const pedidos = await prisma.pedidos.findMany({
      where: { userId: userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        pedidosProdutos: { include: { produto: { select: { id: true, nome: true, descricao: true, preco: true, status: true, estoque: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ error: 'Token inválido ou expirado' });
    if (!id || isNaN(Number(id))) return res.status(400).json({ error: 'ID do pedido deve ser um número válido' });

    const pedido = await prisma.pedidos.findUnique({ where: { id: Number(id) }, include: { user: { select: { id: true, name: true, email: true } }, pedidosProdutos: { include: { produto: { select: { id: true, nome: true, descricao: true, preco: true, status: true, estoque: true } } } } } });

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (pedido.userId !== userId) return res.status(403).json({ error: 'Acesso negado: você só pode visualizar seus próprios pedidos' });

    return res.json(pedido);
  } catch (error) {
    console.error('Erro ao listar pedido por ID:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createPedido = async (req, res) => {
  const { body } = req;
  const { produtos, ...dados } = body;
  try {
    const token = req?.headers?.authorization?.slice('Bearer '.length);
    const payload = verifyAccess(token || '');

    // validar produtos recebido
    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ error: 'Campo "produtos" deve ser um array de ids' });
    }

    // buscar produtos do pedido no banco
    const produtosDb = await prisma.produto.findMany({ where: { id: { in: produtos.map(Number) } } });
    if (!produtosDb || produtosDb.length === 0) {
      return res.status(400).json({ error: 'Nenhum produto encontrado para os ids fornecidos' });
    }

    // calcular valor total simples (soma dos preços)
    const valorTotal = produtosDb.reduce((acc, p) => acc + Number(p.preco), 0);

    // criar registro de pedido
    const pedido = await prisma.pedidos.create({
      data: {
        ...dados,
        valor: valorTotal,
        status: dados.status || 'pendente',
        userId: payload.id,
      },
    });

    // criar itens de pedido (pedidosProdutos)
    const itens = produtosDb.map((produto) => ({
      pedidoId: pedido.id,
      produtoId: produto.id,
      quantidade: 1,
      precoUnitario: produto.preco,
    }));

    // usar createMany para inserir os itens
    await prisma.pedidosProdutos.createMany({ data: itens });

    // buscar o pedido com os produtos incluídos para retorno
    const pedidoWithItems = await prisma.pedidos.findUnique({
      where: { id: pedido.id },
      include: { pedidosProdutos: { include: { produto: true } }, user: { select: { id: true, name: true, email: true } } },
    });

    const resultado = await simuladorService.enviarPedidoParaFila(pedidoWithItems);
    if (!resultado) return res.status(400).send('Erro ao enviar para o simulador/bancada');

    console.log('Enviado para simulador/bancada com sucesso!');
    res.status(201).json(pedidoWithItems);
  } catch (error) {
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, status } = req.body;
    const userId = getUserIdFromToken(req);

    if (!id || isNaN(Number(id))) return res.status(400).json({ error: 'ID do pedido deve ser um número válido' });
    if (!userId) return res.status(401).json({ error: 'Token inválido ou expirado' });

    const existingPedido = await prisma.pedidos.findUnique({ where: { id: Number(id) } });
    if (!existingPedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (existingPedido.userId !== userId) return res.status(403).json({ error: 'Acesso negado: você só pode alterar pedidos que você criou' });

    const updateData = {};
    if (valor !== undefined) updateData.valor = Number(valor);
    if (status !== undefined) updateData.status = status;

    const pedidoAtualizado = await prisma.pedidos.update({ where: { id: Number(id) }, data: updateData, include: { user: { select: { id: true, name: true, email: true } } } });

    return res.json({ message: 'Pedido atualizado com sucesso', data: pedidoAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    if (!id || isNaN(Number(id))) return res.status(400).json({ error: 'ID do pedido deve ser um número válido' });
    if (!userId) return res.status(401).json({ error: 'Token inválido ou expirado' });

    const existingPedido = await prisma.pedidos.findUnique({ where: { id: Number(id) } });
    if (!existingPedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (existingPedido.userId !== userId) return res.status(403).json({ error: 'Acesso negado: você só pode remover pedidos que você criou' });

    await prisma.pedidos.delete({ where: { id: Number(id) } });

    return res.json({ message: 'Pedido removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Método especial para a API do professor atualizar status para concluído
export const updatePedidoStatus = async (req, res) => {
  try {
    const { query } = req;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) return res.status(400).json({ error: 'ID do pedido deve ser um número válido' });

    const existingPedido = await prisma.pedidos.findUnique({ where: { id: Number(id) } });
    if (!existingPedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    const pedidoConcluido = await prisma.pedidos.update({
      where: { id: Number(id) },
      data: { status: String(query.status) || 'pendente', updatedAt: new Date() },
      include: {
        user: { select: { id: true, name: true, email: true } },
        pedidosProdutos: { include: { produto: { select: { id: true, nome: true, descricao: true, preco: true, status: true, estoque: true } } } },
      },
    });

    return res.json({ message: 'Pedido marcado como concluído com sucesso', data: pedidoConcluido });
  } catch (error) {
    console.error('Erro ao concluir pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

