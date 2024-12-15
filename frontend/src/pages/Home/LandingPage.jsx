import React from 'react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import './LandingPage.css'; // Si tienes estilos específicos para la landing page

const LandingPage = () => {
  return (
    <div className="landing-page d-flex flex-column min-vh-100">
      <Header />
      <div>
        <div>
          <div className="text-center">
            <a href="/ducech/login" className="btn btn-primary">Iniciar Sesión</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
