import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/custom.css';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistroPage from './components/RegistroPage';


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                <Route path="/ducech" element={<LandingPage />} />
                <Route path="/ducech/login" element={<LoginPage />} />
                <Route path="/ducech/registro" element={<RegistroPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
