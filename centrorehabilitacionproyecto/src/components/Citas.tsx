import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendar, FaUserClock } from 'react-icons/fa';
import axios from 'axios';
import CitasForm from './Forms/CitasForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CitasReport from './Reports/CitasReport';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FaFilePdf } from 'react-icons/fa6';


export interface Cita {
  id_cita: number;
  id_paciente: number;
  id_terapeuta: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  tipo_terapia: 'Fisica' | 'Neurologica'; 
  duracion_min: number; 
  paciente: {
    id_paciente: number;
    nombre: string;
    apellido: string;
  };
  terapeuta: {
    id_terapeuta: number;
    nombre: string;
    apellido: string;
  };
}

function CitasTable() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [searchPaciente, setSearchPaciente] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchTherapist, setSearchTherapist] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const obtenerCitas = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/citas/getcitas')
      .then(response => {
        setCitas(response.data.result);
        toast.success("Citas cargadas exitosamente");
      })
      .catch(error => {
        console.error("Error al obtener citas:", error);
        toast.error("No se pudieron cargar las citas.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerCitas();
  }, [obtenerCitas]);

  const eliminarCita = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;
    axios.delete(`http://localhost:3002/Api/citas/deletecita?cita_id=${id}`)
      .then(() => {
        setCitas(prev => prev.filter(c => c.id_cita !== id));
        toast.success("Cita eliminada con éxito.");
      })
      .catch(error => {
        console.error("Error al eliminar cita:", error);
        toast.error("Hubo un problema al eliminar la cita.");
      });
  };

  const handleSubmit = () => {
    obtenerCitas();
    toast.success("Cita guardada con éxito.");
  };

  const editarCita = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setShowForm(true);
    toast.info("Editando cita");
  };

  const crearCita = () => {
    setCitaSeleccionada(null);
    setShowForm(true);
    toast.info("Creando nueva cita");
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setCitaSeleccionada(null);
  };

  const citasFiltradas = citas.filter(c => {
    const pacienteFull = `${c.paciente.nombre} ${c.paciente.apellido}`.toLowerCase();
    const terapeutaFull = `${c.terapeuta.nombre} ${c.terapeuta.apellido}`.toLowerCase();
    const fechaCita = new Date(c.fecha).toISOString().split('T')[0];
    return pacienteFull.includes(searchPaciente.toLowerCase()) &&
           (searchDate === "" || fechaCita === searchDate) &&
           terapeutaFull.includes(searchTherapist.toLowerCase());
  });

  // Determinar si estamos en un dispositivo móvil
  const isMobile = windowWidth < 768;

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Card className="shadow-lg border-0" style={{ 
        borderRadius: "20px",
        backgroundColor: "#ffffff"
      }}>
        <Card.Header className="bg-gradient py-3"
          style={{ 
            backgroundColor: "#2E8B57",
            borderRadius: "20px 20px 0 0",
            border: "none"
          }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaCalendar size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                  Gestión de Citas
                </h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                <Button 
                  variant="light" 
                  onClick={crearCita}
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    borderRadius: "10px",
                    padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    width: isMobile ? "100%" : "auto",
                    fontSize: isMobile ? "0.9rem" : "1rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FaPlus className="me-2" /> Nueva Cita
                </Button>
                <PDFDownloadLink
                  document={<CitasReport citas={citasFiltradas} />} 
                  fileName="Reporte_Citas.pdf"                         
                  className={`btn btn-success ${isMobile ? 'w-100' : ''}`}
                  style={{
                    borderRadius: "10px",
                    padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                    fontWeight: "500",
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "0.9rem" : "1rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {({ loading }) => (
                    <div className="d-flex align-items-center justify-content-center w-100">
                      <FaFilePdf className="me-2" />
                      {loading ? "Generando..." : isMobile ? "Descargar" : "Descargar Reporte"}
                    </div>
                  )}
                </PDFDownloadLink>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-3 p-md-4">
          <Row className="mb-4 g-3">
            <Col xs={12} md={4}>
              <InputGroup style={{ 
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderRadius: "12px",
                overflow: "hidden"
              }}>
                <InputGroup.Text style={{ 
                  backgroundColor: "#f8f9fa",
                  border: "none",
                  paddingLeft: "1.2rem"
                }}>
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por paciente..."
                  value={searchPaciente}
                  onChange={(e) => setSearchPaciente(e.target.value)}
                  style={{
                    border: "none",
                    padding: "0.8rem 1rem",
                    fontSize: "0.95rem"
                  }}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <InputGroup style={{ 
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderRadius: "12px",
                overflow: "hidden"
              }}>
                <InputGroup.Text style={{ 
                  backgroundColor: "#f8f9fa",
                  border: "none",
                  paddingLeft: "1.2rem"
                }}>
                  <FaUserClock className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por terapeuta..."
                  value={searchTherapist}
                  onChange={(e) => setSearchTherapist(e.target.value)}
                  style={{
                    border: "none",
                    padding: "0.8rem 1rem",
                    fontSize: "0.95rem"
                  }}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <InputGroup style={{ 
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderRadius: "12px",
                overflow: "hidden"
              }}>
                <InputGroup.Text style={{ 
                  backgroundColor: "#f8f9fa",
                  border: "none",
                  paddingLeft: "1.2rem"
                }}>
                  <FaCalendar className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  style={{
                    border: "none",
                    padding: "0.8rem 1rem",
                    fontSize: "0.95rem"
                  }}
                />
              </InputGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3 text-muted">Cargando citas...</p>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No se encontraron citas.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Paciente</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Terapeuta</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Hora</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Tipo</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.map((cita, index) => (
                    <tr key={cita.id_cita}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{`${cita.paciente.nombre} ${cita.paciente.apellido}`}</td>
                      <td className="py-3 px-4">{`${cita.terapeuta.nombre} ${cita.terapeuta.apellido}`}</td>
                      <td className="py-3 px-4">{new Date(cita.fecha).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{`${cita.hora_inicio} - ${cita.hora_fin}`}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${
                          cita.estado === 'Confirmada' ? 'bg-success' :
                          cita.estado === 'Pendiente' ? 'bg-warning' :
                          cita.estado === 'Cancelada' ? 'bg-danger' :
                          'bg-info'
                        }`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">{cita.tipo_terapia}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => editarCita(cita)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem"
                            }}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarCita(cita.id_cita)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem"
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <CitasForm 
          show={showForm} 
          handleClose={cerrarFormulario} 
          handleSubmit={handleSubmit}
          citaEditar={citaSeleccionada}
        />
      )}
    </Container>
  );
}

export default CitasTable;