import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Home/LandingPage';
import LoginPage from './pages/Log/LoginPage'; // Importar la página de inicio de sesión

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/ducech" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;
