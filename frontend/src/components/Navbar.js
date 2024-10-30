import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav>
            <h1>Sistema Web</h1>
            <ul>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/login">Iniciar Sesión</Link></li>
            </ul>
        </nav>
    );
}

export default Navbar;
