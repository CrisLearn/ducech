import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Asegúrate de que este archivo CSS esté correctamente enlazado

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Hook para navegar a otra página

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', {
                correo: email,
                password: password,
            });

            // Guarda el token JWT en el almacenamiento local si el inicio de sesión es exitoso
            localStorage.setItem('token', response.data.token);
            navigate('/admin'); // Redirige a AdminPage directamente
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    const handleRegister = () => {
        navigate('/register'); // Redirige a la página de registro
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Iniciar Sesión</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Correo Electrónico:</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
                </form>
                <button onClick={handleRegister} className="btn btn-secondary">Registrarse</button>
            </div>
        </div>
    );
}

export default LoginPage;
