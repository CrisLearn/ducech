import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        match: /.+\@.+\..+/, 
    },
    password: {
        type: String,
        required: true,
    },
    fechacreacion: {
        type: Date,
        default: Date.now, 
    },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
