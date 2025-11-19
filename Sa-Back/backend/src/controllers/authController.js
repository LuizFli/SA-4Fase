import bcrypt from "bcrypt";
import { prismaClient } from "../../prisma/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ error: "Usuário já existe" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await prismaClient.user.create({
      data: { email, password: hashedPassword, name: name || null },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    return res.status(201).json(user);
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
  return res.status(400).send("Not Found");
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    console.log(refreshToken);
    await prismaClient.token.create({
      data: {
        token: refreshToken,
        type: "refresh",
        userId: user.id,
        expiresAt,
      },
    });
    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
  return res;
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const storedRefreshToken = await prismaClient.token.findFirst({
    where: { token: refreshToken },
  });
  if (
    !storedRefreshToken ||
    storedRefreshToken.revoked ||
    storedRefreshToken.expiresAt < new Date()
  )
    return res.status(401).json({ error: "invalid refresh token" });

  try {
    const payload = verifyRefresh(refreshToken);
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const storedRefreshToken = await prismaClient.token.findFirst({
      where: { token: refreshToken },
    });
    if (
      !storedRefreshToken ||
      storedRefreshToken.revoked ||
      storedRefreshToken.expiresAt < new Date()
    )
      return res.status(401).json({ error: "invalid refresh token" });

    await prismaClient.token.updateMany({
      where: { id: storedRefreshToken?.id ?? 0 },
      data: { revoked: true },
    });
  } catch (error) {
    res.status(400).json(error);
  }

  return res.status(200).json("Usuário deslogado!");
};
