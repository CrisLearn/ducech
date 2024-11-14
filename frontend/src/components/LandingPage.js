import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';

const LandingPage = () => {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">MiApp</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Inicio</Nav.Link>
              <Nav.Link href="#features">Características</Nav.Link>
              <Nav.Link href="#pricing">Precios</Nav.Link>
            </Nav>
            <Button variant="outline-light" href="/login">Iniciar Sesión</Button>
            <Button variant="outline-light" href="/registro">Registro</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="bg-light text-dark py-5 text-center">
        <Container>
          <h1>Bienvenido a MiApp</h1>
          <p>
            Esta es una página de inicio simple para demostrar el uso de Bootstrap con React.
          </p>
          <Button variant="primary" href="/ducech/login">Iniciar Sesión</Button>
          <Button variant="primary" href="/ducech/registro">Registrate</Button>
        </Container>
      </Container>

      <Container className="mt-5">
        <h2>Características</h2>
        <p>Descubre las increíbles características de nuestra aplicación.</p>

        <h2>Precios</h2>
        <p>Encuentra el plan que mejor se adapta a tus necesidades.</p>
      </Container>
    </>
  );
};

export default LandingPage;
