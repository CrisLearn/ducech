import mongoose from 'mongoose';

const mecanicoSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true
    },
    correo: {
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
        default: true // Por defecto, el estado es verdadero (activo)
    }
});

export default mongoose.model('Mecanico', mecanicoSchema);
