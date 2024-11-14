import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../services/auth';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Por defecto, rol 'admin'
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await auth.login(email, password, role);
      switch (role) {
        case 'admin':
          navigate('/ducech/administrador');
          break;
        case 'tecnico':
          navigate('/ducech/tecnico');
          break;
        case 'cliente':
          navigate('/ducech/cliente');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row>
        <Col md={12}>
          <Card className="p-4">
            <Card.Body>
              <h2 className="text-center mb-4">Iniciar Sesión</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Ingresa tu email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicRole" className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Control 
                    as="select" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="admin">Administrador</option>
                    <option value="tecnico">Técnico</option>
                    <option value="cliente">Cliente</option>
                  </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Iniciar Sesión
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
