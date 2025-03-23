import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { motion } from "framer-motion";
import { FaUserMd, FaUsers, FaCalendarAlt, FaUserFriends, FaBox, FaWarehouse } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";

const cardsData = [
  { path: "/pacientes", img: "/images/paciente.jpg", title: "Control de Pacientes", text: "Gestiona pacientes, citas y diagnósticos.", icon: <FaUsers size={24} /> },
  { path: "/terapeutas", img: "/images/terapeuta.jpg", title: "Control de Terapeutas", text: "Administra terapeutas, horarios y especialidades.", icon: <FaUserMd size={24} /> },
  { path: "/citas", img: "/images/citas.jpg", title: "Control de Citas", text: "Organiza y gestiona citas de los pacientes.", icon: <FaCalendarAlt size={24} /> }, 
  { path: "/encargados", img: "/images/encargado.jpg", title: "Control de Encargados", text: "Maneja información de encargados del sistema.", icon: <FaUserFriends size={24} /> },
  { path: "/productos", img: "/images/producto.jpg", title: "Control de Productos", text: "Supervisa el stock y gestión de productos.", icon: <FaBox size={24} /> },
  { path: "/bodega", img: "/images/bodega.jpg", title: "Control de Bodega", text: "Administra el inventario de productos médicos.", icon: <FaWarehouse size={24} /> },
  { path: "/usuarios", img: "/images/usuario.jpg", title: "Control de Usuarios", text: "Gestiona permisos y roles de usuarios.", icon: <FaUsers size={24} /> },
 /* { path: "/diagnosticos", img: "/images/diagnostico.jpg", title: "Control de Diagnósticos", text: "Registro y seguimiento de diagnósticos." },
  { path: "/bodega", img: "/images/bodega.jpg", title: "Control de Bodega", text: "Administra el inventario de productos médicos." },
  { path: "/prestamos", img: "/images/prestamo.jpg", title: "Control de Préstamos", text: "Gestiona préstamos de insumos y equipos." },
  { path: "/productos", img: "/images/producto.jpg", title: "Control de Productos", text: "Supervisa el stock y gestión de productos." },
  { path: "/encargados", img: "/images/encargado.jpg", title: "Control de Encargados", text: "Maneja información de encargados del sistema." },
  { path: "/usuarios", img: "/images/usuario.jpg", title: "Control de Usuarios", text: "Gestiona permisos y roles de usuarios." },*/
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

function CardGrids() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 position-relative d-flex" style={{ 
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      <div className="position-fixed w-100 h-100" style={{
        background: "linear-gradient(135deg, rgba(46, 139, 87, 0.95) 0%, rgba(32, 97, 61, 0.9) 50%, rgba(46, 139, 87, 0.85) 100%)",
        zIndex: 0,
        top: 0,
        left: 0
      }} />
      
      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3" style={{ 
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            fontFamily: "'Poppins', sans-serif"
          }}>
            Panel de Control
          </h1>
          <p className="text-white-50 lead mb-4" style={{ 
            fontSize: "1.2rem",
            maxWidth: "800px",
            margin: "0 auto",
            lineHeight: "1.8"
          }}>
            Bienvenido al sistema de gestión integral. Acceda a todos los módulos de control desde esta interfaz centralizada.
          </p>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row xs={1} md={2} lg={3} className="g-4">
            {cardsData.map((card, index) => (
              <Col key={index}>
                <motion.div variants={cardVariants}>
                  <Card
                    className="h-100 border-0 shadow-lg rounded-4 overflow-hidden"
                    onClick={() => navigate(card.path)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      backgroundColor: "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={card.img}
                        height="200px"
                        style={{ 
                          objectFit: "cover",
                          filter: "brightness(0.9)",
                          transition: "all 0.3s ease"
                        }}
                        className="rounded-top-4"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = "brightness(1.1)";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = "brightness(0.9)";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                      <div className="position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2 shadow-sm">
                        {card.icon}
                      </div>
                    </div>
                    <Card.Body className="p-4">
                      <Card.Title className="h4 fw-bold mb-3" style={{ color: "#2E8B57" }}>
                        {card.title}
                      </Card.Title>
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                        {card.text}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>
    </div>
  );
}

export default CardGrids;

