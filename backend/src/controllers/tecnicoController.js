import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Tecnico from '../models/Tecnico.js';
import Cliente from '../models/Cliente.js';

// Create a new Tecnico
export const createTecnico = async (req, res) => {
  try {
    const { nombre, email, password, telefono, taller } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const tecnico = new Tecnico({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      taller,
    });

    await tecnico.save();

    res.status(201).json({ message: 'Tecnico created', tecnico });
  } catch (error) {
    res.status(500).json({ message: 'Error creating tecnico', error });
  }
};

// Login a tecnico
export const loginTecnico = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the Tecnico by email
    const tecnico = await Tecnico.findOne({ email });

    if (!tecnico) {
      return res.status(404).json({ message: 'Tecnico not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, tecnico.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: tecnico.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Update a tecnico
export const updateTecnico = async (req, res) => {
  try {
      // Verificar que el encabezado de autorización esté presente
      const authHeader = req.headers.authorization;
      if (!authHeader) {
          return res.status(401).json({ message: 'Token no proporcionado' });
      }

      // Extraer el token del encabezado (formato: "Bearer <token>")
      const token = authHeader.split(' ')[1];
      if (!token) {
          return res.status(401).json({ message: 'Token inválido' });
      }

      // Verificar el token JWT
      const { id: tecnicoId } = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el técnico por su ID
      const tecnico = await Tecnico.findById(tecnicoId);
      if (!tecnico) {
          return res.status(404).json({ message: 'Técnico no encontrado' });
      }

      // Actualizar solo los campos que se proporcionen
      const { nombre, email, password, telefono, taller } = req.body;
      if (nombre !== undefined) tecnico.nombre = nombre;
      if (email !== undefined) tecnico.email = email;
      if (telefono !== undefined) tecnico.telefono = telefono;
      if (taller !== undefined) tecnico.taller = taller;

      // Hashear la nueva contraseña si es proporcionada
      if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          tecnico.password = hashedPassword;
      }

      await tecnico.save();

      res.status(200).json({ message: 'Técnico actualizado exitosamente', tecnico });
  } catch (error) {
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Token inválido' });
      }
      res.status(500).json({ message: 'Error al actualizar el técnico', error });
  }
};


// Delete a tecnico
export const deleteTecnico = async (req, res) => {
  try {
    // Verificar el token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Verificar el token JWT
    const { id: tecnicoId } = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el tecnico por su ID y eliminar
    const tecnico = await Tecnico.findByIdAndDelete(tecnicoId);

    if (!tecnico) {
      return res.status(404).json({ message: 'Tecnico no encontrado' });
    }

    res.status(200).json({ message: 'Tecnico eliminado exitosamente' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(500).json({ message: 'Error al eliminar el tecnico', error });
  }
};

export const createCliente = async (req, res) => {
  try {
    // Obtener y verificar el token de autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { id: tecnicoId } = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el técnico autenticado en la base de datos
    const tecnico = await Tecnico.findById(tecnicoId);
    if (!tecnico) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }

    // Crear un nuevo cliente con los datos proporcionados
    const { nombre, email, password, telefono, direccion, vehiculoId } = req.body;

    // Hashear la contraseña del cliente
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el cliente con el ID del técnico asignado automáticamente
    const cliente = new Cliente({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      direccion,
      vehiculoId,
      tecnico: tecnicoId // Asignación automática del ID del técnico
    });

    // Guardar el cliente en la base de datos
    await cliente.save();

    // Añadir el cliente recién creado a la lista de clientes del técnico
    tecnico.clientes.push(cliente._id);
    await tecnico.save();

    res.status(201).json({
      message: 'Cliente creado y asignado al técnico exitosamente',
      cliente
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(500).json({ message: 'Error al crear cliente para técnico', error });
  }
};