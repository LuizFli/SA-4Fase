import { Router } from "express";
import {
  createPedido,
  listPedidos,
  listPedidoById,
  updatePedido,
  deletePedido,
} from "../controllers/pedidoController.js";
import { auth } from "../middleware/auth.js";

const pedidoRouter = Router();

// Rotas protegidas - requerem autenticação
// Importante: como esse router é montado em "/pedidos" no index, aqui usamos caminhos relativos
pedidoRouter.post("/", auth, createPedido);
pedidoRouter.get("/", auth, listPedidos);
pedidoRouter.get("/:id", auth, listPedidoById);
pedidoRouter.put("/:id", auth, updatePedido);
pedidoRouter.delete("/:id", auth, deletePedido);

export default pedidoRouter;
