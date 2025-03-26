import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Offcanvas } from "react-bootstrap";
import { FaCalendarAlt, FaNotesMedical, FaUsers, FaUserFriends, FaClinicMedical, FaMoneyBill, FaSignOutAlt, FaBars } from "react-icons/fa";

function NavBar() {
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);

  const handleNavClick = (path: string) => {
    navigate(path);
    setShowOffcanvas(false);
  };

  const menuItems = [
    { path: "/citas", icon: <FaCalendarAlt size={20} />, text: "Citas" },
    { path: "/diagnosticos", icon: <FaNotesMedical size={20} />, text: "Diagnósticos" },
    { path: "/pacientes", icon: <FaUsers size={20} />, text: "Pacientes" },
    { path: "/encargados", icon: <FaUserFriends size={20} />, text: "Encargados" },
    { path: "/terapeutas", icon: <FaClinicMedical size={20} />, text: "Terapeutas" },
    { path: "/compras", icon: <FaMoneyBill size={20} />, text: "Compras" }
  ];

  return (
    <>
      <Navbar expand="lg" fixed="top" className="shadow-lg" style={{ 
        background: "linear-gradient(to right, #287549, #1a5735)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "0.75rem 0"
      }}>
        <Container fluid className="px-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: '0 0 auto' }}>
            <Navbar.Brand 
              onClick={() => handleNavClick("/home")} 
              className="d-flex align-items-center"
              style={{ 
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: "0.5rem 1rem",
                borderRadius: "12px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <img 
                src="/logo.png"
                alt="Logo"
                style={{
                  width: "45px",
                  height: "45px",
                  marginRight: "12px",
                  borderRadius: "8px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))"
                }}
              />
              <span className="fw-bold text-white" style={{ 
                fontSize: "1.3rem",
                letterSpacing: "0.5px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
              }}>
                Centro de Rehabilitación
              </span>
            </Navbar.Brand>
          </div>

          <Button
            variant="link"
            className="d-lg-none text-white"
            onClick={() => setShowOffcanvas(true)}
            style={{
              padding: "0.5rem",
              border: "none",
              transition: "all 0.3s ease"
            }}
          >
            <FaBars size={24} />
          </Button>

          <div style={{ 
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }} className="d-none d-lg-flex">
            <Nav className="d-flex align-items-center gap-3">
              {menuItems.map((item, index) => (
                <Nav.Link 
                  key={index}
                  onClick={() => handleNavClick(item.path)}
                  className="text-white d-flex align-items-center position-relative"
                  style={{
                    padding: "0.6rem 1.2rem",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                    fontSize: "1rem",
                    fontWeight: "500",
                    letterSpacing: "0.3px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span className="me-2" style={{ 
                    display: "flex", 
                    alignItems: "center",
                    color: "rgba(255, 255, 255, 0.9)"
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ position: "relative" }}>
                    {item.text}
                    <span style={{
                      position: "absolute",
                      bottom: "-4px",
                      left: "0",
                      width: "0",
                      height: "2px",
                      backgroundColor: "white",
                      transition: "width 0.3s ease"
                    }} className="hover-line" />
                  </span>
                </Nav.Link>
              ))}
            </Nav>
          </div>

          <div style={{ flex: '0 0 auto' }} className="d-none d-lg-block">
            <Button 
              variant="outline-light"
              onClick={() => window.location.href = "/"}
              className="d-flex align-items-center"
              style={{ 
                gap: "8px",
                padding: "0.6rem 1.2rem",
                borderRadius: "10px",
                transition: "all 0.3s ease",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FaSignOutAlt size={18} />
              <span>Salir</span>
            </Button>
          </div>
        </Container>
      </Navbar>

      <Offcanvas 
        show={showOffcanvas} 
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="bg-dark"
        style={{
          background: "linear-gradient(135deg, #287549, #1a5735)",
          color: "white",
          width: "280px",
          transition: "transform 0.3s ease-in-out",
          transform: showOffcanvas ? "translateX(0)" : "translateX(100%)"
        }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="d-flex align-items-center">
            <span style={{ 
              fontSize: "1.5rem",
              fontWeight: "600",
              letterSpacing: "0.5px"
            }}>Menú</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column gap-2">
            {menuItems.map((item, index) => (
              <Nav.Link
                key={index}
                onClick={() => handleNavClick(item.path)}
                className="text-white d-flex align-items-center"
                style={{
                  padding: "1rem",
                  borderRadius: "10px",
                  transition: "all 0.3s ease",
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  opacity: "0",
                  transform: "translateX(20px)",
                  animation: `slideIn 0.3s ease forwards ${index * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "translateX(5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <span className="me-3" style={{ 
                  display: "flex", 
                  alignItems: "center",
                  color: "rgba(255, 255, 255, 0.9)"
                }}>
                  {item.icon}
                </span>
                {item.text}
              </Nav.Link>
            ))}
            <Button 
              variant="outline-light"
              onClick={() => {
                window.location.href = "/";
                setShowOffcanvas(false);
              }}
              className="d-flex align-items-center justify-content-center mt-4"
              style={{ 
                gap: "8px",
                padding: "0.8rem",
                borderRadius: "10px",
                transition: "all 0.3s ease",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                opacity: "0",
                transform: "translateX(20px)",
                animation: `slideIn 0.3s ease forwards ${menuItems.length * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FaSignOutAlt size={18} />
              <span>Salir</span>
            </Button>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  );
}

export default NavBar;