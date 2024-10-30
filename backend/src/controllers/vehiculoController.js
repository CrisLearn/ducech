import Vehiculo from '../models/Vehiculo.js';

export const registrarVehiculo = async (req, res) => {
    try {
        const {
            clienteId,
            marca,
            modelo,
            year,
            placa,
            cilindraje
        } = req.body;

        // Verificar si ya existe un vehículo con la misma placa
        const vehiculoExistente = await Vehiculo.findOne({ placa });
        if (vehiculoExistente) {
            return res.status(400).json({ message: 'El vehículo con esta placa ya está registrado.' });
        }

        // Crear el nuevo vehículo
        const nuevoVehiculo = new Vehiculo({
            clienteId,
            marca,
            modelo,
            year,
            placa,
            cilindraje,
            fechaRegistro: Date.now()
        });

        // Guardar el nuevo vehículo en la base de datos
        await nuevoVehiculo.save();

        res.status(201).json({ message: 'Vehículo registrado exitosamente', vehiculo: nuevoVehiculo });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el vehículo', error: error.message });
    }
};
