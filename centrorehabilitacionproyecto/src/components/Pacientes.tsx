import { useEffect, useState, useRef } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserPlus, FaFilePdf, FaFolderOpen, FaUserCheck } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';

// --- IMPORTS CORRECTOS ---
import { AppDispatch, RootState } from '../app/store';

// 1. Importamos la Interfaz y Acciones desde el Slice
import { 
  fetchPacientes, 
  deletePaciente, 
  darAltaPaciente,
  Paciente 
} from '../features/pacientes/pacientesSlice';

// 2. Importamos el Formulario (Modal)
import PacientesForm from './Forms/PacientesForm';
import PacientesReport from './Reports/PacientesReport';
import PaginationComponent from './PaginationComponent';
import ExpedientePaciente from './ExpedientePaciente';

// 3. Importamos el hook de permisos
import { usePermissions } from '../hooks/usePermissions';

function PacientesTable() {
  const dispatch: AppDispatch = useDispatch();
  const { pacientes, status, error, pagination } = useSelector((state: RootState) => state.pacientes);
  
  // Hook de permisos
  const { canCreate, canUpdate, canDelete } = usePermissions();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [showExpediente, setShowExpediente] = useState<boolean>(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [pacienteExpediente, setPacienteExpediente] = useState<Paciente | null>(null);
  const [search, setSearch] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchDebounce, setSearchDebounce] = useState<string>("");
  const itemsPerPage = 10;

  // Referencias para notificaciones
  const prevStatusRef = useRef(status);
  const prevPacientesCountRef = useRef(pacientes.length);

  // Helper para mostrar género en texto
  const getGeneroTexto = (g: number | null | undefined) => {
    switch (g) {
      case 0: return "Masculino";
      case 1: return "Femenino";
      case 2: return "Indefinido";
      default: return "No registrado";
    }
  };

  useEffect(() => {
    // Notificación eliminación
    if (pacientes.length < prevPacientesCountRef.current) {
        toast.success("Paciente eliminado con éxito.");
    }
    prevStatusRef.current = status;
    prevPacientesCountRef.current = pacientes.length;
  }, [status, pacientes]);

  useEffect(() => {
    dispatch(fetchPacientes({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
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

  const eliminarPacienteHandler = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este paciente?")) return;
    dispatch(deletePaciente(id))
      .unwrap()
      .catch((err) => toast.error(`Hubo un problema al eliminar: ${err.message || 'Error desconocido'}`));
  };

  const darAltaHandler = (id: number) => {
    if (!window.confirm("¿Confirmar el alta médica de este paciente?")) return;
    dispatch(darAltaPaciente(id))
      .unwrap()
      .then(() => {
        toast.success("Paciente dado de alta exitosamente.");
        dispatch(fetchPacientes({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
      })
      .catch((err) => toast.error(`Error al dar de alta: ${err.message || 'Error desconocido'}`));
  };

  const handleSubmit = () => {
    dispatch(fetchPacientes({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editarPaciente = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente);
    setShowForm(true);
  };

  const crearPaciente = () => {
    setPacienteSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setPacienteSeleccionado(null);
  };

  const verExpediente = (paciente: Paciente) => {
    setPacienteExpediente(paciente);
    setShowExpediente(true);
  };

  const cerrarExpediente = () => {
    setShowExpediente(false);
    setPacienteExpediente(null);
  };

  const isMobile = windowWidth < 768;

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaUserPlus size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Pacientes</h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                {/* Botón Nuevo Paciente - Solo si tiene permiso de crear */}
                {canCreate('pacientes') && (
                  <Button 
                    variant="light" 
                    onClick={crearPaciente}
                    className="d-flex align-items-center justify-content-center"
                    style={{ borderRadius: "10px", fontWeight: "500" }}
                  >
                    <FaPlus className="me-2" /> Nuevo Paciente
                  </Button>
                )}
                
                {pacientes.length > 0 && (
                  <PDFDownloadLink
                    document={<PacientesReport pacientes={pacientes} />}
                    fileName="Reporte_Pacientes.pdf"
                    className={`btn btn-success ${isMobile ? 'w-100' : ''}`}
                    style={{ borderRadius: "10px", fontWeight: "500", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {({ loading }) => (
                      <div className="d-flex align-items-center justify-content-center w-100">
                        <FaFilePdf className="me-2" />
                        {loading ? "Generando..." : "Reporte PDF"}
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
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}><FaSearch className="text-muted" /></InputGroup.Text>
                <Form.Control type="text" placeholder="Buscar por nombre o identidad..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: "none", padding: "0.8rem 1rem" }} />
              </InputGroup>
            </div>
          </Row>
          
          {status === 'loading' ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando...</p></div>
          ) : status === 'failed' ? (
            <div className="text-center py-5"><p className="text-danger">Error: {error}</p></div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Identidad</th>
                    <th className="py-3 px-4">Nombre Completo</th>
                    <th className="py-3 px-4">Género</th>
                    <th className="py-3 px-4">Procedencia</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4 text-center">Alta Médica</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.length > 0 ? (
                    pacientes.map((paciente, index) => (
                      <tr key={paciente.id_paciente}>
                        <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="py-3 px-4">{paciente.numero_identidad || <span className="text-muted small">S/D</span>}</td>
                        <td className="py-3 px-4">{`${paciente.nombre} ${paciente.apellido}`}</td>
                        <td className="py-3 px-4">{getGeneroTexto(paciente.genero)}</td>
                        <td className="py-3 px-4">{paciente.lugar_procedencia || <span className="text-muted small">N/A</span>}</td>
                        <td className="py-3 px-4">{paciente.telefono}</td>
                        <td className="py-3 px-4 text-center">
                          {paciente.alta_medica ? (
                            <span className="badge bg-success">Sí</span>
                          ) : (
                            <span className="badge bg-secondary">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {/* Botón Ver Expediente - Siempre visible (es view) */}
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              onClick={() => verExpediente(paciente)} 
                              style={{ borderRadius: "8px" }}
                              title="Ver Expediente"
                            >
                              <FaFolderOpen />
                            </Button>
                            
                            {/* Botón Dar de Alta - Solo si tiene permiso de actualizar */}
                            {canUpdate('pacientes') && (
                              <Button 
                                variant={paciente.alta_medica ? "success" : "outline-success"}
                                size="sm" 
                                onClick={() => darAltaHandler(paciente.id_paciente)} 
                                disabled={paciente.alta_medica}
                                style={{ borderRadius: "8px" }}
                                title={paciente.alta_medica ? "Paciente ya dado de alta" : "Dar de Alta Médica"}
                              >
                                <FaUserCheck />
                              </Button>
                            )}
                            
                            {/* Botón Editar - Solo si tiene permiso de actualizar */}
                            {canUpdate('pacientes') && (
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => editarPaciente(paciente)} 
                                style={{ borderRadius: "8px" }}
                                title="Editar"
                              >
                                <FaEdit />
                              </Button>
                            )}
                            
                            {/* Botón Eliminar - Solo si tiene permiso de eliminar */}
                            {canDelete('pacientes') && (
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => eliminarPacienteHandler(paciente.id_paciente)} 
                                style={{ borderRadius: "8px" }}
                                title="Eliminar"
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className="text-center py-5 text-muted">No se encontraron pacientes.</td></tr>
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

      {/* FORMULARIO (MODAL) */}
      {showForm && (
        <PacientesForm 
            show={showForm} 
            handleClose={cerrarFormulario} 
            handleSubmit={handleSubmit} 
            pacienteEditar={pacienteSeleccionado}
        />
      )}

      {/* MODAL DE EXPEDIENTE */}
      {showExpediente && pacienteExpediente && (
        <ExpedientePaciente
          show={showExpediente}
          handleClose={cerrarExpediente}
          paciente={pacienteExpediente}
        />
      )}
    </Container>
  );
}

export default PacientesTable;
