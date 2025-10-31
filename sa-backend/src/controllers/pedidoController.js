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

export const listPedidosEmAndamento = async (req, res) => {
  try {
    // Lista pedidos com status pendente/andamento para dashboard/visão geral
    const pedidos = await prisma.pedidos.findMany({
      where: { status: { in: ['pendente', 'andamento'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        pedidosProdutos: { include: { produto: { select: { id: true, nome: true, preco: true } } } },
      },
    });

    return res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos em andamento:', error);
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
  const { produtos, configuracao, quantidade = 1, ...dados } = body;
  try {
    const token = req?.headers?.authorization?.slice('Bearer '.length);
    const payload = verifyAccess(token || '');

    let pedidoCreated = null;
    // Caso 1: Pedido baseado em produtos existentes (produtos = [ids])
  if (Array.isArray(produtos) && produtos.length > 0) {
      const produtosDb = await prisma.produto.findMany({ where: { id: { in: produtos.map(Number) } } });
      if (!produtosDb || produtosDb.length === 0) {
        return res.status(400).json({ error: 'Nenhum produto encontrado para os ids fornecidos' });
      }

      const valorTotal = produtosDb.reduce((acc, p) => acc + Number(p.preco), 0);

      const pedido = await prisma.pedidos.create({
        data: {
          ...dados,
          valor: valorTotal,
          status: String(dados.status || 'pendente'),
          userId: payload.id,
          configuracao: configuracao ? configuracao : undefined,
          quantidade: Number(quantidade) || 1,
        },
      });

      const itens = produtosDb.map((produto) => ({ pedidoId: pedido.id, produtoId: produto.id, quantidade: 1, precoUnitario: produto.preco }));
      await prisma.pedidosProdutos.createMany({ data: itens });

      pedidoCreated = await prisma.pedidos.findUnique({ where: { id: pedido.id }, include: { pedidosProdutos: { include: { produto: true } }, user: { select: { id: true, name: true, email: true } } } });
    } else {
      // Caso 2: Pedido customizado por configuracao (marca, modelo, cor, cambio, etc.)
      if (!configuracao || typeof configuracao !== 'object') {
        return res.status(400).json({ error: 'Informe "configuracao" com as opções do veículo ou a lista "produtos"' });
      }

      pedidoCreated = await prisma.pedidos.create({
        data: {
          ...dados,
          valor: Number(dados.valor || 0),
          status: String(dados.status || 'pendente'),
          userId: payload.id,
          configuracao,
          quantidade: Number(quantidade) || 1,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    }

    const resultado = await simuladorService.enviarPedidoParaFila(pedidoCreated);
    if (!resultado) return res.status(400).send('Erro ao enviar para o simulador/bancada');

    console.log('Enviado para simulador/bancada com sucesso!');
    res.status(201).json(pedidoCreated);
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

    // Se o pedido foi finalizado e ainda não enviado ao estoque, transfere para produtos/estoque
    if ((status || pedidoAtualizado.status)?.toLowerCase() === 'finalizado') {
      const pedido = await prisma.pedidos.findUnique({ where: { id: Number(id) } });
      if (pedido && !pedido.enviadoAoEstoque) {
        const qtd = Number(pedido.quantidade || 1);
        // Preferir configuracao para criar/abastecer produto
        if (pedido.configuracao && typeof pedido.configuracao === 'object') {
          const { marca, modelo, cor, ano, kilometragem } = pedido.configuracao;
          const nome = [marca, modelo].filter(Boolean).join(' ') || 'Veículo';
          const precoUnit = pedido.valor && qtd > 0 ? Number(pedido.valor) / qtd : 0;

          // Procurar produto existente com mesmas características
          const existente = await prisma.produto.findFirst({
            where: {
              marca: marca ?? null,
              modelo: modelo ?? null,
              cor: cor ?? null,
              ano: ano ?? null,
              kilometragem: kilometragem ?? null,
            },
          });

          if (existente) {
            await prisma.produto.update({ where: { id: existente.id }, data: { estoque: existente.estoque + qtd } });
          } else {
            await prisma.produto.create({
              data: {
                nome,
                descricao: `${marca ?? ''} ${modelo ?? ''} ${cor ?? ''}`.trim(),
                preco: precoUnit,
                estoque: qtd,
                marca: marca ?? null,
                modelo: modelo ?? null,
                cor: cor ?? null,
                ano: ano ?? null,
                kilometragem: kilometragem ?? null,
                status: 'Disponivel',
                userId: userId,
              },
            });
          }

          await prisma.pedidos.update({ where: { id: Number(id) }, data: { enviadoAoEstoque: true } });
        }
      }
    }

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

    // Se finalizado via API externa, processar envio ao estoque
    if ((String(query.status) || '').toLowerCase() === 'finalizado') {
      const pedido = await prisma.pedidos.findUnique({ where: { id: Number(id) } });
      if (pedido && !pedido.enviadoAoEstoque && pedido.configuracao) {
        const qtd = Number(pedido.quantidade || 1);
        const { marca, modelo, cor, ano, kilometragem } = pedido.configuracao;
        const nome = [marca, modelo].filter(Boolean).join(' ') || 'Veículo';
        const precoUnit = pedido.valor && qtd > 0 ? Number(pedido.valor) / qtd : 0;

        const existente = await prisma.produto.findFirst({
          where: {
            marca: marca ?? null,
            modelo: modelo ?? null,
            cor: cor ?? null,
            ano: ano ?? null,
            kilometragem: kilometragem ?? null,
          },
        });

        if (existente) {
          await prisma.produto.update({ where: { id: existente.id }, data: { estoque: existente.estoque + qtd } });
        } else {
          await prisma.produto.create({
            data: {
              nome,
              descricao: `${marca ?? ''} ${modelo ?? ''} ${cor ?? ''}`.trim(),
              preco: precoUnit,
              estoque: qtd,
              marca: marca ?? null,
              modelo: modelo ?? null,
              cor: cor ?? null,
              ano: ano ?? null,
              kilometragem: kilometragem ?? null,
              status: 'Disponivel',
              userId: existingPedido.userId,
            },
          });
        }

        await prisma.pedidos.update({ where: { id: Number(id) }, data: { enviadoAoEstoque: true } });
      }
    }

    return res.json({ message: 'Pedido marcado como concluído com sucesso', data: pedidoConcluido });
  } catch (error) {
    console.error('Erro ao concluir pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

