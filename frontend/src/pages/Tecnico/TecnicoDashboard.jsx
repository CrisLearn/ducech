import React, { useState, useEffect } from 'react';
import './TecnicoDashboard.css';

const TecnicoDashboard = ({ tecnicoName = "Tecnico" }) => {
  const [selectedSection, setSelectedSection] = useState("Técnicos");
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({}); // Estado para manejar la visibilidad de los detalles

  useEffect(() => {

    if (selectedSection === "Clientes") {
      const fetchClientes = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuario no autenticado");
          }

          const response = await fetch("http://localhost:5000/api/tecnico/clientes", {
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

    if (selectedSection === "Vehículos") {
      const fetchVehiculos = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuario no autenticado");
          }

          const response = await fetch("http://localhost:5000/api/tecnico/vehiculos", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error al obtener la lista de vehiculos. Verifica tu autenticación.");
          }

          const data = await response.json();
          setVehiculos(data);
          setError("");
        } catch (err) {
          setError(err.message);
          setVehiculos([]);
        }
      };
      fetchVehiculos();
    }
  }, [selectedSection]);

  const toggleDetalles = (id) => {
    setDetallesVisible((prev) => ({
      ...prev,
      [id]: !prev[id], // Alterna la visibilidad de los detalles para el vehículo con el id específico
    }));
  };

  const handleLogout = () => {
    // Elimina el token del almacenamiento local
    localStorage.removeItem("token");
    
    // Redirige a la página de login
    window.location.href = "/ducech/login"; // Cambia la URL si es necesario
  };

  const sections = {
    Clientes: "Gestión de Clientes: Aquí puedes tecnicoistrar clientes registrados.",
    Vehículos: "Gestión de Vehículos: Lista y tecnicoistra los vehículos registrados.",
    Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
    Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
  };

  return (
    <div className="tecnico-dashboard">
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
          <span>Bienvenido</span>
          <button className="logout-button" onClick={handleLogout}>
            Salir
              </button>
        </header>
        <div className="dashboard-content">
          <h1>{selectedSection}</h1>
          <p>{sections[selectedSection]}</p>

          {selectedSection === "Clientes" && (
            <div className="clientes-list">
              {error && <p className="error">{error}</p>}
              {clientes.length === 0 && !error && (
                <p>Sin clientes registrados</p>
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

          {selectedSection === "Vehículos" && (
            <div className="vehiculos-list">
              {error && <p className="error">{error}</p>}
              {vehiculos.length === 0 && !error && (
                <p>Sin vehiculos asignados</p>
              )}
              {vehiculos.map((vehiculo) => (
                <div key={vehiculo.id} className="vehiculo-item">
                  <h3>{vehiculo.placa}</h3>
                  <p><strong>Marca:</strong> {vehiculo.marca}</p>
                  <p><strong>Color:</strong> {vehiculo.color}</p>
                  <button onClick={() => toggleDetalles(vehiculo.id)}>
                    {detallesVisible[vehiculo.id] ? "Ocultar detalles" : "Ver detalles"}
                  </button>
                  {detallesVisible[vehiculo.id] && (
                    <div className="vehiculo-detalles">
                      <p><strong>Tipo:</strong> {vehiculo.tipo}</p>
                      <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                      <p><strong>Motor:</strong> {vehiculo.cilindraje}</p>
                      <p><strong>Kilometraje:</strong> {vehiculo.kilometrajeActual}</p>
                      {/* Agrega más detalles según sea necesario */}
                    </div>
                  )}
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

export default TecnicoDashboard;
