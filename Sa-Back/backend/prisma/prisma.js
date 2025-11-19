import 'dotenv/config'
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  // Falha explícita cedo, mensagem amigável para configuração
  console.error("[Prisma] Variável de ambiente DATABASE_URL não encontrada. Configure em backend/.env, ex: mysql://user:pass@host:3306/database");
  throw new Error("DATABASE_URL ausente. Defina em .env antes de iniciar o servidor.");
}

export const prismaClient = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
