import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Cliente from '../models/Cliente.js'; // Asegúrate de que la ruta sea correcta

// Crear un nuevo Cliente
export const createCliente = async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const cliente = new Cliente({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      direccion,
    });

    await cliente.save();

    res.status(201).json({ message: 'Cliente creado exitosamente', cliente });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el cliente', error });
  }
};

// Iniciar sesión de un Cliente
export const loginCliente = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el Cliente por correo
    const cliente = await Cliente.findOne({ email });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Comparar la contraseña proporcionada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, cliente.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: cliente.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

// Actualizar un Cliente
export const updateCliente = async (req, res) => {
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
        const { id: clienteId } = jwt.verify(token, process.env.JWT_SECRET);
  
        // Buscar el técnico por su ID
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).json({ message: 'Técnico no encontrado' });
        }
  
        // Actualizar solo los campos que se proporcionen
        const { nombre, email, password, telefono, taller } = req.body;
        if (nombre !== undefined) cliente.nombre = nombre;
        if (email !== undefined) cliente.email = email;
        if (telefono !== undefined) cliente.telefono = telefono;
        if (taller !== undefined) cliente.taller = taller;
  
        // Hashear la nueva contraseña si es proporcionada
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            cliente.password = hashedPassword;
        }
  
        await cliente.save();
  
        res.status(200).json({ message: 'Cliente actualizado exitosamente', cliente });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        res.status(500).json({ message: 'Error al actualizar el cliente', error });
    }
  };

// Eliminar un Cliente
export const deleteCliente = async (req, res) => {
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
    const { id: clienteId } = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el cliente por su ID y eliminar
    const cliente = await Cliente.findByIdAndDelete(clienteId);

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(500).json({ message: 'Error al eliminar el cliente', error });
  }
};
