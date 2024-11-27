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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Función de validación
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,15}$/; // Teléfonos de 8 a 15 dígitos
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Al menos 8 caracteres, una letra y un número

    if (!formData.nombre.trim()) return 'El nombre es obligatorio.';
    if (!emailRegex.test(formData.email)) return 'El correo electrónico no es válido.';
    if (!passwordRegex.test(formData.password)) {
      return 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número.';
    }
    if (!phoneRegex.test(formData.telefono)) {
      return 'El teléfono debe contener solo números y tener entre 8 y 15 dígitos.';
    }
    if (!formData.direccion.trim()) return 'La dirección es obligatoria.';
    if (selectedRole === 'tecnico' && !formData.taller.trim()) {
      return 'El campo "Taller" es obligatorio para técnicos.';
    }
    return null; // Sin errores
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const endpoint =
        selectedRole === 'tecnico'
          ? 'http://localhost:5000/api/tecnico/registrar-tecnico'
          : 'http://localhost:5000/api/cliente/registrar-cliente';

      console.log('Datos enviados:', formData);

      const response = await axios.post(endpoint, formData);

      if (response.status === 201) {
        setFormData({
          nombre: '',
          email: '',
          password: '',
          telefono: '',
          taller: '',
          direccion: '',
        });
        setShowSuccessModal(true);

        setTimeout(() => {
          setShowSuccessModal(false);
          window.location.href = '/ducech/login';
        }, 5000);
      } else {
        setError('Error inesperado en el registro.');
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);

      if (err.response) {
        const serverMessage = err.response.data.message || 'Error desconocido en el registro.';
        setError(serverMessage);
      } else {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      }
    }
  };

  return (
    <div className="background-registro">
      <div id="contenedor">
        <div id="contenedorcentrado-registro">
          {!selectedRole ? (
            <div id="registro">
              <h1>Registro</h1>
              <p>Elige el tipo de registro:</p>
              <button onClick={() => handleRoleSelection('tecnico')}>Registrar como Técnico</button>
              <button onClick={() => handleRoleSelection('cliente')}>Registrar como Cliente</button>
              <div className="pie-form-registro">
                <a href="/ducech/login">« Volver</a>
              </div>
            </div>
          ) : (
            <div id="registro">
              <h1>Registro como {selectedRole}</h1>
              <form onSubmit={handleSubmit}>
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />

                <label htmlFor="email">Correo electrónico:</label>
                <input type="email" id="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required />

                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="telefono">Teléfono:</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />

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
              <button onClick={() => setSelectedRole(null)} style={{ marginTop: '15px' }}>
                Volver a la selección de rol
              </button>
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>¡Registro Exitoso!</h2>
            <p>¡Bienvenido! Tu registro fue exitoso.</p>
            <p>Inicia Sesión para Continuar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
