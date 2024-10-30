import Cliente from '../models/Cliente.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrarCliente = async (req, res) => {
    try {
        const { usuario, correo, password, telefono, direccion, vehiculoId } = req.body;

        // Verificar si el correo ya está registrado
        const clienteExistente = await Cliente.findOne({ correo });
        if (clienteExistente) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        // Encriptar la contraseña antes de guardar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el nuevo cliente
        const nuevoCliente = new Cliente({
            usuario,
            correo,
            password: hashedPassword,
            telefono,
            direccion,
            vehiculoId,
            fechaCreacion: Date.now()
        });

        // Guardar el nuevo cliente en la base de datos
        await nuevoCliente.save();

        res.status(201).json({ message: 'Cliente registrado exitosamente', cliente: nuevoCliente });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el cliente', error: error.message });
    }
};

export const loginCliente = async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Buscar al cliente por correo
        const cliente = await Cliente.findOne({ correo });
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, cliente.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta.' });
        }

        // Generar token JWT
        const token = jwt.sign({ id: cliente._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
