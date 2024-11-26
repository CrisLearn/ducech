import React from 'react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Sidebar from '../../components/Layout/Sidebar';
import './LandingPage.css'; // Si tienes estilos específicos para la landing page

const LandingPage = () => {
  return (
    <div className="landing-page d-flex flex-column min-vh-100">
      <Header />
      <div className="main-content d-flex flex-grow-1">
        <Sidebar />
        <div className="content flex-grow-1 p-3">
          <h1 className="text-center">Bienvenido a Mi Aplicación</h1>
          <p className="text-center">Esta es la página de inicio.</p>
          <div className="text-center">
            <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
