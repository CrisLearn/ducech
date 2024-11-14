import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const TecnicoDashboard = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Dashboard de Técnico</h1>
          <p>Bienvenido, Técnico. Aquí puedes gestionar tus tareas y asignaciones.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default TecnicoDashboard;