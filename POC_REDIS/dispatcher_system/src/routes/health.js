import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString()
  });
});

router.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Dispatcher system online" });
});

export default router;
