import Mecanico from '../models/Mecanico.js';
import bcrypt from 'bcryptjs';

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
