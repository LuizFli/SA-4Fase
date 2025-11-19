import { Router } from "express";
import { simuladorHealth } from "../controllers/simuladorController.js";

const router = Router();

// Public health proxy for the external simulator
router.get("/simulador/health", simuladorHealth);

export default router;
