import mongoose from 'mongoose';
const { Schema } = mongoose;

const tecnicoSchema = new Schema({
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
    direccion: {
        type: String,
        required: true
    },
    clientes: [{
        type: Schema.Types.ObjectId,
        ref: 'Cliente'
    }],
    vehiculos: [{
        type: Schema.Types.ObjectId,
        ref: 'Vehiculo'
    }],
    mantenimientos: [{
        type: Schema.Types.ObjectId,
        ref: 'Mantenimiento'
    }],
    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

const Tecnico = mongoose.model('Tecnico', tecnicoSchema);

export default Tecnico;
