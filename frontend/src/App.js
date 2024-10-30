import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage'
import MecanicoPage from './pages/MecanicoPage'
import ClientePage from './pages/ClientePage'
import RegistroCliente from './pages/RegistroCliente';
import RegistroMecanico from './pages/RegistroMecanico';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/mecanico" element={<MecanicoPage />} />
                    <Route path="/cliente" element={<ClientePage />} />
                    <Route path="/registro-mecanico" element={<RegistroMecanico />} />
                    <Route path="/registro-cliente" element={<RegistroCliente />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
