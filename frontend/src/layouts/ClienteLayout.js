
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const ClienteDashboard = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Dashboard de Cliente</h1>
          <p>Bienvenido, Cliente. Aquí puedes gestionar tus servicios y vehículos.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default ClienteDashboard;