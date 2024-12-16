import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Home/LandingPage';
import LoginPage from './pages/Log/LoginPage';
import AdminDashboard from './pages/Admin/AdminDasboard';
import TecnicoDashboard from './pages/Tecnico/TecnicoDashboard';
import ClientDashboard from './pages/Client/ClientDashboard';
import Registro from './pages/Log/RegisterPage';
import PrivateRoute from './services/PrivateRoutes'; 
import AdmPage from './pages/Admin/Admin'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/ducech" element={<LandingPage />} />
        <Route path="/ducech/login" element={<LoginPage />} />
        <Route path="/ducech/registro" element={<Registro />} />

        {/* Rutas privadas */}
        <Route
          path="/ducech/admin"
          element={
            <PrivateRoute>
              <AdmPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ducech/tecnico"
          element={
            <PrivateRoute>
              <TecnicoDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/ducech/cliente"
          element={
            <PrivateRoute>
              <ClientDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
