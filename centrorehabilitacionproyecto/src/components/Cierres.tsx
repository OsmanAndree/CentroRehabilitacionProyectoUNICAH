import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';
import { FaCashRegister, FaCalendar, FaDollarSign, FaFileInvoice, FaCheckCircle, FaClock, FaBan, FaHistory } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import PaginationComponent from './PaginationComponent';

interface Cita {
  id_cita: number;
  fecha: string;
  hora_inicio: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  total: number;
  paciente: {
    nombre: string;
    apellido: string;
  };
  terapeuta: {
    nombre: string;
    apellido: string;
  };
  servicios?: Array<{
    id_servicio: number;
    nombre: string;
    costo: number;
  }>;
  Recibo?: {
    id_recibo: number;
    numero_recibo: string;
    total: number;
    estado: string;
  };
}

interface Recibo {
  id_recibo: number;
  numero_recibo: string;
  fecha_cobro: string;
  total: number;
  estado: string;
  Cita?: {
    id_cita: number;
    fecha: string;
    hora_inicio: string;
    paciente: {
      nombre: string;
      apellido: string;
    };
  };
}

interface DatosCierre {
  fecha: string;
  totalEsperado: number;
  totalCobrado: number;
  diferencia: number;
  citasPorEstado: {
    total: number;
    pagadas: number;
    pendientes: number;
    confirmadas: number;
    completadas: number;
    canceladas: number;
  };
  citas: Cita[];
  recibos: Recibo[];
  cierreExistente: boolean;
  cierreId: number | null;
}

interface Cierre {
  id_cierre: number;
  fecha_cierre: string;
  hora_cierre: string;
  total_esperado: number;
  total_cobrado: number;
  diferencia: number;
  total_citas: number;
  citas_pagadas: number;
  citas_pendientes: number;
  citas_confirmadas: number;
  citas_completadas: number;
  citas_canceladas: number;
  observaciones: string | null;
  usuario?: {
    nombre: string;
    apellido: string;
  };
}

function CierresTable() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [datosCierre, setDatosCierre] = useState<DatosCierre | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModalCierre, setShowModalCierre] = useState<boolean>(false);
  const [observaciones, setObservaciones] = useState<string>('');
  const [loadingCierre, setLoadingCierre] = useState<boolean>(false);
  
  // Historial de cierres
  const [showHistorial, setShowHistorial] = useState<boolean>(false);
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState<boolean>(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    cargarDatosCierre();
  }, [fecha]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const cargarDatosCierre = async () => {
    setLoading(true);
    try {
      const fechaStr = formatDate(fecha);
      const response = await axios.get(`http://localhost:3002/Api/cierres/getDatosCierre?fecha=${fechaStr}`);
      setDatosCierre(response.data);
    } catch (error: any) {
      toast.error('Error al cargar datos del cierre: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async (page: number = 1) => {
    setLoadingHistorial(true);
    try {
      const response = await axios.get(`http://localhost:3002/Api/cierres/getCierres?page=${page}&limit=${itemsPerPage}`);
      setCierres(response.data.result);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error('Error al cargar historial: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!datosCierre) return;

    if (datosCierre.cierreExistente) {
      toast.warning('Ya existe un cierre para esta fecha');
      return;
    }

    setShowModalCierre(true);
  };

  const confirmarCierre = async () => {
    setLoadingCierre(true);
    try {
      const fechaStr = formatDate(fecha);
      const idUsuario = localStorage.getItem('idUsuario');
      
      await axios.post('http://localhost:3002/Api/cierres/crearCierre', {
        fecha: fechaStr,
        observaciones: observaciones,
        id_usuario: idUsuario ? parseInt(idUsuario) : null
      });

      toast.success('Cierre de caja realizado exitosamente');
      setShowModalCierre(false);
      setObservaciones('');
      cargarDatosCierre();
    } catch (error: any) {
      toast.error('Error al crear cierre: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoadingCierre(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: { [key: string]: { variant: string; icon: JSX.Element } } = {
      'Pendiente': { variant: 'warning', icon: <FaClock /> },
      'Confirmada': { variant: 'info', icon: <FaCheckCircle /> },
      'Completada': { variant: 'success', icon: <FaCheckCircle /> },
      'Cancelada': { variant: 'danger', icon: <FaBan /> }
    };
    const badge = badges[estado] || { variant: 'secondary', icon: <FaClock /> };
    return <Badge bg={badge.variant}>{badge.icon} {estado}</Badge>;
  };

  return (
    <Container fluid className="py-4">
      <ToastContainer />
      
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaCashRegister /> Cierre de Caja
          </h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setShowHistorial(true);
              cargarHistorial();
            }}
          >
            <FaHistory className="me-2" /> Historial
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Row className="align-items-center mb-3">
                <Col md={4}>
                  <Form.Label className="fw-semibold">Fecha del Cierre:</Form.Label>
                  <DatePicker
                    onChange={setFecha}
                    value={fecha}
                    format="dd/MM/yyyy"
                    className="w-100"
                  />
                </Col>
                <Col md={8} className="text-end">
                  {datosCierre?.cierreExistente && (
                    <Badge bg="success" className="p-2">
                      <FaCheckCircle className="me-2" />
                      Cierre realizado para esta fecha
                    </Badge>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando datos...</p>
        </div>
      ) : datosCierre ? (
        <>
          {/* Resumen del Día */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <FaDollarSign size={30} className="text-primary mb-2" />
                  <h5>Total Esperado</h5>
                  <h3 className="text-primary">L. {parseFloat(datosCierre.totalEsperado.toString()).toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-success">
                <Card.Body>
                  <FaFileInvoice size={30} className="text-success mb-2" />
                  <h5>Total Cobrado</h5>
                  <h3 className="text-success">L. {parseFloat(datosCierre.totalCobrado.toString()).toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`text-center border-${datosCierre.diferencia >= 0 ? 'success' : 'danger'}`}>
                <Card.Body>
                  <FaCashRegister size={30} className={`text-${datosCierre.diferencia >= 0 ? 'success' : 'danger'} mb-2`} />
                  <h5>Diferencia</h5>
                  <h3 className={`text-${datosCierre.diferencia >= 0 ? 'success' : 'danger'}`}>
                    L. {parseFloat(datosCierre.diferencia.toString()).toFixed(2)}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-info">
                <Card.Body>
                  <FaCalendar size={30} className="text-info mb-2" />
                  <h5>Total Citas</h5>
                  <h3 className="text-info">{datosCierre.citasPorEstado.total}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Estadísticas de Citas */}
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Estadísticas de Citas</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={2} className="text-center">
                      <Badge bg="success" className="p-2 w-100">
                        Pagadas: {datosCierre.citasPorEstado.pagadas}
                      </Badge>
                    </Col>
                    <Col md={2} className="text-center">
                      <Badge bg="warning" className="p-2 w-100">
                        Pendientes: {datosCierre.citasPorEstado.pendientes}
                      </Badge>
                    </Col>
                    <Col md={2} className="text-center">
                      <Badge bg="info" className="p-2 w-100">
                        Confirmadas: {datosCierre.citasPorEstado.confirmadas}
                      </Badge>
                    </Col>
                    <Col md={2} className="text-center">
                      <Badge bg="success" className="p-2 w-100">
                        Completadas: {datosCierre.citasPorEstado.completadas}
                      </Badge>
                    </Col>
                    <Col md={2} className="text-center">
                      <Badge bg="danger" className="p-2 w-100">
                        Canceladas: {datosCierre.citasPorEstado.canceladas}
                      </Badge>
                    </Col>
                    <Col md={2} className="text-center">
                      {!datosCierre.cierreExistente && (
                        <Button 
                          variant="primary" 
                          onClick={handleCerrarCaja}
                          className="w-100"
                        >
                          <FaCashRegister className="me-2" />
                          Cerrar Caja
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Lista de Citas */}
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Citas del Día</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Hora</th>
                          <th>Paciente</th>
                          <th>Terapeuta</th>
                          <th>Estado</th>
                          <th>Total</th>
                          <th>Pagado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosCierre.citas.length > 0 ? (
                          datosCierre.citas.map((cita) => (
                            <tr key={cita.id_cita}>
                              <td>{cita.hora_inicio}</td>
                              <td>{cita.paciente.nombre} {cita.paciente.apellido}</td>
                              <td>{cita.terapeuta.nombre} {cita.terapeuta.apellido}</td>
                              <td>{getEstadoBadge(cita.estado)}</td>
                              <td>L. {parseFloat(cita.total.toString()).toFixed(2)}</td>
                              <td>
                                {cita.Recibo && cita.Recibo.estado === 'Activo' ? (
                                  <Badge bg="success">
                                    <FaCheckCircle className="me-1" />
                                    {cita.Recibo.numero_recibo}
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary">No pagado</Badge>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center text-muted py-4">
                              No hay citas para esta fecha
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Lista de Recibos */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Recibos del Día</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Número de Recibo</th>
                          <th>Hora</th>
                          <th>Paciente</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosCierre.recibos.length > 0 ? (
                          datosCierre.recibos.map((recibo) => (
                            <tr key={recibo.id_recibo}>
                              <td>{recibo.numero_recibo}</td>
                              <td>{new Date(recibo.fecha_cobro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
                              <td>
                                {recibo.Cita?.paciente 
                                  ? `${recibo.Cita.paciente.nombre} ${recibo.Cita.paciente.apellido}`
                                  : 'N/A'}
                              </td>
                              <td>L. {parseFloat(recibo.total.toString()).toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-muted py-4">
                              No hay recibos para esta fecha
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">No hay datos disponibles</p>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Confirmación de Cierre */}
      <Modal show={showModalCierre} onHide={() => setShowModalCierre(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cierre de Caja</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro de realizar el cierre de caja para la fecha <strong>{formatDate(fecha)}</strong>?</p>
          <Form.Group className="mb-3">
            <Form.Label>Observaciones (opcional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese observaciones sobre el cierre..."
            />
          </Form.Group>
          {datosCierre && (
            <div className="alert alert-info">
              <strong>Resumen:</strong><br />
              Total Esperado: L. {parseFloat(datosCierre.totalEsperado.toString()).toFixed(2)}<br />
              Total Cobrado: L. {parseFloat(datosCierre.totalCobrado.toString()).toFixed(2)}<br />
              Diferencia: L. {parseFloat(datosCierre.diferencia.toString()).toFixed(2)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalCierre(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarCierre} disabled={loadingCierre}>
            {loadingCierre ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              'Confirmar Cierre'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Historial */}
      <Modal show={showHistorial} onHide={() => setShowHistorial(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Historial de Cierres</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingHistorial ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Total Esperado</th>
                      <th>Total Cobrado</th>
                      <th>Diferencia</th>
                      <th>Citas</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cierres.length > 0 ? (
                      cierres.map((cierre) => (
                        <tr key={cierre.id_cierre}>
                          <td>{new Date(cierre.fecha_cierre).toLocaleDateString('es-ES')}</td>
                          <td>{cierre.hora_cierre}</td>
                          <td>L. {parseFloat(cierre.total_esperado.toString()).toFixed(2)}</td>
                          <td>L. {parseFloat(cierre.total_cobrado.toString()).toFixed(2)}</td>
                          <td>
                            <span className={cierre.diferencia >= 0 ? 'text-success' : 'text-danger'}>
                              L. {parseFloat(cierre.diferencia.toString()).toFixed(2)}
                            </span>
                          </td>
                          <td>{cierre.total_citas}</td>
                          <td>
                            {cierre.usuario 
                              ? `${cierre.usuario.nombre} ${cierre.usuario.apellido}`
                              : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No hay cierres registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              {pagination && (
                <PaginationComponent
                  pagination={pagination}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    cargarHistorial(page);
                  }}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                />
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistorial(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CierresTable;

