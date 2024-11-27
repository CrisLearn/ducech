import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Tecnico from '../models/Tecnico.js';
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';
import Mantenimiento from '../models/Mantenimiento.js';
import PDFDocument from 'pdfkit'; 
import fs from 'fs';


// Método para crear un nuevo administrador
export const createAdmin = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el correo ya está registrado en Técnico, Cliente o Admin
        const [existingTecnico, existingCliente, existingAdmin] = await Promise.all([
            Tecnico.findOne({ email }),
            Cliente.findOne({ email }),
            Admin.findOne({ email })
        ]);

        if (existingTecnico) {
            return res.status(400).send({ message: 'El correo ya está registrado' });
        }

        if (existingCliente) {
            return res.status(400).send({ message: 'El correo ya está registrado' });
        }

        if (existingAdmin) {
            return res.status(400).send({ message: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear el nuevo administrador
        const newAdmin = new Admin({
            nombre,
            email,
            password: hashedPassword,
            fechaCreacion: new Date()
        });

        // Guardar en la base de datos
        await newAdmin.save();

        // Respuesta exitosa
        res.status(201).send({
            message: 'Administrador registrado exitosamente.',
            admin: newAdmin
        });
    } catch (error) {
        // Manejo de errores
        console.error('Error al crear el administrador:', error);

        if (error.code === 11000) {
            res.status(400).send({ message: 'El correo ya está registrado.' });
        } else {
            res.status(500).send({
                message: 'Error al procesar la solicitud.',
                error: error.message
            });
        }
    }
};



// Método para autenticar un administrador (login)
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el administrador por email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).send({ error: 'Credenciales incorrectas' });
        }

        // Comparar las contraseñas
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Credenciales incorrectas' });
        }

        // Crear el token JWT
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.send({ token });
    } catch (error) {
        res.status(400).send(error);
    }
};

// Ajusta la ruta según tu estructura de proyecto

export const getAdminProfile = async (req, res) => {
    try {
        // Obtén el ID del admin desde la solicitud (por ejemplo, del token JWT o de los parámetros)
        const adminId = req.params.id || req.user.id; // Asume que tienes middleware de autenticación

        // Busca al administrador en la base de datos
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado' });
        }

        // Retorna los datos del perfil
        return res.status(200).json({
            id: admin._id,
            nombre: admin.nombre,
            email: admin.email
        });
    } catch (error) {
        console.error('Error al obtener el perfil del administrador:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Método para actualizar los datos del administrador
export const updateAdmin = async (req, res) => {
    try {
        const { nombre, password } = req.body;

        // Obtener el ID del administrador desde el middleware de autenticación
        const adminId = req.userId;

        // Buscar el administrador por ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).send({ error: 'Administrador no encontrado' });
        }

        // Actualizar el nombre
        if (nombre) {
            admin.nombre = nombre;
        }

        // Encriptar y actualizar la contraseña si se proporciona
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            admin.password = hashedPassword;
        }

        // Guardar los cambios
        await admin.save();
        res.send(admin);
    } catch (error) {
        res.status(400).send(error);
    }
};

export const getAllTecnicos = async (req, res) => { 
    try { const tecnicos = await Tecnico.find(); 
        res.send(tecnicos); 
    } catch (error) { 
        res.status(500).send(error); 
    } 
};

export const getTecnicoById = async (req, res) => { 
    try { 
        const tecnicoId = req.params.id; 
        const tecnico = await Tecnico.findById(tecnicoId); 
        if (!tecnico) { return res.status(404).send({ error: 'Técnico no encontrado' }); 
    } 
        res.send(tecnico); 
    } catch (error) { 
        res.status(500).send(error); 
    } 
};

// Método para generar el reporte en PDF de los técnicos
export const generateTecnicosReport = async (req, res) => {
    try {
        const tecnicos = await Tecnico.find().populate('clientes');

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar el encabezado de la respuesta para enviar un PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-tecnicos.pdf');

        // Enviar el documento PDF en el cuerpo de la respuesta
        doc.pipe(res);

        // Añadir contenido al PDF
        doc.fontSize(20).text('Reporte de Técnicos', { align: 'center' });
        doc.moveDown();

        tecnicos.forEach(tecnico => {
            doc.fontSize(14).text(`Nombre: ${tecnico.nombre}`);
            doc.fontSize(14).text(`Email: ${tecnico.email}`);
            doc.fontSize(14).text(`Teléfono: ${tecnico.telefono}`);
            doc.fontSize(14).text(`Taller: ${tecnico.taller}`);
            doc.fontSize(14).text(`Dirección: ${tecnico.direccion}`);
            doc.fontSize(14).text(`Estado: ${tecnico.estado}`);
            doc.moveDown();
            
            if (tecnico.clientes.length > 0) {
                doc.fontSize(14).text('Clientes:', { underline: true });
                tecnico.clientes.forEach(cliente => {
                    doc.fontSize(12).text(`Nombre: ${cliente.nombre}`);
                    doc.fontSize(12).text(`Email: ${cliente.email}`);
                    doc.fontSize(12).text(`Teléfono: ${cliente.telefono}`);
                    doc.fontSize(12).text(`Dirección: ${cliente.direccion}`);
                    doc.fontSize(12).text(`Estado: ${cliente.estado}`);
                    doc.moveDown();
                });
            } else {
                doc.fontSize(12).text('Sin clientes registrados');
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


export const getAllClientes = async (req, res) => { 
    try { const clientes = await Cliente.find(); 
        res.send(clientes); 
    } catch (error) { 
        res.status(500).send(error); 
    } 
};

export const getClienteById = async (req, res) => { 
    try { 
        const clienteId = req.params.id; 
        const cliente = await Cliente.findById(clienteId); 
        if (!cliente) { return res.status(404).send({ error: 'Cliente no encontrado' }); 
    } 
        res.send(cliente); 
    } catch (error) { 
        res.status(500).send(error); 
    } 
};

export const generateClientesReport = async (req, res) => {
    try {
        const clientes = await Cliente.find().populate('vehiculos');

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar el encabezado de la respuesta para enviar un PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-clientes.pdf');

        // Enviar el documento PDF en el cuerpo de la respuesta
        doc.pipe(res);

        // Añadir contenido al PDF
        doc.fontSize(20).text('Reporte de Clientes', { align: 'center' });
        doc.moveDown();

        clientes.forEach(cliente => {
            doc.fontSize(14).text(`Nombre: ${cliente.nombre}`);
            doc.fontSize(14).text(`Email: ${cliente.email}`);
            doc.fontSize(14).text(`Teléfono: ${cliente.telefono}`);
            doc.fontSize(14).text(`Dirección: ${cliente.direccion}`);
            doc.moveDown();

            if (cliente.vehiculos.length > 0) {
                doc.fontSize(14).text('Vehiculos:', { underline: true });
                cliente.vehiculos.forEach(vehiculo => {
                    doc.fontSize(12).text(`Placa: ${vehiculo.placa}`);
                    doc.moveDown();
                });
            } else {
                doc.fontSize(12).text('Sin vehiculos registrados.');
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

// Obtener todos los vehículos
export const getAllVehiculos = async (req, res) => { 
    try {
        const vehiculos = await Vehiculo.find(); // Obtiene todos los vehículos sin restricciones
        res.send(vehiculos);
    } catch (error) { 
        res.status(500).send({ error: 'Error del servidor', details: error.message }); 
    } 
};

// Método para obtener un vehículo por su ID sin restricciones
export const getVehiculoById = async (req, res) => { 
    try { 
        const vehiculoId = req.params.id; 
        const vehiculo = await Vehiculo.findById(vehiculoId); 
        if (!vehiculo) { 
            return res.status(404).send({ error: 'Vehículo no encontrado' }); 
        } 
        res.send(vehiculo); 
    } catch (error) { 
        res.status(500).send({ error: 'Error del servidor', details: error.message }); 
    } 
};

export const generateVehiculosReport = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.find().populate('mantenimientos');

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar el encabezado de la respuesta para enviar un PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-vehiculos.pdf');

        // Enviar el documento PDF en el cuerpo de la respuesta
        doc.pipe(res);

        // Añadir contenido al PDF
        doc.fontSize(20).text('Reporte de Vehiculos', { align: 'center' });
        doc.moveDown();

        vehiculos.forEach(vehiculo => {
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