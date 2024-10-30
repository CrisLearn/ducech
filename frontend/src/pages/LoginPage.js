import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Intentar iniciar sesión como admin
            const adminResponse = await axios.post('http://localhost:5000/api/admin/login', {
                correo: email,
                password: password,
            });
            localStorage.setItem('token', adminResponse.data.token);
            navigate('/admin'); // Redirige al panel de admin
        } catch (error) {
            // Si falla, intenta iniciar sesión como mecánico
            try {
                const mecanicoResponse = await axios.post('http://localhost:5000/api/mecanico/login', {
                    correo: email,
                    password: password,
                });
                localStorage.setItem('token', mecanicoResponse.data.token);
                navigate('/mecanico'); // Redirige al panel del mecánico
            } catch (error) {
                try {
                    const mecanicoResponse = await axios.post('http://localhost:5000/api/cliente/login', {
                        correo: email,
                        password: password,
                    });
                    localStorage.setItem('token', mecanicoResponse.data.token);
                    navigate('/cliente');
                } catch (error) {
                    setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión');
                }
            }
        }
    };

    const handleRegister = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectRole = (role) => {
        setShowModal(false);
        if (role === 'cliente') {
            navigate('/registro-cliente'); // Redirige a RegistroCliente.js
        } else if (role === 'mecanico') {
            navigate('/registro-mecanico'); // Redirige a RegistroMecanico.js
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center vh-100">
            <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico:</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-2">Iniciar Sesión</button>
                </form>
                <button onClick={handleRegister} className="btn btn-secondary w-100">Registrarse</button>
            </div>

            {/* Modal de selección de rol */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">¿Cómo te gustaría registrarte?</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body text-center">
                                <button onClick={() => handleSelectRole('cliente')} className="btn btn-outline-primary w-100 mb-2">
                                    Cliente
                                </button>
                                <button onClick={() => handleSelectRole('mecanico')} className="btn btn-outline-primary w-100">
                                    Mecánico
                                </button>
                            </div>
                            <div className="modal-footer">
                                <button onClick={handleCloseModal} className="btn btn-secondary w-100">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginPage;

