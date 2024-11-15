import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const AdminDashboard = () => {
  const [tecnicos, setTecnicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [adminData, setAdminData] = useState({ nombre: '', email: '', password: '' });

  useEffect(() => {
    // Obtener todos los técnicos y clientes cuando el componente se monta
    fetchTecnicos();
    fetchClientes();
  }, []);

  const fetchTecnicos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api//admintecnicos');
      setTecnicos(response.data);
    } catch (error) {
      console.error('Error fetching tecnicos:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAdminData({ ...adminData, [name]: value });
  };


  const generateReport = async (type) => {
    try {
      const url = type === 'tecnicos' 
        ? 'http://localhost:5000/api/admin/reportes-tecnicos' 
        : 'http://localhost:5000/api/admin/reportes-clientes';
      const response = await axios.get(url, { responseType: 'blob' });

      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', `reporte-${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Dashboard de Administrador</h1>
          <p>Bienvenido, Administrador. Aquí puedes gestionar el sistema.</p>

          <h2>Registrar Administrador</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu nombre"
                name="nombre"
                value={adminData.nombre}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email"
                name="email"
                value={adminData.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                name="password"
                value={adminData.password}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Registrar
            </Button>
          </Form>

          <h2 className="mt-4">Técnicos</h2>
          <ul>
            {tecnicos.map(tecnico => (
              <li key={tecnico._id}>{tecnico.nombre} - {tecnico.email}</li>
            ))}
          </ul>
          <Button variant="primary" onClick={() => generateReport('tecnicos')}>
            Generar Reporte de Técnicos
          </Button>

          <h2 className="mt-4">Clientes</h2>
          <ul>
            {clientes.map(cliente => (
              <li key={cliente._id}>{cliente.nombre} - {cliente.email}</li>
            ))}
          </ul>
          <Button variant="primary" onClick={() => generateReport('clientes')}>
            Generar Reporte de Clientes
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
