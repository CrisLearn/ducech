import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegistroMecanico() {
    const [formData, setFormData] = useState({
        usuario: '',
        correo: '',
        password: '',
        telefono: '',
        taller: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/mecanico/registrar-mecanico', formData);
            navigate('/login'); // Redirige a la página de inicio de sesión después del registro exitoso
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error en el registro');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h2 className="text-center mb-4">Registro de Mecánico</h2>
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
                            <label htmlFor="taller">Taller</label>
                            <input
                                type="text"
                                className="form-control"
                                id="taller"
                                name="taller"
                                value={formData.taller}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Registrarse</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegistroMecanico;
