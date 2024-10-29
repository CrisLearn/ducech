import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Asegúrate de tener el Navbar importado
import axios from 'axios';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', {
                correo: email,
                password: password,
            });

            // Guarda el token JWT en el almacenamiento local si el inicio de sesión es exitoso
            localStorage.setItem('token', response.data.token);
            alert('Inicio de sesión exitoso');
            // Redireccionar o realizar otra acción después del inicio de sesión
        } catch (error) {
            // Captura y muestra el mensaje de error
            setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div>
            <Navbar />
            <h2>Iniciar Sesión</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Correo Electrónico:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
}

export default LoginPage;
