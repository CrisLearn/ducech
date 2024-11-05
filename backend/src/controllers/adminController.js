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
    const admin = await Admin.findOne({ where: { email } });

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
    const { id } = req.params;
    const { nombre, email, password } = req.body;
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }

    admin.nombre = nombre || admin.nombre;
    admin.email = email || admin.email;
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();
    res.status(200).json({ message: 'Administrador actualizado con éxito', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el administrador', error });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }

    await admin.destroy();
    res.status(200).json({ message: 'Administrador eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el administrador', error });
  }
};
