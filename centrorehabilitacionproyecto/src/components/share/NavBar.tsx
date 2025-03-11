import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Form, NavDropdown, Offcanvas } from "react-bootstrap";
import { FaUser, FaBox, FaWarehouse, FaClipboardList, FaHome, FaCalendarAlt, FaNotesMedical, FaUsers, FaUserFriends, FaClinicMedical, FaMoneyBill, FaSignOutAlt } from "react-icons/fa";

function NavBar() {
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);

  const handleNavClick = (path: string) => {
    navigate(path);
    setShowOffcanvas(false);
  };

  return (
    <Navbar expand="lg" fixed="top" style={{ backgroundColor: "#287549" }} className="shadow">
      <Container fluid>
        <Navbar.Brand onClick={() => handleNavClick("/home")} className="brand-hover fw-bold text-white">
          <img src="/logo.png" alt="Logo" width="50" height="50" className="d-inline-block align-center me-2" />
          Centro de Rehabilitación
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="offcanvasNavbar" className="border-0 shadow-none text-white" onClick={() => setShowOffcanvas(true)} />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          placement="end"
          className="offcanvas-custom"
          show={showOffcanvas}
          onHide={() => setShowOffcanvas(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-bold text-white">Menú Desplegable</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="justify-content-center flex-grow-1 pe-3">
              <Nav.Link onClick={() => handleNavClick("/home")} className="fw-bold text-white nav-hover mb-2" style={{ fontSize: '18px' }}>
                <FaHome className="me-2" /> Inicio
              </Nav.Link>
              <Nav.Link onClick={() => handleNavClick("/citas")} className="fw-bold text-white nav-hover mb-2" style={{ fontSize: '18px' }}>
                <FaCalendarAlt className="me-2" /> Citas
              </Nav.Link>
              <Nav.Link onClick={() => handleNavClick("/diagnosticos")} className="fw-bold text-white nav-hover mb-2" style={{ fontSize: '18px' }}>
                <FaNotesMedical className="me-2" /> Diagnósticos
              </Nav.Link>
              <Nav.Link onClick={() => handleNavClick("/pacientes")} className="fw-bold text-white nav-hover mb-2" style={{ fontSize: '18px' }}>
                <FaUsers className="me-2" /> Pacientes
              </Nav.Link>
              <Nav.Link onClick={() => handleNavClick("/encargados")} className="fw-bold text-white nav-hover mb-2" style={{ fontSize: '18px' }}>
                <FaUserFriends className="me-2" /> Encargados
              </Nav.Link>
              <Nav.Link onClick={() => handleNavClick("/terapeutas")} className="fw-bold text-white nav-hover mb-2" style={{ fontSize: '18px' }}>
                <FaClinicMedical className="me-2" /> Terapeutas
              </Nav.Link>

              <NavDropdown title={<span style={{ color: 'white' }}>Accesos Rápidos</span>} className="fw-bold text-white nav-hover mb-3" style={{ fontSize: '18px' }}>
                <NavDropdown.Item onClick={() => handleNavClick("/compras")}>
                  <FaMoneyBill className="me-2 text-success" /> Compras
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavClick("/prestamos")}>
                  <FaClipboardList className="me-2 text-success" /> Préstamos
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavClick("/productos")}>
                  <FaBox className="me-2 text-success" /> Productos
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavClick("/bodegas")}>
                  <FaWarehouse className="me-2 text-success" /> Bodegas
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => handleNavClick("/usuarios")}>
                  <FaUser className="me-2 text-danger" /> Usuarios
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <Form className="d-flex">
              <Button variant="danger" onClick={() => {
                window.location.href = "/";
              }}
              className="d-flex align-items-center gap-2">
                <FaSignOutAlt /> Cerrar Sesión
              </Button>
            </Form>

          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default NavBar;