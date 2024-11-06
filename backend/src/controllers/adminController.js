import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createAdmin = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      nombre,
      email,
      password: hashedPassword,
      fechaCreacion: new Date()
    });

    res.status(201).json({ message: 'Administrador creado con éxito', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el administrador', error });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    // Verify the JWT token
    const { id: adminId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

    // Find the admin by ID
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update the admin's information
    const { nombre, email, password } = req.body;
    admin.nombre = nombre;
    admin.email = email;

    // Hash the new password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }

    await admin.save();

    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    if (error.nombre === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error updating admin', error });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    // Verify the JWT token
    const { id: adminId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

    // Find the admin by ID and delete
    const admin = await Admin.findByIdAndDelete(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    if (error.nombre === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error deleting admin', error });
  }
};