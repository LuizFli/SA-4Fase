import { Router } from "express";
import { login, logout, register, refresh, verify } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/refresh", refresh)
authRouter.post('/logout', auth, logout);
authRouter.get('/verify', auth, verify);

export default authRouter;
