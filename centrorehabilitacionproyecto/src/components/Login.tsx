import React, { useState, FormEvent } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BiFontSize } from 'react-icons/bi';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    // Aquí iría la lógica de validación del usuario
    navigate('/home'); // Solo navegación sin lógica
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <Container fluid className="vh-90 d-flex justify-content-center align-items-center">
      <Row className="w-100">
        <Col md={6} className="mx-auto d-flex justify-content-center">
          <div className="card p-4 shadow-lg bg-white" style={{ minWidth: '400px', maxWidth: '400px', borderRadius: '10px' }}>
            <div className="text-center mt-3">
              <img src="/logo.svg" alt="Logo" style={{ width: '150px' }} />
            </div>
            <h2 className="text-center mb-4 text-dark" style={{ fontWeight: 'bold', fontSize: '28px' }}>Bienvenidos al Sistema</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formBasicUser" style={{ fontWeight: 'medium' }}>
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Introduce tu Usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  style={{ borderRadius: '0.375rem' }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword" style={{ fontWeight: 'medium' }}>
                <Form.Label>Contraseña</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Introduce tu contraseña"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    style={{
                      borderRadius: '0.375rem',
                      paddingLeft: '10px',
                      paddingRight: '35px',
                    }}
                  />
                  <Button
                    variant="link"
                    onClick={togglePasswordVisibility}
                    className="text-decoration-none"
                    style={{
                      marginLeft: '-30px',
                      fontSize: '1.2rem',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
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
