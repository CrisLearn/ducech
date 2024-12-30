import React, { useState, useEffect } from 'react';
import './TecnicoDashboard.css';
import Header from '../../components/Layout/Header'
import { FaDoorOpen, FaUser, FaCar, FaClipboardList, FaDoorClosed } from 'react-icons/fa';

const TecnicoDashboard = ({ tecnicoName = "Tecnico" }) => {
  const [selectedSection, setSelectedSection] = useState("Perfil");
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [error, setError] = useState("");
  const [detallesVisible, setDetallesVisible] = useState({}); 
  const [successMessage, setSuccessMessage] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [successMessages, setSuccessMessages] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [reporte, setReporte] = useState(null);
  const [perfil, setPerfil] = useState(null);
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
        }else if (selectedSection === "Perfil") {
          const response = await fetch(
            "http://localhost:5000/api/tecnico/perfil-tecnico",
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
          setPerfil(data);
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
        } else if (selectedSection === "Perfil") {
          setPerfil([]);
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
    const updatedCliente = {
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
  
        // Actualiza la lista de clientes en el estado
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>
            cliente._id === id ? { ...cliente, ...updatedCliente } : cliente
          )
        );
  
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
        setError(errorData.error || "Error al actualizar el cliente");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setError("Error al enviar la solicitud");
    }
  };
  const handleUpdateVehiculo = async (e, id) => {
    e.preventDefault();
    const form = e.target;
    const updatedVehiculo = {
      tipo: form.tipo.value,
      marca: form.marca.value,
      modelo: form.modelo.value,
      color: form.color.value,
      cilindraje: form.cilindraje.value,
      kilometrajeActual: form.kilometrajeActual.value,
      observacion: form.observacion.value,
    };
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado.");
      }
      const response = await fetch(
        `http://localhost:5000/api/tecnico/update-vehiculo/${id}`,
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
        console.log("Vehiculo Actualizado Correctamente:", data);
  
        // Actualiza la lista de clientes en el estado
        setVehiculos((prevVehiculos) =>
          prevVehiculos.map((vehiculo) =>
            vehiculo._id === id ? { ...vehiculo, ...updatedVehiculo } : vehiculo
          )
        );
  
        // Muestra el mensaje de éxito
        setSuccessMessage("Vehiculo actualizado correctamente");
        setError(null);
  
        // Limpia el mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000);
  
        // Opcional: Oculta el formulario
        setFormVisible(false);
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar el vehiculo:", errorData);
        setError(errorData.error || "Error al actualizar el vehiculo");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setError("Error al enviar la solicitud");
    }
  };
  const renderClientesForm = () => (
    <form onSubmit={handleAddCliente} className="form-clientes-tecnico">
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
  const handleAddVehiculo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado");
      }
  
      const response = await fetch("http://localhost:5000/api/tecnico/registrar-vehiculo", {
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
  const fetchVehiculos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado.");
      }
      const response = await fetch('http://localhost:5000/api/tecnico/vehiculos', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setVehiculos(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al obtener los vehículos");
      }
    } catch (error) {
      console.error("Error al obtener los vehículos:", error);
      setError("Error al obtener los vehículos");
    }
  };
  const fetchPerfil = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuario no autenticado.");
      }
      const response = await fetch('http://localhost:5000/api/admin/perfil-admin', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setVehiculos(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al obtener el perfil");
      }
    } catch (error) {
      console.error("Error al obtener lel perfil:", error);
      setError("Error al obtener el perfil");
    }
  };
  useEffect(() => {
    fetchVehiculos();
  }, []); 
  const renderVehiculosForm = () => (
    <form onSubmit={handleAddVehiculo} className="form-vehiculos-tecnico">
      <label>
          Cliente:
          <select 
            name="clienteId"
            value={nuevoVehiculo.clienteId}
            onChange={(e) => handleInputChange(e, 'vehiculo')}
            required
          >
            <option value="" disabled>Seleccionar cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nombre}
              </option>
            ))} 
          </select>
      </label>
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
  const [nuevoMantenimiento, setNuevoMantenimiento] = useState({
    vehiculo: "",
    tipoMantenimiento: "",
    detalleMantenimiento: "",
    marcaRepuesto: "",
    kilometrajeActual: "",
    kilometrajeCambio: "",
    detalleGeneral: ""
  });
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

      const response = await fetch("http://localhost:5000/api/tecnico/registrar-mantenimiento", {
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
      const response = await fetch(`http://localhost:5000/api/tecnico/desactivar-mantenimiento/${id}`, {
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
  const renderMantenimientosForm = () => (
    <form onSubmit={handleAddMantenimiento} className="form-mantenimientos-tecnico">
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
          readOnly
        />
      </label>
      <label>
        Kilometraje Cambio:
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
  const generarReporteClientes = () => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/tecnico/reportes-clientes', {
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

    fetch('http://localhost:5000/api/tecnico/reportes-vehiculos', {
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

    fetch('http://localhost:5000/api/tecnico/reportes-mantenimientos', {
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
  const handleUpdateTecnico = async (e, id) => {
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
        `http://localhost:5000/api/tecnico/update-tecnico`,
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
  const sections = {
    Clientes: "Gestión de Clientes: Aquí puedes tecnicoistrar clientes registrados.",
    Vehículos: "Gestión de Vehículos: Lista y tecnicoistra los vehículos registrados.",
    Mantenimientos: "Historial de Mantenimientos: Detalles sobre mantenimientos realizados.",
    Reportes: "Reportes: Visualiza y descarga reportes estadísticos.",
  };
  return (
    <div className='header-tecnico'>
      <Header/>
      <div className="tecnico-dashboard">
      {/* Barra lateral */}
        <aside className="sidebar-tecnico">
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
          <div className="buttons-tecnico">
            <button onClick={handleLogout}>
              <FaDoorOpen/>
            </button>
            <button onClick={() => setSelectedSection("Perfil")}>
              <FaUser/>
            </button>
          </div>
        </aside>
      {/* Contenido principal */}
      <main className="content-tecnico">
        <h1>{selectedSection} Técnico</h1>
        <div>
          {selectedSection === "Clientes" && (
            <div className="list-clientes-tecnico">
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
                <div key={cliente._id} className='item-clientes-tecnico'>
                  <h3>{cliente.nombre}</h3>
                  <div className='etiquetas-horizontales'>
                  <p><strong><span className='highlight-tecnico'>Correo:</span></strong> {cliente.email}</p>
                  <p><strong><span className='highlight-tecnico'>Teléfono:</span></strong> {cliente.telefono}</p>
                  </div>
                  <div>
                  <button onClick={() => toggleDetalles(cliente._id)}>
                    {detallesVisible[cliente._id] ? "Ocultar detalles" : "Ver detalles"}
                  </button>
                  </div>
                  {detallesVisible[cliente._id] && (
                    <div className='contenido-tecnico'>
                      <form onSubmit={(e) => handleUpdate(e, cliente._id)}>
                        <div>
                          <h4>Actualiza la Información de tu Cliente</h4>
                        <label>
                          <span className='highlight-tecnico'>Nombre:</span>
                          <input
                            type="text"
                            name="nombre"
                            defaultValue={cliente.nombre}
                            required
                            maxLength="50" // Máximo 50 caracteres
                            pattern="^[A-Za-z\s]{1,50}$" // Solo letras y espacios, máximo 50 caracteres
                            title="El nombre debe contener solo letras y un máximo de 50 caracteres"
                          />
                        </label>
                        </div>
                        <div>
                        <label>
                          <span className="highlight-tecnico">Email:</span>
                          <input
                            type="email"
                            name="email"
                            defaultValue={cliente.email}
                            required
                            title="Ingrese un correo electrónico válido"
                          />
                        </label>
                        </div>
                        <div>
                        <label>
                          <span className="highlight-tecnico">Teléfono:</span>
                          <input
                            type="tel"
                            name="telefono"
                            defaultValue={cliente.telefono}
                            required
                            pattern="^\d{10}$" // Exactamente 10 dígitos
                            title="El teléfono debe contener exactamente 10 dígitos"
                          />
                        </label>
                        </div>
                        <div>
                        <label>
                          <span className='highlight-tecnico'>Dirección:</span>
                          <input
                            type="text"
                            name="direccion"
                            defaultValue={cliente.direccion}
                            required
                            maxLength="100" // Máximo 100 caracteres
                            title="La dirección debe tener un máximo de 100 caracteres"
                          />
                        </label>
                        </div>
                        <div className='actualizar-button'>
                        <input  type="submit" value="Actualizar" />
                          {/* Mensajes de éxito o error debajo del botón */}
                          {successMessage && <p className="cliente-success">{successMessage}</p>}
                          {error && <p className="error">{error}</p>}
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {selectedSection === "Vehículos" && (
            <div className="list-vehiculos-tecnico">
              <button
                className="tecnico-add-vehiculo-button"
                onClick={() => setFormVisible(!formVisible)}
              >
                {formVisible ? "Cancelar" : "Agregar Vehículo"}
              </button>

              {formVisible && renderVehiculosForm()}

              {vehiculos.length === 0 && !error && <p>No hay vehículos registrados</p>}

              {vehiculos.map((vehiculo) => (
                <div key={vehiculo._id} className="item-vehiculos-tecnico">
                  <h3>{vehiculo.placa}</h3>
                  <div className="etiquetas-horizontales">
                    <p>
                      <strong><span className='highlight-tecnico'>Marca:</span></strong> {vehiculo.marca}
                    </p>
                    <p>
                      <strong><span className='highlight-tecnico'>Modelo:</span></strong> {vehiculo.modelo}
                    </p>
                    <p>
                      <strong><span className='highlight-tecnico'>Color:</span></strong> {vehiculo.color}
                    </p>
                  </div>
                  <div>
                    <button onClick={() => toggleDetalles(vehiculo._id)}>
                      {detallesVisible[vehiculo._id] ? "Ocultar detalles" : "Ver detalles"}
                    </button>
                  </div>
                  {detallesVisible[vehiculo._id] && (
                    <div className="contenido-tecnico">
                      <form onSubmit={(e) => handleUpdateVehiculo(e, vehiculo._id)}>
                        <div>
                          <h4>Actualiza la Información del Vehículo</h4>
                          <label>
                            <span className="highlight-tecnico">Placa:</span>
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
                            <span className="highlight-tecnico">Tipo:</span>
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
                            <span className="highlight-tecnico">Marca:</span>
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
                            <span className="highlight-tecnico">Modelo:</span>
                            <input
                              type="text"
                              name="modelo"
                              defaultValue={vehiculo.modelo}
                              maxLength="50"
                              required
                            />
                          </label>
                          <label>
                            <span className="highlight-tecnico">Color:</span>
                            <input
                              type="text"
                              name="color"
                              defaultValue={vehiculo.color}
                              maxLength="50"
                              required
                            />
                          </label>
                          <label>
                            <span className="highlight-tecnico">Cilindraje:</span>
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
                            <span className="highlight-tecnico">Kilometraje Actual:</span>
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
                            <span className="highlight-tecnico">Observación:</span>
                            <input
                              type="text"
                              name="observacion"
                              defaultValue={vehiculo.observacion}
                              maxLength="50"
                            />
                          </label>
                        </div>
                        <div className="actualizar-button">
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
              ))}
            </div>
          )}
          {selectedSection === "Mantenimientos" && (
              <div className="list-mantenimientos-tecnico">
                <button
                  className="tecnico-add-mantenimiento-button"
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
                  <div key={mantenimiento._id} className="item-mantenimientos-tecnico">
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
              <div className='reportes'>
                <div>
                  <button onClick={generarReporteClientes}>
                    <FaUser style={{ marginRight: '8px' }} /> Generar Reporte de Clientes
                  </button>
                  {reporte && (
                    <div id="reporteContainer">
                      <pre>{JSON.stringify(reporte, null, 2)}</pre>
                    </div>
                  )}
                </div>
                <div>
                  <button onClick={generarReporteVehiculos}>
                    <FaCar style={{ marginRight: '8px' }} /> Generar Reporte de Vehículos
                  </button>
                  {reporte && (
                    <div id="reporteContainer">
                      <pre>{JSON.stringify(reporte, null, 2)}</pre>
                    </div>
                  )}
                </div>
                <div>
                  <button onClick={generarReporteMantenimientos}>
                    <FaClipboardList style={{ marginRight: '8px' }} /> Generar Reporte de Mantenimientos
                  </button>
                  {reporte && (
                    <div id="reporteContainer">
                      <pre>{JSON.stringify(reporte, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
          )}
          {selectedSection === "Perfil" && (
            <div className="perfil">
            {perfil ? (
              <div className="perfil-tecnico">
                <h3>Editar Mi Perfil</h3>
                <form onSubmit={(e) => handleUpdateTecnico(e)}>
                  <label htmlFor='rol'><strong>Rol:</strong>
                  <input
                    defaultValue={"Tecnico"}
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
                    
                  />
                  <label htmlFor="telefono"><strong>Telefono:</strong></label>
                  <input
                    type="tel"
                    name="telefono"
                    defaultValue={perfil.telefono}
                    required
                    pattern="^\d{10}$" // Exactamente 10 dígitos
                    title="El teléfono debe contener exactamente 10 dígitos"
                  />
                  <label htmlFor="taller"><strong>Taller:</strong></label>
                  <input
                    type="taller"
                    id="taller"
                    name="taller"
                    defaultValue={perfil.taller}
                    
                  />
                  <label htmlFor="direccion"><strong>Dirección:</strong></label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    defaultValue={perfil.direccion}
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
        </div>  
      </main>
    </div>
    </div>
  );
};

export default TecnicoDashboard;
