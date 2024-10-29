import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true,
        unique: true, // Asegura que el nombre de usuario sea único
    },
    correo: {
        type: String,
        required: true,
        unique: true, // Asegura que el correo electrónico sea único
        match: /.+\@.+\..+/, // Valida el formato del correo electrónico
    },
    password: {
        type: String,
        required: true,
    },
    fechacreacion: {
        type: Date,
        default: Date.now, // Establece la fecha de creación por defecto
    },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
