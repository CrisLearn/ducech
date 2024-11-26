import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const endpoints = [
    'http://localhost:5000/api/admin/login-admin',
    'http://localhost:5000/api/tecnico/login-tecnico',
    'http://localhost:5000/api/cliente/login-cliente',
  ];

  const authenticate = async (email, password) => {
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, role: data.role };
        }
      } catch (error) {
        console.error(`Error al intentar en ${endpoint}:`, error);
      }
    }
    return { success: false }; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos

    const result = await authenticate(email, password);

    if (result.success) {
      alert(`Bienvenido, ${result.role}!`);
    } else {
      setError('Credenciales inválidas o usuario no encontrado.');
    }
  };

  return (
    <div className="background">
      <div id="contenedor">
        <div id="contenedorcentrado">
          {/* Sección del login */}
          <div id="login">
            <form id="loginform" onSubmit={handleSubmit}>
              <label htmlFor="usuario">Correo</label>
              <input
                id="usuario"
                type="text"
                name="usuario"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="error">{error}</p>}
              <button type="submit" title="Ingresar" name="Ingresar">
                Login
              </button>
            </form>
          </div>

          {/* Sección derecha con texto y enlaces */}
          <div id="derecho">
            <div className="titulo">Bienvenido</div>
            <hr />
            <div className="pie-form">
              <a href="/forgot">¿Perdiste tu contraseña?</a>
              <a href="/register">¿No tienes Cuenta? Regístrate</a>
              <hr />
              <a href="ducech">« Volver</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
