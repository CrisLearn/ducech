import React from 'react';
import './TecnicoDashboard.css';

const TecnicoDashboard = () => {
  return (
    <div className="tecnico-dashboard">
      <h1>Bienvenido al Panel de Técnico</h1>

      <div className="dashboard-section">
        <h2>Gestionar Tareas</h2>
        <p>Aquí puedes ver, asignar y actualizar tareas técnicas.</p>
        {/* Agrega tu lógica para gestionar tareas aquí */}
      </div>

      <div className="dashboard-section">
        <h2>Informes</h2>
        <p>Visualiza informes de servicios y mantenimiento realizados.</p>
        {/* Agrega tu lógica para ver informes aquí */}
      </div>

      <div className="dashboard-section">
        <h2>Recursos Técnicos</h2>
        <p>Accede a manuales, guías y otros recursos técnicos.</p>
        {/* Agrega tu lógica para acceder a recursos técnicos aquí */}
      </div>
    </div>
  );
};

export default TecnicoDashboard;
