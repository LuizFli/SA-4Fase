import { Router } from "express";
import { updateStatus } from "../controllers/pedidosController.js";

const publicPedidosRouter = Router();

publicPedidosRouter.patch("/pedidos/:id", updateStatus);
publicPedidosRouter.post("/pedidos/:id", updateStatus);

export default publicPedidosRouter;
