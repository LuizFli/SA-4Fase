import { Router } from "express";
import {
  createProduto,
  listProdutos,
  listProdutoById,
  updateProduto,
  deleteProduto,
} from "../controllers/produtoController.js";

const produtoRouter = Router();

produtoRouter.post("/produtos", createProduto);
produtoRouter.get("/produtos", listProdutos);
produtoRouter.get("/produtos/:id", listProdutoById);
produtoRouter.put("/produtos/:id", updateProduto);
produtoRouter.delete("/produtos/:id", deleteProduto);

export default produtoRouter;
