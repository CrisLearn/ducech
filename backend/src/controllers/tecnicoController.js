import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tecnico from '../models/Tecnico.js';
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js'; // Asegúrate de importar el modelo Cliente
import Mantenimiento from '../models/Mantenimiento.js'; // Asegúrate de importar el modelo Cliente
import PDFDocument from 'pdfkit'; 
import Admin from '../models/Admin.js';
import transporter from '../config/nodemailer.js';

// Método para crear un nuevo técnico
export const createTecnico = async (req, res) => {
    try {
        const { nombre, email, password, telefono, taller, direccion } = req.body;

        // Verificar si el correo ya está registrado en cualquiera de los modelos
        const [existingTecnico, existingAdmin] = await Promise.all([
            Tecnico.findOne({ email }),
            Admin.findOne({ email })
        ]);

        if (existingTecnico) {
            return res.status(400).send({ message: 'El correo ya está registrado' });
        }

        if (existingAdmin) {
            return res.status(400).send({ message: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear el nuevo técnico
        const newTecnico = new Tecnico({
            nombre,
            email,
            password: hashedPassword,
            telefono,
            taller,
            direccion,
            fechaCreacion: new Date()
        });

        // Guardar en la base de datos
        await newTecnico.save();

        // Respuesta exitosa
        res.status(201).send({
            message: 'Técnico registrado exitosamente.',
            tecnico: newTecnico
        });
    } catch (error) {
        // Manejar otros errores
        console.error('Error al crear el técnico:', error);

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

export const getTecnicoProfile = async (req, res) => {
    try {
        // Obtener el ID del administrador desde el middleware de autenticación
        const tecnicoId = req.userId;

        // Buscar el administrador por ID
        const tecnico = await Tecnico.findById(tecnicoId);
        if (!tecnico) {
            return res.status(404).send({ error: 'tecncio no encontrado' });
        }

        // Retornar los datos del perfil
        res.send({
            nombre: tecnico.nombre,
            email: tecnico.email,
            telefono: tecnico.telefono,
            taller: tecnico.taller,
            direccion: tecnico.direccion,
        });
    } catch (error) {
        console.error('Error al obtener el perfil del tecncio:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
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
        const token = jwt.sign({ id: tecnico._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

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
      const { nombre, email, telefono, direccion } = req.body;
      const tecnicoId = req.userId; // Obtener el ID del técnico del token
  
      const nombreSinEspacios = nombre.replace(/[^a-zA-Z]/g, '');
      const password = `${nombreSinEspacios.substring(0, 5).toLowerCase()}123`;
  
      // Encriptar la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newCliente = new Cliente({
        nombre,
        email,
        password: hashedPassword,
        telefono,
        direccion,
        fechaCreacion: new Date(),
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
  
      // Enviar correo al cliente con su contraseña
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Bienvenido a DUCECH',
        text: `Hola ${nombre},\n\nGracias por registrarte. Aquí tienes tu contraseña para acceder a nuestra plataforma:\n\nContraseña: ${password}\n\nPor favor, cámbiala después de iniciar sesión por primera vez.\n\nSaludos,\nEl equipo de DUCECH.`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(201).send(newCliente);
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      res.status(400).send({ error: 'Error al crear el cliente. Por favor, revise los datos e intente nuevamente.' });
    }
  };
  

export const getAllClientes = async (req, res) => { 
    try {
        const tecnicoId = req.userId; // Obtener el ID del técnico del token
        const tecnico = await Tecnico.findById(tecnicoId).populate('clientes');
        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }
        res.send(tecnico.clientes);
    } catch (error) {
        res.status(500).send(error);
    }
};


export const getClienteById = async (req, res) => { 
    try {
        const tecnicoId = req.userId; // Obtener el ID del técnico del token
        const clienteId = req.params.id;
        
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            match: { _id: clienteId }
        });
        
        if (!tecnico || tecnico.clientes.length === 0) {
            return res.status(404).send({ error: 'Cliente no encontrado o no asignado a este técnico' });
        }
        
        res.send(tecnico.clientes[0]);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateClienteForTecnico = async (req, res) => {
    try {
      const { id } = req.params; // Obtener el ID del cliente desde la URL
      const { nombre, email, telefono, direccion } = req.body;
  
      // Buscar el cliente por ID y actualizarlo con los nuevos datos
      const updatedCliente = await Cliente.findByIdAndUpdate(
        id,
        {
          nombre,
          email,
          telefono,
          direccion,
          fechaActualizacion: new Date()
        },
        { new: true } // Esta opción devuelve el documento modificado en lugar del original
      );
  
      if (!updatedCliente) {
        return res.status(404).send({ error: 'Cliente no encontrado' });
      }
  
      res.status(200).send(updatedCliente);
    } catch (error) {
      console.error(error); // Agregar log para ver el error en la consola
      res.status(400).send({ error: 'Error al actualizar el cliente. Por favor, revise los datos e intente nuevamente.' });
    }
  };

export const updateVehiculoForTecnico = async (req, res) => {
    try {
      const { id } = req.params; // Obtener el ID del cliente desde la URL
      const { tipo, marca, modelo, cilindraje, color, kilometrajeActual, observacion } = req.body;
  
      // Buscar el cliente por ID y actualizarlo con los nuevos datos
      const updatedVehiculos = await Vehiculo.findByIdAndUpdate(
        id,
        {
          tipo,
          marca,
          modelo,
          cilindraje,
          color,
          kilometrajeActual,
          observacion,
          fechaActualizacion: new Date()
        },
        { new: true } // Esta opción devuelve el documento modificado en lugar del original
      );
  
      if (!updatedVehiculos) {
        return res.status(404).send({ error: 'Vehiculo no encontrado' });
      }
  
      res.status(200).send(updatedVehiculos);
    } catch (error) {
      console.error(error); // Agregar log para ver el error en la consola
      res.status(400).send({ error: 'Error al actualizar el vehiculo. Por favor, revise los datos e intente nuevamente.' });
    }
  };
  
  
  

  export const generateClientesReport = async (req, res) => {
    try {
        const tecnicoId = req.userId;
        // Modificamos el populate para incluir los vehículos de los clientes
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            populate: {
                path: 'vehiculos'  // Agregamos populate anidado para los vehículos
            }
        });

        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        const clientes = tecnico.clientes;

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar el encabezado de la respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-clientes.pdf');

        // Pipe al response
        doc.pipe(res);

        // Título del reporte
        doc.fontSize(20).text('Reporte de Clientes', { align: 'center' });
        doc.moveDown();

        // Iterar sobre los clientes
        clientes.forEach(cliente => {
            // Información del cliente
            doc.fontSize(16).text('Información del Cliente', { underline: true });
            doc.fontSize(14).text(`Nombre: ${cliente.nombre}`);
            doc.fontSize(14).text(`Email: ${cliente.email}`);
            doc.fontSize(14).text(`Teléfono: ${cliente.telefono}`);
            doc.fontSize(14).text(`Dirección: ${cliente.direccion}`);
            doc.moveDown();

            // Información de vehículos
            doc.fontSize(14).text('Vehículos:', { underline: true });
            if (cliente.vehiculos && cliente.vehiculos.length > 0) {
                cliente.vehiculos.forEach((vehiculo, index) => {
                    doc.fontSize(12).text(`Vehículo ${index + 1}:`);
                    doc.fontSize(12).text(`  • Placa: ${vehiculo.placa}`);
                    // Puedes agregar más campos del vehículo aquí
                    if (vehiculo.marca) doc.fontSize(12).text(`  • Marca: ${vehiculo.marca}`);
                    if (vehiculo.modelo) doc.fontSize(12).text(`  • Modelo: ${vehiculo.modelo}`);
                    if (vehiculo.año) doc.fontSize(12).text(`  • Año: ${vehiculo.año}`);
                    doc.moveDown();
                });
            } else {
                doc.fontSize(12).text('Sin vehículos registrados');
            }
            
            // Agregar línea separadora entre clientes
            doc.moveDown();
            doc.strokeColor('#000000')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            doc.moveDown();
        });

        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send({ error: 'Error al generar el reporte PDF' });
    }
};

export const createVehiculoForTecnico = async (req, res) => {
    try {
        const { placa, tipo, marca, modelo, cilindraje, color, kilometrajeActual, observacion, clienteId } = req.body;
        const tecnicoId = req.userId; // Obtener el ID del técnico del token

        // Verificar si el cliente existe
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).send({ error: 'Cliente no encontrado' });
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

        // Añadir el vehículo a la lista de vehículos del cliente
        cliente.vehiculos.push(newVehiculo._id);
        await cliente.save();

        // Asignar el vehículo al técnico también si es necesario (opcional)
        const tecnico = await Tecnico.findById(tecnicoId);
        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        tecnico.vehiculos.push(newVehiculo._id);
        await tecnico.save();

        res.status(201).send(newVehiculo);
    } catch (error) {
        console.error(error); // Agregar log para ver el error en la consola
        res.status(400).send({ error: 'Error al crear el vehículo. Por favor, revise los datos e intente nuevamente.' });
    }
};


export const getAllVehiculos = async (req, res) => { 
    try {
        const tecnicoId = req.userId; // Obtener el ID del técnico del token
        
        // Buscar al técnico y hacer un populate de los clientes y los vehículos de los clientes
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes', // Asumo que el técnico tiene un campo "clientes"
            populate: {
                path: 'vehiculos', // Y que cada cliente tiene un campo "vehiculos"
            }
        });

        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        // Obtener todos los vehículos de los clientes y del técnico
        const vehiculosClientes = tecnico.clientes.flatMap(cliente => cliente.vehiculos);
        const todosLosVehiculos = [...tecnico.vehiculos, ...vehiculosClientes]; // Combinar vehículos

        // Responder con todos los vehículos
        res.send(todosLosVehiculos);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al obtener los vehículos', detalle: error.message });
    }
};


export const getVehiculoById = async (req, res) => { 
    try {
        const tecnicoId = req.userId; // Obtener el ID del técnico del token
        const vehiculoId = req.params.id;
        
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'vehiculos',
            match: { _id: vehiculoId }
        });
        
        if (!tecnico || tecnico.vehiculos.length === 0) {
            return res.status(404).send({ error: 'Vehiculo no encontrado o no asignado a este técnico' });
        }
        
        res.send(tecnico.vehiculos[0]);
    } catch (error) {
        res.status(500).send(error);
    }
};


export const generateVehiculosReport = async (req, res) => {
    try {
        const tecnicoId = req.userId;
        
        // Modificamos el populate para incluir los vehículos y sus mantenimientos
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            populate: {
                path: 'vehiculos',
                populate: {
                    path: 'mantenimientos'  // Agregamos populate para los mantenimientos
                }
            }
        });

        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        const clientes = tecnico.clientes;

        if (!clientes || clientes.length === 0) {
            return res.status(404).send({ error: 'No se encontraron clientes asignados al técnico' });
        }

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar el encabezado de la respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-vehiculos.pdf');

        // Pipe al response
        doc.pipe(res);

        // Título del reporte
        doc.fontSize(20).text('Reporte de Vehículos Asignados', { align: 'center' });
        doc.moveDown();

        // Iterar sobre cada cliente
        for (const cliente of clientes) {
            // Verificación de seguridad para cliente
            if (!cliente) continue;

            // Sección de información del cliente
            doc.fontSize(16).text('Información del Cliente', { underline: true });
            doc.fontSize(14).text(`Nombre: ${cliente.nombre || 'No especificado'}`);
            doc.fontSize(14).text(`Email: ${cliente.email || 'No especificado'}`);
            doc.fontSize(14).text(`Teléfono: ${cliente.telefono || 'No especificado'}`);
            doc.fontSize(14).text(`Dirección: ${cliente.direccion || 'No especificada'}`);
            doc.moveDown();

            // Verificar y mostrar vehículos
            if (cliente.vehiculos && cliente.vehiculos.length > 0) {
                doc.fontSize(14).text('Vehículos:', { underline: true });
                
                for (const vehiculo of cliente.vehiculos) {
                    if (!vehiculo) continue;

                    // Sección de información del vehículo
                    doc.fontSize(12).text('Datos del Vehículo:', { underline: true });
                    doc.fontSize(12).text(`Placa: ${vehiculo.placa || 'No especificada'}`);
                    doc.fontSize(12).text(`Tipo: ${vehiculo.tipo || 'No especificado'}`);
                    doc.fontSize(12).text(`Marca: ${vehiculo.marca || 'No especificada'}`);
                    doc.fontSize(12).text(`Modelo: ${vehiculo.modelo || 'No especificado'}`);
                    doc.fontSize(12).text(`Cilindraje: ${vehiculo.cilindraje || 'No especificado'}`);
                    doc.fontSize(12).text(`Color: ${vehiculo.color || 'No especificado'}`);
                    doc.fontSize(12).text(`Kilometraje Actual: ${vehiculo.kilometrajeActual || 'No especificado'}`);
                    doc.fontSize(12).text(`Observación: ${vehiculo.observacion || 'Sin observaciones'}`);
                    doc.moveDown();

                    // Verificar y mostrar mantenimientos
                    if (vehiculo.mantenimientos && vehiculo.mantenimientos.length > 0) {
                        doc.fontSize(12).text('Historial de Mantenimientos:', { underline: true });
                        
                        for (const mantenimiento of vehiculo.mantenimientos) {
                            if (!mantenimiento) continue;

                            doc.fontSize(10).text('Detalles del Mantenimiento:', { italic: true });
                            doc.fontSize(10).text(`• Descripción: ${mantenimiento.descripcion || 'No especificada'}`);
                            doc.fontSize(10).text(`• Tipo: ${mantenimiento.tipoMantenimiento || 'No especificado'}`);
                            doc.fontSize(10).text(`• Detalle: ${mantenimiento.detalleMantenimiento || 'No especificado'}`);
                            doc.fontSize(10).text(`• Marca del Repuesto: ${mantenimiento.marcaRepuesto || 'No especificada'}`);
                            doc.fontSize(10).text(`• Kilometraje Actual: ${mantenimiento.kilometrajeActual || 'No especificado'}`);
                            doc.fontSize(10).text(`• Kilometraje del Cambio: ${mantenimiento.kilometrajeCambio || 'No especificado'}`);
                            doc.fontSize(10).text(`• Detalle General: ${mantenimiento.detalleGeneral || 'No especificado'}`);
                            doc.fontSize(10).text(`• Fecha: ${mantenimiento.fechaCreacion ? 
                                new Date(mantenimiento.fechaCreacion).toLocaleDateString() : 'No especificada'}`);
                            doc.moveDown();
                        }
                    } else {
                        doc.fontSize(10).text('Sin mantenimientos registrados');
                    }
                    
                    // Línea separadora entre vehículos
                    doc.strokeColor('#000000')
                       .lineWidth(0.5)
                       .moveTo(50, doc.y)
                       .lineTo(550, doc.y)
                       .stroke();
                    doc.moveDown();
                }
            } else {
                doc.fontSize(12).text('Sin vehículos registrados');
            }

            // Línea separadora entre clientes
            doc.strokeColor('#000000')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            doc.moveDown(2);
        }

        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
};




// Método para crear un nuevo mantenimiento para un vehículo de un cliente registrado por el técnico
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

        const tecnicoId = req.userId; 

        const vehiculoEncontrado = await Vehiculo.findOne({ placa: new RegExp(`^${placa}$`, 'i') }).populate('mantenimientos');

        if (!vehiculoEncontrado) {
            return res.status(404).send({ error: 'Vehículo no encontrado' });
        }

        // Verificar que el vehículo pertenece al cliente autenticado
        const tecnico = await Tecnico.findById(tecnicoId);
        if (!tecnico || !tecnico.vehiculos.includes(vehiculoEncontrado._id)) {
            console.log('Permisos del tecnico:', tecnico ? tecnico.vehiculos : 'No se encontró tecnico');
            return res.status(403).send({ error: 'Acceso denegado. El tecnico no tiene permisos para este vehículo.' });
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



export const getAllMantenimientos = async (req, res) => {
    try {
        const tecnicoId = req.userId; // Obtener el ID del técnico del token
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            populate: {
                path: 'vehiculos',
                populate: {
                    path: 'mantenimientos'
                }
            }
        });

        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        // Recopilar todos los mantenimientos con la placa del vehículo
        const mantenimientos = [];
        tecnico.clientes.forEach(cliente => {
            cliente.vehiculos.forEach(vehiculo => {
                vehiculo.mantenimientos.forEach(mantenimiento => {
                    mantenimientos.push({
                        ...mantenimiento.toObject(), // Convertir el mantenimiento a objeto plano
                        placa: vehiculo.placa // Agregar la placa del vehículo
                    });
                });
            });
        });

        res.send(mantenimientos);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};


export const eliminarMantenimientoPorTecnico = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el id del mantenimiento de los parámetros de la URL
        const tecnicoId = req.userId;

        // Buscar el mantenimiento por su id y asociar el vehículo al que pertenece
        const mantenimientoEncontrado = await Mantenimiento.findById(id).populate('vehiculo');
        if (!mantenimientoEncontrado) {
            return res.status(404).send({ error: 'Mantenimiento no encontrado' });
        }

        // Verificar que el técnico tiene permisos para eliminar este mantenimiento
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            populate: {
                path: 'vehiculos',
                populate: {
                    path: 'mantenimientos'
                }
            }
        });

        if (!tecnico) {
            return res.status(403).send({ error: 'Acceso denegado. El técnico no tiene permisos para este mantenimiento.' });
        }

        // Verificar si el mantenimiento pertenece a algún vehículo de los clientes del técnico
        let permisoEliminacion = false;
        tecnico.clientes.forEach(cliente => {
            cliente.vehiculos.forEach(vehiculo => {
                if (vehiculo._id.equals(mantenimientoEncontrado.vehiculo._id)) {
                    permisoEliminacion = true;
                }
            });
        });

        if (!permisoEliminacion) {
            return res.status(403).send({ error: 'Acceso denegado. El técnico no tiene permisos para este mantenimiento.' });
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

export const desactivarMantenimientoPorTecnico = async (req, res) => {
    try {
        const mantenimientoId = req.params.id;
        const tecnicoId = req.userId;

        // Busca el mantenimiento por ID y popula el vehículo asociado
        const mantenimiento = await Mantenimiento.findById(mantenimientoId).populate('vehiculo');
        if (!mantenimiento) {
            return res.status(404).json({ message: 'Mantenimiento no encontrado.' });
        }

        // Verifica si el mantenimiento ya está realizado
        if (mantenimiento.realizado) {
            return res.status(400).json({ message: 'El mantenimiento ya está realizado y no puede desactivarse nuevamente.' });
        }

        // Verificar que el técnico tiene permisos para desactivar este mantenimiento
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            populate: {
                path: 'vehiculos',
                populate: {
                    path: 'mantenimientos'
                }
            }
        });

        if (!tecnico) {
            return res.status(403).json({ message: 'Acceso denegado. El técnico no tiene permisos para este mantenimiento.' });
        }

        // Verificar si el mantenimiento pertenece a algún vehículo de los clientes del técnico
        let permisoDesactivacion = false;
        tecnico.clientes.forEach(cliente => {
            cliente.vehiculos.forEach(vehiculo => {
                if (vehiculo._id.equals(mantenimiento.vehiculo._id)) {
                    permisoDesactivacion = true;
                }
            });
        });

        if (!permisoDesactivacion) {
            return res.status(403).json({ message: 'Acceso denegado. El técnico no tiene permisos para este mantenimiento.' });
        }

        // Actualiza el estado a realizado (true)
        mantenimiento.realizado = true;
        await mantenimiento.save();

        res.status(200).json({ message: 'Mantenimiento realizado y desactivado correctamente.', mantenimiento });
    } catch (err) {
        res.status(500).json({ message: 'Error al desactivar el mantenimiento.', error: err.message });
    }
};

export const generateMantenimientosReport = async (req, res) => {
    try {
        const tecnicoId = req.userId;
        
        // Agregamos el populate anidado para incluir los mantenimientos
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            populate: {
                path: 'vehiculos',
                populate: {
                    path: 'mantenimientos'
                }
            }
        });

        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        const clientes = tecnico.clientes;

        if (!clientes || clientes.length === 0) {
            return res.status(404).send({ error: 'No se encontraron clientes asignados al técnico' });
        }

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar encabezados
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-mantenimientos.pdf');

        doc.pipe(res);

        // Título principal
        doc.fontSize(20).text('Reporte de Mantenimientos', { align: 'center' });
        doc.moveDown(2);

        // Iterar sobre cada cliente
        for (const cliente of clientes) {
            if (!cliente || !cliente.vehiculos) continue;

            // Agregar información del cliente
            doc.fontSize(16).text('Cliente:', { underline: true });
            doc.fontSize(12).text(`Nombre: ${cliente.nombre || 'No especificado'}`);
            doc.fontSize(12).text(`Teléfono: ${cliente.telefono || 'No especificado'}`);
            doc.moveDown();

            // Iterar sobre los vehículos del cliente
            for (const vehiculo of cliente.vehiculos) {
                if (!vehiculo) continue;

                // Información del vehículo
                doc.fontSize(14).text('Información del Vehículo:', { underline: true });
                doc.fontSize(12).text(`Placa: ${vehiculo.placa || 'No especificada'}`);
                doc.fontSize(12).text(`Marca: ${vehiculo.marca || 'No especificada'}`);
                doc.fontSize(12).text(`Modelo: ${vehiculo.modelo || 'No especificado'}`);
                doc.fontSize(12).text(`Kilometraje Actual: ${vehiculo.kilometrajeActual || 'No especificado'}`);
                doc.moveDown();

                // Verificar y mostrar mantenimientos
                if (vehiculo.mantenimientos && vehiculo.mantenimientos.length > 0) {
                    doc.fontSize(12).text('Historial de Mantenimientos:', { underline: true });
                    doc.moveDown();

                    for (const mantenimiento of vehiculo.mantenimientos) {
                        if (!mantenimiento) continue;

                        // Cuadro de mantenimiento
                        doc.fontSize(11).text('Detalles del Mantenimiento:', { italic: true });
                        
                        // Información principal
                        doc.fontSize(10)
                           .text(`• Fecha: ${mantenimiento.fechaCreacion ? 
                               new Date(mantenimiento.fechaCreacion).toLocaleDateString() : 'No especificada'}`)
                           .text(`• Tipo: ${mantenimiento.tipoMantenimiento || 'No especificado'}`)
                           .text(`• Descripción: ${mantenimiento.descripcion || 'No especificada'}`);
                        
                        // Información de kilometraje
                        doc.fontSize(10)
                           .text(`• Kilometraje Actual: ${mantenimiento.kilometrajeActual || 'No especificado'}`)
                           .text(`• Kilometraje del Próximo Cambio: ${mantenimiento.kilometrajeCambio || 'No especificado'}`);
                        
                        // Detalles técnicos
                        doc.fontSize(10)
                           .text(`• Marca del Repuesto: ${mantenimiento.marcaRepuesto || 'No especificada'}`)
                           .text(`• Detalle del Mantenimiento: ${mantenimiento.detalleMantenimiento || 'No especificado'}`)
                           .text(`• Detalle General: ${mantenimiento.detalleGeneral || 'No especificado'}`);
                        
                        // Línea separadora entre mantenimientos
                        doc.moveDown()
                           .strokeColor('#cccccc')
                           .lineWidth(0.5)
                           .moveTo(50, doc.y)
                           .lineTo(550, doc.y)
                           .stroke()
                           .moveDown();
                    }
                } else {
                    doc.fontSize(10).text('Sin mantenimientos registrados');
                }

                // Línea separadora entre vehículos
                doc.strokeColor('#999999')
                   .lineWidth(0.5)
                   .moveTo(50, doc.y)
                   .lineTo(550, doc.y)
                   .stroke();
                doc.moveDown(2);
            }

            // Línea separadora entre clientes
            doc.strokeColor('#000000')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            doc.moveDown(2);
        }

        // Finalizar el PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
};