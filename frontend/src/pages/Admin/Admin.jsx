import React, {useEffect, useState} from "react";
import './Admin.css'
import Header from '../../components/Layout/Header'
import { FaUser, FaDoorOpen } from "react-icons/fa";

const AdmPage = ({ adminName = "Administrador"}) => {
    const [selectedSection, setSelectedSection] =useState("Técnicos");
    const [tecnicos, setTecnicos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [error, setError] = useState("");
    const [mantenimientos, setMantenimientos] = useState([]);
    const [detallesVisible, setDetallesVisible] = useState({});
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
            fetchData("http://localhost:5000/api/admin/mantenimientos", (data) => {
              // Asegurarse de que cada mantenimiento tiene la información del vehículo
              const mantenimientosConVehiculo = data.map(mantenimiento => ({
                ...mantenimiento,
                vehiculo: mantenimiento.vehiculo || { placa: "Información no disponible" }
              }));
              setMantenimientos(mantenimientosConVehiculo);
            });
            break;
          default:
            break;
        }
    }, [selectedSection]);
    const toggleDetalles = (id) => {
        setDetallesVisible((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));
    };
    const sections ={
        Técnicos: "Gestión de Técnicos: Aquí puedes agregar, editar o eliminar técnicos.",
        Clientes: "Gestión de Clientes: Aquí puedes administrar clientes registrados.",
        Vehículos: "Gestión de Vehículos: Lista y administra los vehículos registrados.",
        Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
        Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
    };
    return (
        <div className="header-adminlanding-page d-flex flex-column min-vh-100">
            <Header/>
            <div>
                <aside className="sidebar-admin">
                    <h2>OPCIONES</h2>
                    <ul>
                        {Object.keys(sections).map((section) => (
                            <li
                             key={section}
                                className={selectedSection === section ? "active" : ""}>
                                <button onClick={() => setSelectedSection(section)}>
                                    {section}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="main-admin">
                    <header className="header-admin">
                        <button >
                            Perfil <FaUser/> 
                        </button>    
                        <button >
                            Salir <FaDoorOpen/> 
                        </button>    
                    </header>
                    <div className="dashboard-admin">
                        <h1>{selectedSection}</h1>
                        {selectedSection === "Técnicos" && (
                            <div className="tecnicos-list-admin">
                                {tecnicos.length === 0 ? (
                                    <p>Cargando técnicos...</p>
                                ):(
                                    tecnicos.map((tecnico) => (
                                        <div key={tecnico._id} className="tecnico-item-admin">
                                            <h3>{tecnico.nombre}</h3>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdmPage;