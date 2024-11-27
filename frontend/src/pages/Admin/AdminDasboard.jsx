import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Bienvenido al Panel de Administración</h1>
      
      <div className="dashboard-section">
        <h2>Gestionar Usuarios</h2>
        <p>Aquí puedes agregar, editar o eliminar usuarios.</p>
        {/* Agrega tu lógica para gestionar usuarios aquí */}
      </div>

      <div className="dashboard-section">
        <h2>Configuraciones</h2>
        <p>Configura las opciones de la aplicación y preferencias del administrador.</p>
        {/* Agrega tu lógica para configuraciones aquí */}
      </div>

      <div className="dashboard-section">
        <h2>Reportes</h2>
        <p>Visualiza y descarga reportes de actividades y estadísticas.</p>
        {/* Agrega tu lógica para reportes aquí */}
      </div>
    </div>
  );
};

export default AdminDashboard;
