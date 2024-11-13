import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tecnico from '../models/Tecnico.js';
import Cliente from '../models/Cliente.js'; // Asegúrate de importar el modelo Cliente

// Método para crear un nuevo técnico
export const createTecnico = async (req, res) => {
    try {
        const { nombre, email, password, telefono, taller, direccion } = req.body;

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newTecnico = new Tecnico({
            nombre,
            email,
            password: hashedPassword,
            telefono,
            taller,
            direccion,
            fechaCreacion: new Date()
        });

        await newTecnico.save();
        res.status(201).send(newTecnico);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Método para autenticar un técnico (login)
export const loginTecnico = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el técnico por email
        const tecnico = await Tecnico.findOne({ email });
        if (!tecnico) {
            return res.status(401).send({ error: 'Credenciales incorrectas' });
        }

        // Comparar las contraseñas
        const isMatch = await bcrypt.compare(password, tecnico.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Credenciales incorrectas' });
        }

        // Crear el token JWT
        const token = jwt.sign({ id: tecnico._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.send({ token });
    } catch (error) {
        res.status(400).send(error);
    }
};

// Método para actualizar los datos del técnico
export const updateTecnico = async (req, res) => {
    try {
        const { nombre, password } = req.body;

        // Obtener el ID del técnico desde el middleware de autenticación
        const tecnicoId = req.userId;

        // Buscar el técnico por ID
        const tecnico = await Tecnico.findById(tecnicoId);
        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        // Actualizar el nombre
        if (nombre) {
            tecnico.nombre = nombre;
        }

        // Encriptar y actualizar la contraseña si se proporciona
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            tecnico.password = hashedPassword;
        }

        // Guardar los cambios
        await tecnico.save();
        res.send(tecnico);
    } catch (error) {
        res.status(400).send(error);
    }
};

