import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService'; // Importa el servicio

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Validación del formulario
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correos electrónicos

    if (!emailRegex.test(email)) {
      return 'Por favor, ingresa un correo electrónico válido.';
    }
    if (password.trim() === '') {
      return 'La contraseña no puede estar vacía.';
    }
    return null; // Sin errores
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Llamar al servicio de autenticación
      const result = await AuthService.login(email, password);

      if (result.success) {
        // Guarda el token
        localStorage.setItem('token', result.token);

        // Mapeo de endpoints a rutas
        const endpointToRoute = {
          'http://localhost:5000/api/admin/login-admin': '/ducech/admin',
          'http://localhost:5000/api/tecnico/login-tecnico': '/ducech/tecnico',
          'http://localhost:5000/api/cliente/login-cliente': '/ducech/cliente',
        };

        // Redirige basado en el endpoint
        const route = endpointToRoute[result.endpoint];
        if (route) {
          navigate(route);
        } else {
          setError('No se puede determinar la ruta de redirección.');
        }
      } else {
        setError('Credenciales inválidas o usuario no encontrado.');
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
      setError('Ocurrió un error al intentar iniciar sesión. Por favor, intenta nuevamente.');
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
              <a href="/ducech">« Volver</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
