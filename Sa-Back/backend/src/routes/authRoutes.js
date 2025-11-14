import { Router } from "express";
import { login, logout, register, refresh } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", auth, logout);

export default authRouter;
