import express from 'express';
import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';

const router = express.Router();

// Register a new user (admin or client role)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: role === 'ADMIN' ? 'ADMIN' : 'CLIENT' } });
    const access = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refresh = signRefreshToken({ id: user.id });
    return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, access, refresh });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const access = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refresh = signRefreshToken({ id: user.id });
    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, access, refresh });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
});

export default router;
