import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Hook para redirección

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', { correo, password });
            setSuccess(response.data.message);
            setError('');

            // Guardar el token en localStorage
            localStorage.setItem('token', response.data.token);

            // Redirigir a la página de administración
            navigate('/admin');
        } catch (err) {
            try {
                const response = await axios.post('http://localhost:5000/api/mecanico/login', { correo, password });
                setSuccess(response.data.message);
                setError('');

                // Guardar el token en localStorage
                localStorage.setItem('token', response.data.token);

                // Redirigir a la página de administración
                navigate('/mecanico');
            } catch (error) {
                setError(err.response?.data?.message || 'Error en el inicio de sesión');
                setSuccess('');
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header text-center">
                            <h3>Iniciar Sesión</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-3">
                                    <label htmlFor="correo">Correo electrónico</label>
                                    <input
                                        type="email"
                                        id="correo"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="password">Contraseña</label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Iniciar Sesión
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
