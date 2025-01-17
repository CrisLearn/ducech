// src/service/mailService.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Utiliza las variables de entorno para las credenciales
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const enviarCorreo = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    return transporter.enviarCorreo(mailOptions);
};
