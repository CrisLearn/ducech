import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
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
    direccion: {
        type: String,
        required: true
    },
    vehiculoId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehiculo'
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Cliente', clienteSchema);
