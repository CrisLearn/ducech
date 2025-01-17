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

app.use(cors(corsOptions));


app.use(express.json());

app.use('/api', routes);




export default app;
