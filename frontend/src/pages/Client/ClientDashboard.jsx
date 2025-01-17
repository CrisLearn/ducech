import React, { useState, useEffect } from "react";
import "./ClienteDashboard.css";
import Header from '../../components/Layout/Header'
import { FaDoorOpen, FaCar, FaUser } from 'react-icons/fa';

const ClienteDashboard = ({ clienteName = "Cliente" }) => {
  const [selectedSection, setSelectedSection] = useState("Perfil");
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [reporte, setReporte] = useState(null);
  const [successMessages, setSuccessMessages] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [perfil, setPerfil] = useState(null);

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
  })
  const generarReporte = () => {
    const token = localStorage.getItem('token');

    fetch(`${process.env.REACT_APP_API_URL}/api/cliente/reporte-vehiculo`, {
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
  
        let response;
        if (selectedSection === "Vehículos") {
          response = await fetch(`${process.env.REACT_APP_API_URL}/api/cliente/vehiculos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error(
              "Error al obtener la lista de vehículos. Verifica tu autenticación"
            );
          }
  
          const data = await response.json();
          setVehiculos(data);
          setError("");
        } else if (selectedSection === "Mantenimientos") {
          response = await fetch(`${process.env.REACT_APP_API_URL}/api/cliente/mantenimientos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error(
              "Error al obtener la lista de mantenimientos. Verifica tu autenticación"
            );
          }
  
          const data = await response.json();
          setMantenimientos(data);
          setError("");
        } else if (selectedSection === "Perfil") {
          response = await fetch(`${process.env.REACT_APP_API_URL}/api/cliente/perfil-cliente`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error(
              "Error al obtener el perfil del cliente. Verifica tu autenticación"
            );
          }
  
          const data = await response.json();
          setPerfil(data);
          setError("");
        }
      } catch (err) {
        setError(err.message);
        if (selectedSection === "Vehículos") {
          setVehiculos([]);
        } else if (selectedSection === "Mantenimientos") {
          setMantenimientos([]);
        } else if (selectedSection === "Perfil") {
          setPerfil(null); // Limpiar datos del perfil en caso de error
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
    window.location.href = "/login";
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
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cliente/registrar-vehiculo`, {
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

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cliente/registrar-mantenimiento`, {
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
        `${process.env.REACT_APP_API_URL}/api/cliente/actualizar-vehiculo/${id}`,
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
  const renderVehiculosForm = () => (
    <form onSubmit={handleAddVehiculo} className="form-vehiculos-cliente">
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
    <form onSubmit={handleAddMantenimiento} className="form-mantenimientos-cliente">
      <label>
        Vehículo:
        <select
          name="vehiculo"
          value={nuevoMantenimiento.vehiculo}
          onChange={(e) => {handleInputChange(e, 'mantenimiento');
            const vehiculoSeleccionado = vehiculos.find(
              (vehiculo) => vehiculo.placa === e.target.value
            );
            handleInputChange(
              { target: { name: 'kilometrajeActual', value: vehiculoSeleccionado?.kilometrajeActual || '' } },
              'mantenimiento'
            );
          }}
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
        Kilometraje Actual del Cambio:
        <input 
          type="number"
          name="kilometrajeActual"
          value={nuevoMantenimiento.kilometrajeActual}
          readOnly
        />
      </label>
      <label>
        Kilometraje del Próximo Cambio:
        <input
          type="number"
          name="kilometrajeCambio"
          value={nuevoMantenimiento.kilometrajeCambio || ""}
          onChange={(e) => handleInputChange(e, 'mantenimiento')}
          min={
            Math.max(
              5000,
              isNaN(parseInt(nuevoMantenimiento.kilometrajeActual)) 
                ? 5000 
                : parseInt(nuevoMantenimiento.kilometrajeActual) + 4000
            )
          }
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cliente/delete-mantenimiento/${id}`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cliente/desactivar-mantenimiento/${id}`, {
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
  const handleUpdateCliente = async (e, id) => {
    e.preventDefault();
    const form = e.target;
    const updatedCliente = {
      nombre: form.nombre.value,
      password: form.password.value,
      
    };
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado.");
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/cliente/update-cliente`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedCliente),
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        console.log("Perfil Actualizado:", data);
  
  
        // Muestra el mensaje de éxito
        setSuccessMessage("Cliente actualizado correctamente");
        setError(null);
  
        // Limpia el mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000);
  
        // Opcional: Oculta el formulario
        setFormVisible(false);
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar el cliente:", errorData);
        setError("Cliente ya registrado");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setError("Error al enviar la solicitud");
    }
  }; 

  return (
    <div className="header-cliente">
      <Header/>
      <div className="cliente-dashboard">
      <aside className="sidebar-cliente">
        <h2>Opciones</h2>
        <ul>
          {Object.keys(sections).map((section) => (
            <li key={section} className={selectedSection === section ? "active" : ""}>
              <button onClick={() => setSelectedSection(section)}>
                {section}
              </button>
            </li>
          ))}
        </ul>
        <div className="buttons-cliente">
          <button onClick={handleLogout}>
            <FaDoorOpen/>
          </button>
          <button onClick={() => setSelectedSection("Perfil")}>
            <FaUser/>
          </button>
        </div>
      </aside>
      <main className="content-cliente">
        <div className="cliente-dashboard-content">
          <h1>{selectedSection} Cliente </h1>

            {selectedSection === "Vehículos" && (
              <div className="list-vehiculos-cliente">
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
                  <div key={vehiculo._id} className="item-vehiculos-cliente">
                    <h3>{vehiculo.placa}</h3>
                    <div className="etiquetas-horizontales">
                    <p>
                      <strong><span className='highlight-cliente'>Marca:</span></strong> {vehiculo.marca}
                    </p>
                    <p>
                      <strong><span className='highlight-cliente'>Modelo:</span></strong> {vehiculo.modelo}
                    </p>
                    <p>
                      <strong><span className='highlight-cliente'>Color:</span></strong> {vehiculo.color}
                    </p>
                  </div>
                    <button onClick={() => toggleDetalles(vehiculo._id)}>
                      {detallesVisible[vehiculo._id] ? "Ocultar detalles" : "Ver detalles"}
                    </button>
                    <div>
                    {detallesVisible[vehiculo._id] && (
                      <div className="contenido-cliente">
                        <form onSubmit={(e) => handleUpdate(e, vehiculo._id)}>
                        <div>
                          <h4>Actualiza la Información del Vehículo</h4>
                          <label>
                            <span className="highlight-cliente">Placa:</span>
                            <input
                              type="text"
                              name="placa"
                              value={vehiculo.placa}
                              readOnly
                            />
                          </label>
                        </div>
                        <div>
                          <label>
                            <span className="highlight-cliente">Tipo:</span>
                            <select
                              name="tipo"
                              value={nuevoVehiculo.tipo || ""}
                              onChange={(e) =>
                                setNuevoVehiculo({
                                  ...nuevoVehiculo,
                                  tipo: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">Seleccione un tipo</option>
                              <option value="sedan">Sedan</option>
                              <option value="suv">SUV</option>
                            </select>
                          </label>
                        </div>
                        <div>
                          <label>
                            <span className="highlight-cliente">Marca:</span>
                            <input
                              type="text"
                              name="marca"
                              defaultValue={vehiculo.marca}
                              maxLength="50"
                              required
                            />
                          </label>
                        </div>
                        <div>
                          <label>
                            <span className="highlight-cliente">Modelo:</span>
                            <input
                              type="text"
                              name="modelo"
                              defaultValue={vehiculo.modelo}
                              maxLength="50"
                              required
                            />
                          </label>
                          <label>
                            <span className="highlight-cliente">Color:</span>
                            <input
                              type="text"
                              name="color"
                              defaultValue={vehiculo.color}
                              maxLength="50"
                              required
                            />
                          </label>
                          <label>
                            <span className="highlight-cliente">Cilindraje:</span>
                            <input
                              type="number"
                              name="cilindraje"
                              defaultValue={vehiculo.cilindraje}
                              min="1000"
                              max="5000"
                              required
                            />
                          </label>
                          <label>
                            <span className="highlight-cliente">Kilometraje Actual:</span>
                            <input
                              type="number"
                              name="kilometrajeActual"
                              defaultValue={vehiculo.kilometrajeActual}
                              min={vehiculo.kilometrajeActual} 
                              max="500000"
                              required
                            />
                          </label>
                          <label>
                            <span className="highlight-cliente">Observación:</span>
                            <input
                              type="text"
                              name="observacion"
                              defaultValue={vehiculo.observacion}
                              maxLength="50"
                            />
                          </label>
                        </div>
                        <div className="actualizar-button-cliente">
                          <input type="submit" value="Actualizar" />
                          {successMessage && (
                            <p className="cliente-success">{successMessage}</p>
                          )}
                          {error && <p className="error">{error}</p>}
                        </div>
                        </form>

                      </div>
                    )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedSection === "Mantenimientos" && (
              <div className="list-mantenimientos-cliente">
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

              {mantenimientos.map((mantenimiento) => {
                // Obtener la placa del vehículo de forma segura
                const placa = mantenimiento.vehiculo?.placa || 
                              mantenimiento.placa || 
                              'Placa no disponible';

                return (
                  <div key={mantenimiento._id} className="item-mantenimientos-cliente">
                    <h3 className="vehicle-plate">
                      <span className='highlight-cliente'>Vehículo:</span> {placa}
                    </h3>
                    <div className='etiquetas-horizontales'>
                      <p>
                        <strong><span className='highlight-cliente'>Fecha:</span></strong> 
                        {new Date(mantenimiento.fechaCreacion).toLocaleDateString()}
                      </p>
                      <p>
                        <strong><span className='highlight-cliente'>Tipo de Mantenimiento: </span></strong> 
                        {mantenimiento.tipoMantenimiento}
                      </p>
                      <p>
                        <strong><span className='highlight-cliente'>Detalle del Mantenimiento: </span></strong> 
                        {mantenimiento.detalleMantenimiento}
                      </p>
                      <p>
                        <strong><span className='highlight-cliente'>Realizado: </span></strong> 
                        {mantenimiento.realizado ? 'Sí' : 'No'}
                      </p>
                    </div>

                    <div className="mantenimiento-actions">
                      <button onClick={() => toggleDetalles(mantenimiento._id)}>
                        {detallesVisible[mantenimiento._id] ? "Ocultar detalles" : "Ver detalles"}
                      </button>
                      
                      <button onClick={() => handleEliminar(mantenimiento._id)}>
                        Eliminar Mantenimiento
                      </button>

                      {!mantenimiento.realizado && (
                        <button onClick={() => handleRealizarMantenimiento(mantenimiento._id)}>
                          Marcar como Realizado
                        </button>
                      )}
                    </div>

                    {successMessages[mantenimiento._id] && (
                      <p className="mantenimiento-success">{successMessages[mantenimiento._id]}</p>
                    )}
                    {errorMessages[mantenimiento._id] && (
                      <p className="error-message">{errorMessages[mantenimiento._id]}</p>
                    )}

                    {detallesVisible[mantenimiento._id] && (
                      <div className="detalle-mantenimientos-">
                        <p><strong><span className='highlight-cliente'>Kilometraje de Cambio:</span></strong> {mantenimiento.kilometrajeActual}</p>
                        <p><strong><span className='highlight-cliente'>Kilometraje para el Próximo Cmabio</span></strong> {mantenimiento.kilometrajeCambio}</p>
                        <p><strong><span className='highlight-cliente'>Marca del Repuesto:</span></strong> {mantenimiento.marcaRepuesto}</p>
                        <p><strong><span className='highlight-cliente'>Detalles:</span></strong>{mantenimiento.detalleGeneral}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            )}
            {selectedSection === "Reportes" && (
              <div className="reportes-vehiculos">
                <div className="botones-reportes-cliente">
                  <div>
                  <button onClick={generarReporte}><FaCar style={{ marginRight: '8px' }} size={24} />Generar Reporte de Vehículos</button>
                  </div>
                </div>
              </div>
            )}
            {selectedSection === "Perfil" && (
                      <div className="perfil">
                        {perfil ? (
                          <div className="perfil-cliente">
                            <h3>Editar Mi Perfil</h3>
                            <form onSubmit={(e) => handleUpdateCliente(e)}>
                              <label htmlFor='rol'><strong>Rol:</strong>
                              <input
                                defaultValue={"Cliente"}
                                readOnly
                              />
                              </label>
                              <label htmlFor="nombre"><strong>Nombre:</strong></label>
                              <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                defaultValue={perfil.nombre}
                                maxLength="50"
                                pattern="^[a-zA-Z\s]{1,50}$"
                                title="El nombre debe tener solo letras y espacios (máximo 50 caracteres)."
                                required
                              />

                              <label htmlFor="email"><strong>Correo Electrónico:</strong></label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                defaultValue={perfil.email}
                                disabled // No editable
                              />

                              <label htmlFor="password"><strong>Nueva Contraseña:</strong></label>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Ingrese una nueva contraseña (opcional)"
                                minLength="8"
                                maxLength="50"
                                title="La contraseña debe tener al menos 8 caracteres."
                              />

                              <div className='actualizar-button'>
                                <input type="submit" value="Actualizar" />
                                {/* Mensajes de éxito o error debajo del botón */}
                                {successMessage && <p className="perfil-success">{successMessage}</p>}
                                {error && <p className="error">{error}</p>}
                              </div>
                            </form>
                          </div>
                        ) : (
                          <p>Cargando perfil...</p>
                        )}
                      </div>
                    )}

        </div>
      </main>
      </div>
    </div>
  );
};

export default ClienteDashboard;