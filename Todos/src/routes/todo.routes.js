import { Router } from "express";
import { addTodo, deleteTodo, getById, getUserTodo, updateTodo } from "../controllers/todo.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { todoSchema } from "../validations/todo.schema.js";

const router = Router();

router.post("/", requireAuth, validate(todoSchema), addTodo)
router.get("/:id", requireAuth, getById)
router.put("/:id", requireAuth, validate(todoSchema), updateTodo)
router.get("/", requireAuth, getUserTodo)
router.delete("/:id", requireAuth, deleteTodo)


export default router;
