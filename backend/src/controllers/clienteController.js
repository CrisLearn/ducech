import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from "../models/Admin.js";
import Tecnico from "../models/Tecnico.js";
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';
import Mantenimiento from '../models/Mantenimiento.js';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';


// Método para crear un nuevo cliente
export const createCliente = async (req, res) => {
    try {
        const { nombre, email, password, telefono, direccion, vehiculos } = req.body;

        // Verificar si el correo ya está registrado en cualquiera de los modelos
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

        res.status(201).send({
            message: 'Cliente registrado exitosamente.',
            cliente: newCliente
        });
    } catch (error) {
        console.error('Error al crear el cliente:', error);

        // Verificar si el error es de duplicado en MongoDB
        if (error.code === 11000) {
            res.status(400).send({ message: 'Ya existe un cliente con ese correo electrónico.' });
        } else {
            res.status(500).send({
                message: 'Error al crear el cliente.',
                error: error.message
            });
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
        const token = jwt.sign({ id: cliente._id }, process.env.JWT_SECRET, { expiresIn: '10h' });

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

export const updateVehiculoForCliente = async (req, res) => {
    try {
      const { id } = req.params; // Obtener el ID del vehículo desde la URL
      const {
        placa,
        tipo,
        marca,
        modelo,
        cilindraje,
        color,
        kilometrajeActual,
        observacion
      } = req.body;
  
      // Buscar el vehículo por ID y actualizarlo con los nuevos datos
      const updatedVehiculo = await Vehiculo.findByIdAndUpdate(
        id,
        {
          placa,
          tipo,
          marca,
          modelo,
          cilindraje,
          color,
          kilometrajeActual,
          observacion,
          fechaModificacion: new Date()
        },
        { new: true } // Esta opción devuelve el documento modificado en lugar del original
      );
  
      if (!updatedVehiculo) {
        return res.status(404).send({ error: 'Vehículo no encontrado' });
      }
  
      res.status(200).send(updatedVehiculo);
    } catch (error) {
      console.error(error); // Agregar log para ver el error en la consola
      res.status(400).send({ error: 'Error al actualizar el vehículo. Por favor, revise los datos e intente nuevamente.' });
    }
};
  

// Método para crear un nuevo vehículo para el cliente autenticado
export const createVehiculoForCliente = async (req, res) => {
    try {
        const { placa, tipo, marca, modelo, cilindraje, color, kilometrajeActual, observacion } = req.body;
        const clienteId = req.userId; // Obtener el ID del cliente del token

        // Verificar si ya existe un vehículo con la misma placa
        const vehiculoExistente = await Vehiculo.findOne({ placa: new RegExp(`^${placa}$`, 'i') });
        if (vehiculoExistente) {
            return res.status(400).send({ error: 'Placa ya registrada para otro vehículo' });
        }

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
        const clienteId = req.userId; // Obtener el ID del técnico del token
        const vehiculoId = req.params.id;
        
        const cliente = await Cliente.findById(clienteId).populate({
            path: 'vehiculos',
            match: { _id: vehiculoId }
        });
        
        if (!cliente || cliente.vehiculos.length === 0) {
            return res.status(404).send({ error: 'Vehiculo no encontrado o no asignado a este técnico' });
        }
        
        res.send(cliente.vehiculos[0]);
    } catch (error) {
        res.status(500).send(error);
    }
};

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


export const createMantenimientoForVehiculo = async (req, res) => {
    try {
        // Desestructuración de los campos del cuerpo de la solicitud
        const {
            tipoMantenimiento,
            detalleMantenimiento,
            marcaRepuesto,
            kilometrajeActual,
            kilometrajeCambio,
            detalleGeneral,
            placa // Asegúrate de que 'placa' esté incluido en la solicitud
        } = req.body;

        const clienteId = req.userId; 

        const vehiculoEncontrado = await Vehiculo.findOne({ placa: new RegExp(`^${placa}$`, 'i') }).populate('mantenimientos');

        if (!vehiculoEncontrado) {
            return res.status(404).send({ error: 'Vehículo no encontrado' });
        }

        // Verificar que el vehículo pertenece al cliente autenticado
        const cliente = await Cliente.findById(clienteId);
        if (!cliente || !cliente.vehiculos.includes(vehiculoEncontrado._id)) {
            console.log('Permisos del cliente:', cliente ? cliente.vehiculos : 'No se encontró cliente');
            return res.status(403).send({ error: 'Acceso denegado. El cliente no tiene permisos para este vehículo.' });
        }

        // Crear el nuevo mantenimiento
        const newMantenimiento = new Mantenimiento({
            tipoMantenimiento,
            detalleMantenimiento,
            marcaRepuesto,
            kilometrajeActual,
            kilometrajeCambio,
            detalleGeneral,
            fechaCreacion: new Date(),
            vehiculo: vehiculoEncontrado._id // Asociar el mantenimiento al vehículo
        });

        // Guardar el nuevo mantenimiento
        await newMantenimiento.save();
        const populatedMantenimiento = await Mantenimiento.findById(newMantenimiento._id).populate('vehiculo');
        // Añadir el mantenimiento a la lista de mantenimientos del vehículo
        vehiculoEncontrado.mantenimientos.push(newMantenimiento._id);
        await vehiculoEncontrado.save();

        res.status(201).send(newMantenimiento);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({ error: 'Error al crear el mantenimiento. Por favor, revise los datos e intente nuevamente.' });
    }
};


export const getAllMantenimientosForCliente = async (req, res) => {
    try {
        const clienteId = req.userId; 

        // Buscar el cliente por su ID y obtener los vehículos asociados, incluyendo los mantenimientos
        const cliente = await Cliente.findById(clienteId).populate({
            path: 'vehiculos',
            populate: { path: 'mantenimientos' }
        });

        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado' });
        }

        // Recopilar todos los mantenimientos de los vehículos del cliente, incluyendo la placa del vehículo
        const todosMantenimientos = cliente.vehiculos.flatMap(vehiculo => 
            vehiculo.mantenimientos.map(mantenimiento => ({
                ...mantenimiento.toObject(),
                vehiculo: {
                    placa: vehiculo.placa
                }
            }))
        );

        res.status(200).send(todosMantenimientos);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({ error: 'Error al obtener los mantenimientos. Por favor, intente nuevamente.' });
    }
};

export const eliminarMantenimiento = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el id del mantenimiento de los parámetros de la URL
        const clienteId = req.userId;

        // Buscar el mantenimiento por su id y asociar el vehículo al que pertenece
        const mantenimientoEncontrado = await Mantenimiento.findById(id).populate('vehiculo');
        if (!mantenimientoEncontrado) {
            return res.status(404).send({ error: 'Mantenimiento no encontrado' });
        }

        // Verificar que el cliente tiene permisos para eliminar este mantenimiento
        const cliente = await Cliente.findById(clienteId);
        if (!cliente || !cliente.vehiculos.includes(mantenimientoEncontrado.vehiculo._id)) {
            return res.status(403).send({ error: 'Acceso denegado. El cliente no tiene permisos para este vehículo.' });
        }

        // Eliminar el mantenimiento
        await Mantenimiento.findByIdAndDelete(id);

        // Eliminar la referencia al mantenimiento en el vehículo correspondiente
        const vehiculo = await Vehiculo.findById(mantenimientoEncontrado.vehiculo._id);
        vehiculo.mantenimientos = vehiculo.mantenimientos.filter(m => m.toString() !== id);
        await vehiculo.save();

        res.status(200).send({ message: 'Mantenimiento eliminado exitosamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({ error: 'Error al eliminar el mantenimiento. Por favor, intente nuevamente.' });
    }
};


export const notificacionesMantenimiento = async (req, res) => {
    try {
        const { placa, kilometrajeIngresado } = req.body;
        
        const vehiculoEncontrado = await Vehiculo.findOne({ placa: new RegExp(`^${placa}$`, 'i') }).populate('mantenimientos');

        if (!vehiculoEncontrado) {
            return res.status(404).send({ error: 'Vehículo no encontrado' });
        }

        // Verificar que el kilometraje ingresado no sea menor al kilometraje actual del vehículo
        const kilometrajeComp = vehiculoEncontrado.kilometrajeActual; // Asegúrate de que 'kilometraje' sea la propiedad correcta en el modelo
        if (kilometrajeIngresado < kilometrajeComp) {
            return res.status(400).send({ error: 'El kilometraje ingresado no puede ser menor al kilometraje actual del vehículo.' });
        }
        
        // Obtener la lista de mantenimientos del vehículo que no están realizados
        const mantenimientos = vehiculoEncontrado.mantenimientos.filter(mantenimiento => !mantenimiento.realizado);
        const alertas = [];

        for (const mantenimiento of mantenimientos) {
            const diferenciaKilometraje = kilometrajeIngresado - mantenimiento.kilometrajeCambio;

            if (diferenciaKilometraje > 100) {
                alertas.push({
                    mantenimientoId: mantenimiento._id,
                    mensaje: 'ALERTA: Mantenimiento excedido. Cambio urgente recomendado.'
                });
            } else if (diferenciaKilometraje <= 100 && diferenciaKilometraje >= 0) {
                alertas.push({
                    mantenimientoId: mantenimiento._id,
                    mensaje: 'Mantenimiento cumplido. Realizar pronto.'
                });
            } else if (diferenciaKilometraje < 0 && Math.abs(diferenciaKilometraje) < 1000) {
                alertas.push({
                    mantenimientoId: mantenimiento._id,
                    mensaje: 'Mantenimiento al día. Recomendado realizar revisión de rutina.'
                });
            } else if (diferenciaKilometraje < 0 && Math.abs(diferenciaKilometraje) >= 1000) {
                alertas.push({
                    mantenimientoId: mantenimiento._id,
                    mensaje: 'Mantenimiento pendiente. Revisar pronto.'
                });
            }
        }

        if (alertas.length > 0) {
            res.status(200).send({
                mensaje: 'Notificaciones de mantenimiento generadas',
                alertas
            });
        } else {
            res.status(200).send({
                mensaje: 'No hay alertas de mantenimiento en este momento.'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({ error: 'Error al verificar las notificaciones de mantenimiento. Por favor, revise los datos e intente nuevamente.' });
    }
};


export const desactivarMantenimiento = async (req, res) => {
    try {
        const mantenimientoId = req.params.id;

        // Busca el mantenimiento por ID
        const mantenimiento = await Mantenimiento.findById(mantenimientoId);

        if (!mantenimiento) {
            return res.status(404).json({ message: 'Mantenimiento no encontrado.' });
        }

        // Verifica si el mantenimiento ya está realizado
        if (mantenimiento.realizado) {
            return res.status(400).json({ message: 'El mantenimiento ya está realizado y no puede desactivarse nuevamente.' });
        }

        // Actualiza el estado a realizado (true)
        mantenimiento.realizado = true;
        await mantenimiento.save();

        res.status(200).json({ message: 'Mantenimiento realizado y desactivado correctamente.', mantenimiento });
    } catch (err) {
        res.status(500).json({ message: 'Error al desactivar el mantenimiento.', error: err.message });
    }
};




