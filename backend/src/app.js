import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; 
import routes from './routes/index.js'; 
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import dotenv from 'dotenv';
import Cliente from './models/Cliente.js'; // Modelo de clientes

dotenv.config();

const app = express();

connectDB();
const corsOptions = {
  origin: 'https://ducech.com',  // Cambia esto por la URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors({
    origin: 'http://localhost:3000' 
}));

app.use(express.json());

app.use('/api', routes);

// Configuración de transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

// Función para enviar el recordatorio a todos los clientes
const sendReminderToClients = async () => {
  try {
    const clientes = await Cliente.find(); // Obtiene todos los clientes de la base de datos
    if (clientes.length === 0) {
      console.log('No hay clientes registrados.');
      return;
    }

    for (const cliente of clientes) {
      const info = await transporter.sendMail({
        from: `"Recordatorio Frecuente" <${process.env.EMAIL}>`,
        to: cliente.email, // Envía el correo al cliente
        subject: 'Recordatorio de Mantenimiento Programado',
        text: `¡Hola ${cliente.nombre}!

        Queremos recordarte la importancia de mantener el kilometraje de tu vehículo actualizado. Esto te ayudará a cumplir con los mantenimientos programados y garantizará el óptimo desempeño y seguridad de tu vehículo.

        Mantener tu vehículo en perfectas condiciones no solo alarga su vida útil, sino que también te asegura viajes más seguros y sin contratiempos.

        ¡No lo olvides! Estamos aquí para ayudarte con cualquier duda o consulta.

        Saludos cordiales,
        DUCECH`,

      });
      console.log(`Correo enviado a ${cliente.email}: %s`, info.messageId);
    }
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

// Programar el envío del correo cada 30 segundos */30 * * * * *
cron.schedule('0 0 * * *', () => {
  console.log('Enviando recordatorio a clientes...');
  sendReminderToClients();
});


export default app;
