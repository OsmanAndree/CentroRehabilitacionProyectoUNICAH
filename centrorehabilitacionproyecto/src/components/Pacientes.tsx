import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import PacientesForm from './Forms/PacientesForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PacientesReport from './Reports/PacientesReport'; 
import { FaFilePdf } from 'react-icons/fa';

export interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  telefono: string;
  direccion: string;
  id_encargado: number;
  encargado: {
    nombre: string;
    apellido: string;
  };
}

function PacientesTable() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [search, setSearch] = useState<string>("");
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

  const obtenerPacientes = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/pacientes/getpacientes')
      .then(response => {
        setPacientes(response.data.result);
        toast.success("Pacientes cargados exitosamente");
      })
      .catch(error => {
        console.error("Error al obtener pacientes:", error);
        toast.error("No se pudieron cargar los pacientes.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerPacientes();
  }, [obtenerPacientes]);

  const eliminarPaciente = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este paciente?")) return;
    axios.delete(`http://localhost:3002/Api/pacientes/deletepacientes?paciente_id=${id}`)
      .then(() => {
        setPacientes(prev => prev.filter(p => p.id_paciente !== id));
        toast.success("Paciente eliminado con éxito.");
      })
      .catch(error => {
        console.error("Error al eliminar paciente:", error);
        toast.error("Hubo un problema al eliminar el paciente.");
      });
  };

  const handleSubmit = () => {
    obtenerPacientes();
    toast.success("Paciente guardado con éxito.");
  };

  const editarPaciente = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente);
    setShowForm(true);
    toast.info("Editando paciente");
  };

  const crearPaciente = () => {
    setPacienteSeleccionado(null);
    setShowForm(true);
    toast.info("Creando nuevo paciente");
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setPacienteSeleccionado(null);
  };

  const pacientesFiltrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

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
                <FaUserPlus size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                  Gestión de Pacientes
                </h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                <Button 
                  variant="light" 
                  onClick={crearPaciente}
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
                  <FaPlus className="me-2" /> Nuevo Paciente
                </Button>
                {pacientesFiltrados.length > 0 && (
                  <PDFDownloadLink
                    document={<PacientesReport pacientes={pacientesFiltrados} />}
                    fileName="Reporte_Pacientes.pdf"
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
                  >
                    {({ loading }) => (
                      <div className="d-flex align-items-center justify-content-center w-100">
                        <FaFilePdf className="me-2" />
                        {loading ? "Generando..." : isMobile ? "Descargar" : "Descargar Reporte"}
                      </div>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-3 p-md-4">
          <Row className="mb-4">
            <div className="col-md-6 col-lg-4">
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
                  placeholder="Buscar paciente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: "none",
                    padding: "0.8rem 1rem",
                    fontSize: "0.95rem"
                  }}
                />
              </InputGroup>
            </div>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3 text-muted">Cargando pacientes...</p>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No se encontraron pacientes.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Nombre Completo</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha de Nacimiento</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Teléfono</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Encargado</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((paciente, index) => (
                    <tr key={paciente.id_paciente}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{`${paciente.nombre} ${paciente.apellido}`}</td>
                      <td className="py-3 px-4">{new Date(paciente.fecha_nacimiento).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{paciente.telefono}</td>
                      <td className="py-3 px-4">{paciente.encargado ? `${paciente.encargado.nombre} ${paciente.encargado.apellido}` : "No asignado"}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => editarPaciente(paciente)}
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
                            onClick={() => eliminarPaciente(paciente.id_paciente)}
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
        <PacientesForm 
          show={showForm} 
          handleClose={cerrarFormulario} 
          handleSubmit={handleSubmit}
          pacienteEditar={pacienteSeleccionado}
        />
      )}
    </Container>
  );
}

export default PacientesTable;