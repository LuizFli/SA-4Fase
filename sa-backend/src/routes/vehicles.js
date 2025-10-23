import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// List vehicles with optional filters
router.get('/', async (req, res) => {
  try {
    const { brand, model, minPrice, maxPrice, year } = req.query;
    const where = {};
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (year) where.year = Number(year);
    if (minPrice || maxPrice) where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Get vehicle detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id }, include: { images: true } });
    if (!vehicle) return res.status(404).json({ error: 'not found' });
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

export default router;
