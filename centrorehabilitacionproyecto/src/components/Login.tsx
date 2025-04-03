import React, { useState, FormEvent } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<string>("");
  const [contraseña, setContraseña] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3002/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario, password: contraseña }),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.error || "Error en el inicio de sesión");
      }

      if (data.usuario && data.estado === 'Inactivo') {
        toast.error("Este usuario se encuentra inactivo. Contacte al administrador.");
        setLoading(false);
        return;
      }
         
      localStorage.setItem("idRol", data.idRol.toString());
        
      toast.success("Inicio de sesión exitoso");
      setTimeout(() => navigate("/home"), 1500);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="p-0 m-0"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `linear-gradient(135deg, rgba(40, 117, 73, 0.7) 0%, rgba(26, 87, 53, 0.7) 100%), url('/images/fotoprincipallogin.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4} xl={4} className="px-4">
          <div
            className="bg-white shadow-lg"
            style={{
              borderRadius: "20px",
              padding: "2.5rem",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="text-center mb-4">
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  width: "120px",
                  height: "auto",
                  marginBottom: "1.5rem",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                }}
              />
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "600",
                  color: "#2E8B57",
                  marginBottom: "0.5rem",
                }}
              >
                Bienvenido
              </h2>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.95rem",
                }}
              >
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-4" controlId="formBasicUser">
                <div className="position-relative">
                  <div
                    className="position-absolute"
                    style={{
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#2E8B57",
                    }}
                  >
                    <FaUser />
                  </div>
                  <Form.Control
                    type="email"
                    placeholder="Correo electrónico"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    style={{
                      padding: "0.75rem 1rem 0.75rem 2.5rem",
                      borderRadius: "10px",
                      border: "1px solid #e0e0e0",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                    }}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="formBasicPassword">
                <div className="position-relative">
                  <div
                    className="position-absolute"
                    style={{
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#2E8B57",
                    }}
                  >
                    <FaLock />
                  </div>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    style={{
                      padding: "0.75rem 1rem 0.75rem 2.5rem",
                      borderRadius: "10px",
                      border: "1px solid #e0e0e0",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                    }}
                  />
                  <Button
                    variant="link"
                    onClick={() => setShowPassword(!showPassword)}
                    className="position-absolute"
                    style={{
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#2E8B57",
                      padding: "0.25rem",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                className="w-100"
                style={{
                  padding: "0.75rem",
                  borderRadius: "10px",
                  backgroundColor: "#2E8B57",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "500",
                  marginTop: "1rem",
                  transition: "all 0.3s ease",
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(46, 139, 87, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
