import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService'; // Importa el servicio

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para el mensaje de éxito
  const navigate = useNavigate();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Por favor, ingresa un correo electrónico válido.';
    }
    if (password.trim() === '') {
      return 'La contraseña no puede estar vacía.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = await AuthService.login(email, password);

      if (result.success) {
        localStorage.setItem('token', result.token);

        const endpointToRoute = {
          'http://localhost:5000/api/admin/login-admin': '/ducech/admin',
          'http://localhost:5000/api/tecnico/login-tecnico': '/ducech/tecnico',
          'http://localhost:5000/api/cliente/login-cliente': '/ducech/cliente',
        };

        const route = endpointToRoute[result.endpoint];
        if (route) {
          if (route === '/ducech/cliente') {
            setSuccessMessage('Inicio de sesión exitoso. Actualiza el kilometraje de tu vehículo para no olvidar tus mantenimientos pendientes.');
          }
          setTimeout(() => navigate(route), 3000);
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

      {successMessage && (
        <div className="success-overlay">
          <div className="success-modal">
            <h2>¡Éxito!</h2>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
