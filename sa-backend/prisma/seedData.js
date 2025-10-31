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
  const funcionarioPass = await bcrypt.hash('funcpass', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@example.com', password: adminPass },
  });

  const funcionario = await prisma.user.create({
    data: { name: 'Funcionario', email: 'funcionario@example.com', password: funcionarioPass },
  });

  // create produtos
  const prod1 = await prisma.produto.create({ data: { 
    nome: 'Toyota Corolla', descricao: 'Sedan 2020', preco: '35000.00', estoque: 5, userId: admin.id,
    marca: 'Toyota', modelo: 'Corolla', cor: 'Branco', ano: 2020, kilometragem: 15000,
  } });
  const prod2 = await prisma.produto.create({ data: { 
    nome: 'Honda Civic', descricao: 'Sedan 2019', preco: '42000.00', estoque: 3, userId: admin.id,
    marca: 'Honda', modelo: 'Civic', cor: 'Cinza', ano: 2019, kilometragem: 20000,
  } });
  const prod3 = await prisma.produto.create({ data: { 
    nome: 'Ford Ka', descricao: 'Hatch 2018', preco: '25000.00', estoque: 2, userId: admin.id,
    marca: 'Ford', modelo: 'Ka', cor: 'Preto', ano: 2018, kilometragem: 30000,
  } });

  // create a pedido (order) for client buying prod1 and prod3
  const pedido = await prisma.pedidos.create({ data: { 
    valor: '90000.00', 
    status: 'finalizado', 
    userId: funcionario.id,
    quantidade: 3,
    configuracao: {
      marca: 'Volkswagen',
      modelo: 'Gol',
      cor: 'Vermelho',
      ano: 2017,
      kilometragem: 45000,
    }
  } });

  // Para refletir a lógica de "finalizado" enviando ao estoque, faça um upsert no produto conforme a configuracao
  const { marca, modelo, cor, ano, kilometragem } = pedido.configuracao;
  const existente = await prisma.produto.findFirst({ where: { marca, modelo, cor, ano, kilometragem } });
  if (existente) {
    await prisma.produto.update({ where: { id: existente.id }, data: { estoque: existente.estoque + pedido.quantidade } });
  } else {
    await prisma.produto.create({ data: {
      nome: `${marca} ${modelo}`.trim(),
      descricao: `${marca} ${modelo} ${cor}`.trim(),
      preco: Number(pedido.valor) / Number(pedido.quantidade || 1),
      estoque: pedido.quantidade,
      marca, modelo, cor, ano, kilometragem,
      status: 'Disponivel',
      userId: admin.id,
    }});
  }

  console.log('Seed complete:');
  console.log('  users:', { admin: admin.email, funcionario: funcionario.email });
  console.log('  passwords: adminpass / funcpass');
  console.log('  produtos:', [prod1.nome, prod2.nome, prod3.nome]);
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
