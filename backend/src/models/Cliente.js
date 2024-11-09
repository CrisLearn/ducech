import mongoose from 'mongoose';

const { Schema } = mongoose;

const clienteSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo'
  }],
  tecnicoId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tecnico',
    required: false
  }],
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

export default Cliente;
