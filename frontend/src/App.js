import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/custom.css';
import { AdminRoute, TecnicoRoute, ClienteRoute } from './Routes/ProtectedRoute';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistroPage from './components/RegistroPage';
import AdminDashboard from './layouts/AdminLayout';
import TecnicoDashboard from './layouts/TecnicoLayout';
import ClienteDashboard from './layouts/ClienteLayout';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/ducech" element={<LandingPage />} />
                    <Route path="/ducech/login" element={<LoginPage />} />
                    <Route path="/ducech/registro" element={<RegistroPage />} />
                    <Route path="/ducech/administrador" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/ducech/tecnico" element={<TecnicoRoute><TecnicoDashboard /></TecnicoRoute>} />
                    <Route path="/ducech/cliente" element={<ClienteRoute><ClienteDashboard /></ClienteRoute>} />
                    <Route path="*" element={<Navigate to="/ducech" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

