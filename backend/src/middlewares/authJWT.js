import jwt from 'jsonwebtoken';
import Cliente from '../models/Cliente.js';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensaje: 'No token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Cliente.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    console.error('Token no es válido:', error);
    res.status(401).json({ mensaje: 'Token no es válido' });
  }
};
