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

// Método para crear un nuevo cliente y asignarlo al técnico autenticad

// Método para crear un nuevo cliente y asignarlo al técnico autenticado
export const createClienteForTecnico = async (req, res) => {
    try {
        const { nombre, email, password, telefono, direccion } = req.body;
        const tecnicoId = req.userId; // Obtener el ID del técnico del token

        console.log('Datos recibidos:', { nombre, email, password, telefono, direccion });
        console.log('ID del técnico:', tecnicoId);

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newCliente = new Cliente({
            nombre,
            email,
            password: hashedPassword,
            telefono,
            direccion,
            fechaCreacion: new Date()
        });

        // Guardar el nuevo cliente
        await newCliente.save();
        console.log('Cliente creado:', newCliente);

        // Buscar el técnico por ID y añadir el cliente a su lista de clientes
        const tecnico = await Tecnico.findById(tecnicoId);
        if (!tecnico) {
            console.error('Técnico no encontrado');
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        tecnico.clientes.push(newCliente._id);
        await tecnico.save();
        console.log('Cliente asignado al técnico:', tecnico);

        res.status(201).send(newCliente);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({ error: 'Error al crear el cliente. Por favor, revise los datos e intente nuevamente.' });
    }
};
