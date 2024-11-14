import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AdminDashboard = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Dashboard de Administrador</h1>
          <p>Bienvenido, Administrador. Aquí puedes gestionar el sistema.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
