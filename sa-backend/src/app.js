import express from "express";
import authRouter from "./routes/authRoutes.js";
import { auth } from "./middleware/auth.js";
import userRouter from "./routes/userRoutes.js";
import pedidosRouter from "./routes/pedidosRoutes.js";
import produtosRouter from "./routes/produtoRoutes.js";
import publicPedidosRouter from "./routes/publicPedidosRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("API RODANDO");
});

app.use(authRouter);
app.use(publicPedidosRouter);

app.use(auth);
// privados

app.use(userRouter);

app.use(pedidosRouter);

app.use(produtosRouter);

app.listen(PORT, () => {
  console.log(`Server port ${PORT}`);
});
