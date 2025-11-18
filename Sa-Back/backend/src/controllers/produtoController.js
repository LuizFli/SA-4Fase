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

export const listProdutos = async (req, res) => {
  try {
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    const produtos = await prismaClient.produto.findMany({
      where: { userId: payload.userId },
    });
    res.json(produtos);
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
    if (error && error.code === "P2025") {
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
    if (error && error.code === "P2025") {
      res.status(404).send("Produto não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};
