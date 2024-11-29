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
  const sections = {
    Vehiculo: "Mi Vehículo",
    Vehículos: "Gestión de Vehículos: Lista y administra los vehículos registrados.",
    Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
    Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
  };
  return(
    <div className="cliente-dashboard">
      <aside className="sidebar">
        <h2>Menú</h2>
        <ul>
          {Object.keys(sections).map((section) => (
            <li key={section} className={selectedSection === section ? "active" : ""}>
              <button onClick={() => setSelectedSection(section)}>{section}</button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
export default ClienteDashboard;