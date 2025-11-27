import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaConciergeBell, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import ServiciosForm from './Forms/ServiciosForm';
import PaginationComponent from './PaginationComponent';
import { usePermissions } from '../hooks/usePermissions';

export interface Servicio {
  id_servicio: number;
  nombre: string;
  costo: number;
  estado: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function ServiciosTable() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const { canCreate, canUpdate, canDelete } = usePermissions();
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [search, setSearch] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchDebounce, setSearchDebounce] = useState<string>("");
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchServicios();
  }, [currentPage, searchDebounce]);

  const fetchServicios = async () => {
    setStatus('loading');
    try {
      const response = await axios.get('http://localhost:3002/Api/servicios/getServicios', {
        params: { page: currentPage, limit: itemsPerPage, search: searchDebounce }
      });
      setServicios(response.data.result);
      setPagination(response.data.pagination);
      setStatus('succeeded');
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios');
      setStatus('failed');
    }
  };

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

  const eliminarServicioHandler = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      await axios.delete(`http://localhost:3002/Api/servicios/deleteServicio?servicio_id=${id}`);
      toast.success("Servicio eliminado con éxito.");
      fetchServicios();
    } catch (err: any) {
      toast.error(`Error al eliminar: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSubmit = () => {
    fetchServicios();
    toast.success("Servicio guardado con éxito.");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editarServicio = (servicio: Servicio) => {
    setServicioSeleccionado(servicio);
    setShowForm(true);
  };

  const crearServicio = () => {
    setServicioSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setServicioSeleccionado(null);
  };

  const isMobile = windowWidth < 768;

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaConciergeBell size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Servicios</h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                {canCreate('servicios') && (
                  <Button 
                    variant="light" 
                    onClick={crearServicio}
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
                    <FaPlus className="me-2" /> Nuevo Servicio
                  </Button>
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
                  placeholder="Buscar servicio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </div>
          </Row>

          {status === 'loading' ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando servicios...</p></div>
          ) : status === 'failed' ? (
            <div className="text-center py-5"><p className="text-danger">Error: {error}</p></div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Nombre</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Costo</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.length > 0 ? (
                    servicios.map((servicio, index) => (
                      <tr key={servicio.id_servicio}>
                        <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="py-3 px-4">{servicio.nombre}</td>
                        <td className="py-3 px-4"><strong className="text-success">L. {parseFloat(servicio.costo.toString()).toFixed(2)}</strong></td>
                        <td className="py-3 px-4">
                          <span className={`badge ${servicio.estado ? 'bg-success' : 'bg-secondary'}`}>
                            {servicio.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {canUpdate('servicios') && (
                              <Button variant="outline-primary" size="sm" onClick={() => editarServicio(servicio)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                                <FaEdit />
                              </Button>
                            )}
                            {canDelete('servicios') && (
                              <Button variant="outline-danger" size="sm" onClick={() => eliminarServicioHandler(servicio.id_servicio)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                                <FaTrash />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">No se encontraron servicios.</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
          {pagination && (
            <PaginationComponent 
              pagination={pagination}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
            />
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <ServiciosForm 
          show={showForm} 
          handleClose={cerrarFormulario} 
          handleSubmit={handleSubmit}
          servicioEditar={servicioSeleccionado}
        />
      )}
    </Container>
  );
}

export default ServiciosTable;

