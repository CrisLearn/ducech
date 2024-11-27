import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ adminName = "Administrador" }) => {
  const [selectedSection, setSelectedSection] = useState("Técnicos");
  const [tecnicos, setTecnicos] = useState([]);
  const [clientes, setClientes] = useState([]); // Nuevo estado para clientes
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedSection === "Técnicos") {
      const fetchTecnicos = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No se encontró un token de autenticación. Por favor, inicia sesión.");
          }

          const response = await fetch("http://localhost:5000/api/admin/tecnicos", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error al obtener la lista de técnicos. Verifica tu autenticación.");
          }

          const data = await response.json();
          setTecnicos(data);
          setError("");
        } catch (err) {
          setError(err.message);
          setTecnicos([]);
        }
      };
      fetchTecnicos();
    }

    if (selectedSection === "Clientes") {
      const fetchClientes = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuario no autenticado");
          }

          const response = await fetch("http://localhost:5000/api/admin/clientes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error al obtener la lista de clientes. Verifica tu autenticación.");
          }

          const data = await response.json();
          setClientes(data); // Actualiza el estado de clientes
          setError("");
        } catch (err) {
          setError(err.message);
          setClientes([]);
        }
      };
      fetchClientes();
    }
  }, [selectedSection]);

  const sections = {
    Técnicos: "Gestión de Técnicos: Aquí puedes agregar, editar o eliminar técnicos.",
    Clientes: "Gestión de Clientes: Aquí puedes administrar clientes registrados.",
    Vehículos: "Gestión de Vehículos: Lista y administra los vehículos registrados.",
    Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
    Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
  };

  return (
    <div className="admin-dashboard">
      {/* Barra lateral */}
      <aside className="sidebar">
        <h2>Menú</h2>
        <ul>
          {Object.keys(sections).map((section) => (
            <li
              key={section}
              className={selectedSection === section ? "active" : ""}
            >
              <button onClick={() => setSelectedSection(section)}>
                {section}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <header className="header">
          <span>Bienvenido, {adminName}</span>
        </header>
        <div className="dashboard-content">
          <h1>{selectedSection}</h1>
          <p>{sections[selectedSection]}</p>

          {selectedSection === "Técnicos" && (
            <div className="tecnicos-list">
              {error && <p className="error">{error}</p>}
              {tecnicos.length === 0 && !error && (
                <p>Cargando técnicos...</p>
              )}
              {tecnicos.map((tecnico) => (
                <div key={tecnico.id} className="tecnico-item">
                  <h3>{tecnico.nombre}</h3>
                  <p><strong>Email:</strong> {tecnico.email}</p>
                  <p><strong>Teléfono:</strong> {tecnico.telefono}</p>
                  <hr />
                </div>
              ))}
            </div>
          )}

          {selectedSection === "Clientes" && (
            <div className="clientes-list">
              {error && <p className="error">{error}</p>}
              {clientes.length === 0 && !error && (
                <p>Cargando clientes...</p>
              )}
              {clientes.map((cliente) => (
                <div key={cliente.id} className="cliente-item">
                  <h3>{cliente.nombre}</h3>
                  <p><strong>Email:</strong> {cliente.email}</p>
                  <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
