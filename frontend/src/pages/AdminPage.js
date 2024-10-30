import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [perfil, setPerfil] = useState(null);
    const [usuario, setUsuario] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [mecanicos, setMecanicos] = useState([]);
    const [clientes, setClientes] = useState([]);

    const fetchPerfil = async () => {
        try {
            const token = localStorage.getItem('token'); // Recuperar el token de localStorage
            if (!token) {
                setError('No se encontró token, por favor inicie sesión nuevamente');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/admin/obtener-perfil', {
                headers: {
                    Authorization: `Bearer ${token}` // Agregar el token en los encabezados
                }
            });
            setPerfil(response.data);
            setUsuario(response.data.usuario);
            setCorreo(response.data.correo);
        } catch (err) {
            setError('Error al obtener el perfil');
        }
    };

    const fetchMecanicos = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No se encontró token, por favor inicie sesión nuevamente');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/admin/mecanicos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMecanicos(response.data);
        } catch (err) {
            setError('Error al obtener mecánicos');
        }
    };

    const fetchClientes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No se encontró token, por favor inicie sesión nuevamente');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/admin/clientes', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setClientes(response.data);
        } catch (err) {
            setError('Error al obtener clientes');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token'); // Recuperar el token de localStorage
            if (!token) {
                setError('No se encontró token, por favor inicie sesión nuevamente');
                return;
            }

            const response = await axios.put(
                'http://localhost:5000/api/admin/actualizar-perfil',
                { usuario, correo, password },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Agregar el token en los encabezados
                    },
                }
            );

            setMessage(response.data.message);
            setError('');
            fetchPerfil(); // Refrescar los datos del perfil después de la actualización
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar el perfil');
            setMessage('');
        }
    };

    useEffect(() => {
        fetchPerfil();
        fetchMecanicos(); // Obtener mecánicos al cargar el componente
        fetchClientes(); // Obtener clientes al cargar el componente
    }, []);

    return (
        <div className="container mt-5">
            <h1>Admin Page</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            {perfil ? (
                <div>
                    <h2>Bienvenido, {perfil.usuario}</h2>
                    <p>Correo: {perfil.correo}</p>
                    {/* Formulario para actualizar el perfil */}
                    <div className="form-group mt-4">
                        <label>Usuario</label>
                        <input
                            type="text"
                            className="form-control"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo</label>
                        <input
                            type="email"
                            className="form-control"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Dejar en blanco para no cambiar"
                        />
                    </div>
                    <button className="btn btn-primary mt-3" onClick={handleUpdateProfile}>
                        Actualizar Perfil
                    </button>
                </div>
            ) : (
                !error && <p>Cargando perfil...</p>
            )}

            {/* Sección para mostrar mecánicos */}
            <h2 className="mt-5">Mecánicos</h2>
            {mecanicos.length > 0 ? (
                <ul className="list-group">
                    {mecanicos.map(mecanico => (
                        <li key={mecanico._id} className="list-group-item">
                            {mecanico.usuario} - {mecanico.correo}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay mecánicos disponibles.</p>
            )}

            {/* Sección para mostrar clientes */}
            <h2 className="mt-5">Clientes</h2>
            {clientes.length > 0 ? (
                <ul className="list-group">
                    {clientes.map(cliente => (
                        <li key={cliente._id} className="list-group-item">
                            {cliente.usuario} - {cliente.correo}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay clientes disponibles.</p>
            )}
        </div>
    );
};

export default AdminPage;
