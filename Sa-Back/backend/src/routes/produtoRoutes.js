import { Router } from "express";
import { createProduto, deleteProduto, listProdutoById, listProdutos, updateProduto } from "../controllers/produtoController.js";

const produtosRouter = Router();

produtosRouter.post("/produtos", createProduto);
produtosRouter.get("/produtos", listProdutos);

produtosRouter.get("/produtos/:id", listProdutoById);

produtosRouter.put("/produtos/:id", updateProduto);

produtosRouter.delete("/produtos/:id", deleteProduto);

export default produtosRouter;
