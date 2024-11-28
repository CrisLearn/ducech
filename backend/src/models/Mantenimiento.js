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
        enum: ['cambioAceite', 'cambioPastillasFreno', 'revisionGeneral'],
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
    }
});

const Mantenimiento = mongoose.model('Mantenimiento', mantenimientoSchema);

export default Mantenimiento;
