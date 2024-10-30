import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPage() {
    const [admin, setAdmin] = useState(null);
    const [usuario, setUsuario] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem('token'); // Asegúrate de que el token se almacena en el localStorage tras el inicio de sesión
                const adminId = localStorage.getItem('userId'); // Obtiene el ID del administrador desde localStorage

                const response = await axios.get(`http://localhost:5000/api/admin/perfil/${adminId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setAdmin(response.data);
                setUsuario(response.data.usuario);
                setCorreo(response.data.correo);
            } catch (error) {
                console.error(error);
                setError('Error al obtener el perfil. Asegúrate de que estás autenticado.');
            } finally {
                setLoading(false); // Cambia el estado de carga
            }
        };

        fetchAdminProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!usuario || !correo) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const adminId = localStorage.getItem('userId'); // Obtiene el ID del administrador desde localStorage

            const response = await axios.put(`http://localhost:5000/api/admin/perfil/${adminId}`, {
                usuario,
                correo,
                password,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAdmin(response.data.admin);
            setMessage('Perfil actualizado correctamente.');
            setError('');
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Error al actualizar el perfil.');
            setMessage('');
        }
    };

    return (
        <div>
            <h1>Bienvenido a la Página de Administración</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {loading ? (
                <p>Cargando perfil...</p>
            ) : (
                admin && (
                    <div>
                        <h2>Perfil del Administrador</h2>
                        <p><strong>Usuario:</strong> {admin.usuario}</p>
                        <p><strong>Correo:</strong> {admin.correo}</p>
                        <form onSubmit={handleUpdateProfile}>
                            <div>
                                <label>
                                    Usuario:
                                    <input
                                        type="text"
                                        value={usuario}
                                        onChange={(e) => setUsuario(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Correo:
                                    <input
                                        type="email"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Nueva Contraseña:
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </label>
                            </div>
                            <button type="submit">Actualizar Información</button>
                        </form>
                    </div>
                )
            )}
        </div>
    );
}

export default AdminPage;
