import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs'; // Para encriptar contraseñas
import jwt from 'jsonwebtoken'; // Para generar tokens JWT

// Registrar un nuevo administrador
export const registerAdmin = async (req, res) => {
    const { usuario, correo, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingAdmin = await Admin.findOne({ correo });
        if (existingAdmin) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear un nuevo administrador
        const newAdmin = new Admin({
            usuario,
            correo,
            password: hashedPassword,
        });

        const savedAdmin = await newAdmin.save();
        res.status(201).json({ message: 'Administrador registrado', admin: savedAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Iniciar sesión (login) de un administrador
export const loginAdmin = async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Buscar al administrador por correo
        const admin = await Admin.findOne({ correo });
        if (!admin) {
            return res.status(404).json({ message: 'Administrador no encontrado.' });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta.' });
        }

        // Generar token JWT
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
