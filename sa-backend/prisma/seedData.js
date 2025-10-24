import prisma from '../src/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database (prisma)...');

  // Delete in dependency order
  await prisma.pedidosProdutos.deleteMany();
  await prisma.pedidos.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash('adminpass', 10);
  const clientPass = await bcrypt.hash('clientpass', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@example.com', password: adminPass },
  });

  const client = await prisma.user.create({
    data: { name: 'Client', email: 'client@example.com', password: clientPass },
  });

  // create produtos
  const prod1 = await prisma.produto.create({ data: { nome: 'Toyota Corolla', descricao: 'Sedan 2020', preco: '35000.00', estoque: 5, userId: admin.id } });
  const prod2 = await prisma.produto.create({ data: { nome: 'Honda Civic', descricao: 'Sedan 2019', preco: '42000.00', estoque: 3, userId: admin.id } });
  const prod3 = await prisma.produto.create({ data: { nome: 'Ford Ka', descricao: 'Hatch 2018', preco: '25000.00', estoque: 2, userId: client.id } });

  // create a pedido (order) for client buying prod1 and prod3
  const pedido = await prisma.pedidos.create({ data: { valor: '60000.00', status: 'PENDENTE', userId: client.id } });

  await prisma.pedidosProdutos.createMany({ data: [
    { pedidoId: pedido.id, produtoId: prod1.id, quantidade: 1, precoUnitario: '35000.00' },
    { pedidoId: pedido.id, produtoId: prod3.id, quantidade: 1, precoUnitario: '25000.00' },
  ]});

  console.log('Seed complete:');
  console.log('  users:', { admin: admin.email, client: client.email });
  console.log('  passwords: adminpass / clientpass');
  console.log('  produtos:', [prod1.nome, prod2.nome, prod3.nome]);
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
