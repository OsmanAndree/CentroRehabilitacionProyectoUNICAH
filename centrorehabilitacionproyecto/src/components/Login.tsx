import React, { useState, FormEvent } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '0 15px' }}>
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <div className="card p-5 shadow-lg" style={{ minWidth: '300px', maxWidth: '400px' }}>
            <h2 className="text-center mb-4">Acceso Rápido</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Introduce tu email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Introduce tu contraseña" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Iniciar sesión
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
