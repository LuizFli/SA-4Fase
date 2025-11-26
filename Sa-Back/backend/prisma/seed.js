import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (order matters due to FKs)
  await prisma.produtosEmPedidos.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  // Reset Auto Increment counters (MySQL specific)
  await prisma.$queryRaw`ALTER TABLE pedido AUTO_INCREMENT = 1`;
  await prisma.$queryRaw`ALTER TABLE produto AUTO_INCREMENT = 1`;
  await prisma.$queryRaw`ALTER TABLE token AUTO_INCREMENT = 1`;
  await prisma.$queryRaw`ALTER TABLE user AUTO_INCREMENT = 1`;

  // Users
  const passwordHash = await bcrypt.hash("123456", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@salesight.com",
      password: passwordHash,
      cargo: "Administrador",
      fone: "(11) 98765-4321",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "User",
      email: "user@example.com",
      password: passwordHash,
      cargo: "Usuario",
      fone: "(48) 98754-2831",
    },
  });

  // Produtos (based on src/utils/teste.ts)
  const produtosSeed = [
    {
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2022,
      cor: "Prata",
      motor: "2.0 Flex",
      cambio: "CVT",
      preco: new Prisma.Decimal("115000"),
      status: "DISPONIVEL",
      bloco: { cor: 1, lamina1: 1, lamina2: 2, lamina3: 3, padrao1: "A1", padrao2: "B1", padrao3: "C1" },
      estoque: 5,
      userId: admin.id,
    },
    {
      marca: "Honda",
      modelo: "Civic",
      ano: 2021,
      cor: "Preto",
      motor: "1.5 Turbo",
      cambio: "Automático",
      preco: new Prisma.Decimal("120000"),
      status: "DISPONIVEL",
      bloco: { cor: 1, lamina1: 5, lamina2: 4, lamina3: 3, padrao1: "D1", padrao2: "E1", padrao3: "F1" },
      estoque: 3,
      userId: admin.id,
    },
    {
      marca: "Chevrolet",
      modelo: "Onix",
      ano: 2023,
      cor: "Branco",
      motor: "1.0 Turbo",
      cambio: "Manual",
      preco: new Prisma.Decimal("85000"),
      status: "DISPONIVEL",
      bloco: { cor: 1, lamina1: 3, lamina2: 1, lamina3: 5, padrao1: "G1", padrao2: "H1", padrao3: "I1" },
      estoque: 8,
      userId: admin.id,
    },
    {
      marca: "Volkswagen",
      modelo: "Virtus",
      ano: 2022,
      cor: "Azul",
      motor: "1.6 MSI",
      cambio: "Automático",
      preco: new Prisma.Decimal("99000"),
      status: "DISPONIVEL",
      bloco: { cor: 1, lamina1: 2, lamina2: 4, lamina3: 1, padrao1: "J1", padrao2: "K1", padrao3: "L1" },
      estoque: 4,
      userId: admin.id,
    },
    {
      marca: "Hyundai",
      modelo: "HB20",
      ano: 2023,
      cor: "Vermelho",
      motor: "1.0 Flex",
      cambio: "Manual",
      preco: new Prisma.Decimal("78000"),
      status: "DISPONIVEL",
      bloco: { cor: 2, lamina1: 2, lamina2: 4, lamina3: 1, padrao1: "M2", padrao2: "N2", padrao3: "O2" },
      estoque: 10,
      userId: admin.id,
    },
  ];

  const createdProdutos = await prisma.$transaction(
    produtosSeed.map((p) => prisma.produto.create({ data: p }))
  );

  
  

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
