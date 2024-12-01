import React, { useState, useEffect } from "react";
import "./ClienteDashboard.css";
import Sedan from "../../components/svg/sedan";
const ClienteDashboard = ({ clienteName = "Cliente"}) => {
  const [selectedSection, setSelectedSection] = useState("Vehículos");
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({});
  const [formVisible, setFormVisible] = useState(false);
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

  const [nuevoMantenimiento, setNuevoMantenimiento] = useState({
    placa: "",
    tipo: "sedan",
    marca: "",
    modelo: "",
    cilindraje: "",
    color: "",
    kilometrajeActual: "",
    observacion: ""
  });
  const [successMessage, setSuccessMessage] = useState("");

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
              "Error al obtener la lista de vehículo. Verifica tu autenticación"  
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
              "Error al obtener la lista de mantenimientos. Verifica tu autenticación"  
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
  },[selectedSection]);
  const toggleDetalles = (id) => {
    setDetallesVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/ducech/login";
  };
  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
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
  const handleAddMantenimiento = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado");
      }

      const response = await fetch("http://localhost:5000/api/cliente/registrar-mantenimiento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoMantenimiento),
      });

      if (!response.ok) {
        throw new Error("Error al agregar mantenimiento. Verifica los datos y la autenticación.");
      }

      const mantenimientoAgregado = await response.json();
      setMantenimientos((prevMantenimientos) => [...prevMantenimientos, mantenimientoAgregado]);
      setFormVisible(false);
      setNuevoMantenimiento({
        placa: "",
        tipo: "sedan",
        marca: "",
        modelo: "",
        cilindraje: "",
        color: "",
        kilometrajeActual: "",
        observacion: ""
      });
      setSuccessMessage("Mantenimiento agregado correctamente."); 
      setTimeout(() => setSuccessMessage(""), 5000); 
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
  return(
    <div className="cliente-dashboard">
      <aside className="cliente-sidebar">
        <h2>Menú</h2>
        <ul>
          {Object.keys(sections).map((section) => (
            <li key={section} className={selectedSection === section ? "active" : ""}>
              <button onClick={() => setSelectedSection(section)}>{section}</button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="cliente-main-content">
        <header className="cliente-header">
          <span>Bienvenido</span>
          <button>Salir</button>
        </header>
        <div className="cliente-dashboard-content">
          <h1>{selectedSection}</h1>
          <p>{sections[selectedSection]}</p>

          
          {selectedSection === "Vehículos" && (
            <div className="cliente-vehiculos-list">
              <button className="cliente-add-vehiculo-button" onClick={() => setFormVisible(!formVisible)}>
                {formVisible ? "Cancelar" : "Agregar Vehículo"}
              </button>
              {formVisible && (
                <form onSubmit={handleAddVehiculo} className="cliente-vehiculo-form">
                  <label>
                    Placa:
                    <input 
                      type="text"
                      name="placa"
                      value={nuevoVehiculo.placa}
                      onChange={handleInputChange}
                      required
                    ></input>
                  </label>
                  <label>
                    Tipo:
                    <select
                    name="tipo"
                    value={nuevoVehiculo.tipo}
                    onChange={handleInputChange}
                    required>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                    </select>
                  </label>
                  <label>
                    Marca:
                    <input 
                      type="text"
                      name="marca"
                      value={nuevoVehiculo.marca}
                      onChange={handleInputChange}
                      required
                    ></input>
                  </label>
                  <label>
                    Modelo:
                    <input 
                      type="text"
                      name="modelo"
                      value={nuevoVehiculo.modelo}
                      onChange={handleInputChange}
                      required
                    ></input>
                  </label>
                  <label>
                    Cilindraje:
                    <input 
                      type="number"
                      name="cilindraje"
                      value={nuevoVehiculo.cilindraje}
                      onChange={handleInputChange}
                      required
                    ></input>
                  </label>
                  <label>
                    Color:
                    <input 
                      type="text"
                      name="color"
                      value={nuevoVehiculo.color}
                      onChange={handleInputChange}
                      required
                    ></input>
                  </label>
                  <label>
                    Kilometaje Actual:
                    <input 
                      type="number"
                      name="kilometrajeActual"
                      value={nuevoVehiculo.kilometrajeActual}
                      onChange={handleInputChange}
                      required
                    ></input>
                  </label>
                  <label>
                    Observación:
                    <input 
                      type="text"
                      name="observacion"
                      value={nuevoVehiculo.observacion}
                      onChange={handleInputChange}
                    ></input>
                  </label>
                  <button type="submit">Guardar</button>
                </form>
              )}
              {successMessage && <p className="success">{successMessage}</p>}
              {error && <p className="error">{error}</p>}
              {mantenimientos.length === 0 && !error && (
                <p>No hay vehículos registrados</p>
              )}
              {vehiculos.map((vehiculo) => 
                <div key={vehiculo.id} className="cliente-vehiculo-item">
                  <h3>{vehiculo.placa}</h3>
                  <p><strong>Marca:</strong>{vehiculo.marca}</p>
                  <p><strong>Color:</strong>{vehiculo.color}</p>
                  <button onClick={() => setDetallesVisible(prev => ({
                    ...prev,
                    [vehiculo.id]: !prev[vehiculo.id],
                  }))}>
                    {detallesVisible[vehiculo.id] ? "Ocutar detaller" : "Ver detalles"}
                  </button>
                  {detallesVisible[vehiculo.id] && (
                    <div>
                      <p>
              <strong>Tipo:</strong> {vehiculo.tipo}
            </p>
            <p>
              <strong>Modelo:</strong> {vehiculo.modelo}
            </p>
            <p>
              <strong>Motor:</strong> {vehiculo.cilindraje}
            </p>
            <p>
              <strong>Kilometraje:</strong> {vehiculo.kilometrajeActual}
            </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          


          {selectedSection === "Mantenimientos" && (
            <div className="cliente-mantenimientos-list">
              <button className="cliente-add-mantenimiento-button" onClick={() => setFormVisible(!formVisible)}>
                {formVisible ? "Cancelar" : "Agregar Mantenimiento"}
              </button>
              {formVisible && (
                <form onSubmit={handleAddMantenimiento} className="cliente-mantenimiento-form">
                  <label>
                  Tipo de Mantenimiento:
                  <select
                    name="tipoMantenimiento"
                    value={nuevoMantenimiento.tipoMantenimiento}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="preventivo">Preventivo</option>
                    <option value="predictivo">Predictivo</option>
                    <option value="correctivo">Correctivo</option>
                  </select>
                  </label>
                  <label>
                  Detalle del Mantenimiento:
                  <select
                    name="detalleMantenimiento"
                    value={nuevoMantenimiento.detalleMantenimiento}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="cambioAceite">Cambio de Aceite</option>
                    <option value="cambioPastillasFreno">
                      Cambio de Pastillas de Freno
                    </option>
                    <option value="revisionGeneral">Revisión General</option>
                  </select>
                  </label>
                  <label>
                  Marca del Repuesto:
                  <input
                    type="text"
                    name="marcaRepuesto"
                    value={nuevoMantenimiento.marcaRepuesto}
                    onChange={handleInputChange}
                    required
                  />
                  </label>
                  <label>
                  Kilometraje Actual:
                  <input
                    type="number"
                    name="kilometrajeActual"
                    value={nuevoMantenimiento.kilometrajeActual}
                    onChange={handleInputChange}
                    required
                  />
                  </label>
                  <label>
                  Kilometraje de Cambio:
                  <input
                    type="number"
                    name="kilometrajeCambio"
                    value={nuevoMantenimiento.kilometrajeCambio}
                    onChange={handleInputChange}
                    required
                  />
                  </label>
                  <label>
                  Detalle General:
                  <textarea
                    name="detalleGeneral"
                    value={nuevoMantenimiento.detalleGeneral}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                  </label>
                  <label>
                  Vehículo:
                  <select
                    name="vehiculo"
                    value={nuevoMantenimiento.vehiculo}
                    onChange={handleInputChange}
                    required
                  >
                    {vehiculos.map((vehiculo) => (
                      <option key={vehiculo.id} value={vehiculo.placa}>
                        {vehiculo.placa} - {vehiculo.marca}
                      </option>
                    ))}
                  </select>
                  </label>
                  <button type="submit">Guardar</button>
                </form>
              )}
              {successMessage && <p className="success">{successMessage}</p>}
              {error && <p className="error">{error}</p>}

              {mantenimientos.length === 0 && !error && (
                <p>No hay mantenimientos registrados</p>
              )}
              {mantenimientos.map((mantenimiento) => 
                <div key={mantenimiento.id} className="cliente-mantenimiento-item">
                  <h3>{mantenimiento.descripcion}</h3>
                  <p><strong>Marca del Repuesto:</strong> {mantenimiento.marcaRepuesto}</p>
                  <p><strong>Kilometraje Actual:</strong> {mantenimiento.kilometrajeActual}</p>
                  <p><strong>Kilometraje de Cambio:</strong> {mantenimiento.kilometrajeCambio}</p>
                  <p><strong>Detalles:</strong> {mantenimiento.detalleGeneral}</p>
                  <button onClick={() => toggleDetalles(mantenimiento.id)}>
                    {detallesVisible[mantenimiento.id] ? "Ocutar detaller" : "Ver detalles"}
                  </button>
                  {detallesVisible[mantenimiento.id] && (
                    <div className="cliente-mantenimiento-detalles">
                      <p><strong>Tipo:</strong> {mantenimiento.tipoMantenimiento}</p>
                      <p><strong>Detalle:</strong> {mantenimiento.detalleMantenimiento}</p>
                      <p><strong>Marca del Repuesto:</strong> {mantenimiento.marcaRepuesto}</p>
                      <p><strong>Kilometraje Actual:</strong> {mantenimiento.kilometrajeActual}</p>
                      <p><strong>Kilometraje de Cambio:</strong> {mantenimiento.kilometrajeCambio}</p>
                      <p><strong>Detalles:</strong> {mantenimiento.detalleGeneral}</p>
                    </div>
                  )}
                </div>
              )} 
            </div>
          )}

           

        </div>
      </main>
    </div>
  )
}
export default ClienteDashboard;