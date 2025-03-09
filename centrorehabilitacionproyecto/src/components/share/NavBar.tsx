import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useNavigate } from 'react-router-dom';
function NavBar() {
  const navigate = useNavigate();
  return (
    <>
      {['sm'].map((expand) => (
        <Navbar
          key={expand}
          expand={expand !== 'true' && expand}
          fixed='top'
          className="bg-success w-100 mb-3">
          <Container fluid>
            <Navbar.Brand onClick={() => navigate("/")}
              className='brand-hover'>
              <img
                src="/logo.png"
                alt=""
                width="50"
                height="50"
                className="d-inline-block align-center"
              />{' '}
              Centro de Rehabilitacion
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="end"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  Centro de Rehabilitación
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-center flex-grow-1 pe-3 ">
                  <Nav.Link onClick={() => navigate("/")} className="fw-bold">Inicio</Nav.Link>
                  <Nav.Link onClick={() => navigate("/")} className="fw-bold">Citas</Nav.Link>
                  <Nav.Link onClick={() => navigate("/")} className="fw-bold">Diagnósticos</Nav.Link>
                  <Nav.Link onClick={() => navigate("/pacientes")} className="fw-bold">Pacientes</Nav.Link>
                  <Nav.Link onClick={() => navigate("/")} className="fw-bold">Terapeutas</Nav.Link>
                  <NavDropdown title="Accesos Rápidos" id={`offcanvasNavbarDropdown-expand-${expand}`}>
                    <NavDropdown.Item onClick={() => navigate("/")}>Préstamos</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigate("/")}>Productos</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigate("/")}>Bodegas</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={() => navigate("/")}>Usuarios</NavDropdown.Item>
                  </NavDropdown>
                </Nav>
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Buscar Pacientes"
                    className="me-2"
                    aria-label="Search"
                  />
                  <Button variant="light">Buscar</Button>
                </Form>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </>
  );
}

export default NavBar;
