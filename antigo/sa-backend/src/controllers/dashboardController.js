import prisma from '../prisma.js';

export const getSummary = async (req, res) => {
  try {
    const totalProdutos = await prisma.produto.count();
    const pedidosEmAndamento = await prisma.pedidos.findMany({
      where: { status: { in: ['pendente', 'andamento'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        pedidosProdutos: { include: { produto: { select: { id: true, nome: true, preco: true } } } },
      },
      take: 20,
    });

    const totalPedidosEmAndamento = pedidosEmAndamento.length;

    return res.json({ totalProdutos, totalPedidosEmAndamento, pedidosEmAndamento });
  } catch (error) {
    console.error('Erro ao obter summary do dashboard:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
