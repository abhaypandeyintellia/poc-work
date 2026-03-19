import express from 'express';
import { generateToken } from '../auth/jwt.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const token = generateToken({ userId, role });
  res.json({ token });
});

export default router;