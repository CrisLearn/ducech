import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Cliente from './models/Cliente.js'; // Modelo de clientes

dotenv.config();

const app = express();

// Conexión a la base de datos
connectDB();

// Configuración de CORS
const corsOptions = {
  origin: ['https://ducech.com', 'http://localhost:3000'], // URLs permitidas
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware para JSON
app.use(express.json());

// Rutas principales
app.use('/api', routes);

// Configuración de transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

// Función para enviar recordatorios a los clientes
const sendReminderToClients = async () => {
  try {
    const clientes = await Cliente.find(); // Obtiene todos los clientes
    if (clientes.length === 0) {
      console.log('No hay clientes registrados.');
      return;
    }

    for (const cliente of clientes) {
      await transporter.sendMail({
        from: `"Recordatorio Frecuente" <${process.env.EMAIL}>`,
        to: cliente.email,
        subject: 'Recordatorio de Mantenimiento Programado',
        text: `¡Hola ${cliente.nombre}!

Queremos recordarte la importancia de mantener el kilometraje de tu vehículo actualizado. Esto te ayudará a cumplir con los mantenimientos programados y garantizará el óptimo desempeño y seguridad de tu vehículo.

Mantener tu vehículo en perfectas condiciones no solo alarga su vida útil, sino que también te asegura viajes más seguros y sin contratiempos.

¡No lo olvides! Estamos aquí para ayudarte con cualquier duda o consulta.

Saludos cordiales,
DUCECH`,
      });
      console.log(`Correo enviado a ${cliente.email}`);
    }
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

// Endpoint para activar el envío de recordatorios
app.post('/api/send-reminders', async (req, res) => {
  try {
    await sendReminderToClients();
    res.status(200).send('Recordatorios enviados exitosamente.');
  } catch (error) {
    console.error('Error en el endpoint de recordatorios:', error);
    res.status(500).send('Error al enviar los recordatorios.');
  }
});

// Exportar la app
export default app;
