import React from 'react';
import './Sidebar.css'; // Si tienes estilos específicos para el sidebar

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><a href="/ducech">Inicio</a></li>
          <li><a href="/login">Iniciar Sesión</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

