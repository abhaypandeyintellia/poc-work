import { Router } from "express";
import healthRouter from "./health.js";
import eventsRouter from "./events.js";

const router = Router();

router.use(healthRouter);
router.use(eventsRouter);

export default router;
