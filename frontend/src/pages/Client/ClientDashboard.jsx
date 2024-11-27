import React from 'react';
import './ClienteDashboard.css';

const ClienteDashboard = () => {
  return (
    <div className="cliente-dashboard">
      <h1>Bienvenido al Panel de Cliente</h1>

      <div className="dashboard-section">
        <h2>Historial de Servicios</h2>
        <p>Aquí puedes ver el historial de todos los servicios que has solicitado.</p>
        {/* Agrega tu lógica para ver el historial de servicios aquí */}
      </div>

      <div className="dashboard-section">
        <h2>Mis Datos</h2>
        <p>Gestiona tus datos personales y preferencias de cuenta.</p>
        {/* Agrega tu lógica para gestionar datos personales aquí */}
      </div>

      <div className="dashboard-section">
        <h2>Soporte</h2>
        <p>Accede a ayuda y soporte técnico.</p>
        {/* Agrega tu lógica para soporte aquí */}
      </div>
    </div>
  );
};

export default ClienteDashboard;
