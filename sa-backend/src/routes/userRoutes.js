import { Router } from "express";
import {
  deleteUser,
  listUserById,
  listUsers,
  updateUser,
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/users", listUsers);

userRouter.get("/users/:id", listUserById);

userRouter.put("/users/:id", updateUser);

userRouter.delete("/users/:id", deleteUser);

export default userRouter;
