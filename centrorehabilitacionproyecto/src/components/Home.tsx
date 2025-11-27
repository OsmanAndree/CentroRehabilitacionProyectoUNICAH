import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { FaUserMd, FaUsers, FaCalendarAlt, FaUserFriends, FaBox, FaWarehouse, FaBuyNLarge, FaShare, FaConciergeBell, FaReceipt, FaCashRegister, FaShieldAlt } from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";
import { usePermissions } from "../hooks/usePermissions";

interface CardData {
  path: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  module: string; // Módulo para verificar permisos
}

const cardsData: CardData[] = [
  { path: "/pacientes", title: "Control de Pacientes", text: "Gestiona pacientes, citas y diagnósticos.", icon: <FaUsers size={48} />, module: "pacientes" },
  { path: "/encargados", title: "Control de Encargados", text: "Maneja información de encargados de los pacientes.", icon: <FaUserFriends size={48} />, module: "encargados" },
  { path: "/citas", title: "Control de Citas", text: "Organiza y gestiona citas de los pacientes.", icon: <FaCalendarAlt size={48} />, module: "citas" },
  { path: "/diagnosticos", title: "Control de Diagnósticos", text: "Administra los diagnósticos del sistema.", icon: <FaUserGear size={48} />, module: "diagnosticos" },
  { path: "/terapeutas", title: "Control de Terapeutas", text: "Administra terapeutas, horarios y especialidades.", icon: <FaUserMd size={48} />, module: "terapeutas" },
  { path: "/servicios", title: "Control de Servicios", text: "Administra los servicios disponibles del sistema.", icon: <FaConciergeBell size={48} />, module: "servicios" },
  { path: "/recibos", title: "Control de Recibos", text: "Gestiona y administra los recibos del sistema.", icon: <FaReceipt size={48} />, module: "recibos" },
  { path: "/cierres", title: "Control de Cierres", text: "Administra los cierres de caja del sistema.", icon: <FaCashRegister size={48} />, module: "cierres" },
  { path: "/productos", title: "Control de Productos", text: "Supervisa el stock y gestión de productos.", icon: <FaBox size={48} />, module: "productos" },
  { path: "/compras", title: "Control de Compras", text: "Administra las compras del sistema.", icon: <FaBuyNLarge size={48} />, module: "compras" },
  { path: "/bodega", title: "Control de Bodega", text: "Administra el inventario de productos médicos.", icon: <FaWarehouse size={48} />, module: "bodega" },
  { path: "/prestamos", title: "Control de Préstamos", text: "Administra los préstamos del sistema.", icon: <FaShare size={48} />, module: "prestamos" },
  { path: "/usuarios", title: "Control de Usuarios", text: "Administra los usuarios del sistema.", icon: <FaUserGear size={48} />, module: "usuarios" },
  { path: "/roles", title: "Roles y Permisos", text: "Administra roles y permisos del sistema.", icon: <FaShieldAlt size={48} />, module: "roles" },
];

function CardGrids() {
  const navigate = useNavigate();
  const { canView } = usePermissions();

  // Filtrar cards basado en permisos de visualización
  const filteredCards = cardsData.filter(card => canView(card.module));

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
          {filteredCards.map((card, index) => (
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
                  <Card.Body className="p-4 d-flex flex-column align-items-center text-center">
                    <div 
                      className="mb-3 rounded-circle p-4 d-flex align-items-center justify-content-center"
                      style={{ 
                        backgroundColor: "rgba(46, 139, 87, 0.1)",
                        color: "#2E8B57"
                      }}
                    >
                      {card.icon}
                    </div>
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
