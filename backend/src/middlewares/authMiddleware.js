import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = { id: decoded.id }; // Guarda el ID del administrador en req.admin
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

export default authMiddleware;
