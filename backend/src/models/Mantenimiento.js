import mongoose from 'mongoose';

const mantenimientoSchema = new mongoose.Schema({
    vehiculoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehiculo',
        required: true
    },
    tecnicoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tecnico',
        required: true
    },
    fechaMantenimiento: {
        type: Date,
        required: true,
        default: Date.now
    },
    kilometrajeMantenimiento: {
        type: Number,
        required: true
    },
    tipoMantenimiento: {
        type: String,
        enum: ['preventivo', 'predictivo', 'correctivo'],
        required: true
    },
    marcaRepuesto: {
        type: String,
        required: true
    },
    proximoMantenimiento: {
        type: Number,
        required: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    detalleMantenimiento: { // Nuevo campo añadido
        type: String,
        required: true // Puedes ajustar esto a `true` si quieres que sea obligatorio
    }
});

export default mongoose.model('Mantenimiento', mantenimientoSchema);

