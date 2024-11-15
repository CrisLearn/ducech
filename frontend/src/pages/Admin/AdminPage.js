import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PerfilAdmin = () => {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/perfil-admin')
      .then(response => {
        setPerfil(response.data);
      })
      .catch(error => {
        console.error('Hubo un error al obtener el perfil:', error);
      });
  }, []);

  if (!perfil) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ float: 'left', width: '25%' }}>
      <h2>Perfil Admin</h2>
      <img src={perfil.avatar} alt="Avatar" style={{ width: '100%' }} />
      <p>Nombre: {perfil.name}</p>
      <p>Email: {perfil.email}</p>
      {/* Aquí puedes agregar más información del perfil según tus necesidades */}
    </div>
  );
};

export default PerfilAdmin;
