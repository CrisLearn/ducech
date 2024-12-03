import React, { useState, useEffect } from 'react';
import './TecnicoDashboard.css';

const TecnicoDashboard = ({ tecnicoName = "Tecnico" }) => {
  const [selectedSection, setSelectedSection] = useState("Técnicos");
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({}); 
  const [successMessage, setSuccessMessage] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Usuario no autenticado");
        }

        if (selectedSection === "Clientes") {
          const response = await fetch(
            "http://localhost:5000/api/tecnico/clientes",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (!response.ok) {
            throw new Error(
              "Error al obtener la lista de clientes. Verifica tu autenticación"
            );
          }
          
          const data = await response.json();
          setClientes(data);
          setError("");
        } else if (selectedSection === "Vehiculos") {
          const response = await fetch(
            "http://localhost:5000/api/tecnico/vehiculos",
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
            "http://localhost:5000/api/tecnico/mantenimientos",
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
        if (selectedSection === "Clientes") {
          setClientes([]);
        } else if (selectedSection === "Vehículos") {
          setVehiculos([]);
        } else if (selectedSection === "Mantenimientos") {
          setMantenimientos([]);
        }
      }
    };

    fetchData();
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

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'cliente') {
      setNuevoCliente((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (formType === 'vehiculo') {
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

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    direccion: ''
  });
  const handleAddCliente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado");
      }
  
      const response = await fetch("http://localhost:5000/api/tecnico/registrar-cliente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoCliente),
      });
  
      if (!response.ok) {
        // Capturar el error específico del servidor
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes("Correo ya registrado")) {
          throw new Error("El correo ya esta registrado para otro usuario.");
        }
        throw new Error("Error al agregar cliente. Verifica los datos y la autenticación.");
      }
  
      const clienteAgregado = await response.json();
      setClientes((prevClientes) => [...prevClientes, clienteAgregado]);
      setFormVisible(false);
      setNuevoCliente({
          nombre: '',
          email: '',
          password: '',
          telefono: '',
          direccion: '',
      });
      showMessage("Cliente agregado correctamente.");
    } catch (err) {
      // Mostrar el mensaje de error en la interfaz de usuario
      setError(err.message);
    }
  };
  const handleUpdate = async (e, id) => {
    e.preventDefault();
    const form = e.target;
    const updatedCliente= {
      nombre: form.nombre.value,
      email: form.email.value,
      telefono: form.telefono.value,
      direccion: form.direccion.value,
    };
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado.");
      }
      const response = await fetch(
        `http://localhost:5000/api/tecnico/update-cliente/${id}`,
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
        console.log("Cliente actualizado:", data);
  
        // Actualiza la lista de vehículos en el estado
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>
            cliente._id === id ? { ...cliente, ...updatedCliente } : cliente
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
        console.error("Error al actualizar el cliente:", errorData);
        setError("Cliente ya registrado");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setError("Error al enviar la solicitud");
    }
  };  

  const renderClientesForm = () => (
    <form onSubmit={handleAddCliente} className="tecnico-cliente-form">
      <label>
        Nombre:
        <input
          type="text"
          name="nombre"
          value={nuevoCliente.nombre}
          onChange={(e) => handleInputChange(e, 'cliente')}
          required
          maxLength="50" // Máximo 50 caracteres
          pattern="^[A-Za-z\s]{1,50}$" // Solo letras y espacios, máximo 50 caracteres
          title="El nombre debe contener solo letras y un máximo de 50 caracteres"
        />
      </label>

      <label>
        Email:
        <input
          type="email"
          name="email"
          value={nuevoCliente.email}
          onChange={(e) => handleInputChange(e, 'cliente')}
          required
          title="Ingrese un correo electrónico válido"
        />
      </label>

      <label>
        Contraseña:
        <input
          type="password"
          name="password"
          value={`${nuevoCliente.nombre}123`} // Contraseña generada automáticamente
          readOnly // Campo de solo lectura para evitar modificaciones
          title="La contraseña se genera automáticamente basada en el nombre"
        />
      </label>

      <label>
        Teléfono:
        <input
          type="tel"
          name="telefono"
          value={nuevoCliente.telefono}
          onChange={(e) => handleInputChange(e, 'cliente')}
          required
          pattern="^\d{10}$" // Exactamente 10 dígitos
          title="El teléfono debe contener exactamente 10 dígitos"
        />
      </label>

      <label>
        Dirección:
        <input
          type="text"
          name="direccion"
          value={nuevoCliente.direccion}
          onChange={(e) => handleInputChange(e, 'cliente')}
          required
          maxLength="100" // Máximo 100 caracteres
          title="La dirección debe tener un máximo de 100 caracteres"
        />
      </label>

      <button type="submit">Guardar</button>
    </form>
  );

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
              <button className='tecnico-add-cliente-button'
              onClick={() => {
                setFormVisible(!formVisible);
                setSuccessMessage("");
                setError(null);
              }}>
                {formVisible ? "Cancelar":"Agregar Cliente"}
              </button>
              {error && <p className="cliente-error">{error}</p>}
              {formVisible && renderClientesForm()}
              {clientes.length === 0 && !error && (
                <p>No hay clientes registrados</p>
              )}
              {clientes.map((cliente) => (
                <div key={cliente._id} className='tecnico-cliente-item'>
                  <h3>{cliente.nombre}</h3>
                  <p><strong>Correo:</strong> {cliente.email}</p>
                  <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                  <button onClick={() => toggleDetalles(cliente._id)}>
                    {detallesVisible[cliente._id] ? "Ocultar detalles" : "Ver detalles"}
                  </button>
                  {detallesVisible[cliente._id] && (
                    <div>
                      <form onSubmit={(e) => handleUpdate(e, cliente._id)}>
                        <label>
                          Nombre:
                          <input
                            type="text"
                            name="nombre"
                            value={nuevoCliente.nombre}
                            onChange={(e) => handleInputChange(e, 'cliente')}
                            required
                            maxLength="50" // Máximo 50 caracteres
                            pattern="^[A-Za-z\s]{1,50}$" // Solo letras y espacios, máximo 50 caracteres
                            title="El nombre debe contener solo letras y un máximo de 50 caracteres"
                          />
                        </label>

                        <label>
                          Email:
                          <input
                            type="email"
                            name="email"
                            value={nuevoCliente.email}
                            onChange={(e) => handleInputChange(e, 'cliente')}
                            required
                            title="Ingrese un correo electrónico válido"
                          />
                        </label>

                        <label>
                          Teléfono:
                          <input
                            type="tel"
                            name="telefono"
                            value={nuevoCliente.telefono}
                            onChange={(e) => handleInputChange(e, 'cliente')}
                            required
                            pattern="^\d{10}$" // Exactamente 10 dígitos
                            title="El teléfono debe contener exactamente 10 dígitos"
                          />
                        </label>

                        <label>
                          Dirección:
                          <input
                            type="text"
                            name="direccion"
                            value={nuevoCliente.direccion}
                            onChange={(e) => handleInputChange(e, 'cliente')}
                            required
                            maxLength="100" // Máximo 100 caracteres
                            title="La dirección debe tener un máximo de 100 caracteres"
                          />
                        </label>
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
