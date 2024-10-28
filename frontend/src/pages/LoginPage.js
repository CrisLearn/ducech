import React from 'react';
import Navbar from '../components/Navbar'; // Asegúrate de tener el Navbar importado

function LoginPage() {
    return (
        <div>
            <Navbar />
            <h2>Iniciar Sesión</h2>
            <form>
                <div>
                    <label>Correo Electrónico:</label>
                    <input type="email" required />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input type="password" required />
                </div>
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
}

export default LoginPage;
