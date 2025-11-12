import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import vehiclesRoutes from './routes/produtoRoutes.js';
import { listProdutos, listProdutoById } from './controllers/produtoController.js';
import pedidoRoutes from './routes/predidoRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { env } from './env.js';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
// Expor rotas de produtos originais em /produtos
app.use('/', vehiclesRoutes);
// Fornecer alias em /vehicles e /vehicles/:id para compatibilidade com o frontend
app.get('/vehicles', listProdutos);
app.get('/vehicles/:id', listProdutoById);
// Pedidos (orders) routes — protected endpoints.
app.use('/pedidos', pedidoRoutes);
// Provide an English alias so frontend that calls /sales can reach the same handlers
app.use('/sales', pedidoRoutes);
// Dashboard routes (protected)
app.use('/dashboard', dashboardRoutes);

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
