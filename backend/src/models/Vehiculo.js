import mongoose from 'mongoose';
const { Schema } = mongoose;

const vehiculoSchema = new Schema({
    placa: {
        type: String,
        required: true,
        unique: true
    },
    tipo: {
        type: String,
        enum: ['sedan', 'suv'],
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
    cilindraje: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    kilometrajeActual: {
        type: Number,
        required: true
    },
    observacion: {
        type: String,
        default: ''
    },
    mantenimientos: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Mantenimiento' 
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

const Vehiculo = mongoose.model('Vehiculo', vehiculoSchema);

export default Vehiculo;
