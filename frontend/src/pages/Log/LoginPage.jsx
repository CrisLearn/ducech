import React from 'react';
import './LoginPage.css'; // Archivo donde están los estilos dados

const LoginPage = () => {
  return (
    <div className="background">
      <div id="contenedor">
        <div id="contenedorcentrado">
          {/* Sección del login */}
          <div id="login">
            <form id="loginform">
              <label htmlFor="usuario">Correo</label>
              <input
                id="usuario"
                type="text"
                name="usuario"
                placeholder="Correo"
                required
              />
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Contraseña"
                required
              />
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
              <a href="#">¿Perdiste tu contraseña?</a>
              <a href="/register">¿No tienes Cuenta? Regístrate</a>
              <hr />
              <a href="#">« Volver</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
