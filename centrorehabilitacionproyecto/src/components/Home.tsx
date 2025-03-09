import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

function CardGrids() {
  const navigate = useNavigate();

  return (
    <Container className="py-4 container">
      <Row xs={1} md={2} lg={3} className="g-4"> 
        {[
          { path: "/pacientes", img: "/images/paciente.jpg", title: "Control de Pacientes", text: "Aquí se maneja el control de pacientes, citas, diagnósticos, etc." },
         
          { path: "/", img: "/images/terapeuta.jpg", title: "Control de Terapeutas", text: "Aquí se maneja el control de terapeutas, horarios y especialidades." },
         
          { path: "/", img: "/images/citas.jpg", title: "Control de Citas", text: "Aquí se maneja el control de las citas de los pacientes." },
         
          { path: "/", img: "/images/diagnostico.jpg", title: "Control de Diagnósticos", text: "Aquí se maneja el control de diagnósticos de pacientes." },
         
          { path: "/", img: "/images/bodega.jpg", title: "Control de Bodega", text: "Aquí se maneja el control de la bodega de productos." },
          
          { path: "/", img: "/images/prestamo.jpg", title: "Control de Préstamos", text: "Aquí se maneja el control de préstamos de productos." },
         
          { path: "/", img: "/images/producto.jpg", title: "Control de Productos", text: "Aquí se maneja el control de productos." },
         
          { path: "/", img: "/images/encargado.jpg", title: "Control de Encargados", text: "Aquí se maneja el control de los encargados." },
         
          { path: "/", img: "/images/usuario.jpg", title: "Control de Usuarios", text: "Aquí se maneja el control de los usuarios." },
        ].map((card, index) => (
          <Col key={index}>
            <Card 
              onClick={() => navigate(card.path)}
              className="cursor-pointer shadow-sm hover-shadow"
            >
              <Card.Img variant="top" src={card.img} height="300px"  width="50px"/>
              <Card.Body>
                <Card.Title>{card.title}</Card.Title>
                <Card.Text>{card.text}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default CardGrids;
