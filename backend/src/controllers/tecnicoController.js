import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tecnico from '../models/Tecnico.js';
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js'; // Asegúrate de importar el modelo Cliente
import Mantenimiento from '../models/Mantenimiento.js'; // Asegúrate de importar el modelo Cliente
import PDFDocument from 'pdfkit'; 

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

// Método para crear un nuevo cliente y asignarlo al técnico autenticado
export const createClienteForTecnico = async (req, res) => {
    try {
        const { nombre, email, password, telefono, direccion } = req.body;
        const tecnicoId = req.userId; // Obtener el ID del técnico del token

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

        // Buscar el técnico por ID y añadir el cliente a su lista de clientes
        const tecnico = await Tecnico.findById(tecnicoId);
        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        tecnico.clientes.push(newCliente._id);
        await tecnico.save();

        res.status(201).send(newCliente);
    } catch (error) {
        console.error(error); // Agregar log para ver el error en la consola
        res.status(400).send({ error: 'Error al crear el cliente. Por favor, revise los datos e intente nuevamente.' });
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


// Método para crear un nuevo mantenimiento para un vehículo de un cliente registrado por el técnico
export const createMantenimientoForVehiculo = async (req, res) => {
    try {
        const { descripcion, tipoMantenimiento, detalleMantenimiento, marcagaRepuesto, kilometrajeActual, kilometrajeCambio, detalleGeneral, vehiculoId } = req.body;
        const tecnicoId = req.userId; // Obtener el ID del técnico del token


        // Buscar el vehículo por ID y verificar que pertenezca a un cliente registrado por el técnico
        const vehiculo = await Vehiculo.findById(vehiculoId).populate('mantenimientos');
        if (!vehiculo) {
            return res.status(404).send({ error: 'Vehículo no encontrado' });
        }

        // Buscar el cliente propietario del vehículo
        const cliente = await Cliente.findOne({ vehiculos: vehiculoId }).populate('vehiculos');
        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado' });
        }

        // Verificar que el técnico registrado sea el propietario del cliente
        const tecnico = await Tecnico.findById(tecnicoId).populate('clientes');
        if (!tecnico) {
            console.log('Técnico no encontrado con ID:', tecnicoId);
            console.log('Todos los técnicos en la base de datos:', await Tecnico.find({}));
            return res.status(403).send({ error: 'Acceso denegado. No se encontró el técnico.' });
        }

        if (!tecnico.clientes.some(clienteId => clienteId.equals(cliente._id))) {
            console.log('El técnico no tiene permisos para este cliente. Clientes del técnico:', tecnico.clientes);
            return res.status(403).send({ error: 'Acceso denegado. El técnico no tiene permisos para este cliente.' });
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
