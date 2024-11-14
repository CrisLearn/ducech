import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Tecnico from '../models/Tecnico.js';
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';
import PDFDocument from 'pdfkit'; 
import fs from 'fs';


// Método para crear un nuevo administrador
export const createAdmin = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = new Admin({
            nombre,
            email,
            password: hashedPassword,
            fechaCreacion: new Date()
        });

        await newAdmin.save();
        res.status(201).send(newAdmin);
    } catch (error) {
        res.status(400).send(error);
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
        const tecnicos = await Tecnico.find();

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
        const clientes = await Cliente.find();

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
            doc.fontSize(14).text(`Vehiculo: ${cliente.vehiculos}`);
            doc.moveDown();
        });

        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send(error);
    }
};

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

// Método para generar el reporte en PDF de los vehículos del cliente autenticado
export const generateVehiculosReport = async (req, res) => {
    try {
        const clienteId = req.userId; // Obtener el ID del cliente del token
        const cliente = await Cliente.findById(clienteId).populate({
            path: 'vehiculos',
            /*populate: { path: 'mantenimientos' }*/
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
            /*doc.moveDown();
            doc.fontSize(14).text('Mantenimientos:', { underline: true });
            vehiculo.mantenimientos.forEach(mantenimiento => {
                doc.fontSize(12).text(`Descripción: ${mantenimiento.descripcion}`);
                doc.fontSize(12).text(`Fecha: ${mantenimiento.fecha.toISOString().split('T')[0]}`);
                doc.fontSize(12).text(`Costo: ${mantenimiento.costo}`);
                doc.moveDown();
            });
            doc.moveDown();*/
        });

        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send(error);
    }
};

