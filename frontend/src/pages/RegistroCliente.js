import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClienteForm = () => {
    const [formData, setFormData] = useState({
        usuario: '',
        correo: '',
        password: '',
        telefono: '',
        direccion: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/cliente/registrar-cliente', formData);
            navigate('/login'); // Redirige a la página de inicio de sesión después del registro exitoso
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error en el registro');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h2 className="text-center mb-4">Registro de Cliente</h2>
                    {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label htmlFor="usuario">Usuario</label>
                            <input
                                type="text"
                                className="form-control"
                                id="usuario"
                                name="usuario"
                                value={formData.usuario}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="correo">Correo Electrónico</label>
                            <input
                                type="email"
                                className="form-control"
                                id="correo"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="direccion">Dirección</label>
                            <input
                                type="text"
                                className="form-control"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Registrar Cliente</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClienteForm;
