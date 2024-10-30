import Cliente from '../models/Cliente.js';
import bcrypt from 'bcryptjs';

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
