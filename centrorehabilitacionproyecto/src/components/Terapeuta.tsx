import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaUserMd, FaSearch, FaPlus, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { AppDispatch, RootState } from '../app/store';
import { fetchTerapeutas, deleteTerapeuta } from '../features/terapeutas/terapeutasSlice';
import TerapeutasForm from './Forms/TerapeutasForm';
import TerapeutasReport from './Reports/TerapeutaReport';

export interface Terapeuta {
  id_terapeuta: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
  estado: boolean;
}

function TerapeutasTable() {
  const dispatch: AppDispatch = useDispatch();
  const { terapeutas, status, error } = useSelector((state: RootState) => state.terapeutas);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState<Terapeuta | null>(null);
  const [search, setSearch] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTerapeutas());
    }
  }, [status, dispatch]);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const eliminarTerapeutaHandler = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este terapeuta?")) return;

    dispatch(deleteTerapeuta(id))
      .unwrap()
      .then(() => toast.success("Terapeuta eliminado con éxito."))
      .catch((err) => toast.error(`Hubo un problema al eliminar: ${err.message || 'Error desconocido'}`));
  };

  const handleSubmit = () => {
    dispatch(fetchTerapeutas());
    toast.success("Terapeuta guardado con éxito.");
  };

  const editarTerapeuta = (terapeuta: Terapeuta) => {
    setTerapeutaSeleccionado(terapeuta);
    setShowForm(true);
  };

  const crearTerapeuta = () => {
    setTerapeutaSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setTerapeutaSeleccionado(null);
  };

  const terapeutasFiltrados = terapeutas.filter(t =>
    `${t.nombre} ${t.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  const isMobile = windowWidth < 768;

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaUserMd size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Terapeutas</h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                <Button 
                  variant="light" 
                  onClick={crearTerapeuta}
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
                  <FaPlus className="me-2" /> Nuevo Terapeuta
                </Button>
                {terapeutasFiltrados.length > 0 && (
                  <PDFDownloadLink
                    document={<TerapeutasReport terapeutas={terapeutasFiltrados} />}
                    fileName="Reporte_Terapeutas.pdf"
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
          <Row className="mb-4">
            <div className="col-md-6 col-lg-4">
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar terapeuta..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </div>
          </Row>

          {status === 'loading' ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando terapeutas...</p></div>
          ) : status === 'failed' ? (
             <div className="text-center py-5">
              <p className="text-danger">Error: {error}</p>
              <Button variant="secondary" size="sm" onClick={() => dispatch(fetchTerapeutas())}>Reintentar</Button>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Nombre Completo</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Especialidad</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Teléfono</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {terapeutasFiltrados.length > 0 ? (
                    terapeutasFiltrados.map((terapeuta, index) => (
                    <tr key={terapeuta.id_terapeuta}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{`${terapeuta.nombre} ${terapeuta.apellido}`}</td>
                      <td className="py-3 px-4">{terapeuta.especialidad}</td>
                      <td className="py-3 px-4">{terapeuta.telefono}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${terapeuta.estado ? 'bg-success' : 'bg-danger'}`}>
                          {terapeuta.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button variant="outline-primary" size="sm" onClick={() => editarTerapeuta(terapeuta)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => eliminarTerapeutaHandler(terapeuta.id_terapeuta)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">No se encontraron terapeutas.</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <TerapeutasForm 
          show={showForm} 
          handleClose={cerrarFormulario} 
          handleSubmit={handleSubmit}
          terapeutaEditar={terapeutaSeleccionado}
        />
      )}
    </Container>
  );
}

export default TerapeutasTable;