import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';
import Mantenimiento from '../models/Mantenimiento.js';
import PDFDocument from 'pdfkit';

// Método para crear un nuevo cliente
export const createCliente = async (req, res) => {
    try {
        const { nombre, email, password, telefono, direccion, vehiculos } = req.body;

        // Verificar si el email ya existe en la base de datos
        const existingCliente = await Cliente.findOne({ email });
        if (existingCliente) {
            return res.status(400).send({ message: 'El correo electrónico ya está registrado.' });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear nuevo cliente
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
        // Verificar si el error es de duplicado en MongoDB
        if (error.code === 11000) {
            res.status(400).send({ message: 'Ya existe un cliente con ese correo electrónico.' });
        } else {
            res.status(500).send({ message: 'Error al crear el cliente.', error });
        }
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

// Método para crear un nuevo vehículo para el cliente autenticado
export const createVehiculoForCliente = async (req, res) => {
    try {
        const { placa, tipo, marca, modelo, cilindraje, color, kilometrajeActual, observacion } = req.body;
        const clienteId = req.userId; // Obtener el ID del cliente del token

        const newVehiculo = new Vehiculo({
            placa,
            tipo,
            marca,
            modelo,
            cilindraje,
            color,
            kilometrajeActual,
            observacion,
            fechaCreacion: new Date()
        });

        // Guardar el nuevo vehículo
        await newVehiculo.save();

        // Buscar el cliente por ID y añadir el vehículo a su lista de vehículos
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado' });
        }

        cliente.vehiculos.push(newVehiculo._id);
        await cliente.save();

        res.status(201).send(newVehiculo);
    } catch (error) {
        console.error(error); // Agregar log para ver el error en la consola
        res.status(400).send({ error: 'Error al crear el vehículo. Por favor, revise los datos e intente nuevamente.' });
    }
};

// Método para obtener todos los vehículos del cliente autenticado
export const getAllVehiculos = async (req, res) => { 
    try {
        const clienteId = req.userId; // Obtener el ID del cliente del token
        const cliente = await Cliente.findById(clienteId).populate('vehiculos');
        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado' });
        }
        res.send(cliente.vehiculos);
    } catch (error) { 
        res.status(500).send(error); 
    } 
};

// Método para obtener un vehículo por su ID
export const getVehiculoById = async (req, res) => { 
    try { 
        const vehiculoId = req.params.id; 
        const vehiculo = await Vehiculo.findById(vehiculoId)/*.populate('Mantenimiento')*/; 
        if (!vehiculo) { 
            return res.status(404).send({ error: 'Vehículo no encontrado' }); 
        } 
        res.send(vehiculo); 
    } catch (error) { 
        res.status(500).send(error); 
    } 
};

// Método para generar el reporte en PDF de los vehículos del cliente autenticad
// Método para generar el reporte en PDF de los vehículos y sus mantenimientos del cliente autenticado
export const generateVehiculosReport = async (req, res) => {
    try {
        const clienteId = req.userId; // Obtener el ID del cliente del token
        const cliente = await Cliente.findById(clienteId).populate({
            path: 'vehiculos',
            populate: {
                path: 'mantenimientos'
            }
        });

        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado' });
        }

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar el encabezado de la respuesta para enviar un PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-vehiculos.pdf');

        // Enviar el documento PDF en el cuerpo de la respuesta
        doc.pipe(res);

        // Añadir contenido al PDF
        doc.fontSize(20).text('Reporte de Vehículos', { align: 'center' });
        doc.moveDown();

        cliente.vehiculos.forEach(vehiculo => {
            doc.fontSize(14).text(`Placa: ${vehiculo.placa}`);
            doc.fontSize(14).text(`Tipo: ${vehiculo.tipo}`);
            doc.fontSize(14).text(`Marca: ${vehiculo.marca}`);
            doc.fontSize(14).text(`Modelo: ${vehiculo.modelo}`);
            doc.fontSize(14).text(`Cilindraje: ${vehiculo.cilindraje}`);
            doc.fontSize(14).text(`Color: ${vehiculo.color}`);
            doc.fontSize(14).text(`Kilometraje Actual: ${vehiculo.kilometrajeActual}`);
            doc.fontSize(14).text(`Observación: ${vehiculo.observacion}`);
            doc.moveDown();

            if (vehiculo.mantenimientos.length > 0) {
                doc.fontSize(14).text('Mantenimientos:', { underline: true });
                vehiculo.mantenimientos.forEach(mantenimiento => {
                    doc.fontSize(12).text(`Descripción: ${mantenimiento.descripcion}`);
                    doc.fontSize(12).text(`Tipo de Mantenimiento: ${mantenimiento.tipoMantenimiento}`);
                    doc.fontSize(12).text(`Detalle del Mantenimiento: ${mantenimiento.detalleMantenimiento}`);
                    doc.fontSize(12).text(`Marca del Repuesto: ${mantenimiento.marcagaRepuesto}`);
                    doc.fontSize(12).text(`Kilometraje Actual: ${mantenimiento.kilometrajeActual}`);
                    doc.fontSize(12).text(`Kilometraje del Cambio: ${mantenimiento.kilometrajeCambio}`);
                    doc.fontSize(12).text(`Detalle General: ${mantenimiento.detalleGeneral}`);
                    doc.fontSize(12).text(`Fecha: ${mantenimiento.fechaCreacion.toISOString().split('T')[0]}`);
                    doc.moveDown();
                });
            } else {
                doc.fontSize(12).text('Sin mantenimientos registrados.');
            }
            doc.moveDown();
        });

        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send(error);
    }
};



// Método para crear un nuevo mantenimiento para un vehículo del cliente autenticado
export const createMantenimientoForVehiculo = async (req, res) => {
    try {
        const { descripcion, tipoMantenimiento, detalleMantenimiento, marcagaRepuesto, kilometrajeActual, kilometrajeCambio, detalleGeneral, vehiculoId } = req.body;
        const clienteId = req.userId; // Obtener el ID del cliente del token


        // Buscar el vehículo por ID y verificar que pertenezca al cliente autenticado
        const vehiculo = await Vehiculo.findById(vehiculoId).populate('mantenimientos');
        if (!vehiculo) {
            return res.status(404).send({ error: 'Vehículo no encontrado' });
        }

        // Verificar que el vehículo pertenece al cliente autenticado
        const cliente = await Cliente.findById(clienteId).populate('vehiculos');
        if (!cliente || !cliente.vehiculos.includes(vehiculo._id)) {
            console.log('Permisos del cliente:', cliente ? cliente.vehiculos : 'No se encontró cliente');
            return res.status(403).send({ error: 'Acceso denegado. El cliente no tiene permisos para este vehículo.' });
        }

        // Crear el nuevo mantenimiento
        const newMantenimiento = new Mantenimiento({
            descripcion,
            tipoMantenimiento,
            detalleMantenimiento,
            marcagaRepuesto,
            kilometrajeActual,
            kilometrajeCambio,
            detalleGeneral,
            fechaCreacion: new Date()
        });

        // Guardar el nuevo mantenimiento
        await newMantenimiento.save();

        // Añadir el mantenimiento a la lista de mantenimientos del vehículo
        vehiculo.mantenimientos.push(newMantenimiento._id);
        await vehiculo.save();

        res.status(201).send(newMantenimiento);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({ error: 'Error al crear el mantenimiento. Por favor, revise los datos e intente nuevamente.' });
    }
};

