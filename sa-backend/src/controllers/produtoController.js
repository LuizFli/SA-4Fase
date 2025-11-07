import { prismaClient } from "../../prisma/prisma.js";
import { verifyAccess } from "../utils/jwt.js";

const produtoColumns = {
  MARCA: "marca",
  MODELO: "modelo",
  ANO: "ano",
  COR: "cor",
  MOTOR: "motor",
  CAMBIO: "cambio",
  PRECO: "preco",
  BLOCO: "bloco",
  ESTOQUE: "estoque",
  STATUS: "status",
};

export const createProduto = async (req, res) => {
  const { body } = req;
  const token = req?.headers?.authorization?.slice("Bearer ".length);
  const payload = verifyAccess(token || "");
  try {
    const produto = await prismaClient.produto.create({
      data: {
        ...body,
        userId: payload.userId,
      },
    });

    res.status(201).json(produto);
  } catch (error) {
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const listProdutos = async (_, res) => {
  try {
    const pedidos = await prismaClient.produto.findMany();
    res.json(pedidos);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const listProdutoById = async (req, res) => {
  try {
    const { params } = req;

    const produto = await prismaClient.produto.findUnique({
      where: {
        id: Number(params.id),
      },
    });

    if (!produto) {
      return res.status(404).json({
        message: "Produto não existe no banco de dados.",
      });
    }

    return res.json(produto);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const updateProduto = async (req, res) => {
  try {
    const { params, body } = req;
    const bodyKeys = Object.keys(body);
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    for (const key of bodyKeys) {
      if (
        key !== produtoColumns.PRECO &&
        key !== produtoColumns.MARCA &&
        key !== produtoColumns.MODELO &&
        key !== produtoColumns.ANO &&
        key !== produtoColumns.CAMBIO &&
        key !== produtoColumns.MOTOR &&
        key !== produtoColumns.COR &&
        key !== produtoColumns.ESTOQUE &&
        key !== produtoColumns.STATUS
      )
        return res.status(404).send("Colunas não existentes");
    }
    const produtoToUpdated = await prismaClient.produto.findUnique({
      where: {
        id: Number(params.id),
      },
    });
    if (produtoToUpdated?.userId !== payload.userId) {
      return res.status(403).send("Produto não pertence ao usuário");
    }
    const produto = await prismaClient.produto.update({
      where: { id: Number(params.id) },
      data: {
        ...body,
      },
    });
    return res.status(200).json({
      message: "Produto atualizado!",
      data: produto,
    });
  } catch (error) {
    if (error && error.code == "P2025") {
      res.status(404).send("Produto não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const deleteProduto = async (req, res) => {
  try {
    const { params } = req;
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    const produtoToDelete = await prismaClient.produto.findUnique({
      where: {
        id: Number(params.id),
      },
    });
    if (produtoToDelete?.userId !== payload.userId) {
      return res.status(403).send("Produto não pertence ao usuário");
    }
    await prismaClient.produto.delete({
      where: {
        id: Number(params.id),
      },
    });
    res.status(200).send("Produto deletado com sucesso!");
  } catch (error) {
    if (error && error.code == "P2025") {
      res.status(404).send("Produto não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

// Reabastecer produtos: incrementa o estoque dos produtos informados
// Body esperado:
// { produtos: [{ id: number, quantidade: number }, ...] }
export const restockProdutos = async (req, res) => {
  try {
    const { produtos } = req.body || {};
    if (!Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).send("Informe a lista de produtos para reabastecer.");
    }

    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");

    // Normaliza e valida entrada
    const itens = [];
    for (const p of produtos) {
      const id = Number(p?.id);
      const quantidade = Math.max(1, Number(p?.quantidade || p?.qtd || 0));
      if (!Number.isFinite(id) || !Number.isFinite(quantidade) || quantidade <= 0) {
        return res.status(400).send("Itens inválidos. Use { id, quantidade } com valores numéricos.");
      }
      itens.push({ id, quantidade });
    }

    // Busca produtos e verifica propriedade do usuário
    const ids = itens.map((i) => i.id);
    const produtosDb = await prismaClient.produto.findMany({ where: { id: { in: ids } } });
    if (produtosDb.length !== ids.length) {
      return res.status(404).send("Um ou mais produtos não foram encontrados.");
    }
    for (const prod of produtosDb) {
      if (prod.userId !== payload.userId) {
        return res.status(403).send("Um ou mais produtos não pertencem ao usuário.");
      }
    }

    // Aplica incremento de estoque com transação
    const resultados = await prismaClient.$transaction(
      itens.map((item) =>
        prismaClient.produto.update({
          where: { id: item.id },
          data: { estoque: { increment: item.quantidade } },
        })
      )
    );

    return res.status(200).json({
      message: "Reabastecimento concluído.",
      data: resultados,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Erro no servidor: ${error}`);
  }
};

// Lista enxuta para popular selects no front
// GET /produtos/select?q=texto&status=ativo&disponiveis=true
export const listProdutosSelect = async (req, res) => {
  try {
    const { q, status, disponiveis } = req.query || {};

    const where = {};
    if (status) where.status = String(status);
    if (String(disponiveis).toLowerCase() === "true") {
      where.estoque = { gt: 0 };
    }
    if (q && String(q).trim().length > 0) {
      where.OR = [
        { marca: { contains: String(q), mode: "insensitive" } },
        { modelo: { contains: String(q), mode: "insensitive" } },
      ];
    }

    const produtos = await prismaClient.produto.findMany({
      where,
      select: { id: true, marca: true, modelo: true, estoque: true, preco: true, status: true },
      orderBy: [{ marca: "asc" }, { modelo: "asc" }],
    });

    return res.json(produtos);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Erro no servidor: ${error}`);
  }
};
