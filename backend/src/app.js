import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; 
import routes from './routes/index.js'; 

const app = express();

connectDB();

app.use(cors({
    origin: 'http://localhost:3000' 
}));


app.use(express.json());


app.use('/api', routes); 


export default app;
