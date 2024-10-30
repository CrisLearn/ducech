import Mecanico from '../models/Mecanico.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrarMecanico = async (req, res) => {
    try {
        const { usuario, correo, password, telefono, taller, clienteId } = req.body;

        // Verificar si el correo ya está registrado
        const mecanicoExistente = await Mecanico.findOne({ correo });
        if (mecanicoExistente) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        // Encriptar la contraseña antes de guardar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el nuevo mecánico
        const nuevoMecanico = new Mecanico({
            usuario,
            correo,
            password: hashedPassword,
            telefono,
            taller,
            clienteId,
            fechaCreacion: Date.now(),
            estado: true // Por defecto, el mecánico está activo
        });

        // Guardar el nuevo mecánico en la base de datos
        await nuevoMecanico.save();

        res.status(201).json({ message: 'Mecánico registrado exitosamente', mecanico: nuevoMecanico });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el mecánico', error: error.message });
    }
};

export const loginMecanico = async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Buscar al mecanico por correo
        const mecanico = await Mecanico.findOne({ correo });
        if (!mecanico) {
            return res.status(404).json({ message: 'Mecanico no encontrado.' });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, mecanico.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta.' });
        }

        // Generar token JWT
        const token = jwt.sign({ id: mecanico._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const obtenerPerfil = async (req, res) => {
    try {
        // Retrieve mecanico data using the ID from the token payload
        const mecanico = await Mecanico.findById(req.mecanico.id).select('-password'); // Exclude password field
        if (!mecanico) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }

        res.status(200).json(mecanico);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil', error });
    }
};

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