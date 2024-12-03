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
  const [successMessages, setSuccessMessages] = useState({});
  const [errorMessages, setErrorMessages] = useState({});


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
      setReporte(blob);

      // Crear una URL para el Blob y abrirla en una nueva pestaña
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte-vehiculos.pdf'; 
      document.body.appendChild(a); 
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
        // Capturar el error específico del servidor
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes("Placa ya registrada")) {
          throw new Error("La placa ya está registrada para otro vehículo.");
        }
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
      // Mostrar el mensaje de error en la interfaz de usuario
      setError(err.message);
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

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    const form = e.target;
    const updatedVehiculo = {
      placa: form.placa.value,
      marca: form.marca.value,
      color: form.color.value,
      tipo: form.tipo.value,
      modelo: form.modelo.value,
      cilindraje: form.cilindraje.value,
      kilometrajeActual: form.kilometrajeActual.value,
    };
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado.");
      }
      const response = await fetch(
        `http://localhost:5000/api/cliente/actualizar-vehiculo/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedVehiculo),
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        console.log("Vehículo actualizado:", data);
  
        // Actualiza la lista de vehículos en el estado
        setVehiculos((prevVehiculos) =>
          prevVehiculos.map((vehiculo) =>
            vehiculo._id === id ? { ...vehiculo, ...updatedVehiculo } : vehiculo
          )
        );
  
        // Muestra el mensaje de éxito
        setSuccessMessage("Vehículo actualizado correctamente");
        setError(null);
  
        // Limpia el mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000);
  
        // Opcional: Oculta el formulario
        setFormVisible(false);
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar el vehículo:", errorData);
        setError("Vehículo ya registrado");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setError("Error al enviar la solicitud");
    }
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
          pattern="^[A-Z]{3}[0-9]{4}$" // Tres letras seguidas de cuatro números
          title="La placa debe tener tres letras seguidas de cuatro números (ejemplo: ABC1234)"
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
          <option value="">Seleccione un tipo</option>
          <option value="sedan">sedan</option>
          <option value="suv">suv</option>
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
          maxLength="20" // Máximo 20 caracteres
          pattern="^[A-Za-z\s]{1,20}$" // Solo letras y espacios, máximo 20 caracteres
          title="La marca debe contener solo letras y un máximo de 20 caracteres"
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
          maxLength="20" // Máximo 20 caracteres
          pattern="^[A-Za-z0-9\s]{1,20}$" // Letras, números y espacios, máximo 20 caracteres
          title="El modelo debe contener solo letras, números y un máximo de 20 caracteres"
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
          min="1000" // Mínimo 1000
          max="5000" // Máximo 5000
          title="El cilindraje debe ser un número entre 1000 y 5000"
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
          maxLength="20" // Máximo 20 caracteres
          pattern="^[A-Za-z\s]{1,20}$" // Solo letras y espacios, máximo 20 caracteres
          title="El color debe contener solo letras y un máximo de 20 caracteres"
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
          min="5000" // Mínimo 5000
          max="500000" // Máximo 500000
          title="El kilometraje actual debe ser un número entre 5000 y 500000"
        />
      </label>
      <label>
        Observación:
        <input 
          type="text"
          name="observacion"
          value={nuevoVehiculo.observacion}
          onChange={(e) => handleInputChange(e, 'vehiculo')}
          maxLength="50" // Máximo 50 caracteres
          title="La observación debe tener un máximo de 50 caracteres"
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
          maxLength="20"
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
          min="5000"
          max="500000"
          required
        />
      </label>
      <label>
        Kilometraje Cambio:
        <input
          type="number"
          name="kilometrajeCambio"
          value={nuevoMantenimiento.kilometrajeCambio || ""}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          min={Math.max(5000, parseInt(nuevoMantenimiento.kilometrajeActual) + 4000)}
          max="500000"
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
          maxLength="600" // Aprox. 100 palabras (considerando un promedio de 6 caracteres por palabra)
        ></textarea>
      </label>
      <button type="submit">Guardar</button>
    </form>
  );
  

  const handleEliminar = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cliente/delete-mantenimiento/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el mantenimiento');
      }
  
      // Establece el mensaje de éxito para este mantenimiento
      setSuccessMessages((prevMessages) => ({
        ...prevMessages,
        [id]: "Mantenimiento Eliminado Correctamente"
      }));
      setErrorMessages((prevMessages) => ({
        ...prevMessages,
        [id]: null // Limpia el mensaje de error si existía
      }));
  
      // Actualiza la lista de mantenimientos eliminando el mantenimiento correspondiente
      setMantenimientos((prevMantenimientos) => 
        prevMantenimientos.filter((mantenimiento) => mantenimiento._id !== id)
      );
    } catch (error) {
      console.error('Error:', error);
  
      // Establece el mensaje de error para este mantenimiento
      setErrorMessages((prevMessages) => ({
        ...prevMessages,
        [id]: "Hubo un problema al eliminar el mantenimiento"
      }));
    }
  };

  const handleRealizarMantenimiento = async (id) => {
    try {
      // Llamada a la API para marcar el mantenimiento como realizado
      const response = await fetch(`http://localhost:5000/api/cliente/desactivar-mantenimiento/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Mostrar mensaje de éxito
        setSuccessMessages({
          ...successMessages,
          [id]: 'Mantenimiento marcado como realizado correctamente.'
        });
      } else {
        // Mostrar mensaje de error
        setErrorMessages({
          ...errorMessages,
          [id]: data.error || 'Error al marcar el mantenimiento.'
        });
      }
    } catch (error) {
      console.error('Error al marcar el mantenimiento:', error);
      setErrorMessages({
        ...errorMessages,
        [id]: 'Error al procesar la solicitud.'
      });
    }
  };
  

    const sections = {
    Vehículos: "Gestión de Vehículos: Lista y administra los vehículos registrados.",
    Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
    Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
  };

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
                  onClick={() => {
                    setFormVisible(!formVisible);
                    setSuccessMessage("");
                    setError(null);
                  }}
                >
                  {formVisible ? "Cancelar" : "Agregar Vehículo"}
                </button>
                {error && <p className="vehiculo-error">{error}</p>}
                
                {formVisible && renderVehiculosForm()}
                
                {vehiculos.length === 0 && !error && (
                  <p>No hay vehículos registrados</p>
                )}
                
                {vehiculos.map((vehiculo) => (
                  <div key={vehiculo._id} className="cliente-vehiculo-item">
                    <h3>{vehiculo.placa}</h3>
                    <p><strong>Marca:</strong> {vehiculo.marca}</p>
                    <p><strong>Color:</strong> {vehiculo.color}</p>
                    <button onClick={() => toggleDetalles(vehiculo._id)}>
                      {detallesVisible[vehiculo._id] ? "Ocultar detalles" : "Ver detalles"}
                    </button>
                    {detallesVisible[vehiculo._id] && (
                      <div>
                        <form onSubmit={(e) => handleUpdate(e, vehiculo._id)}>
                          <label htmlFor="placa"><strong>Placa:</strong></label>
                          <input
                            type="text"
                            id="placa"
                            name="placa"
                            defaultValue={vehiculo.placa}
                            pattern="^[A-Z]{3}[0-9][0-9]{2}[1-9]$" 
                            title="La placa debe tener tres letras seguidas de cuatro números (no solo ceros), ej. PCH5503."
                            required
                          />

                          <label htmlFor="marca"><strong>Marca:</strong></label>
                          <input
                            type="text"
                            id="marca"
                            name="marca"
                            defaultValue={vehiculo.marca}
                            maxLength="20"
                            pattern="^[a-zA-Z\s]{1,20}$"
                            title="La marca debe tener solo letras (máximo 20 caracteres)."
                            required
                          />

                          <label htmlFor="color"><strong>Color:</strong></label>
                          <input
                            type="text"
                            id="color"
                            name="color"
                            defaultValue={vehiculo.color}
                            maxLength="20"
                            pattern="^[a-zA-Z\s]{1,20}$"
                            title="El color debe tener solo letras (máximo 20 caracteres)."
                            required
                          />

                            <label htmlFor="tipo"><strong>Tipo:</strong></label>
                            <select id="tipo" name="tipo" defaultValue={vehiculo.tipo} required>
                              <option value="" disabled>Seleccione un tipo</option>
                              <option value="sedan">sedan</option>
                              <option value="suv">suv</option>
                            </select>


                          <label htmlFor="modelo"><strong>Modelo:</strong></label>
                          <input
                            type="text"
                            id="modelo"
                            name="modelo"
                            defaultValue={vehiculo.modelo}
                            maxLength="20"
                            pattern="^[a-zA-Z\s]{1,20}$"
                            title="El modelo debe tener solo letras (máximo 20 caracteres)."
                            required
                          />

                          <label htmlFor="cilindraje"><strong>Motor:</strong></label>
                          <input
                            type="number"
                            id="cilindraje"
                            name="cilindraje"
                            defaultValue={vehiculo.cilindraje}
                            min="1300"
                            max="7000"
                            title="El cilindraje debe estar entre 1300 y 7000."
                            required
                          />

                          <label htmlFor="kilometrajeActual"><strong>Kilometraje:</strong></label>
                          <input
                            type="number"
                            id="kilometrajeActual"
                            name="kilometrajeActual"
                            defaultValue={vehiculo.kilometrajeActual}
                            min="5000"
                            max="500000"
                            title="El kilometraje debe estar entre 5000 y 500000."
                            required
                          />

                          <input type="submit" value="Actualizar" />
                          {/* Mensajes de éxito o error debajo del botón */}
                          {successMessage && <p className="vehiculo-success">{successMessage}</p>}
                          {error && <p className="error">{error}</p>}
                        </form>

                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedSection === "Mantenimientos" && (
              <div className="cliente-mantenimientos-list">
                <input
      type="number"
      min="5000"
      max="50000"
      className="kilometraje-input"
      placeholder="Ingresa tu kilometraje actual"
    />
    <button className="enviar-notificacion-button">Enviar Notificación</button>
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
                    <p><strong>Fecha:</strong> {mantenimiento.fechaCreacion}</p>
                    <p><strong>Kilometraje Actual:</strong> {mantenimiento.kilometrajeActual}</p>
                    <p><strong>Kilometraje de próximo Cambio:</strong> {mantenimiento.kilometrajeCambio}</p>
                    <p><strong>Detalles:</strong> {mantenimiento.detalleGeneral}</p>

                    <button onClick={() => toggleDetalles(mantenimiento._id)}>
                      {detallesVisible[mantenimiento._id] ? "Ocultar detalles" : "Ver detalles"}
                    </button>
                    <button onClick={() => handleEliminar(mantenimiento._id)}>
                      Eliminar Mantenimiento
                    </button>

                    {/* Mostrar el botón solo si el mantenimiento no ha sido realizado */}
                    {!mantenimiento.realizado && (
                      <button onClick={() => handleRealizarMantenimiento(mantenimiento._id)}>
                        Marcar como Realizado
                      </button>
                    )}

                    {/* Muestra el mensaje de éxito o error solo para el mantenimiento actual */}
                    {successMessages[mantenimiento._id] && (
                      <p className="mantenimiento-success">{successMessages[mantenimiento._id]}</p>
                    )}
                    {errorMessages[mantenimiento._id] && (
                      <p className="error-message">{errorMessages[mantenimiento._id]}</p>
                    )}
                    {detallesVisible[mantenimiento._id] && (
                      <div className="cliente-mantenimiento-detalles">
                        <p><strong>Tipo:</strong> {mantenimiento.tipoMantenimiento}</p>
                        <p><strong>Detalle:</strong> {mantenimiento.detalleMantenimiento}</p>
                        <p><strong>Marca del Repuesto:</strong> {mantenimiento.marcaRepuesto}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}



          {selectedSection === "Reportes" && (
            <div>
              <button onClick={generarReporte}>Generar Reporte de Vehículos</button>
              {reporte && ( <div id="reporteContainer"> <pre>{JSON.stringify(reporte, null, 2)}</pre> </div> )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClienteDashboard;