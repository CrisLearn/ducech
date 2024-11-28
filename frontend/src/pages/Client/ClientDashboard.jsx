import React, { useState, useEffect } from "react";
import "./ClienteDashboard.css";
import Sedan from "../../components/svg/sedan"; // Importa el componente SVG del vehículo
// Importa otros SVG si los necesitas

const ClienteDashboard = ({ clienteName = "Cliente" }) => {
  const [selectedSection, setSelectedSection] = useState("Vehículos");
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({});
  const [formVisible, setFormVisible] = useState(false); // Nuevo estado para controlar la visibilidad del formulario
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    placa: "",
    tipo: "sedan",
    marca: "",
    modelo: "",
    cilindraje: "",
    color: "",
    kilometrajeActual: "",
    observacion: ""
  });
  const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito

  useEffect(() => {
    if (selectedSection === "Vehículos") {
      const fetchVehiculos = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuario no autenticado");
          }

          const response = await fetch(
            "http://localhost:5000/api/cliente/vehiculos",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              "Error al obtener la lista de vehículos. Verifica tu autenticación."
            );
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
    }else if (selectedSection === "Mantenimientos") {
      const fetchMantenimientos = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuario no autenticado");
          }

          const response = await fetch(
            "http://localhost:5000/api/cliente/mantenimientos",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              "Error al obtener los mantenimientos. Verifica tu autenticación."
            );
          }

          const data = await response.json();
          setMantenimientos(data);
          setError("");
        } catch (err) {
          setError(err.message);
          setMantenimientos([]);
        }
      };
      fetchMantenimientos();
    }
  }, [selectedSection]);

  const toggleDetalles = (id) => {
    setDetallesVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/ducech/login";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoVehiculo({
      ...nuevoVehiculo,
      [name]: value
    });
  };

  const handleAddVehiculo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado");
      }

      const response = await fetch("http://localhost:5000/api/cliente/registrar-vehiculo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoVehiculo),
      });

      if (!response.ok) {
        throw new Error("Error al agregar vehículo. Verifica los datos y la autenticación.");
      }

      const vehiculoAgregado = await response.json();
      setVehiculos((prevVehiculos) => [...prevVehiculos, vehiculoAgregado]);
      setFormVisible(false);
      setNuevoVehiculo({
        placa: "",
        tipo: "sedan",
        marca: "",
        modelo: "",
        cilindraje: "",
        color: "",
        kilometrajeActual: "",
        observacion: ""
      });
      setSuccessMessage("Vehículo agregado correctamente."); // Mostrar mensaje de éxito
      setTimeout(() => setSuccessMessage(""), 5000); // Ocultar mensaje después de 5 segundos
    } catch (err) {
      setError(err.message);
    }
  };

  const sections = {
    Vehiculo: "Mi Vehículo",
    Vehículos: "Gestión de Vehículos: Lista y administra los vehículos registrados.",
    Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
    Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
  };

  // Función para renderizar el SVG según el tipo de vehículo
  const renderSVG = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "sedan":
        return <Sedan />;
      // Agrega más casos para otros tipos de vehículos
      default:
        return <Sedan />; // SVG predeterminado si no hay coincidencia
    }
  };

  return (
    <div className="cliente-dashboard">
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

          {selectedSection === "Vehículos" && (
            <div className="vehiculos-list">
              <button className="add-vehiculo-button" onClick={() => setFormVisible(!formVisible)}>
                {formVisible ? "Cancelar" : "Agregar Vehículo"}
              </button>
              {formVisible && (
                <form onSubmit={handleAddVehiculo} className="vehiculo-form">
                  <label>
                    Placa:
                    <input type="text" name="placa" value={nuevoVehiculo.placa} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Tipo:
                    <select name="tipo" value={nuevoVehiculo.tipo} onChange={handleInputChange} required>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                    </select>
                  </label>
                  <label>
                    Marca:
                    <input type="text" name="marca" value={nuevoVehiculo.marca} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Modelo:
                    <input type="text" name="modelo" value={nuevoVehiculo.modelo} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Cilindraje:
                    <input type="number" name="cilindraje" value={nuevoVehiculo.cilindraje} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Color:
                    <input type="text" name="color" value={nuevoVehiculo.color} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Kilometraje Actual:
                    <input type="number" name="kilometrajeActual" value={nuevoVehiculo.kilometrajeActual} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Observación:
                    <input type="text" name="observacion" value={nuevoVehiculo.observacion} onChange={handleInputChange} />
                  </label>
                  <button type="submit">Guardar</button>
                </form>
              )}

              {successMessage && <p className="success">{successMessage}</p>} {/* Mostrar mensaje de éxito */}
              {error && <p className="error">{error}</p>}
              {vehiculos.length === 0 && !error && (
                <p>Sin vehículos asignados</p>
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
                    </div>
                  )}
                  
                  <hr />
                </div>
              ))}
            </div>
          )}

              {selectedSection === "Mantenimientos" && (
                      <div className="mantenimientos-list">
                        {error && <p className="error">{error}</p>}
                        {mantenimientos.length === 0 && !error && (
                          <p>No hay mantenimientos registrados.</p>
                        )}
                        {mantenimientos.map((mantenimiento) => (
                          <div key={mantenimiento.id} className="mantenimiento-item">
                            <h3>{mantenimiento.nombre}</h3>
                            <p><strong>Vehículo:</strong> {mantenimiento.vehiculo}</p>
                            <p><strong>Fecha:</strong> {mantenimiento.fecha}</p>
                            <p><strong>Detalles:</strong> {mantenimiento.detalles}</p>
                            <hr />
                          </div>
                        ))}
                      </div>
                    )}          

          {selectedSection === "Vehiculo" && (
            <div>
              <div className="vehiculo-svg">{renderSVG("sedan")}</div>
            </div>
          )}


        </div>
      </main>
    </div>
  );
};

export default ClienteDashboard;
