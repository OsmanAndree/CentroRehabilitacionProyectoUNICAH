import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { FaUserMd, FaUsers, FaCalendarAlt, FaUserFriends, FaBox, FaWarehouse } from "react-icons/fa";

const cardsData = [
  { path: "/pacientes", img: "/images/paciente.jpg", title: "Control de Pacientes", text: "Gestiona pacientes, citas y diagnósticos.", icon: <FaUsers size={24} /> },
  { path: "/terapeutas", img: "/images/terapeuta.jpg", title: "Control de Terapeutas", text: "Administra terapeutas, horarios y especialidades.", icon: <FaUserMd size={24} /> },
  { path: "/citas", img: "/images/citas.jpg", title: "Control de Citas", text: "Organiza y gestiona citas de los pacientes.", icon: <FaCalendarAlt size={24} /> }, 
  { path: "/encargados", img: "/images/encargado.jpg", title: "Control de Encargados", text: "Maneja información de encargados del sistema.", icon: <FaUserFriends size={24} /> },
  { path: "/productos", img: "/images/producto.jpg", title: "Control de Productos", text: "Supervisa el stock y gestión de productos.", icon: <FaBox size={24} /> },
  { path: "/bodega", img: "/images/bodega.jpg", title: "Control de Bodega", text: "Administra el inventario de productos médicos.", icon: <FaWarehouse size={24} /> },
];

function CardGrids() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 position-relative d-flex" style={{ 
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      background: "linear-gradient(135deg, rgba(46, 139, 87, 0.95) 0%, rgba(32, 97, 61, 0.9) 50%, rgba(46, 139, 87, 0.85) 100%)",
    }}>
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3" style={{ 
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "-0.02em"
          }}>
            Panel de Control
          </h1>
          <p className="text-white-50 lead mb-4" style={{
            fontSize: "1.1rem",
            maxWidth: "700px",
            margin: "0 auto",
            fontWeight: "300"
          }}>
            Bienvenido al sistema de gestión integral. Acceda a todos los módulos de control desde esta interfaz centralizada.
          </p>
        </div>
        
        <Row xs={1} md={2} lg={3} className="g-4">
          {cardsData.map((card, index) => (
            <Col key={index}>
              <div className={`card-animate delay-${index}`}>
                <Card
                  className="h-100 border-0 rounded-4 overflow-hidden card-hover"
                  onClick={() => navigate(card.path)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={card.img}
                      height="200px"
                      style={{ 
                        objectFit: "cover",
                        filter: "brightness(0.95)"
                      }}
                      className="rounded-top-4"
                    />
                    <div className="card-img-overlay" />
                    <div className="position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2 shadow-sm">
                      <div style={{ color: "#2E8B57" }}>{card.icon}</div>
                    </div>
                  </div>
                  <Card.Body className="p-4">
                    <Card.Title className="h4 mb-3" style={{ 
                      color: "#2E8B57",
                      fontWeight: "600",
                      letterSpacing: "-0.01em"
                    }}>
                      {card.title}
                    </Card.Title>
                    <Card.Text style={{ 
                      color: "#666",
                      fontSize: "0.95rem",
                      lineHeight: "1.5"
                    }}>
                      {card.text}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default CardGrids;
