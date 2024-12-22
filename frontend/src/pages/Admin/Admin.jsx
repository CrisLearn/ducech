import React, { useState, useEffect } from 'react';
import './Admin.css'
import Header from '../../components/Layout/Header'
import { FaWrench, FaUser, FaDoorOpen, FaCar, FaClipboardList } from 'react-icons/fa';

const AdmPage = () => {
    const [selectedSection, setSelectedSection] = useState("Técnicos");
    const [tecnicos, setTecnicos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [mantenimientos, setMantenimientos] = useState([]);
    const [reportes, setReportes] = useState([]);
    const [error, setError] = useState("");
    const [detallesVisible, setDetallesVisible] = useState({});
    const [reporte, setReporte] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [formVisible, setFormVisible] = useState(false);
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
          setState(null); // Cambié a `null` para diferenciar datos cargados de errores
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
          fetchData("http://localhost:5000/api/admin/mantenimientos", (data) => {
            const mantenimientosConVehiculo = data.map((mantenimiento) => ({
              ...mantenimiento,
              vehiculo: mantenimiento.vehiculo || { placa: "Información no disponible" },
            }));
            setMantenimientos(mantenimientosConVehiculo);
          });
          break;
        case "Perfil":
          fetchData("http://localhost:5000/api/admin/perfil-admin", setPerfil);
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
    const handleUpdate = async (e, id) => {
      e.preventDefault();
      const form = e.target;
      const updatedAdmin = {
        nombre: form.nombre.value,
        password: form.password.value,
        
      };
    
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Usuario no autenticado.");
        }
        const response = await fetch(
          `http://localhost:5000/api/admin/update-admin`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedAdmin),
          }
        );
    
        if (response.ok) {
          const data = await response.json();
          console.log("Perfil Actualizado:", data);
    
    
          // Muestra el mensaje de éxito
          setSuccessMessage("Administrador actualizado correctamente");
          setError(null);
    
          // Limpia el mensaje de éxito después de 3 segundos
          setTimeout(() => setSuccessMessage(""), 3000);
    
          // Opcional: Oculta el formulario
          setFormVisible(false);
        } else {
          const errorData = await response.json();
          console.error("Error al actualizar el administrador:", errorData);
          setError("Administrador ya registrado");
        }
      } catch (error) {
        console.error("Error al enviar la solicitud:", error);
        setError("Error al enviar la solicitud");
      }
    }; 
    const generarReporteTecnicos = () => {
        const token = localStorage.getItem('token');
    
        fetch('http://localhost:5000/api/admin/reportes-tecnicos', {
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
          a.download = 'reporte-tecnicos.pdf'; 
          document.body.appendChild(a); 
          a.click();
          a.remove();
        })
        .catch(error => console.error('Error:', error));
    };
    const generarReporteClientes = () => {
        const token = localStorage.getItem('token');
    
        fetch('http://localhost:5000/api/admin/reportes-clientes', {
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
          a.download = 'reporte-clientes.pdf'; 
          document.body.appendChild(a); 
          a.click();
          a.remove();
        })
        .catch(error => console.error('Error:', error));
    };
    const generarReporteVehiculos = () => {
        const token = localStorage.getItem('token');
    
        fetch('http://localhost:5000/api/admin/reportes-vehiculos', {
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
    const generarReporteMantenimientos = () => {
        const token = localStorage.getItem('token');
    
        fetch('http://localhost:5000/api/admin/reportes-mantenimientos', {
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
          a.download = 'reporte-mantenimientos.pdf'; 
          document.body.appendChild(a); 
          a.click();
          a.remove();
        })
        .catch(error => console.error('Error:', error));
    };
    const sections = {
        Técnicos: "Gestión de Técnicos: Aquí puedes agregar, editar o eliminar técnicos.",
        Clientes: "Gestión de Clientes: Aquí puedes administrar clientes registrados.",
        Vehículos: "Gestión de Vehículos: Lista y administra los vehículos registrados.",
        Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
        Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
    };
    return (
        <div className="header-admin">
            <Header/>
            <div className="admin-dashboard">
                <aside className="sidebar-admin">
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
                    <div className='buttons-admin'>
                        <button onClick={handleLogout}>
                            <FaDoorOpen/>
                        </button>
                        <button onClick={() => setSelectedSection("Perfil")}>
                            <FaUser/>
                        </button>
                    </div>
                </aside>
                <main className="content-admin">
                    <h1>{selectedSection}</h1>
                    {selectedSection === "Técnicos" && (
                        <div className="list-tecnicos-admin">
                        {tecnicos.length === 0 ? (
                          <p>Cargando técnicos...</p>
                        ) : (
                          tecnicos.map((tecnico) => (
                            <div key={tecnico._id} className="item-tecnicos-admin">
                              <h3>{tecnico.nombre}</h3>
                              <div className='contenido'>
                              <p><strong>Email:</strong> {tecnico.email}</p>
                              <p><strong>Teléfono:</strong> {tecnico.telefono}</p>
                              </div>
                              <hr />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {selectedSection === "Clientes" && (
                      <div className="list-clientes-admin">
                        {clientes.length === 0 ? (
                          <p>Cargando clientes...</p>
                        ) : (
                          clientes.map((cliente) => (
                            <div key={cliente._id} className="item-clientes-admin">
                              <h3>{cliente.nombre}</h3>
                              <div className='contenido'>
                              <p><strong>Email:</strong> {cliente.email}</p>
                              <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                              </div>
                              <hr />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {selectedSection === "Vehículos" && (
                      <div className="list-vehiculos-admin">
                        {vehiculos.length === 0 ? (
                          <p>Cargando vehículos...</p>
                        ) : (
                          vehiculos.map((vehiculo) => (
                            <div key={vehiculo._id} className="item-vehiculos-admin">
                              <h3>{vehiculo.placa}</h3>
                              <div className='contenido'>
                              <p><strong>Marca:</strong> {vehiculo.marca}</p>
                              <p><strong>Color:</strong> {vehiculo.color}</p>
                              </div>
                              <button onClick={() => toggleDetalles(vehiculo._id)}>
                                {detallesVisible[vehiculo._id] ? "Ocultar detalles" : "Ver detalles"}
                              </button>
                              {detallesVisible[vehiculo._id] && (
                                <div className="contenido">
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
                      <div className="list-mantenimientos-admin">
                        {mantenimientos.length === 0 ? (
                          <p>Cargando mantenimientos...</p>
                        ) : (
                          mantenimientos.map((mantenimiento) => (
                            <div key={mantenimiento._id} className="item-mantenimientos-admin">
                              <h3>Placa del Vehículo: {mantenimiento.vehiculo.placa}</h3>
                              <div className='contenido'>
                              <p><strong>Tipo de Mantenimiento:</strong> {mantenimiento.tipoMantenimiento || "Información no disponible"}</p>
                              <p><strong>Descripción:</strong> {mantenimiento.detalleMantenimiento || "Información no disponible"}</p>
                              <p><strong>Realizado:</strong> {mantenimiento.realizado ? "Sí" : "No"}</p>
                              </div>
                              <button onClick={() => toggleDetalles(mantenimiento._id)}>
                                {detallesVisible[mantenimiento._id] ? "Ocultar detalles" : "Ver detalles"}
                              </button>
                              {detallesVisible[mantenimiento._id] && (
                                <div className='contenido'>
                                  <p><strong>Marca de Repuesto:</strong> {mantenimiento.marcaRepuesto || "Información no disponible"}</p>
                                  <p><strong>Kilometraje Actual:</strong> {mantenimiento.kilometrajeActual || "Información no disponible"}</p>
                                  <p><strong>Kilometraje de Próximo Cambio:</strong> {mantenimiento.kilometrajeCambio || "Información no disponible"}</p>
                                  <p><strong>Detalles Generales:</strong> {mantenimiento.detalleGeneral || "Información no disponible"}</p>
                                  <p><strong>Fecha del Mantenimiento:</strong> {new Date(mantenimiento.fechaCreacion).toLocaleDateString() || "Información no disponible"}</p>
                                </div>
                              )}
                              <hr />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {selectedSection === "Reportes" && (
                      <div className='reportes'>
                        <div className='botones-reportes'>
                        <div>
                          <button onClick={generarReporteTecnicos}>
                            <FaWrench style={{ marginRight: '8px' }} /> Generar Reporte de Técnicos
                          </button>
                          {reporte && (
                            <div id="reporteContainer">
                              
                            </div>
                          )}
                        </div>
                        <div>
                          <button onClick={generarReporteClientes}>
                            <FaUser style={{ marginRight: '8px' }} /> Generar Reporte de Clientes
                          </button>
                          {reporte && (
                            <div id="reporteContainer">
                              
                            </div>
                          )}
                        </div>
                        <div>
                          <button onClick={generarReporteVehiculos}>
                            <FaCar style={{ marginRight: '8px' }} /> Generar Reporte de Vehículos
                          </button>
                          {reporte && (
                            <div id="reporteContainer">
                              
                            </div>
                          )}
                        </div>
                        <div>
                          <button onClick={generarReporteMantenimientos}>
                            <FaClipboardList style={{ marginRight: '8px' }} /> Generar Reporte de Mantenimientos
                          </button>
                          {reporte && (
                            <div id="reporteContainer">
                              
                            </div>
                          )}
                        </div>
                        </div>
                      </div>
                    )}
                    {selectedSection === "Perfil" && (
                      <div className="perfil">
                        {perfil ? (
                          <div className="perfil-admin">
                            <h3>Editar Mi Perfil</h3>
                            <form onSubmit={(e) => handleUpdate(e)}>
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

                              <input type="submit" value="Actualizar" />
                              {/* Mensajes de éxito o error debajo del botón */}
                              {successMessage && <p className="perfil-success">{successMessage}</p>}
                              {error && <p className="error">{error}</p>}
                            </form>
                          </div>
                        ) : (
                          <p>Cargando perfil...</p>
                        )}
                      </div>
                    )}


                </main>
            </div>
        </div>
    );
};

export default AdmPage;