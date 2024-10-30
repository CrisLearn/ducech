import Mecanico  from "../models/Mecanico.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerMecanico = async (req, res) => {
    const {usuario, correo, password, taller} = req.body;
    try {
        const existinMecanico = await Mecanico.findOne({ correo });
        if (existinMecanico) {
            return res.status(400).json({message: 'El correo ya está registrado'}); 
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newMecanico = new Mecanico({
            usuario,
            correo,
            password: hashedPassword,
            taller,
        })
        const savedMecanico = await newMecanico.save();
        res.status(201).json({message:'Mecanico Registrado',mecanico:savedMecanico});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

export const loginMecanico = async (req, res) => {
    const {correo, password} = req.body;
    try {
        const mecanico = await Mecanico.findOne({correo});
        if (!mecanico) {
            return res.status(404).json({message:'Mecanico no encontrado'});
        }
        const isMatch = await bcrypt.compare(password, mecanico.password);
        if (!isMatch) {
            return res.status(400).json({message:'Contraseña incorrecta'});
        }
        const token = jwt.sign({id: mecanico._id },process.env.JWT_SECRET, {expiresIn:'1h'});
        res.status(200).json({message:'Inicio de sesión exitoso',token});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}