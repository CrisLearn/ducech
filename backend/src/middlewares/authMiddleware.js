import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send({ error: 'Acceso denegado. No se proporcionó un token.' });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Asegurarse de que este campo se está estableciendo correctamente
        next();
    } catch (error) {
        res.status(401).send({ error: 'Token inválido o expirado.' });
    }
};
