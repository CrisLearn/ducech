import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // Ruta a la configuración de la base de datos
import routes from './routes/index.js'; // Ruta a tu archivo de rutas

const app = express();

// Conectar a la base de datos
connectDB();

app.use(cors({
    origin: 'http://localhost:3000' // Reemplaza con el origen de tu frontend
}));

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Definir rutas
app.use('/api', routes); // Todas las rutas estarán bajo el prefijo /api

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API en funcionamiento');
});

export default app;
