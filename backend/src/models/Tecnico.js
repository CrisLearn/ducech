import mongoose from 'mongoose';

const tecnicoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    taller: {
        type: String,
        required: true
    },
    clienteId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente'
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: Boolean,
        default: true 
    }
});

export default mongoose.model('Tecnico', tecnicoSchema);
