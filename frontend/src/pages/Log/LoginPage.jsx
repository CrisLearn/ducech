import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService'; // Importa el servicio

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos

    const result = await AuthService.login(email, password);

    if (result.success) {
      // Guarda el token en localStorage o como sea necesario
      localStorage.setItem('token', result.token);

      // Redirige basado en el endpoint
      switch (result.endpoint) {
        case 'http://localhost:5000/api/admin/login-admin':
          navigate('/ducech/admin');
          break;
        case 'http://localhost:5000/api/tecnico/login-tecnico':
          navigate('/ducech/tecnico');
          break;
        case 'http://localhost:5000/api/cliente/login-cliente':
          navigate('/ducech/cliente');
          break;
        default:
          setError('No se puede determinar la ruta de redirección.');
      }
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
                type="email"
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
              <a href="/ducech/registro">¿No tienes Cuenta? Regístrate</a>
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
