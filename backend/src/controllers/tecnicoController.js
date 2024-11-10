import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tecnico from "../models/Tecnico.js";
import Cliente from '../models/Cliente.js';

export const crearTecnico = async (req, res) => {
    try {
      const { nombre, email, password, telefono, taller } = req.body;
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const nuevoTecnico = new Tecnico({
        nombre,
        email,
        password: hashedPassword,
        telefono,
        taller
      });
  
      await nuevoTecnico.save();
  
      res.status(201).json({ mensaje: 'Tecnico creado con éxito', tecnico: nuevoTecnico });
    } catch (error) {
      console.error('Error al crear el tecnico:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

export const loginTecnico = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tecnico = await Tecnico.findOne({ email });
    if (!Tecnico) {
      return res.status(404).json({mensaje: 'Tecnico no encontrado'});
    }
    const validPassword = await bcrypt.compare(password, tecnico.password);
    if (!validPassword) {
      return res.status(401).json({mensaje: 'Contraseña Incorrecta'})
    }
    const token = jwt.sign({ id:tecnico._id, email: tecnico.email }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
    res.status(200).json({mensaje:'Inicio de sesión exitoso',token});
  } catch (error) {
    console.error('Error al iniciar sesión: ',error);
    res.status(500).json({mensaje:'Error del servidor'});
  }
}

export const crearCliente = async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;
    const tecnicoId = req.user._id; 

    const nuevoCliente = new Cliente({
      tecnicoId,
      nombre,
      email,
      password,
      telefono,
      direccion
    });

    await nuevoCliente.save();

    await Tecnico.findByIdAndUpdate(tecnicoId, { $push: { clientes: nuevoCliente._id } });

    res.status(201).json({ mensaje: 'Cliente creado con éxito', cliente: nuevoCliente });
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};