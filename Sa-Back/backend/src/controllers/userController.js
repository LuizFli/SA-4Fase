import { prismaClient } from "../../prisma/prisma.js";
import { verifyAccess } from "../utils/jwt.js";

const userColumns = {
  NAME: "name",
  EMAIL: "email",
  PASSWORD: "password",
  CARGO: "cargo",
  FONE: "fone",
};

export const listUsers = async (_req, res) => {
  try {
    const users = await prismaClient.user.findMany();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const listUserById = async (req, res) => {
  try {
    const { params } = req;

    const user = await prismaClient.user.findUnique({
      where: {
        id: Number(params.id),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não existe no banco de dados.",
      });
    }

    return res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const me = async (req, res) => {
  try {
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    const user = await prismaClient.user.findUnique({
      where: { id: Number(payload.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        cargo: true,
        fone: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { params, body } = req;
    const token = req?.headers?.authorization?.slice("Bearer ".length);
    const payload = verifyAccess(token || "");
    const targetId = Number(params.id);
    if (!payload?.userId || payload.userId !== targetId) {
      return res.status(403).send("Operação não permitida para este usuário");
    }
    const bodyKeys = Object.keys(body);
    for (const key of bodyKeys) {
      if (
        key !== userColumns.NAME &&
        key !== userColumns.PASSWORD &&
        key !== userColumns.EMAIL &&
        key !== userColumns.CARGO &&
        key !== userColumns.FONE
      )
        return res.status(404).send("Colunas não existentes");
    }
    const user = await prismaClient.user.update({
      where: { id: targetId },
      data: {
        ...body,
      },
    });
    return res.status(200).json({
      message: "Usuário atualizado!",
      data: user,
    });
  } catch (error) {
    // Prisma error code P2025 -> record not found
    if (error && error.code === "P2025") {
      return res.status(404).send("Usuário não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { params } = req;
    await prismaClient.user.delete({
      where: {
        id: Number(params.id),
      },
    });
    res.status(200).send("Usuário deletado com sucesso!");
  } catch (error) {
    if (error && error.code === "P2025") {
      return res.status(404).send("Usuário não encontrado!");
    }
    console.log(error);
    res.status(500).send(`Erro no servidor: ${error}`);
  }
};
