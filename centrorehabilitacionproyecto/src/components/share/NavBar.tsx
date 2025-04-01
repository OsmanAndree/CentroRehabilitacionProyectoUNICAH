import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Offcanvas } from "react-bootstrap";
import { FaCalendarAlt, FaNotesMedical, FaUsers, FaUserFriends, FaClinicMedical, FaMoneyBill, FaSignOutAlt, FaBars } from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";

function NavBar() {
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobileDevice(width < 768);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setShowOffcanvas(false);
  };

  const getResponsiveFontSize = () => {
    if (windowWidth < 1200) return "0.85rem";
    if (windowWidth < 1400) return "0.9rem";
    return "1rem";
  };

  const getResponsivePadding = () => {
    if (windowWidth < 1200) return "0.4rem 0.7rem";
    if (windowWidth < 1400) return "0.5rem 0.9rem";
    return "0.6rem 1.2rem";
  };

  const getIconSize = (defaultSize: number) => {
    if (isMobileDevice) return defaultSize - 2;
    if (windowWidth < 1200) return defaultSize - 4;
    return defaultSize;
  };

  const menuItems = [
    { path: "/citas", icon: <FaCalendarAlt size={getIconSize(20)} />, text: "Citas" },
    { path: "/diagnosticos", icon: <FaNotesMedical size={getIconSize(20)} />, text: "Diagnósticos" },
    { path: "/pacientes", icon: <FaUsers size={getIconSize(20)} />, text: "Pacientes" },
    { path: "/encargados", icon: <FaUserFriends size={getIconSize(20)} />, text: "Encargados" },
    { path: "/terapeutas", icon: <FaClinicMedical size={getIconSize(20)} />, text: "Terapeutas" },
    { path: "/compras", icon: <FaMoneyBill size={getIconSize(20)} />, text: "Compras" },
    { path: "/usuarios", icon: <FaUserGear size={getIconSize(20)} />, text: "Usuarios" }
  ];

  return (
    <>
      <Navbar expand="xl" fixed="top" className="shadow-lg" style={{ 
        background: "linear-gradient(to right, #287549, #1a5735)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: isMobileDevice ? "0.5rem 0" : "0.75rem 0"
      }}>
        <Container fluid className="px-2 px-sm-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: '0 0 auto' }}>
            <Navbar.Brand 
              onClick={() => handleNavClick("/home")} 
              className="d-flex align-items-center"
              style={{ 
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: isMobileDevice ? "0.3rem 0.5rem" : "0.5rem 0.75rem",
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
                  width: isMobileDevice ? "30px" : windowWidth < 576 ? "35px" : "45px",
                  height: isMobileDevice ? "30px" : windowWidth < 576 ? "35px" : "45px",
                  marginRight: isMobileDevice ? "6px" : "8px",
                  borderRadius: "8px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))"
                }}
              />
              <span className="fw-bold text-white" style={{ 
                fontSize: isMobileDevice ? "0.9rem" : windowWidth < 576 ? "1rem" : "1.3rem",
                letterSpacing: "0.5px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
              }}>
                {isMobileDevice ? "Centro Rehab." : "Centro de Rehabilitación"}
              </span>
            </Navbar.Brand>
          </div>

          <Button
            variant="link"
            className="d-xl-none text-white"
            onClick={() => setShowOffcanvas(true)}
            style={{
              padding: isMobileDevice ? "0.3rem" : "0.5rem",
              border: "none",
              transition: "all 0.3s ease"
            }}
          >
            <FaBars size={isMobileDevice ? 20 : 24} />
          </Button>

          <div style={{ 
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }} className="d-none d-xl-flex">
            <Nav className="d-flex align-items-center justify-content-center flex-wrap" style={{ gap: windowWidth < 1400 ? "0.3rem" : "0.5rem" }}>
              {menuItems.map((item, index) => (
                <Nav.Link 
                  key={index}
                  onClick={() => handleNavClick(item.path)}
                  className="text-white d-flex align-items-center position-relative"
                  style={{
                    padding: getResponsivePadding(),
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                    fontSize: getResponsiveFontSize(),
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
                  <span className="me-1 me-lg-2" style={{ 
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

          <div style={{ flex: '0 0 auto' }} className="d-none d-xl-block">
            <Button 
              variant="outline-light"
              onClick={() => window.location.href = "/"}
              className="d-flex align-items-center"
              style={{ 
                gap: "8px",
                padding: windowWidth < 1200 ? "0.5rem 1rem" : "0.6rem 1.2rem",
                borderRadius: "10px",
                transition: "all 0.3s ease",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontSize: getResponsiveFontSize()
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
              <FaSignOutAlt size={windowWidth < 1200 ? 16 : 18} />
              <span>Salir</span>
            </Button>
          </div>
        </Container>
      </Navbar>

      <Offcanvas 
        show={showOffcanvas} 
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="bg-dark mobile-menu"
        style={{
          background: "linear-gradient(135deg, #287549, #1a5735)",
          color: "white",
          width: isMobileDevice ? "85%" : windowWidth < 576 ? "100%" : "280px",
          transition: "transform 0.3s ease-in-out",
          transform: showOffcanvas ? "translateX(0)" : "translateX(100%)"
        }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="py-2">
          <Offcanvas.Title className="d-flex align-items-center">
            <span style={{ 
              fontSize: isMobileDevice ? "1.2rem" : "1.5rem",
              fontWeight: "600",
              letterSpacing: "0.5px"
            }}>Menú</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-2 pb-4">
          <Nav className="flex-column" style={{ gap: isMobileDevice ? "0.5rem" : "0.75rem" }}>
            {menuItems.map((item, index) => (
              <Nav.Link
                key={index}
                onClick={() => handleNavClick(item.path)}
                className="text-white d-flex align-items-center"
                style={{
                  padding: isMobileDevice ? "0.75rem 0.5rem" : "1rem",
                  borderRadius: "10px",
                  transition: "all 0.3s ease",
                  fontSize: isMobileDevice ? "1rem" : "1.1rem",
                  fontWeight: "500",
                  opacity: "0",
                  transform: "translateX(20px)",
                  animation: `slideIn 0.3s ease forwards ${index * 0.08}s`
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
                <span className={isMobileDevice ? "me-2" : "me-3"} style={{ 
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
              className="d-flex align-items-center justify-content-center mt-3"
              style={{ 
                gap: "8px",
                padding: isMobileDevice ? "0.6rem" : "0.8rem",
                borderRadius: "10px",
                transition: "all 0.3s ease",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                opacity: "0",
                transform: "translateX(20px)",
                animation: `slideIn 0.3s ease forwards ${menuItems.length * 0.08}s`,
                fontSize: isMobileDevice ? "0.9rem" : "1rem"
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
              <FaSignOutAlt size={isMobileDevice ? 16 : 18} />
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
          
          @media (max-width: 1400px) {
            .navbar .nav-link {
              white-space: nowrap;
            }
          }
          
          .mobile-menu .btn-close {
            filter: brightness(0) invert(1);
            opacity: 0.8;
            padding: 0.25rem;
          }
          
          .mobile-menu .btn-close:hover {
            opacity: 1;
          }
          
          /* Ajustes para dispositivos plegables como Z Flip */
          @media (max-height: 700px) {
            .mobile-menu .offcanvas-body {
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
            }
            
            .mobile-menu .nav-link {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
          }
        `}
      </style>
    </>
  );
}

export default NavBar;