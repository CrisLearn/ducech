import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService'; // Importa el servicio

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para el mensaje de éxito
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(''); // Estado para el mensaje de "olvidaste tu contraseña"
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
          [`${process.env.REACT_APP_API_URL}/api/admin/login-admin`]: '/admin',
          [`${process.env.REACT_APP_API_URL}/api/tecnico/login-tecnico`]: '/tecnico',
          [`${process.env.REACT_APP_API_URL}/api/cliente/login-cliente`]: '/cliente',
        };
        

        const route = endpointToRoute[result.endpoint];
        if (route) {
          if (route === '/cliente') {
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

  const handleForgotPassword = (e) => {
    e.preventDefault(); // Evita la navegación predeterminada
    setForgotPasswordMessage('Por favor, contáctate con soporte para recuperar tu contraseña.');
  
    // Abre el enlace de WhatsApp en una nueva pestaña después de 3 segundos
    setTimeout(() => {
      window.open('https://wa.me/qr/VOCKHZYNN7DUL1', '_blank');
    }, 3000);
  };
  ;
  

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
              <a href="/forgot" onClick={handleForgotPassword}>
                ¿Perdiste tu contraseña?
              </a>
              <a href="/registro">¿No tienes Cuenta? Regístrate</a>
              <hr />
              <a href="/">« Volver</a>
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

      {forgotPasswordMessage && (
        <div className="info-overlay">
          <div className="info-modal">
            <h2>Recuperación de contraseña</h2>
            <p>{forgotPasswordMessage}</p>
            <button onClick={() => setForgotPasswordMessage('')}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
