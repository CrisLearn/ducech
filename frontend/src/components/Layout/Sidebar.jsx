import React from 'react';
import './Sidebar.css';

const Sidebar = ({ selectedSection, setSelectedSection }) => {
  const sections = ["Técnicos", "Clientes", "Vehículos", "Mantenimientos", "Reportes"];

  return (
    <aside className="sidebar">
      <h2>Menú</h2>
      <ul>
        {sections.map((section) => (
          <li key={section} className={selectedSection === section ? "active" : ""}>
            <button onClick={() => setSelectedSection(section)}>
              {section}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
