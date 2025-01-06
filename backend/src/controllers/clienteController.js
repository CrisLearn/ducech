import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from "../models/Admin.js";
import Tecnico from "../models/Tecnico.js";
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';
import Mantenimiento from '../models/Mantenimiento.js';
import PDFDocument from 'pdfkit';
import transporter from '../config/nodemailer.js';
import moment from 'moment';

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
export const getClienteProfile = async (req, res) => {
    try {
        // Obtener el ID del administrador desde el middleware de autenticación
        const clienteId = req.userId;

        // Buscar el administrador por ID
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).send({ error: 'tecncio no encontrado' });
        }

        // Retornar los datos del perfil
        res.send({
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
        });
    } catch (error) {
        console.error('Error al obtener el perfil del tecncio:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
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
        const { id } = req.params; // ID del vehículo desde la URL
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

        // Actualizar el vehículo
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
            { new: true } // Retornar el documento actualizado
        );

        if (!updatedVehiculo) {
            return res.status(404).send({ error: 'Vehículo no encontrado' });
        }

        // Buscar los mantenimientos asociados al vehículo
        const mantenimientos = await Mantenimiento.find({ vehiculo: updatedVehiculo._id });

        // Buscar al cliente asociado al vehículo
        const cliente = await Cliente.findOne({ vehiculos: updatedVehiculo._id });

        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado para este vehículo' });
        }

        // Verificar mantenimientos y enviar notificación si corresponde
        for (const mantenimiento of mantenimientos) {
            const kilometrajeFaltante = mantenimiento.kilometrajeCambio - kilometrajeActual;

            // Generar mensaje basado en las condiciones
            let mensaje = '';
            if (!mantenimiento.realizado) {
                if (kilometrajeFaltante > 1000) {
                    mensaje = `Mantenimiento al día. Aún faltan ${kilometrajeFaltante} kilómetros para el próximo mantenimiento.\n\nTipo de mantenimiento:\nTipo: ${mantenimiento.tipoMantenimiento}\nDetalle del Mantenimiento: ${mantenimiento.detalleMantenimiento}\nKilometraje Programado: ${mantenimiento.kilometrajeCambio}\nMarca del Repuesto: ${mantenimiento.marcaRepuesto}`;
                } else if (kilometrajeFaltante > 0 && kilometrajeFaltante <= 1000) {
                    mensaje = `Mantenimiento por cumplirse. Faltan ${kilometrajeFaltante} kilómetros para el próximo mantenimiento.\n\nTipo de mantenimiento:\nTipo: ${mantenimiento.tipoMantenimiento}\nDetalle del Mantenimiento: ${mantenimiento.detalleMantenimiento}\nKilometraje Programado: ${mantenimiento.kilometrajeCambio}\nMarca del Repuesto: ${mantenimiento.marcaRepuesto}`;
                } else if (kilometrajeFaltante <= 0 && Math.abs(kilometrajeFaltante) <= 500) {
                    mensaje = `Mantenimiento cumplido. Realice el cambio, ya que se ha alcanzado el kilometraje programado.\n\nTipo de mantenimiento:\nTipo: ${mantenimiento.tipoMantenimiento}\nDetalle del Mantenimiento: ${mantenimiento.detalleMantenimiento}\nKilometraje Programado: ${mantenimiento.kilometrajeCambio}\nMarca del Repuesto: ${mantenimiento.marcaRepuesto}`;
                } else if (Math.abs(kilometrajeFaltante) > 500) {
                    mensaje = `Mantenimiento excedido. ¡Cambiar inmediatamente! Ha superado el kilometraje recomendado por ${Math.abs(kilometrajeFaltante)} kilómetros.\n\nTipo de mantenimiento:\nTipo: ${mantenimiento.tipoMantenimiento}\nDetalle del Mantenimiento: ${mantenimiento.detalleMantenimiento}\nKilometraje Programado: ${mantenimiento.kilometrajeCambio}\nMarca del Repuesto: ${mantenimiento.marcaRepuesto}`;
                }

                // Enviar correo al cliente
                if (mensaje) {
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: cliente.email,
                        subject: 'Notificación de Mantenimiento',
                        text: `Placa del vehículo: ${placa}\n\n${mensaje}`,
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(`Correo de notificación enviado a ${cliente.email} para el vehículo con placa ${placa}`);
                }
            }
        }

        res.status(200).send(updatedVehiculo);
    } catch (error) {
        console.error(error); // Registrar el error en consola
        res.status(400).send({ error: 'Error al actualizar el vehículo. Por favor, revise los datos e intente nuevamente.' });
    }
};




export const createVehiculoForCliente = async (req, res) => {
    try {
        const { placa, tipo, marca, modelo, cilindraje, color, kilometrajeActual, observacion } = req.body;
        const clienteId = req.userId; // Obtener el ID del cliente del token

        // Verificar si ya existe un vehículo con la misma placa
        const vehiculoExistente = await Vehiculo.findOne({ placa: new RegExp(`^${placa}$`, 'i') });
        if (vehiculoExistente) {
            return res.status(400).send({ error: 'Placa ya registrada para otro vehículo' });
        }

        // Crear el nuevo vehículo
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

        // Enviar el correo al cliente con la información del vehículo registrado
        const mailOptions = {
            from: process.env.EMAIL,
            to: cliente.email,  // Asumimos que el cliente tiene un campo de 'email'
            subject: 'Vehículo Registrado Exitosamente',
            text: `Hola ${cliente.nombre},\n\nTu vehículo con la placa ${placa} ha sido registrado exitosamente en nuestra plataforma. Detalles del vehículo:\n\nTipo: ${tipo}\nMarca: ${marca}\nModelo: ${modelo}\nCilindraje: ${cilindraje}\nColor: ${color}\nKilometraje actual: ${kilometrajeActual}\nObservaciones: ${observacion}\n\n¡Gracias por confiar en nosotros!`,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        // Responder con el nuevo vehículo
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

import path from 'path';
import { fileURLToPath } from 'url'; // Para trabajar con import.meta.url

export const generateVehiculosReport = async (req, res) => {
    try {
        // Obtener __dirname equivalente
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

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

        const doc = new PDFDocument({ margin: 50 });

        // Configurar el encabezado para el PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-vehiculos.pdf');

        doc.pipe(res); // Pipe para enviar el PDF en la respuesta

        // Insertar imagen en la cabecera
        const logoPath = path.join(__dirname, '../../public/images/logo2.png');
        doc.image(logoPath, 50, 45, { width: 100 })
           .font('Helvetica-Bold')
           .fontSize(24)
           .fillColor('#007BFF')
           .text('Reporte de Vehículos', 200, 50, { align: 'center' })
           .moveDown(2);

        // Información del cliente
        doc.font('Helvetica')
           .fontSize(16)
           .fillColor('#000')
           .text(`Cliente: ${cliente.nombre}`)
           .text(`Correo: ${cliente.email}`)
           .text(`Fecha de reporte: ${new Date().toISOString().split('T')[0]}`)
           .moveDown();

        // Iterar sobre los vehículos
        cliente.vehiculos.forEach((vehiculo, index) => {
            doc.font('Helvetica-Bold')
               .fontSize(18)
               .fillColor('#333')
               .text(`Vehículo ${index + 1}: ${vehiculo.placa}`, { underline: true })
               .moveDown(0.5);

            doc.font('Helvetica')
               .fontSize(14)
               .fillColor('#000')
               .text(`Tipo: ${vehiculo.tipo}`)
               .text(`Marca: ${vehiculo.marca}`)
               .text(`Modelo: ${vehiculo.modelo}`)
               .text(`Cilindraje: ${vehiculo.cilindraje}`)
               .text(`Color: ${vehiculo.color}`)
               .text(`Kilometraje Actual: ${vehiculo.kilometrajeActual}`)
               .text(`Observación: ${vehiculo.observacion}`)
               .moveDown();

            if (vehiculo.mantenimientos.length > 0) {
                doc.font('Helvetica-Bold')
                   .fontSize(16)
                   .fillColor('#007BFF')
                   .text('Mantenimientos:', { underline: true })
                   .moveDown(0.5);

                vehiculo.mantenimientos.forEach((mantenimiento, idx) => {
                    doc.font('Helvetica-Bold')
                       .fontSize(14)
                       .fillColor('#333')
                       .text(`Mantenimiento ${idx + 1}`, { align: 'left' })
                       .moveDown(0.3);

                    doc.font('Helvetica')
                       .fontSize(12)
                       .fillColor('#000')
                       .text(`Tipo: ${mantenimiento.tipoMantenimiento}`)
                       .text(`Detalle: ${mantenimiento.detalleMantenimiento}`)
                       .text(`Marca del Repuesto: ${mantenimiento.marcaRepuesto}`)
                       .text(`Kilometraje Actual: ${mantenimiento.kilometrajeActual}`)
                       .text(`Kilometraje Cambio: ${mantenimiento.kilometrajeCambio}`)
                       .text(`Detalle General: ${mantenimiento.detalleGeneral}`)
                       .text(`Fecha: ${mantenimiento.fechaCreacion.toISOString().split('T')[0]}`)
                       .text(`Realizado: ${mantenimiento.realizado ? 'Sí' : 'No'}`)
                       .moveDown();
                });
            } else {
                doc.font('Helvetica-Italic')
                   .fontSize(12)
                   .fillColor('#FF0000')
                   .text('Sin mantenimientos registrados.')
                   .moveDown();
            }

            doc.moveDown(1).lineWidth(1).strokeColor('#CCCCCC').moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);
        });

        doc.end(); // Finalizar el documento
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send({ error: 'Error al generar el PDF.' });
    }
};


export const createMantenimientoForVehiculo = async (req, res) => {
    try {
        const { placa, tipoMantenimiento, detalleMantenimiento, marcaRepuesto, kilometrajeActual, kilometrajeCambio, detalleGeneral } = req.body;
        const clienteId = req.userId;

        const vehiculoEncontrado = await Vehiculo.findOne({ placa: new RegExp(`^${placa}$`, 'i') }).populate('mantenimientos');

        if (!vehiculoEncontrado) {
            return res.status(404).send({ error: 'Vehículo no encontrado' });
        }

        const cliente = await Cliente.findById(clienteId);
        if (!cliente || !cliente.vehiculos.includes(vehiculoEncontrado._id)) {
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
            vehiculo: vehiculoEncontrado._id
        });

        await newMantenimiento.save();

        // Añadir el mantenimiento al vehículo
        vehiculoEncontrado.mantenimientos.push(newMantenimiento._id);

        // Establecer la fecha del próximo mantenimiento, por ejemplo, en 6 meses o 10000 km más
        const fechaProximoMantenimiento = moment().add(2, 'months'); // Por ejemplo, 6 meses después
        vehiculoEncontrado.proximoMantenimiento = fechaProximoMantenimiento.toDate();

        await vehiculoEncontrado.save();

        // Enviar el correo de notificación al cliente
        const mailOptions = {
            from: process.env.EMAIL,
            to: cliente.email,
            subject: 'Mantenimiento Registrado Exitosamente',
            text: `Hola ${cliente.nombre},\n\nEl mantenimiento de tu vehículo con la placa ${placa} ha sido registrado exitosamente. Detalles:\n\nTipo de mantenimiento: ${tipoMantenimiento}\nDetalle: ${detalleMantenimiento}\nMarca de repuesto: ${marcaRepuesto}\nKilometraje actual: ${kilometrajeActual}\nKilometraje de cambio: ${kilometrajeCambio}\n\nEl próximo mantenimiento se estima para: ${fechaProximoMantenimiento.format('YYYY-MM-DD')}\n\n¡Gracias por confiar en nosotros!`,
        };

        await transporter.sendMail(mailOptions);

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




