import React, { useState, useEffect } from "react";
import "./ClienteDashboard.css";
import Sedan from "../../components/svg/sedan";

const ClienteDashboard = ({ clienteName = "Cliente" }) => {
  const [selectedSection, setSelectedSection] = useState("Vehículos");
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [reporte, setReporte] = useState(null);

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
    vehiculo: "",
    tipoMantenimiento: "",
    detalleMantenimiento: "",
    marcaRepuesto: "",
    kilometrajeActual: "",
    kilometrajeCambio: "",
    detalleGeneral: ""
  });
  const generarReporte = () => {
    const token = localStorage.getItem('token');
  
    fetch('http://localhost:5000/api/cliente/reporte-vehiculo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        return response.blob(); // Obtener el contenido como Blob
      }
      throw new Error('Error en la solicitud');
    })
    .then(blob => {
      // Crear una URL para el Blob y abrirla en una nueva pestaña
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte-vehiculo.pdf'; // Nombre del archivo
      document.body.appendChild(a); // Necesario para que funcione en Firefox
      a.click();
      a.remove();
    })
    .catch(error => console.error('Error:', error));
  };
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Usuario no autenticado");
        }

        if (selectedSection === "Vehículos") {
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
              "Error al obtener la lista de vehículos. Verifica tu autenticación"
            );
          }
          
          const data = await response.json();
          setVehiculos(data);
          setError("");
        } else if (selectedSection === "Mantenimientos") {
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
        }
      } catch (err) {
        setError(err.message);
        if (selectedSection === "Vehículos") {
          setVehiculos([]);
        } else if (selectedSection === "Mantenimientos") {
          setMantenimientos([]);
        }
      }
    };

    fetchData();
  }, [selectedSection]);

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'vehiculo') {
      setNuevoVehiculo((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (formType === 'mantenimiento') {
      setNuevoMantenimiento((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toggleDetalles = (id) => {
    setDetallesVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/ducech/login";
  };

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 5000);
    }
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
      showMessage("Vehículo agregado correctamente.");
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleAddMantenimiento = async (e) => {
    e.preventDefault();
    try {
      // Validación local
      if (!nuevoMantenimiento.vehiculo || !nuevoMantenimiento.tipoMantenimiento || 
          !nuevoMantenimiento.detalleMantenimiento || !nuevoMantenimiento.marcaRepuesto || 
          !nuevoMantenimiento.kilometrajeActual || !nuevoMantenimiento.kilometrajeCambio || 
          !nuevoMantenimiento.detalleGeneral) {
        throw new Error("Por favor, completa todos los campos del formulario.");
      }
      const payload = {
        ...nuevoMantenimiento,
        placa: nuevoMantenimiento.vehiculo // Ensure placa is sent
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado.");
      }

      const response = await fetch("http://localhost:5000/api/cliente/registrar-mantenimiento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // Use modified payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Error al agregar mantenimiento. Verifica los datos y la autenticación.";
        throw new Error(errorMessage);
      }

      const mantenimientoAgregado = await response.json();
      setMantenimientos((prevMantenimientos) => [...prevMantenimientos, mantenimientoAgregado]);

      setNuevoMantenimiento({
        vehiculo: "",
        tipoMantenimiento: "",
        detalleMantenimiento: "",
        marcaRepuesto: "",
        kilometrajeActual: "",
        kilometrajeCambio: "",
        detalleGeneral: ""
      });
      setFormVisible(false);
      showMessage("Mantenimiento agregado correctamente.");
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const sections = {
    Vehículos: "Gestión de Vehículos: Lista y administra los vehículos registrados.",
    Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
    Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
  };

  const renderSVG = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "sedan":
        return <Sedan />;
      default:
        return <Sedan />; 
    }
  };

  const renderVehiculosForm = () => (
    <form onSubmit={handleAddVehiculo} className="cliente-vehiculo-form">
      <label>
        Placa:
        <input 
          type="text"
          name="placa"
          value={nuevoVehiculo.placa}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          required
        />
      </label>
      <label>
        Tipo:
        <select
          name="tipo"
          value={nuevoVehiculo.tipo}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          required
        >
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
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          required
        />
      </label>
      <label>
        Modelo:
        <input 
          type="text"
          name="modelo"
          value={nuevoVehiculo.modelo}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          required
        />
      </label>
      <label>
        Cilindraje:
        <input 
          type="number"
          name="cilindraje"
          value={nuevoVehiculo.cilindraje}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          required
        />
      </label>
      <label>
        Color:
        <input 
          type="text"
          name="color"
          value={nuevoVehiculo.color}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          required
        />
      </label>
      <label>
        Kilometraje Actual:
        <input 
          type="number"
          name="kilometrajeActual"
          value={nuevoVehiculo.kilometrajeActual}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          required
        />
      </label>
      <label>
        Observación:
        <input 
          type="text"
          name="observacion"
          value={nuevoVehiculo.observacion}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
        />
      </label>
      <button type="submit">Guardar</button>
    </form>
  );
  

  const renderMantenimientosForm = () => (
    <form onSubmit={handleAddMantenimiento} className="cliente-mantenimiento-form">
      <label>
        Vehículo:
        <select
          name="vehiculo"
          value={nuevoMantenimiento.vehiculo}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          required
        >
          <option value="" disabled>Seleccionar vehículo</option>
          {vehiculos.map((vehiculo) => (
            <option key={vehiculo._id} value={vehiculo.placa}>
              {vehiculo.placa}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tipo de Mantenimiento:
        <select
          name="tipoMantenimiento"
          value={nuevoMantenimiento.tipoMantenimiento}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          required
        >
          <option value="" disabled>Seleccionar tipo</option>
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
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          required
        >
          <option value="" disabled>Seleccionar detalle</option>
          <option value="Cambio de Aceite">Cambio de Aceite</option>
          <option value="Cambio de Pastillas de Freno">Cambio de Pastillas de Freno</option>
          <option value="Revisión General">Revisión General</option>
        </select>
      </label>
      <label>
        Marca del Repuesto:
        <input 
          type="text"
          name="marcaRepuesto"
          value={nuevoMantenimiento.marcaRepuesto}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          required
        />
      </label>
      <label>
        Kilometraje Actual:
        <input 
          type="number"
          name="kilometrajeActual"
          value={nuevoMantenimiento.kilometrajeActual}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          required
        />
      </label>
      <label>
        Kilometraje de Cambio:
        <input
          type="number"
          name="kilometrajeCambio"
          value={nuevoMantenimiento.kilometrajeCambio || ""}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          required
        />
      </label>
      <label>
        Detalle General:
        <textarea
          name="detalleGeneral"
          value={nuevoMantenimiento.detalleGeneral}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          required
        ></textarea>
      </label>
      <button type="submit">Guardar</button>
    </form>
  );
  

  return (
    <div className="cliente-dashboard">
      <aside className="cliente-sidebar">
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
      
      <main className="cliente-main-content">
        <header className="cliente-header">
          <span>Bienvenido {clienteName}</span>
          <button className="logout-button" onClick={handleLogout}>Salir</button>
        </header>
        
        <div className="cliente-dashboard-content">
          <h1>{selectedSection}</h1>
          <p>{sections[selectedSection]}</p>

          {selectedSection === "Vehiculo" && (
            <div>
              <div className="vehiculo-svg">{renderSVG("sedan")}</div>
            </div>
          )}

          {selectedSection === "Vehículos" && (
            <div className="cliente-vehiculos-list">
              <button 
                className="cliente-add-vehiculo-button" 
                onClick={() => setFormVisible(!formVisible)}
              >
                {formVisible ? "Cancelar" : "Agregar Vehículo"}
              </button>
              
              {formVisible && renderVehiculosForm()}
              
              {successMessage && <p className="success">{successMessage}</p>}
              {error && <p className="error">{error}</p>}
              
              {vehiculos.length === 0 && !error && (
                <p>No hay vehículos registrados</p>
              )}
              
              {vehiculos.map((vehiculo) => (
                <div key={vehiculo._id} className="cliente-vehiculo-item">
                  <h3>{vehiculo.placa}</h3>
                  <p><strong>Marca:</strong> {vehiculo.marca}</p>
                  <p><strong>Color:</strong> {vehiculo.color}</p>
                  <button onClick={() => toggleDetalles(vehiculo.id)}>
                    {detallesVisible[vehiculo.id] ? "Ocultar detalles" : "Ver detalles"}
                  </button>
                  {detallesVisible[vehiculo.id] && (
                    <div>
                      <p><strong>Tipo:</strong> {vehiculo.tipo}</p>
                      <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                      <p><strong>Motor:</strong> {vehiculo.cilindraje}</p>
                      <p><strong>Kilometraje:</strong> {vehiculo.kilometrajeActual}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedSection === "Mantenimientos" && (
            <div className="cliente-mantenimientos-list">
              <button
                className="cliente-add-mantenimiento-button"
                onClick={() => setFormVisible(!formVisible)}
              >
                {formVisible ? "Cancelar" : "Agregar Mantenimiento"}
              </button>
              
              {formVisible && renderMantenimientosForm()}
              
              {successMessage && <p className="success">{successMessage}</p>}
              {error && <p className="error">{error}</p>}
              
              {mantenimientos.length === 0 && !error && (
                <p>No hay mantenimientos registrados</p>
              )}
              
              {mantenimientos.map((mantenimiento) => (
                <div key={mantenimiento._id} className="cliente-mantenimiento-item">
                  <h3>{mantenimiento.descripcion}</h3>
                  <p className="vehiculo-placa">
                    <strong>Placa del Vehículo:</strong> {mantenimiento.vehiculo.placa}
                  </p>
                  <p><strong>Marca del Repuesto:</strong> {mantenimiento.marcaRepuesto}</p>
                  <p><strong>Kilometraje Actual:</strong> {mantenimiento.kilometrajeActual}</p>
                  <p><strong>Kilometraje de Cambio:</strong> {mantenimiento.kilometrajeCambio}</p>
                  <p><strong>Detalles:</strong> {mantenimiento.detalleGeneral}</p>
                  
                  <button onClick={() => toggleDetalles(mantenimiento._id)}>
                    {detallesVisible[mantenimiento._id] ? "Ocultar detalles" : "Ver detalles"}
                  </button>
                  
                  {detallesVisible[mantenimiento._id] && (
                    <div className="cliente-mantenimiento-detalles">
                      <p><strong>Tipo:</strong> {mantenimiento.tipoMantenimiento}</p>
                      <p><strong>Detalle:</strong> {mantenimiento.detalleMantenimiento}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedSection === "Reportes" && (
            <div>
              <button onClick={generarReporte}>Generar Reporte de Vehículo</button>
              {reporte && ( <div id="reporteContainer"> <pre>{JSON.stringify(reporte, null, 2)}</pre> </div> )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClienteDashboard;