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

// Status internos aceitos no banco
const INTERNAL_STATUS = {
  PENDENTE: 'PENDENTE',
  EM_PROCESSO: 'EM_PROCESSO',
  FINALIZADO: 'FINALIZADO',
  ERRO: 'ERRO'
};

// Mapeia respostas externas do simulador para status internos
function normalizeExternalStatus(raw) {
  const v = String(raw || '').trim().toUpperCase();
  switch (v) {
    case 'QUEUED':
    case 'PENDING':
      return INTERNAL_STATUS.PENDENTE;
    case 'PROCESSING':
    case 'EM_PROCESSO':
    case 'EM_PROCESSAMENTO':
      return INTERNAL_STATUS.EM_PROCESSO;
    case 'COMPLETED':
    case 'FINALIZADO':
    case 'DONE':
      return INTERNAL_STATUS.FINALIZADO;
    case 'FAILED':
    case 'ERROR':
    case 'ERRO':
      return INTERNAL_STATUS.ERRO;
    default:
      // Desconhecido: mantém como PENDENTE se vazio, senão ERRO para sinalizar
      return v === '' ? INTERNAL_STATUS.PENDENTE : INTERNAL_STATUS.ERRO;
  }
}

// Incrementa o estoque dos produtos vinculados ao pedido
async function incrementarEstoqueDoPedido(prisma, pedidoId) {
  const itens = await prisma.produtosEmPedidos.findMany({
    where: { id_pedido: Number(pedidoId) },
  });
  for (const it of itens) {
    await prisma.produto.update({
      where: { id: it.id_produto },
      data: { estoque: { increment: 1 } },
    });
  }
}

export const pedidoStatus = async (req, res) => {
  const { params, query } = req;
  try {
    // Buscar o pedido pelo ID (pedidoId vindo da aplicação)
    const pedido = await prismaClient.pedido.findUnique({
      where: { id: Number(params.id) },
    });
    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }
    if (!pedido.idfila) {
      return res.status(409).json({ message: "Pedido ainda não possui idfila" });
    }

    // Consultar status na fila usando idfila salvo no pedido
    const resultado = await simuladorService.consultarStatusFila(pedido.idfila);
    const novoStatus = resultado?.status ? normalizeExternalStatus(resultado.status) : null;
    if (!novoStatus) {
      return res.status(502).json({ message: "Resposta do simulador sem status" });
    }

    // Atualizar somente se mudou
    let pedidoAtualizado = pedido;
    if (pedido.status !== novoStatus) {
      // Se está finalizando agora, incrementa estoque dos produtos do pedido
      if (novoStatus === INTERNAL_STATUS.FINALIZADO) {
        pedidoAtualizado = await prismaClient.$transaction(async (tx) => {
          await incrementarEstoqueDoPedido(tx, pedido.id);
          return tx.pedido.update({
            where: { id: pedido.id },
            data: { status: novoStatus },
          });
        });
      } else {
        pedidoAtualizado = await prismaClient.pedido.update({
          where: { id: pedido.id },
          data: { status: novoStatus },
        });
      }
    }

    return res.status(200).json({ status: pedidoAtualizado.status, idfila: pedidoAtualizado.idfila });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao consultar status", error: String(error) });
  }
};

export const createPedido = async (req, res) => {
  const { body } = req;
  const { produtos, ...dados } = body;
  try {
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    const userId = payload?.userId ?? payload?.id;
    if (!userId) {
      return res.status(401).json({ error: "Token sem userId. Faça login novamente." });
    }
    const produtosDb = await prismaClient.produto.findMany({
      where: { id: { in: produtos } },
    });
    const pedido = await prismaClient.pedido.create({
      data: {
        ...dados,
        userId: userId,
      },
    });

    for (const produto of produtosDb) {
      await prismaClient.produtosEmPedidos.create({
        data: {
          id_pedido: pedido.id,
          id_produto: produto.id,
        },
      });
    }
    const resultado = await simuladorService.enviarPedidoParaFila(
      pedido,
      produtosDb
    );  
    try {
      const queueId = resultado?.data?.id ?? resultado?.id;
      if (queueId) {
        await prismaClient.pedido.update({
          where: { id: pedido.id },
          data: { idfila: String(queueId) },
        });
      }
    } catch (_) {
      // Se falhar em atualizar idfila, não quebra a criação do pedido
    }
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
        // Tenta carregar relação direta (caso o schema suporte)
        produto: true,
        // E também a relação explícita via tabela de junção
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
    if (error && error.code === "P2025") {
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
    if (error && error.code === "P2025") {
      res.status(404).send("Pedido não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const updateStatus = async (req, res) => {
  const { params, query, body } = req;
  try {
    // Accept status from body, nested payload, or query for flexibility
    const incomingStatus =
      body?.status || body?.payload?.status || query?.status || "";
    if (!incomingStatus) {
      return res.status(400).json({ message: "Status não informado" });
    }
    const statusNormalized = normalizeExternalStatus(incomingStatus);

    const pedidoAtual = await prismaClient.pedido.findUnique({
      where: { id: Number(params.id) },
    });
    if (!pedidoAtual) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    let pedidoUpdate;
    if (
      pedidoAtual.status !== INTERNAL_STATUS.FINALIZADO &&
      statusNormalized === INTERNAL_STATUS.FINALIZADO
    ) {
      // Transição para FINALIZADO: incrementa estoque e atualiza status
      pedidoUpdate = await prismaClient.$transaction(async (tx) => {
        await incrementarEstoqueDoPedido(tx, pedidoAtual.id);
        return tx.pedido.update({
          where: { id: pedidoAtual.id },
          data: { status: statusNormalized },
        });
      });
    } else {
      // Outras mudanças de status
      pedidoUpdate = await prismaClient.pedido.update({
        where: { id: Number(params.id) },
        data: {
          status: statusNormalized,
        },
      });
    }

    return res.status(200).json({
      message: "Pedido atualizado!",
      data: pedidoUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
