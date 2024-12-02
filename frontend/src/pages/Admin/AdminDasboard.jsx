import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ adminName = "Administrador" }) => {
  const [selectedSection, setSelectedSection] = useState("Técnicos");
  const [tecnicos, setTecnicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({});
  const [reporte, setReporte] = useState(null);

  useEffect(() => {
    const fetchData = async (url, setState) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No se encontró un token de autenticación. Por favor, inicia sesión.");
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos. Verifica tu autenticación.");
        }

        const data = await response.json();
        setState(data);
        setError("");
      } catch (err) {
        console.error("Error en la llamada a la API:", err);
        setError(err.message || "Error desconocido");
        setState([]);
      }
    };

    switch (selectedSection) {
      case "Técnicos":
        fetchData("http://localhost:5000/api/admin/tecnicos", setTecnicos);
        break;
      case "Clientes":
        fetchData("http://localhost:5000/api/admin/clientes", setClientes);
        break;
      case "Vehículos":
        fetchData("http://localhost:5000/api/admin/vehiculos", setVehiculos);
        break;
      case "Mantenimientos":
        fetchData("http://localhost:5000/api/admin/mantenimientos", setMantenimientos);
        break;
      case "Reportes":
        fetchData("http://localhost:5000/api/admin/reportes-tecnicos", setReportes);
        break;
      default:
        break;
    }
  }, [selectedSection]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/ducech/login"; // Cambia la URL si es necesario
  };

  const toggleDetalles = (id) => {
    setDetallesVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const generarReporte = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró un token de autenticación. Por favor, inicia sesión.");
      }

      const response = await fetch("http://localhost:5000/api/admin/reportes-tecnicos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al generar el reporte. Verifica tu autenticación.");
      }

      const data = await response.json();
      setReporte(data);
    } catch (err) {
      console.error("Error en la llamada a la API para generar el reporte:", err);
      setError(err.message || "Error desconocido");
    }
  };

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
          <button className="logout-button" onClick={handleLogout}>
            Salir
          </button>
        </header>

        <div className="dashboard-content">
          <h1>{selectedSection}</h1>
          <p>{sections[selectedSection]}</p>

          {error && <p className="error">{error}</p>}

          {selectedSection === "Técnicos" && (
            <div className="tecnicos-list">
              {tecnicos.length === 0 ? (
                <p>Cargando técnicos...</p>
              ) : (
                tecnicos.map((tecnico) => (
                  <div key={tecnico._id} className="tecnico-item">
                    <h3>{tecnico.nombre}</h3>
                    <p><strong>Email:</strong> {tecnico.email}</p>
                    <p><strong>Teléfono:</strong> {tecnico.telefono}</p>
                    <hr />
                  </div>
                ))
              )}
            </div>
          )}

          {selectedSection === "Clientes" && (
            <div className="clientes-list">
              {clientes.length === 0 ? (
                <p>Cargando clientes...</p>
              ) : (
                clientes.map((cliente) => (
                  <div key={cliente._id} className="cliente-item">
                    <h3>{cliente.nombre}</h3>
                    <p><strong>Email:</strong> {cliente.email}</p>
                    <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                    <hr />
                  </div>
                ))
              )}
            </div>
          )}

          {selectedSection === "Vehículos" && (
            <div className="vehiculos-list">
              {vehiculos.length === 0 ? (
                <p>Cargando vehículos...</p>
              ) : (
                vehiculos.map((vehiculo) => (
                  <div key={vehiculo._id} className="vehiculo-item">
                    <h3>{vehiculo.placa}</h3>
                    <p><strong>Marca:</strong> {vehiculo.marca}</p>
                    <p><strong>Color:</strong> {vehiculo.color}</p>
                    <button onClick={() => toggleDetalles(vehiculo._id)}>
                      {detallesVisible[vehiculo._id] ? "Ocultar detalles" : "Ver detalles"}
                    </button>
                    {detallesVisible[vehiculo._id] && (
                      <div className="vehiculo-detalles">
                        <p><strong>Tipo:</strong> {vehiculo.tipo}</p>
                        <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                        <p><strong>Motor:</strong> {vehiculo.cilindraje}</p>
                        <p><strong>Kilometraje:</strong> {vehiculo.kilometrajeActual}</p>
                      </div>
                    )}
                    <hr />
                  </div>
                ))
              )}
            </div>
          )}

          {selectedSection === "Mantenimientos" && (
            <div className="mantenimientos-list">
              {mantenimientos.length === 0 ? (
                <p>Cargando mantenimientos...</p>
              ) : (
                mantenimientos.map((mantenimiento) => (
                  <div key={mantenimiento._id} className="mantenimiento-item">
                    <h3>ID de Mantenimiento: {mantenimiento._id}</h3>
                    <p><strong>Tipo de Mantenimiento:</strong> {mantenimiento.tipoMantenimiento || "Información no disponible"}</p>
                    <p><strong>Descripción:</strong> {mantenimiento.detalleMantenimiento || "Información no disponible"}</p>
                    <p><strong>Marca de Repuesto:</strong> {mantenimiento.marcaRepuesto || "Información no disponible"}</p>
                    <p><strong>Kilometraje Actual:</strong> {mantenimiento.kilometrajeActual || "Información no disponible"}</p>
                    <p><strong>Kilometraje de Próximo Cambio:</strong> {mantenimiento.kilometrajeCambio || "Información no disponible"}</p>
                    <p><strong>Detalles Generales:</strong> {mantenimiento.detalleGeneral || "Información no disponible"}</p>
                    <p><strong>Fecha de Creación:</strong> {new Date(mantenimiento.fechaCreacion).toLocaleDateString() || "Información no disponible"}</p>
                    <hr />
                  </div>
                ))
              )}
            </div>
          )}

          {selectedSection === "Reportes" && (
            <div className="reportes-list">
              <button onClick={generarReporte}>Generar reporte de vehículos</button>
              {reporte ? (
                <pre>{JSON.stringify(reporte, null, 2)}</pre>
              ) : (
                <p>Aún no se ha generado ningún reporte.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
