import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Cliente from '../models/Cliente.js';

// Método para crear un nuevo cliente
export const createCliente = async (req, res) => {
    try {
        const { nombre, email, password, telefono, direccion, vehiculos } = req.body;

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newCliente = new Cliente({
            nombre,
            email,
            password: hashedPassword,
            telefono,
            direccion,
            vehiculos,
            fechaCreacion: new Date()
        });

        await newCliente.save();
        res.status(201).send(newCliente);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Método para autenticar un cliente (login)
export const loginCliente = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el cliente por email
        const cliente = await Cliente.findOne({ email });
        if (!cliente) {
            return res.status(401).send({ error: 'Credenciales incorrectas' });
        }

        // Comparar las contraseñas
        const isMatch = await bcrypt.compare(password, cliente.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Credenciales incorrectas' });
        }

        // Crear el token JWT
        const token = jwt.sign({ id: cliente._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.send({ token });
    } catch (error) {
        res.status(400).send(error);
    }
};

// Método para actualizar los datos del cliente
export const updateCliente = async (req, res) => {
    try {
        const { nombre, password, telefono, direccion } = req.body;

        // Obtener el ID del cliente desde el middleware de autenticación
        const clienteId = req.userId;

        // Buscar el cliente por ID
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado' });
        }

        // Actualizar los datos proporcionados
        if (nombre) {
            cliente.nombre = nombre;
        }

        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            cliente.password = hashedPassword;
        }

        if (telefono) {
            cliente.telefono = telefono;
        }

        if (direccion) {
            cliente.direccion = direccion;
        }

        // Guardar los cambios
        await cliente.save();
        res.send(cliente);
    } catch (error) {
        res.status(400).send(error);
    }
};
