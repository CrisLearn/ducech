import Admin from '../models/Admin.js';
import Mecanico from '../models/Mecanico.js'; // Asegúrate de que el modelo esté importado
import Cliente from '../models/Cliente.js'; // Asegúrate de que el modelo esté importado
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new admin
export const registerAdmin = async (req, res) => {
    const { usuario, correo, password } = req.body;

    try {
        // Check if the email or username already exists
        const existingAdmin = await Admin.findOne({ $or: [{ correo }, { usuario }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Usuario o correo ya existe' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin
        const newAdmin = new Admin({
            usuario,
            correo,
            password: hashedPassword,
        });
        
        // Save the admin to the database
        await newAdmin.save();

        // Respond with a success message
        res.status(201).json({ message: 'Registro exitoso' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el registro', error });
    }
};

// Login admin
export const loginAdmin = async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Check if admin exists
        const admin = await Admin.findOne({ correo });
        if (!admin) {
            return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with the token
        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el inicio de sesión', error });
    }
};

// Get admin profile
export const obtenerPerfil = async (req, res) => {
    try {
        // Retrieve admin data using the ID from the token payload
        const admin = await Admin.findById(req.admin.id).select('-password'); // Exclude password field
        if (!admin) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil', error });
    }
};

// Update admin profile
export const actualizarPerfil = async (req, res) => {
    const { usuario, correo, password } = req.body;

    try {
        // Find admin by ID
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }

        // Update fields if they exist in the request body
        if (usuario) admin.usuario = usuario;
        if (correo) admin.correo = correo;
        if (password) admin.password = await bcrypt.hash(password, 10);

        // Save updates
        await admin.save();

        res.status(200).json({ message: 'Perfil actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el perfil', error });
    }
};

// Get all mechanics
export const obtenerMecanicos = async (req, res) => {
    try {
        const mecanicos = await Mecanico.find(); // Retrieves all mechanics
        res.status(200).json(mecanicos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mecánicos', error });
    }
};

// Get all clients
export const obtenerClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find(); // Retrieves all clients
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes', error });
    }
};
