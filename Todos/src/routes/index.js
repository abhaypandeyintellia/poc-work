import { Router } from "express";
import userRoutes from "./auth.routes.js";
import todoRoutes from "./todo.routes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/todo", todoRoutes);

export default router;