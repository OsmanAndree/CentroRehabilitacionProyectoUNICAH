import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaClipboardList, FaFilePdf, FaUserCheck } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { AppDispatch, RootState } from '../app/store';
import { fetchDiagnosticos, deleteDiagnostico, darAltaDiagnostico} from '../features/diagnosticos/diagnosticosSlice';
import DiagnosticosForm from './Forms/DiagnosticosForm';
import RecetaReport from './Reports/RecetaReport';
import PaginationComponent from './PaginationComponent';

export interface Diagnostico {
  id_diagnostico: number;
  id_paciente: number;
  id_terapeuta: number;
  descripcion: string;
  tratamiento: string;
  fecha: string;
  alta_medica: boolean;
  paciente: {
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
  };
  terapeuta: {
    nombre: string;
    apellido: string;
    especialidad: string;
  };
  
}

function DiagnosticosTable() {
  const dispatch: AppDispatch = useDispatch();
  const { diagnosticos, status, error, pagination } = useSelector((state: RootState) => state.diagnosticos);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<Diagnostico | null>(null);
  const [search, setSearch] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchDebounce, setSearchDebounce] = useState<string>("");
  const itemsPerPage = 10;
  
  useEffect(() => {
    dispatch(fetchDiagnosticos({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
  }, [dispatch, currentPage, searchDebounce]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const eliminarDiagnosticoHandler = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este diagnóstico?")) return;
    dispatch(deleteDiagnostico(id))
      .unwrap()
      .then(() => toast.success("Diagnóstico eliminado con éxito."))
      .catch((err) => toast.error(`Error al eliminar: ${err.message}`));
  };

  const darAltaHandler = (id: number) => {
    if (!window.confirm("¿Confirmar el alta médica del paciente?")) return;
    dispatch(darAltaDiagnostico(id))
      .unwrap()
      .then(() => {
          toast.success("Paciente dado de alta exitosamente.");
          dispatch(fetchDiagnosticos({ page: currentPage, limit: itemsPerPage, search: searchDebounce })); 
      })
      .catch((err: any) => toast.error(`Error al dar de alta: ${err.message}`));
  };

  const handleSubmit = () => {
    dispatch(fetchDiagnosticos({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
    toast.success("Diagnóstico guardado con éxito.");
    cerrarFormulario();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editarDiagnostico = (diagnostico: Diagnostico) => {
    setDiagnosticoSeleccionado(diagnostico);
    setShowForm(true);
  };

  const crearDiagnostico = () => {
    setDiagnosticoSeleccionado(null);
    setShowForm(true);
  };
  
  const cerrarFormulario = () => {
    setShowForm(false);
    setDiagnosticoSeleccionado(null);
  };

  const isMobile = windowWidth < 768;

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      {/* Añadimos el ToastContainer local con el z-index para que funcione */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" style={{ zIndex: 99999 }} />
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaClipboardList size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Diagnósticos</h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                <Button 
                  variant="light" 
                  onClick={crearDiagnostico}
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    borderRadius: "10px",
                    padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    width: isMobile ? "100%" : "auto",
                    fontSize: isMobile ? "0.9rem" : "1rem"
                  }}
                >
                  <FaPlus className="me-2" /> Nuevo Diagnóstico
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-3 p-md-4">
          <Row className="mb-4">
            <div className="col-md-6 col-lg-4">
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar diagnóstico..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </div>
          </Row>

          {status === 'loading' ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando diagnósticos...</p></div>
          ) : status === 'failed' ? (
            <div className="text-center py-5"><p className="text-danger">Error: {error}</p></div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Paciente</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Terapeuta</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Especialidad</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600", minWidth: '200px' }}>Descripción</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600", minWidth: '200px' }}>Tratamiento</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticos.length > 0 ? (
                    diagnosticos.map((diagnostico, index) => (
                      <tr key={diagnostico.id_diagnostico}>
                        <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="py-3 px-4">{`${diagnostico.paciente?.nombre || ''} ${diagnostico.paciente?.apellido || ''}`}</td>
                        <td className="py-3 px-4">{`${diagnostico.terapeuta?.nombre || ''} ${diagnostico.terapeuta?.apellido || ''}`}</td>
                        <td className="py-3 px-4">{diagnostico.terapeuta?.especialidad || ''}</td>
                        <td className="py-3 px-4">
                          <OverlayTrigger placement="top" overlay={<Tooltip>{diagnostico.descripcion}</Tooltip>}>
                            <div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {diagnostico.descripcion}
                            </div>
                          </OverlayTrigger>
                        </td>
                        <td className="py-3 px-4">
                          <OverlayTrigger placement="top" overlay={<Tooltip>{diagnostico.tratamiento}</Tooltip>}>
                            <div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {diagnostico.tratamiento}
                            </div>
                          </OverlayTrigger>
                        </td>
                        <td className="py-3 px-4">{new Date(diagnostico.fecha).toLocaleDateString('es-ES')}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <OverlayTrigger placement="top" overlay={<Tooltip>{diagnostico.alta_medica ? "Paciente ya dado de alta" : "Dar de Alta Médica"}</Tooltip>}>
                                <span>
                                    <Button 
                                        variant={diagnostico.alta_medica ? "success" : "outline-success"}
                                        size="sm" 
                                        onClick={() => darAltaHandler(diagnostico.id_diagnostico)} 
                                        disabled={diagnostico.alta_medica} 
                                        style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}
                                    >
                                        <FaUserCheck />
                                    </Button>
                                </span>
                            </OverlayTrigger>
                            <Button variant="outline-primary" size="sm" onClick={() => editarDiagnostico(diagnostico)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                              <FaEdit />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => eliminarDiagnosticoHandler(diagnostico.id_diagnostico)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                              <FaTrash />
                            </Button>
                            <PDFDownloadLink
                              document={<RecetaReport diagnostico={diagnostico} />}
                              fileName={`Receta_${diagnostico.paciente?.nombre}_${diagnostico.paciente?.apellido}.pdf`}
                              className="btn btn-outline-success btn-sm"
                              style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}
                            >
                              {({ loading }) => (loading ? <Spinner animation="border" size="sm" /> : <FaFilePdf />)}
                            </PDFDownloadLink>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className="text-center py-5 text-muted">No se encontraron diagnósticos.</td></tr>
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
        <DiagnosticosForm 
          show={showForm} 
          handleClose={cerrarFormulario} 
          handleSubmit={handleSubmit}
          diagnosticoEditar={diagnosticoSeleccionado}
        />
      )}
    </Container>
  );
}

export default DiagnosticosTable;
