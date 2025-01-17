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
    realizado: {
        type: Boolean,
        default: false 
    },
    vehiculo: {
        type: Schema.Types.ObjectId,
        ref: 'Vehiculo',
        required: true 
    }
});

const Mantenimiento = mongoose.model('Mantenimiento', mantenimientoSchema);

export default Mantenimiento;
