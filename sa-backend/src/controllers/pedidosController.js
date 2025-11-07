import { prismaClient } from "../../prisma/prisma.js";
import { verifyAccess } from "../utils/jwt.js";
import { simuladorService } from "../services/simuladorService.js";

const pedidoColumns = {
  VALOR: "valor",
  STATUS: "status",
  USER_ID: "userId",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

export const createPedido = async (req, res) => {
  const { body } = req;
  const { produtos, ...dados } = body;
  try {
    // TO-DO -> ARMAZENAR DADOS DO USUARIO EM FORMATO DE CACHE OU ALGO PARECIDO
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    // Normaliza produtos aceitando:
    // - Array de IDs (com duplicados para representar quantidade)
    // - Array de objetos { id, quantidade }
    if (!Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).send("Lista de produtos inválida.");
    }

    const quantidadePorProduto = new Map();
    for (const item of produtos) {
      if (typeof item === "number") {
        quantidadePorProduto.set(item, (quantidadePorProduto.get(item) || 0) + 1);
      } else if (item && typeof item === "object") {
        const id = Number(item.id);
        const qtd = Math.max(1, Number(item.quantidade || item.qtd || 1));
        if (Number.isFinite(id)) {
          quantidadePorProduto.set(id, (quantidadePorProduto.get(id) || 0) + qtd);
        }
      }
    }

    if (quantidadePorProduto.size === 0) {
      return res.status(400).send("Nenhum produto válido informado.");
    }

    const idsUnicos = Array.from(quantidadePorProduto.keys());
    // buscar produtos do pedido no banco (apenas únicos)
    const produtosDb = await prismaClient.produto.findMany({
      where: { id: { in: idsUnicos } },
    });

    if (produtosDb.length !== idsUnicos.length) {
      return res.status(400).send("Um ou mais produtos não foram encontrados.");
    }
    const pedido = await prismaClient.pedido.create({
      data: {
        ...dados,
        userId: payload.userId,
      }
    });

    for (const produto of produtosDb) {
      const quantidade = quantidadePorProduto.get(produto.id) || 1;
      await prismaClient.produtosEmPedidos.create({
        data: {
          id_pedido: pedido.id,
          id_produto: produto.id,
          quantidade,
        },
      });
    }

    // Expande os produtos para a fila replicando conforme a quantidade
    const produtosParaFila = [];
    for (const produto of produtosDb) {
      const quantidade = quantidadePorProduto.get(produto.id) || 1;
      for (let i = 0; i < quantidade; i++) {
        produtosParaFila.push(produto);
      }
    }

    const resultado = await simuladorService.enviarPedidoParaFila(pedido, produtosParaFila);
    if (!resultado) {
      res.status(400).send("Erro ao enviar para o simulador/bancada");
    }
    console.log("Enviado para simulador/bancada com sucesso!");
    res.status(201).json(pedido);
  } catch (error) {
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const listPedidos = async (req, res) => {
  try {
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    const pedidos = await prismaClient.pedido.findMany({
      where: {
        userId: payload.userId,
      },
      include: {
        produto: true,
        produtosEmPedidos: {
          include: { produto: true },
        },
      },
    });
    res.json(pedidos);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const listPedidoById = async (req, res) => {
  try {
    const { params } = req;

    const pedido = await prismaClient.pedido.findUnique({
      where: {
        id: Number(params.id),
      },
      include: {
        produto: true,
        produtosEmPedidos: {
          include: { produto: true },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        message: "Pedido não existe no banco de dados.",
      });
    }

    return res.json(pedido);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const updatePedido = async (req, res) => {
  try {
    const { params, body } = req;
    const bodyKeys = Object.keys(body);
    for (const key of bodyKeys) {
      if (
        key !== pedidoColumns.VALOR &&
        key !== pedidoColumns.STATUS &&
        key !== pedidoColumns.USER_ID &&
        key !== pedidoColumns.CREATED_AT &&
        key !== pedidoColumns.UPDATED_AT
      )
        return res.status(404).send("Colunas não existentes");
    }
    const pedido = await prismaClient.pedido.update({
      where: { id: Number(params.id) },
      data: {
        ...body,
      },
    });
    return res.status(200).json({
      message: "Pedido atualizado!",
      data: pedido,
    });
  } catch (error) {
    if (error && error.code == "P2025") {
      res.status(404).send("Pedido não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const deletePedido = async (req, res) => {
  try {
    const { params } = req;
    await prismaClient.pedido.delete({
      where: {
        id: Number(params.id),
      },
    });
    res.status(200).send("Pedido deletado com sucesso!");
  } catch (error) {
    if (error && error.code == "P2025") {
      res.status(404).send("Pedido não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const updateStatus = async (req, res) => {
  const { params, query } = req;
  try {
    const pedidoUpdate = await prismaClient.pedido.update({
      where: { id: Number(params.id) },
      data: {
        status: String(query.status) || "",
      },
    });

    return res.status(200).json({
      message: "Pedido atualizado!",
      data: pedidoUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
