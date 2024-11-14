import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import axios from 'axios';

const RegistroPage = () => {
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    taller: '' // Solo para técnico
  });

  const handleSelectForm = (type) => {
    setFormType(type);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      direccion: '',
      taller: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = formType === 'tecnico' 
      ? 'http://localhost:5000/api/tecnico/registrar-tecnico' 
      : 'http://localhost:5000/api/cliente/registrar-cliente';
    
    axios.post(url, formData)
      .then(response => {
        // Maneja la respuesta del servidor (por ejemplo, mostrar un mensaje de éxito)
        console.log(response.data);
      })
      .catch(error => {
        // Maneja los errores (por ejemplo, mostrar un mensaje de error)
        console.error(error);
      });
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Registro</h2>
              <div className="d-flex justify-content-around mb-4">
                <Button variant="primary" onClick={() => handleSelectForm('tecnico')}>
                  Registrarse como Técnico
                </Button>
                <Button variant="secondary" onClick={() => handleSelectForm('cliente')}>
                  Registrarse como Cliente
                </Button>
              </div>

              {formType && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formNombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ingresa tu nombre" 
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>

                  <Form.Group controlId="formEmail" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="Ingresa tu email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>

                  <Form.Group controlId="formPassword" className="mt-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Ingresa tu contraseña" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>

                  <Form.Group controlId="formTelefono" className="mt-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ingresa tu teléfono" 
                      name="telefono" 
                      value={formData.telefono} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>

                  {formType === 'tecnico' && (
                    <Form.Group controlId="formTaller" className="mt-3">
                      <Form.Label>Taller</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Ingresa el nombre de tu taller" 
                        name="taller" 
                        value={formData.taller} 
                        onChange={handleChange} 
                        required 
                      />
                    </Form.Group>
                  )}

                  {/* Mostrar Dirección para ambos tipos de usuario */}
                  <Form.Group controlId="formDireccion" className="mt-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ingresa tu dirección" 
                      name="direccion" 
                      value={formData.direccion} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="mt-4">
                    {formType === 'tecnico' ? 'Registrarse como Técnico' : 'Registrarse como Cliente'}
                  </Button>
                </Form>
              )}

              {!formType && (
                <p className="text-center">Por favor, selecciona un tipo de registro para continuar.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistroPage;
