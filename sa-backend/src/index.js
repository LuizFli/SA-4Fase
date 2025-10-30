import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import vehiclesRoutes from './routes/produtoRoutes.js';
import pedidoRoutes from './routes/predidoRoutes.js';
import { env } from './env.js';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
// Keep legacy mount (/vehicles) and also expose produto routes at root so
// the frontend can call /produtos directly.
app.use('/vehicles', vehiclesRoutes);
app.use('/', vehiclesRoutes);
// Pedidos (orders) routes — protected endpoints.
app.use('/pedidos', pedidoRoutes);
// Provide an English alias so frontend that calls /sales can reach the same handlers
app.use('/sales', pedidoRoutes);

const http = createServer(app);
const io = new IOServer(http, { cors: { origin: '*' } });

io.of('/iot').on('connection', (socket) => {
  console.log('iot client connected', socket.id);
  socket.on('telemetry', (data) => {
    // broadcast to all connected clients in /iot
    io.of('/iot').emit('telemetry', data);
  });
});

const PORT = process.env.PORT || 4000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
