import mongoose from 'mongoose';
const { Schema } = mongoose;

const clienteSchema = new Schema({
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
    vehiculos: [{
        type: Schema.Types.ObjectId,
        ref: 'Vehiculo'
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

export default Cliente;
