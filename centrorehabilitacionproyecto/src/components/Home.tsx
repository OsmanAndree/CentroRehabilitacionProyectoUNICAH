import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const cardsData = [
  { path: "/pacientes", img: "/images/paciente.jpg", title: "Control de Pacientes", text: "Gestiona pacientes, citas y diagnósticos." },
  { path: "/terapeutas", img: "/images/terapeuta.jpg", title: "Control de Terapeutas", text: "Administra terapeutas, horarios y especialidades." },
  { path: "/citas", img: "/images/citas.jpg", title: "Control de Citas", text: "Organiza y gestiona citas de los pacientes." },
 /* { path: "/diagnosticos", img: "/images/diagnostico.jpg", title: "Control de Diagnósticos", text: "Registro y seguimiento de diagnósticos." },
  { path: "/bodega", img: "/images/bodega.jpg", title: "Control de Bodega", text: "Administra el inventario de productos médicos." },
  { path: "/prestamos", img: "/images/prestamo.jpg", title: "Control de Préstamos", text: "Gestiona préstamos de insumos y equipos." },
  { path: "/productos", img: "/images/producto.jpg", title: "Control de Productos", text: "Supervisa el stock y gestión de productos." },
  { path: "/encargados", img: "/images/encargado.jpg", title: "Control de Encargados", text: "Maneja información de encargados del sistema." },
  { path: "/usuarios", img: "/images/usuario.jpg", title: "Control de Usuarios", text: "Gestiona permisos y roles de usuarios." },*/
];

function CardGrids() {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {cardsData.map((card, index) => (
          <Col key={index}>
            <Card
              className="border-0 shadow-lg rounded-4 overflow-hidden card-hover"
              onClick={() => navigate(card.path)}
              style={{ cursor: "pointer", transition: "transform 0.3s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
            >
              <Card.Img
                variant="top"
                src={card.img}
                height="200px"
                style={{ objectFit: "cover" }}
                className="rounded-top-4"
              />
              <Card.Body className="text-center">
                <Card.Title className="fw-bold">{card.title}</Card.Title>
                <Card.Text className="text-muted">{card.text}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default CardGrids;
