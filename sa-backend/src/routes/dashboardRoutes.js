import { Router } from 'express';
import { getSummary } from '../controllers/dashboardController.js';
import { auth } from '../middleware/auth.js';

const dashboardRouter = Router();

dashboardRouter.get('/summary', auth, getSummary);

export default dashboardRouter;
