import Mantenimiento from '../models/Mantenimiento.js';

export const registrarMantenimiento = async (req, res) => {
    try {
        const {
            vehiculoId,
            mecanicoId,
            fechaMantenimiento,
            kilometrajeMantenimiento,
            tipoMantenimiento,
            marcaRepuesto,
            proximoMantenimiento,
            detalleMantenimiento // Agrega el nuevo campo aquí
        } = req.body;

        // Crear un nuevo registro de mantenimiento
        const nuevoMantenimiento = new Mantenimiento({
            vehiculoId,
            mecanicoId,
            fechaMantenimiento,
            kilometrajeMantenimiento,
            tipoMantenimiento,
            marcaRepuesto,
            proximoMantenimiento,
            detalleMantenimiento, // Asegúrate de incluirlo aquí
            fechaRegistro: Date.now() // La fecha actual como fecha de registro
        });

        // Guardar el nuevo mantenimiento en la base de datos
        await nuevoMantenimiento.save();

        res.status(201).json({ message: 'Mantenimiento registrado exitosamente', mantenimiento: nuevoMantenimiento });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el mantenimiento', error: error.message });
    }
};
