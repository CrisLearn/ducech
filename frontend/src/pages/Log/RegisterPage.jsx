import React, { useState } from 'react';
import './RegisterPage.css';
import axios from 'axios';

const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    taller: '',
    direccion: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const endpoint = selectedRole === 'tecnico' ? 'http://localhost:5000/api/tecnico/registrar-tecnico' : 'http://localhost:5000/api/cliente/registrar-cliente';
      const response = await axios.post(endpoint, formData);
      
      if (response.data.success) {
        setSuccess('Registro exitoso. ¡Bienvenido!');
      } else {
        setError('Error en el registro. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        console.error('Error detallado:', err.response.data);
      }
      setError('Error en el registro. Inténtalo de nuevo.');
    }
    
  };

  return (
    <div className="background-registro">
      <div id="contenedor">
        <div id="contenedorcentrado-registro">
          {/* Sección de selección de rol */}
          {!selectedRole ? (
            <div id="registro">
              <h1>Registro</h1>
              <p>Elige el tipo de registro:</p>
              <button onClick={() => handleRoleSelection('tecnico')}>Registrar como Técnico</button>
              <button onClick={() => handleRoleSelection('cliente')}>Registrar como Cliente</button>
              <a href="/ducech/login">« Volver</a>
            </div>
          ) : (
            // Formulario específico basado en el rol seleccionado
            <div id="registro">
              <h1>Registro como {selectedRole}</h1>
              <form onSubmit={handleSubmit}>
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
                
                <label htmlFor="email">Correo electrónico:</label>
                <input type="email" id="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required />
                
                <label htmlFor="password">Contraseña:</label>
                <input type="password" id="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
                
                <label htmlFor="telefono">Teléfono:</label>
                <input type="text" id="telefono" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
                
                <label htmlFor="direccion">Dirección:</label>
                <input type="text" id="direccion" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
                
                {selectedRole === 'tecnico' && (
                  <>
                    <label htmlFor="taller">Taller:</label>
                    <input type="text" id="taller" name="taller" placeholder="Taller" value={formData.taller} onChange={handleChange} required />
                  </>
                )}

                <button type="submit">Registrar {selectedRole}</button>
              </form>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
              <button onClick={() => setSelectedRole(null)} style={{ marginTop: '15px' }}>
                Volver a la selección de rol
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
