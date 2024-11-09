import mongoose from 'mongoose';

const vehiculoSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    marca: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    placa: {
        type: String,
        required: true,
        unique: true // Asegura que cada placa sea única en la base de datos
    },
    cilindraje: {
        type: Number,
        required: true
    },
    mantenimientos:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mantrenimiento',
    }],
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Vehiculo', vehiculoSchema);
