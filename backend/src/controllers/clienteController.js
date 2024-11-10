import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Cliente from '../models/Cliente.js';
import Vehiculo from "../models/Vehiculo.js";
import Mantenimiento from "../models/Mantenimiento.js";

// Método para crear un nuevo cliente
export const crearCliente = async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoCliente = new Cliente({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      direccion
    });

    await nuevoCliente.save();

    res.status(201).json({ mensaje: 'Cliente creado con éxito', cliente: nuevoCliente });
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Método para iniciar sesión
export const loginCliente = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el cliente por email
    const cliente = await Cliente.findOne({ email });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, cliente.password);

    if (!validPassword) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: cliente._id, email: cliente.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({ mensaje: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

export const crearVehiculo = async (req, res) => {
  try {
    const { marca, modelo, year, placa, cilindraje } = req.body;
    const clienteId = req.user._id; // Obtener el clienteId del usuario logueado

    // Validar los datos recibidos
    if (!marca || !modelo || !year || !placa || !cilindraje) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Crear un nuevo vehículo
    const nuevoVehiculo = new Vehiculo({
      clienteId,
      marca,
      modelo,
      year,
      placa,
      cilindraje
    });

    // Guardar el vehículo en la base de datos
    await nuevoVehiculo.save();

    // Actualizar el documento del cliente con el ID del nuevo vehículo
    await Cliente.findByIdAndUpdate(clienteId, { $push: { vehiculos: nuevoVehiculo._id } });

    // Responder con éxito
    res.status(201).json({ mensaje: 'Vehículo creado con éxito', vehiculo: nuevoVehiculo });
  } catch (error) {
    console.error('Error al crear el vehículo:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

export const crearMantenimiento = async (req, res) => {
  try {
    const { vehiculoId, tecnicoId, fechaMantenimiento, kilometrajeMantenimiento, tipoMantenimiento, marcaRepuesto, proximoMantenimiento, detalleMantenimiento } = req.body;
    const clienteId = req.user._id; // Obtener el clienteId del usuario logueado

    // Validar los datos recibidos
    if (!vehiculoId || !tecnicoId || !fechaMantenimiento || !kilometrajeMantenimiento || !tipoMantenimiento || !marcaRepuesto || !proximoMantenimiento || !detalleMantenimiento) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar que el vehículo pertenezca al cliente
    const vehiculo = await Vehiculo.findOne({ _id: vehiculoId, clienteId });

    if (!vehiculo) {
      return res.status(404).json({ mensaje: 'Vehículo no encontrado o no pertenece al cliente' });
    }

    // Crear un nuevo mantenimiento
    const nuevoMantenimiento = new Mantenimiento({
      vehiculoId,
      tecnicoId,
      fechaMantenimiento,
      kilometrajeMantenimiento,
      tipoMantenimiento,
      marcaRepuesto,
      proximoMantenimiento,
      detalleMantenimiento
    });

    // Guardar el mantenimiento en la base de datos
    await nuevoMantenimiento.save();

    // Responder con éxito
    res.status(201).json({ mensaje: 'Mantenimiento creado con éxito', mantenimiento: nuevoMantenimiento });
  } catch (error) {
    console.error('Error al crear el mantenimiento:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

