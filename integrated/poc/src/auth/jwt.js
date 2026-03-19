import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const generateToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: "1h" });

export const verifyToken = (token) =>
  jwt.verify(token, SECRET);