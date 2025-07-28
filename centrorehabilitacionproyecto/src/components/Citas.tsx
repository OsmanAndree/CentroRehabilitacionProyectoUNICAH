import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendar, FaUserClock, FaFilePdf } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { AppDispatch, RootState } from '../app/store';
import { fetchCitas, deleteCita } from '../features/citas/citasSlice';
import CitasForm from './Forms/CitasForm';
import CitasReport from './Reports/CitasReport';

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
  const dispatch: AppDispatch = useDispatch();
  const { citas, status, error } = useSelector((state: RootState) => state.citas);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [searchPaciente, setSearchPaciente] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchTherapist, setSearchTherapist] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCitas());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const eliminarCitaHandler = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;
    dispatch(deleteCita(id))
      .unwrap()
      .then(() => toast.success("Cita eliminada con éxito."))
      .catch((err) => toast.error(`Hubo un problema al eliminar: ${err.message || 'Error desconocido'}`));
  };

  const handleSubmit = () => {
    dispatch(fetchCitas());
    toast.success("Cita guardada con éxito.");
  };

  const editarCita = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setShowForm(true);
  };

  const crearCita = () => {
    setCitaSeleccionada(null);
    setShowForm(true);
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

  const isMobile = windowWidth < 768;
  
  const getStatusBadge = (estado: Cita['estado']) => {
    switch (estado) {
      case 'Confirmada': return 'bg-success';
      case 'Pendiente': return 'bg-warning text-dark';
      case 'Cancelada': return 'bg-danger';
      case 'Completada': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaCalendar size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Citas</h4>
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
                {citasFiltradas.length > 0 && (
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
                  >
                    {({ loading }) => (
                      <div className="d-flex align-items-center justify-content-center w-100">
                        <FaFilePdf className="me-2" />
                        {loading ? "Generando..." : "Descargar Reporte"}
                      </div>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-3 p-md-4">
          <Row className="mb-4 g-3">
            <Col xs={12} md={4}>
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por paciente..."
                  value={searchPaciente}
                  onChange={(e) => setSearchPaciente(e.target.value)}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                  <FaUserClock className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por terapeuta..."
                  value={searchTherapist}
                  onChange={(e) => setSearchTherapist(e.target.value)}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                  <FaCalendar className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </Col>
          </Row>

          {status === 'loading' ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando citas...</p></div>
          ) : status === 'failed' ? (
             <div className="text-center py-5">
              <p className="text-danger">Error: {error}</p>
              <Button variant="secondary" size="sm" onClick={() => dispatch(fetchCitas())}>Reintentar</Button>
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
                  {citasFiltradas.length > 0 ? (
                    citasFiltradas.map((cita, index) => (
                    <tr key={cita.id_cita}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{`${cita.paciente.nombre} ${cita.paciente.apellido}`}</td>
                      <td className="py-3 px-4">{`${cita.terapeuta.nombre} ${cita.terapeuta.apellido}`}</td>
                      <td className="py-3 px-4">{new Date(cita.fecha).toLocaleDateString('es-ES')}</td>
                      <td className="py-3 px-4">{`${cita.hora_inicio} - ${cita.hora_fin}`}</td>
                      <td className="py-3 px-4"><span className={`badge ${getStatusBadge(cita.estado)}`}>{cita.estado}</span></td>
                      <td className="py-3 px-4">{cita.tipo_terapia}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button variant="outline-primary" size="sm" onClick={() => editarCita(cita)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => eliminarCitaHandler(cita.id_cita)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr><td colSpan={8} className="text-center py-5 text-muted">No se encontraron citas que coincidan con los filtros.</td></tr>
                  )}
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