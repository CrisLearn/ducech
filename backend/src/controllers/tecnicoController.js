import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tecnico from '../models/Tecnico.js';
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js'; // Asegúrate de importar el modelo Cliente
import Mantenimiento from '../models/Mantenimiento.js'; // Asegúrate de importar el modelo Cliente
import PDFDocument from 'pdfkit'; 
import Admin from '../models/Admin.js';

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

        // Crear una contraseña aleatoria basada en el nombre más "123"
        const password = `${nombre}123`;

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
        const tecnicoId = req.userId; // Obtener el ID del técnico del token
        const tecnico = await Tecnico.findById(tecnicoId).populate('clientes');
        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }
        const clientes = tecnico.clientes;

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
        const tecnicoId = req.userId; // Obtener el ID del tecnico del token
        const tecnico = await Tecnico.findById(tecnicoId).populate('vehiculos');
        if (!tecnico) {
            return res.status(404).send({ error: 'Tecnico no encontrado' });
        }
        res.send(tecnico.vehiculos);
    } catch (error) { 
        res.status(500).send(error); 
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
        const tecnicoId = req.userId; // Obtener el ID del técnico del token
        const tecnico = await Tecnico.findById(tecnicoId).populate('clientes');

        if (!tecnico) {
            return res.status(404).send({ error: 'Técnico no encontrado' });
        }

        const clientes = tecnico.clientes;

        if (!clientes || clientes.length === 0) {
            return res.status(404).send({ error: 'No se encontraron clientes asignados al técnico' });
        }

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configurar el encabezado de la respuesta para enviar un PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-vehiculos.pdf');

        // Enviar el documento PDF en el cuerpo de la respuesta
        doc.pipe(res);

        // Añadir contenido al PDF
        doc.fontSize(20).text('Reporte de Vehículos Asignados', { align: 'center' });
        doc.moveDown();

        // Iterar sobre cada cliente y sus vehículos
        for (const cliente of clientes) {
            if (!cliente || !cliente.vehiculos) {
                console.warn(`Cliente o vehículos de ${cliente ? cliente.nombre : 'desconocido'} no están definidos.`);
                continue; // Saltar a la siguiente iteración si no hay vehículos
            }

            doc.fontSize(14).text(`Nombre: ${cliente.nombre || 'Desconocido'}`);
            doc.fontSize(14).text(`Email: ${cliente.email || 'Desconocido'}`);
            doc.fontSize(14).text(`Teléfono: ${cliente.telefono || 'Desconocido'}`);
            doc.fontSize(14).text(`Dirección: ${cliente.direccion || 'Desconocida'}`);
            doc.moveDown();

            if (cliente.vehiculos.length > 0) {
                doc.fontSize(14).text('Vehículos:', { underline: true });
                for (const vehiculo of cliente.vehiculos) {
                    if (!vehiculo) {
                        console.warn(`Vehículo de ${cliente.nombre} no está definido.`);
                        continue;
                    }

                        doc.fontSize(14).text(`Placa: ${vehiculo.placa}`);
                        doc.fontSize(14).text(`Tipo: ${vehiculo.tipo}`);
                        doc.fontSize(14).text(`Marca: ${vehiculo.marca}`);
                        doc.fontSize(14).text(`Modelo: ${vehiculo.modelo}`);
                        doc.fontSize(14).text(`Cilindraje: ${vehiculo.cilindraje}`);
                        doc.fontSize(14).text(`Color: ${vehiculo.color}`);
                        doc.fontSize(14).text(`Kilometraje Actual: ${vehiculo.kilometrajeActual}`);
                        doc.fontSize(14).text(`Observación: ${vehiculo.observacion}`);
                        doc.moveDown();

                    if (vehiculo.mantenimientos && vehiculo.mantenimientos.length > 0) {
                        doc.fontSize(12).text('Mantenimientos:', { underline: true });
                        for (const mantenimiento of vehiculo.mantenimientos) {
                            if (!mantenimiento) {
                                console.warn(`Mantenimiento de vehículo ${vehiculo.placa} no está definido.`);
                                continue;
                            }

                            doc.fontSize(10).text(`Descripción: ${mantenimiento.descripcion || 'N/A'}`);
                            doc.fontSize(10).text(`Tipo de Mantenimiento: ${mantenimiento.tipoMantenimiento || 'N/A'}`);
                            doc.fontSize(10).text(`Detalle del Mantenimiento: ${mantenimiento.detalleMantenimiento || 'N/A'}`);
                            doc.fontSize(10).text(`Marca del Repuesto: ${mantenimiento.marcaRepuesto || 'N/A'}`);
                            doc.fontSize(10).text(`Kilometraje Actual: ${mantenimiento.kilometrajeActual || 'N/A'}`);
                            doc.fontSize(10).text(`Kilometraje del Cambio: ${mantenimiento.kilometrajeCambio || 'N/A'}`);
                            doc.fontSize(10).text(`Detalle General: ${mantenimiento.detalleGeneral || 'N/A'}`);
                            doc.fontSize(10).text(`Fecha: ${mantenimiento.fechaCreacion ? mantenimiento.fechaCreacion.toISOString().split('T')[0] : 'N/A'}`);
                            doc.moveDown();
                        }
                    } else {
                        doc.fontSize(10).text('Sin mantenimientos registrados.');
                    }
                    doc.moveDown();
                }
            } else {
                doc.fontSize(12).text('Sin vehículos registrados.');
            }
            doc.moveDown();
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
        const tecnicoId = req.userId; // Obtener el ID del tecnico del token
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
            return res.status(404).send({ error: 'Tecnico no encontrado' });
        }

        // Recopilar todos los mantenimientos de los vehículos de los clientes del técnico
        const mantenimientos = [];
        tecnico.clientes.forEach(cliente => {
            cliente.vehiculos.forEach(vehiculo => {
                vehiculo.mantenimientos.forEach(mantenimiento => {
                    mantenimientos.push(mantenimiento);
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
        const tecnico = await Tecnico.findById(tecnicoId).populate({
            path: 'clientes',
            populate: {
                path: 'vehiculos', // Populate vehicles of each client
            },
        });

        if (!tecnico) {
            return res.status(400).send({ error: 'No se encontró al técnico' });
        }

        const clientes = tecnico.clientes;

        if (!clientes || clientes.length === 0) {
            return res.status(404).send({ error: 'No se encontraron clientes asignados al técnico' });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-mantenimientos.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Mantenimientos', { align: 'center' });
        doc.moveDown();

        for (const cliente of clientes) {
            if (!cliente) {
                console.warn('Cliente no definido.');
                continue;
            }

            const vehiculos = cliente.vehiculos;
            if (!vehiculos || vehiculos.length === 0) {
                console.warn(`El cliente ${cliente.nombre} no tiene vehículos asignados.`);
                doc.fontSize(14).text(`Cliente: ${cliente.nombre} - No tiene vehículos asignados.`);
                doc.moveDown();
                continue;
            }

            doc.fontSize(14).text(`Cliente: ${cliente.nombre}`);
            doc.moveDown();

            for (const vehiculo of vehiculos) {
                if (!vehiculo) {
                    console.warn('Vehículo no definido.');
                    continue;
                }

                // Check if vehicle has maintenance information
                if (!vehiculo.mantenimientos || vehiculo.mantenimientos.length === 0) {
                    console.warn(`El vehículo con placa ${vehiculo.placa} no tiene mantenimientos.`);
                    doc.fontSize(14).text(`Placa: ${vehiculo.placa} - Sin mantenimientos registrados.`);
                    doc.moveDown();
                    continue;
                }

                // Add vehicle details to the PDF
                doc.fontSize(14).text(`Placa: ${vehiculo.placa}`);
                doc.moveDown();
                
                doc.fontSize(12).text('Mantenimientos:', { underline: true });
                doc.moveDown();
                
                for (const mantenimiento of vehiculo.mantenimientos) {
                    if (!mantenimiento) {
                        console.warn(`Mantenimiento de vehículo ${vehiculo.placa} no está definido.`);
                        continue;
                    }
                
                    // Log para verificar los valores de mantenimiento
                    console.log('Mantenimiento:', mantenimiento);
                
                    doc.fontSize(10).text(`Descripción: ${mantenimiento.descripcion || 'N/A'}`);
                    doc.fontSize(10).text(`Tipo de Mantenimiento: ${mantenimiento.tipoMantenimiento || 'N/A'}`);
                    doc.fontSize(10).text(`Detalle del Mantenimiento: ${mantenimiento.detalleMantenimiento || 'N/A'}`);
                    doc.fontSize(10).text(`Marca del Repuesto: ${mantenimiento.marcaRepuesto || 'N/A'}`);
                    doc.fontSize(10).text(`Kilometraje Actual: ${mantenimiento.kilometrajeActual || 'N/A'}`);
                    doc.fontSize(10).text(`Kilometraje del Cambio: ${mantenimiento.kilometrajeCambio || 'N/A'}`);
                    doc.fontSize(10).text(`Detalle General: ${mantenimiento.detalleGeneral || 'N/A'}`);
                    doc.fontSize(10).text(`Fecha: ${mantenimiento.fechaCreacion ? mantenimiento.fechaCreacion.toISOString().split('T')[0] : 'N/A'}`);
                    doc.moveDown();
                }
                
                
                doc.moveDown();
            }
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
};




