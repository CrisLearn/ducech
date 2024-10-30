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

// Visualizar perfil del administrador
export const obtenerPerfil = async (req, res) => {
    try {
        const adminId = req.adminId; // Asumiendo que tienes middleware que añade adminId al req después de la verificación del token
        const admin = await Admin.findById(adminId).select('-password'); // No incluir la contraseña

        if (!admin) {
            return res.status(404).json({ message: 'Administrador no encontrado.' });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar perfil del administrador
export const actualizarPerfil = async (req, res) => {
    const { usuario, correo, password } = req.body;
    
    try {
        const adminId = req.adminId; // Asumiendo que tienes middleware que añade adminId al req después de la verificación del token

        // Buscar al administrador por ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Administrador no encontrado.' });
        }

        // Actualizar campos
        if (usuario) admin.usuario = usuario;
        if (correo) {
            // Verificar si el nuevo correo ya está registrado
            const existingAdmin = await Admin.findOne({ correo });
            if (existingAdmin && existingAdmin._id.toString() !== adminId) {
                return res.status(400).json({ message: 'El correo ya está registrado por otro administrador.' });
            }
            admin.correo = correo;
        }
        if (password) {
            // Encriptar nueva contraseña
            admin.password = await bcrypt.hash(password, 10);
        }

        const updatedAdmin = await admin.save();
        res.status(200).json({ message: 'Perfil actualizado', admin: updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
