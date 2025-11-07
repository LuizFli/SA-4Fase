import { Router } from "express";
import { createProduto, deleteProduto, listProdutoById, listProdutos, updateProduto, restockProdutos, listProdutosSelect } from "../controllers/produtoController.js";


const produtosRouter = Router();

produtosRouter.post("/produtos", createProduto);
produtosRouter.get("/produtos", listProdutos);
produtosRouter.get("/produtos/select", listProdutosSelect);

produtosRouter.get("/produtos/:id", listProdutoById);

produtosRouter.put("/produtos/:id", updateProduto);

produtosRouter.delete("/produtos/:id", deleteProduto);

// Reabastecer estoque
produtosRouter.post("/produtos/reabastecer", restockProdutos);

export default produtosRouter;
