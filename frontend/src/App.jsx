import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Home/LandingPage';
import LoginPage from './pages/Log/LoginPage';
import AdminDashboard from './pages/Admin/AdminDasboard'; 
import TecnicoDashboard from './pages/Tecnico/TecnicoDashboard'; 
import ClientDashboard from './pages/Client/ClientDashboard'; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/ducech" element={<LandingPage />} />
        <Route path="/ducech/login" element={<LoginPage />} />
        <Route path="/ducech/Admin" element={<AdminDashboard />} />
        <Route path="/ducech/Tecnico" element={<TecnicoDashboard />} />
        <Route path="/ducech/Cliente" element={<ClientDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
