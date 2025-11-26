import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaReceipt, FaPrint, FaCalendar, FaBan } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PaginationComponent from './PaginationComponent';
import ReciboReport from './Reports/ReciboReport';

export interface Recibo {
  id_recibo: number;
  id_cita: number;
  numero_recibo: string;
  fecha_cobro: string;
  total: number;
  estado: 'Activo' | 'Anulado';
  Cita?: {
    id_cita: number;
    fecha: string;
    hora_inicio: string;
    total: number;
    paciente?: {
      id_paciente: number;
      nombre: string;
      apellido: string;
    };
    terapeuta?: {
      id_terapeuta: number;
      nombre: string;
      apellido: string;
    };
    servicios?: Array<{
      id_servicio: number;
      nombre: string;
      costo: number;
    }>;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function RecibosTable() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  const [searchDate, setSearchDate] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchRecibos();
  }, [currentPage, searchDate]);

  const fetchRecibos = async () => {
    setStatus('loading');
    try {
      const params: any = { page: currentPage, limit: itemsPerPage };
      if (searchDate) {
        params.searchDate = searchDate;
      }
      const response = await axios.get('http://localhost:3002/Api/recibos/getRecibos', { params });
      setRecibos(response.data.result);
      setPagination(response.data.pagination);
      setStatus('succeeded');
    } catch (err: any) {
      setError(err.message || 'Error al cargar recibos');
      setStatus('failed');
    }
  };
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const anularReciboHandler = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea anular este recibo? La cita volverá a su estado anterior.")) return;

    try {
      await axios.put(`http://localhost:3002/Api/recibos/anularRecibo?recibo_id=${id}`);
      toast.success("Recibo anulado con éxito.");
      fetchRecibos();
    } catch (err: any) {
      toast.error(`Error al anular: ${err.response?.data?.error || err.message}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMobile = windowWidth < 768;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-success';
      case 'Anulado': return 'bg-danger';
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
                <FaReceipt size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Recibos</h4>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-3 p-md-4">
          <Row className="mb-4">
            <Col xs={12} md={4}>
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                  <FaCalendar className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  value={searchDate}
                  onChange={(e) => {
                    setSearchDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </Col>
          </Row>

          {status === 'loading' ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando recibos...</p></div>
          ) : status === 'failed' ? (
            <div className="text-center py-5"><p className="text-danger">Error: {error}</p></div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Número Recibo</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha Cobro</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Paciente</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Total</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recibos.length > 0 ? (
                    recibos.map((recibo, index) => (
                      <tr key={recibo.id_recibo}>
                        <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="py-3 px-4"><strong>{recibo.numero_recibo}</strong></td>
                        <td className="py-3 px-4">
                          {new Date(recibo.fecha_cobro).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {recibo.Cita?.paciente 
                            ? `${recibo.Cita.paciente.nombre} ${recibo.Cita.paciente.apellido}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-success">L. {parseFloat(recibo.total.toString()).toFixed(2)}</strong>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge ${getEstadoBadge(recibo.estado)}`}>
                            {recibo.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="d-flex justify-content-center gap-2 flex-wrap">
                            {recibo.estado === 'Activo' && recibo.Cita && (
                              <PDFDownloadLink
                                document={<ReciboReport recibo={recibo} />}
                                fileName={`Recibo_${recibo.numero_recibo}.pdf`}
                                className="btn btn-outline-info btn-sm"
                                style={{
                                  borderRadius: "8px",
                                  padding: "0.4rem 0.6rem",
                                  textDecoration: "none"
                                }}
                              >
                                {({ loading }) => (
                                  <span>
                                    <FaPrint className="me-1" />
                                    {loading ? "..." : "Imprimir"}
                                  </span>
                                )}
                              </PDFDownloadLink>
                            )}
                            {recibo.estado === 'Activo' && (
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => anularReciboHandler(recibo.id_recibo)} 
                                style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}
                                title="Anular recibo"
                              >
                                <FaBan />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="text-center py-5 text-muted">No se encontraron recibos.</td></tr>
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
    </Container>
  );
}

export default RecibosTable;

