import mongoose from 'mongoose';
const { Schema } = mongoose;

const mantenimientoSchema = new Schema({
    tipoMantenimiento: {
        type: String,
        enum: ['preventivo', 'predictivo', 'correctivo'],
        required: true
    },
    detalleMantenimiento: {
        type: String,
        enum: ['Cambio de Aceite', 'Cambio de Pastillas de Freno', 'Revisión General'],
        required: true
    },
    marcaRepuesto: {
        type: String,
        required: true
    },
    kilometrajeActual: {
        type: Number,
        required: true
    },
    kilometrajeCambio: {
        type: Number,
        required: true
    },
    detalleGeneral: {
        type: String,
        required: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    vehiculo: {
        type: Schema.Types.ObjectId,
        ref: 'Vehiculo',
        required: true // Esto asegura que un mantenimiento debe estar asociado a un vehículo
    }
});

const Mantenimiento = mongoose.model('Mantenimiento', mantenimientoSchema);

export default Mantenimiento;
