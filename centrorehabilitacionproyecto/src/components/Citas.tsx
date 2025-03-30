import React, { useEffect, useState, useCallback } from 'react';
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

  return (
    <Container fluid className="px-5 py-4">
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
        <Card.Header className="bg-gradient d-flex justify-content-between align-items-center py-3"
          style={{ 
            backgroundColor: "#2E8B57",
            borderRadius: "20px 20px 0 0",
            border: "none"
          }}>
          <div className="d-flex align-items-center">
            <FaCalendar size={24} className="text-white me-2" />
            <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
              Gestión de Citas
            </h4>
          </div>
          <div className="d-flex">
          <Button 
            variant="light" 
            onClick={crearCita}
            className="d-flex align-items-center"
            style={{
              borderRadius: "10px",
              padding: "0.5rem 1rem",
              fontWeight: "500",
              transition: "all 0.3s ease"
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
              document={<CitasReport citas ={citasFiltradas} />} 
              fileName="Reporte_Citas.pdf"                         
              className="btn btn-success ms-2"
              style={{
                borderRadius: "10px",
                padding: "0.5rem 1rem",
                fontWeight: "500",
                color: "white",
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
                <div className="d-flex align-items-center">
                  <FaFilePdf className="me-2" />
                  {loading ? "Generando PDF..." : "Descargar Reporte"}
                </div>
              )}
            </PDFDownloadLink>
          </div>
          
        </Card.Header>

        <Card.Body className="p-4">
          <Row className="mb-4">
            <Col md={4}>
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
            <Col md={4}>
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
            <Col md={4}>
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
          </Row>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted">Cargando información de citas...</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ 
              borderRadius: "15px", 
              overflow: "auto",
              maxWidth: "100%",
              display: "block"
            }}>
              <Table hover className="align-middle mb-0" style={{ minWidth: "1000px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th className="py-3 px-4 text-muted">#</th>
                    <th className="py-3 px-4 text-muted">Fecha</th>
                    <th className="py-3 px-4 text-muted">Hora Inicio</th>
                    <th className="py-3 px-4 text-muted">Hora Fin</th>
                    <th className="py-3 px-4 text-muted">Paciente</th>
                    <th className="py-3 px-4 text-muted">Terapeuta</th>
                    <th className="py-3 px-4 text-muted">Estado</th>
                    <th className="py-3 px-4 text-muted text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.length > 0 ? (
                    citasFiltradas.map((cita, index) => (
                      <tr key={cita.id_cita}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">{cita.hora_inicio}</td>
                        <td className="py-3 px-4">{cita.hora_fin}</td>
                        <td className="py-3 px-4">{cita.paciente.nombre} {cita.paciente.apellido}</td>
                        <td className="py-3 px-4">{cita.terapeuta.nombre} {cita.terapeuta.apellido}</td>
                        <td className="py-3 px-4">
                          <span className={`badge bg-${
                            cita.estado === 'Confirmada' ? 'success' :
                            cita.estado === 'Pendiente' ? 'warning' :
                            cita.estado === 'Cancelada' ? 'danger' :
                            'info'
                          }`}>
                            {cita.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => editarCita(cita)}
                            className="me-2"
                            style={{ borderRadius: "8px" }}
                          >
                            <FaEdit /> Editar
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarCita(cita.id_cita)}
                            style={{ borderRadius: "8px" }}
                          >
                            <FaTrash /> Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted">
                        No se encontraron citas que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <CitasForm
          citaEditar={citaSeleccionada}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}
    </Container>
  );
}

export default CitasTable;