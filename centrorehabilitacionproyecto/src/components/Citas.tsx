import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendar, FaUserClock, FaFilePdf, FaDollarSign, FaPrint } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboReport from './Reports/ReciboReport';

import { AppDispatch, RootState } from '../app/store';
import { fetchCitas, deleteCita } from '../features/citas/citasSlice';
import CitasForm from './Forms/CitasForm';
import CitasReport from './Reports/CitasReport';
import PaginationComponent from './PaginationComponent';

export interface Servicio {
  id_servicio: number;
  nombre: string;
  costo: number;
  estado: boolean;
}

export interface Recibo {
  id_recibo: number;
  numero_recibo: string;
  fecha_cobro: string;
  total: number;
  estado: 'Activo' | 'Anulado';
}

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
  total?: number;
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
  servicios?: Servicio[];
  Recibo?: Recibo;
}

function CitasTable() {
  const dispatch: AppDispatch = useDispatch();
  const { citas, status, error, pagination } = useSelector((state: RootState) => state.citas);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [searchPaciente, setSearchPaciente] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchTherapist, setSearchTherapist] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchPaciente, setDebouncedSearchPaciente] = useState<string>("");
  const [debouncedSearchTherapist, setDebouncedSearchTherapist] = useState<string>("");
  const itemsPerPage = 10;
  
  useEffect(() => {
    dispatch(fetchCitas({ 
      page: currentPage, 
      limit: itemsPerPage, 
      searchPaciente: debouncedSearchPaciente,
      searchTherapist: debouncedSearchTherapist,
      searchDate: searchDate
    }));
  }, [dispatch, currentPage, debouncedSearchPaciente, debouncedSearchTherapist, searchDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchPaciente(searchPaciente);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchPaciente]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTherapist(searchTherapist);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTherapist]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchDate]);

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

  const cobrarCita = async (idCita: number) => {
    if (!window.confirm("¿Desea cobrar esta cita? Se generará un recibo y la cita pasará a estado 'Completada'.")) return;
    
    try {
      const response = await axios.post('http://localhost:3002/Api/recibos/crearRecibo', { id_cita: idCita });
      toast.success(`Recibo generado exitosamente: ${response.data.data.numero_recibo}`);
      dispatch(fetchCitas({ 
        page: currentPage, 
        limit: itemsPerPage, 
        searchPaciente: debouncedSearchPaciente,
        searchTherapist: debouncedSearchTherapist,
        searchDate: searchDate
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Error al cobrar la cita';
      toast.error(errorMessage);
    }
  };


  const handleSubmit = () => {
    dispatch(fetchCitas({ 
      page: currentPage, 
      limit: itemsPerPage, 
      searchPaciente: debouncedSearchPaciente,
      searchTherapist: debouncedSearchTherapist,
      searchDate: searchDate
    }));
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

  const isMobile = windowWidth < 768;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
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
                {citas.length > 0 && (
                  <PDFDownloadLink
                    document={<CitasReport citas={citas} />} 
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
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Hora Inicio</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Tipo</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Total</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.length > 0 ? (
                    citas.map((cita, index) => (
                    <tr key={cita.id_cita}>
                      <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="py-3 px-4">{`${cita.paciente.nombre} ${cita.paciente.apellido}`}</td>
                      <td className="py-3 px-4">{`${cita.terapeuta.nombre} ${cita.terapeuta.apellido}`}</td>
                      <td className="py-3 px-4">
                        {(() => {
                          // Parsear fecha sin problemas de zona horaria
                          const [year, month, day] = cita.fecha.split('T')[0].split('-').map(Number);
                          const fechaLocal = new Date(year, month - 1, day);
                          return fechaLocal.toLocaleDateString('es-ES');
                        })()}
                      </td>
                      <td className="py-3 px-4">{cita.hora_inicio}</td>
                      <td className="py-3 px-4"><span className={`badge ${getStatusBadge(cita.estado)}`}>{cita.estado}</span></td>
                      <td className="py-3 px-4">{cita.tipo_terapia}</td>
                      <td className="py-3 px-4">
                        <strong className="text-success">L. {parseFloat(cita.total || 0).toFixed(2)}</strong>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <Button variant="outline-primary" size="sm" onClick={() => editarCita(cita)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaEdit />
                          </Button>
                          {(cita.estado === 'Pendiente' || cita.estado === 'Confirmada') && !cita.Recibo && (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => cobrarCita(cita.id_cita)} 
                              style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}
                              title="Cobrar cita"
                            >
                              <FaDollarSign />
                            </Button>
                          )}
                          {cita.Recibo && cita.Recibo.estado === 'Activo' && (
                            <PDFDownloadLink
                              document={
                                <ReciboReport 
                                  recibo={{
                                    id_recibo: cita.Recibo.id_recibo || 0,
                                    id_cita: cita.id_cita,
                                    numero_recibo: cita.Recibo.numero_recibo || '',
                                    fecha_cobro: cita.Recibo.fecha_cobro || new Date().toISOString(),
                                    total: cita.Recibo.total || cita.total || 0,
                                    estado: cita.Recibo.estado || 'Activo',
                                    Cita: {
                                      id_cita: cita.id_cita,
                                      fecha: cita.fecha || '',
                                      hora_inicio: cita.hora_inicio || '',
                                      tipo_terapia: cita.tipo_terapia || 'Fisica',
                                      total: cita.total || 0,
                                      paciente: cita.paciente ? {
                                        id_paciente: cita.paciente.id_paciente,
                                        nombre: cita.paciente.nombre || '',
                                        apellido: cita.paciente.apellido || ''
                                      } : undefined,
                                      terapeuta: cita.terapeuta ? {
                                        id_terapeuta: cita.terapeuta.id_terapeuta,
                                        nombre: cita.terapeuta.nombre || '',
                                        apellido: cita.terapeuta.apellido || ''
                                      } : undefined,
                                      servicios: (cita.servicios || []).map(s => ({
                                        id_servicio: s.id_servicio,
                                        nombre: s.nombre || '',
                                        costo: s.costo || 0
                                      }))
                                    }
                                  } as any} 
                                />
                              }
                              fileName={`Recibo_${cita.Recibo.numero_recibo || 'N/A'}.pdf`}
                              className="btn btn-outline-info btn-sm"
                              style={{
                                borderRadius: "8px",
                                padding: "0.4rem 0.6rem",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem"
                              }}
                            >
                              {({ loading }) => (
                                <>
                                  <FaPrint />
                                  {loading && <span className="ms-1">...</span>}
                                </>
                              )}
                            </PDFDownloadLink>
                          )}
                          <Button variant="outline-danger" size="sm" onClick={() => eliminarCitaHandler(cita.id_cita)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr><td colSpan={9} className="text-center py-5 text-muted">No se encontraron citas que coincidan con los filtros.</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
          <PaginationComponent 
            pagination={pagination}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
          />
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