import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { FaCalendarAlt, FaNotesMedical, FaUsers, FaUserFriends, FaClinicMedical, FaMoneyBill, FaSignOutAlt } from "react-icons/fa";

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
    <Navbar expand="lg" fixed="top" className="shadow-lg" style={{ 
      background: "linear-gradient(to right, #287549, #1a5735)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "0.75rem 0"
    }}>
      <Container fluid>
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
            width="45" 
            height="45" 
            className="d-inline-block align-center me-3" 
            style={{ 
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
              borderRadius: "10px"
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

        <Navbar.Toggle 
          aria-controls="basic-navbar-nav"
          className="border-0 shadow-none" 
          style={{
            color: "white",
            padding: "0.5rem",
            marginRight: "1rem"
          }}
        >
          <span className="navbar-toggler-icon" style={{ filter: "brightness(0) invert(1)" }} />
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto d-flex align-items-center gap-3">
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;