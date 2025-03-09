import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Form, NavDropdown, Offcanvas, InputGroup } from "react-bootstrap";
import { FaSearch, FaUser, FaBox, FaWarehouse, FaClipboardList, FaHome, FaCalendarAlt, FaNotesMedical, FaUsers } from "react-icons/fa";

function NavBar() {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" fixed="top" style={{ backgroundColor: "#287549" }} className="shadow">
      <Container fluid>

        <Navbar.Brand onClick={() => navigate("/")} className="brand-hover fw-bold text-white">
          <img src="/logo.png" alt="Logo" width="50" height="50" className="d-inline-block align-center me-2" />
          Centro de Rehabilitación
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="offcanvasNavbar" className="border-0 shadow-none text-white" />
        <Navbar.Offcanvas id="offcanvasNavbar" placement="end" className="offcanvas-custom" >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-bold text-white">Centro de Rehabilitación</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="justify-content-center flex-grow-1 pe-3">
              <Nav.Link onClick={() => navigate("/")} className="fw-bold text-white nav-hover" style={{ fontSize: '18px' }}>
                <FaHome className="me-2" /> Inicio
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/citas")} className="fw-bold text-white nav-hover" style={{ fontSize: '18px' }}>
                <FaCalendarAlt className="me-2" /> Citas
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/diagnosticos")} className="fw-bold text-white nav-hover" style={{ fontSize: '18px' }}>
                <FaNotesMedical className="me-2" /> Diagnósticos
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/pacientes")} className="fw-bold text-white nav-hover" style={{ fontSize: '18px' }}>
                <FaUsers className="me-2" /> Pacientes
              </Nav.Link>

              <NavDropdown title={<span style={{ color: 'white' }}>Accesos Rápidos</span>} className="fw-bold text-white nav-hover" style={{ fontSize: '18px' }}>
                <NavDropdown.Item onClick={() => navigate("/prestamos")}>
                  <FaClipboardList className="me-2 text-success" /> Préstamos
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate("/productos")}>
                  <FaBox className="me-2 text-success" /> Productos
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate("/bodegas")}>
                  <FaWarehouse className="me-2 text-success" /> Bodegas
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => navigate("/usuarios")}>
                  <FaUser className="me-2 text-danger" /> Usuarios
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <Form className="d-flex">
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder="Buscar..."
                  aria-label="Buscar"
                />
                <Button variant="danger">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Form>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default NavBar;