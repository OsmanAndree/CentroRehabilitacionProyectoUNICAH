import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';
import { FaCashRegister, FaCalendar, FaDollarSign, FaFileInvoice, FaCheckCircle, FaClock, FaBan, FaHistory, FaLock, FaUnlock, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import PaginationComponent from './PaginationComponent';
import { usePermissions } from '../hooks/usePermissions';

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

interface InfoCierre {
  id_cierre: number;
  hora_cierre: string;
  estado: 'Activo' | 'Reabierto';
  observaciones: string | null;
  usuario: { id_usuario: number; nombre: string } | null;
  motivo_reapertura: string | null;
  fecha_reapertura: string | null;
  usuarioReapertura: { id_usuario: number; nombre: string } | null;
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
  estadoCierre: 'Activo' | 'Reabierto' | null;
  diaBloqueado: boolean;
  cierre: InfoCierre | null;
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
  estado: 'Activo' | 'Reabierto';
  motivo_reapertura: string | null;
  fecha_reapertura: string | null;
  usuario?: {
    id_usuario: number;
    nombre: string;
  };
  usuarioReapertura?: {
    id_usuario: number;
    nombre: string;
  };
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function CierresTable() {
  const [fecha, setFecha] = useState<Value>(new Date());
  const [datosCierre, setDatosCierre] = useState<DatosCierre | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModalCierre, setShowModalCierre] = useState<boolean>(false);
  const [observaciones, setObservaciones] = useState<string>('');
  const [loadingCierre, setLoadingCierre] = useState<boolean>(false);
  
  // Historial de cierres
  const [showHistorial, setShowHistorial] = useState<boolean>(false);
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Hook de permisos
  const { canCreate, canDelete, hasPermission } = usePermissions();
  
  // Modal de reabrir cierre
  const [showModalReabrir, setShowModalReabrir] = useState<boolean>(false);
  const [motivoReapertura, setMotivoReapertura] = useState<string>('');
  const [loadingReabrir, setLoadingReabrir] = useState<boolean>(false);
  
  const getToken = () => localStorage.getItem('token');

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
    if (!fecha || !(fecha instanceof Date)) return;
    
    setLoading(true);
    try {
      const fechaStr = formatDate(fecha);
      const response = await axios.get(`http://localhost:3002/Api/cierres/getDatosCierre?fecha=${fechaStr}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setDatosCierre(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error('Error al cargar datos del cierre: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async (page: number = 1) => {
    setLoadingHistorial(true);
    try {
      const response = await axios.get(`http://localhost:3002/Api/cierres/getCierres?page=${page}&limit=${itemsPerPage}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCierres(response.data.result);
      setPagination(response.data.pagination);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error('Error al cargar historial: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!datosCierre) return;

    // Solo bloquear si existe un cierre ACTIVO (bloqueado), no si está reabierto
    if (datosCierre.cierreExistente && datosCierre.diaBloqueado) {
      toast.warning('Ya existe un cierre activo para esta fecha. Debe reabrirlo primero.');
      return;
    }

    setShowModalCierre(true);
  };

  const confirmarCierre = async () => {
    if (!fecha || !(fecha instanceof Date)) return;
    
    setLoadingCierre(true);
    try {
      const fechaStr = formatDate(fecha);
      // Obtener ID del usuario de localStorage (puede estar en diferentes lugares)
      let idUsuario = localStorage.getItem('idUsuario');
      if (!idUsuario) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          idUsuario = user.id?.toString() || user.id_usuario?.toString() || null;
        }
      }
      
      await axios.post('http://localhost:3002/Api/cierres/crearCierre', {
        fecha: fechaStr,
        observaciones: observaciones,
        id_usuario: idUsuario ? parseInt(idUsuario) : null
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      toast.success('Cierre de caja realizado exitosamente. El día está ahora bloqueado.');
      setShowModalCierre(false);
      setObservaciones('');
      cargarDatosCierre();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error('Error al crear cierre: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingCierre(false);
    }
  };

  const handleReabrirCierre = () => {
    if (!datosCierre?.cierreId) return;
    setShowModalReabrir(true);
  };

  const confirmarReapertura = async () => {
    if (!datosCierre?.cierreId) return;

    setLoadingReabrir(true);
    try {
      // Obtener ID del usuario de localStorage (puede estar en diferentes lugares)
      let idUsuario = localStorage.getItem('idUsuario');
      if (!idUsuario) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          idUsuario = user.id?.toString() || user.id_usuario?.toString() || null;
        }
      }
      
      await axios.put(`http://localhost:3002/Api/cierres/reabrirCierre/${datosCierre.cierreId}`, {
        motivo: motivoReapertura,
        id_usuario: idUsuario ? parseInt(idUsuario) : null
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      toast.success('Cierre reabierto exitosamente. Ahora puede realizar operaciones para esta fecha.');
      setShowModalReabrir(false);
      setMotivoReapertura('');
      cargarDatosCierre();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error('Error al reabrir cierre: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingReabrir(false);
    }
  };

  const handleEliminarCierre = async () => {
    if (!datosCierre?.cierreId) return;

    if (!window.confirm('¿Está seguro de eliminar este cierre? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3002/Api/cierres/eliminarCierre/${datosCierre.cierreId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      toast.success('Cierre eliminado exitosamente');
      cargarDatosCierre();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error('Error al eliminar cierre: ' + (err.response?.data?.error || err.message));
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
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaCashRegister size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Cierre de Caja</h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="d-flex justify-content-md-end">
                <Button 
                  variant="light" 
                  onClick={() => {
                    setShowHistorial(true);
                    cargarHistorial();
                  }}
                  className="d-flex align-items-center justify-content-center"
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
                  <FaHistory className="me-2" /> Historial
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-3 p-md-4">
          <Row className="mb-4">
            <Col md={12}>
              <Card className="border-0" style={{ backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
                <Card.Body className="p-4">
                  <Row className="align-items-center mb-3">
                    <Col md={4}>
                      <Form.Label className="fw-semibold mb-2">Fecha del Cierre:</Form.Label>
                      <div style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                        <DatePicker
                          onChange={setFecha}
                          value={fecha}
                          format="dd/MM/yyyy"
                          className="w-100"
                          style={{ padding: "0.8rem 1rem", fontSize: "0.95rem", border: "none" }}
                        />
                      </div>
                    </Col>
                    <Col md={8} className="text-end d-flex justify-content-end align-items-center gap-2 flex-wrap mt-3 mt-md-0">
                      {datosCierre?.cierreExistente && (
                        <>
                          {/* Badge de estado */}
                          {datosCierre.diaBloqueado ? (
                            <Badge bg="danger" className="p-2" style={{ borderRadius: "8px", fontSize: "0.9rem" }}>
                              <FaLock className="me-2" />
                              Día cerrado - Operaciones bloqueadas
                            </Badge>
                          ) : (
                            <Badge bg="warning" text="dark" className="p-2" style={{ borderRadius: "8px", fontSize: "0.9rem" }}>
                              <FaUnlock className="me-2" />
                              Cierre reabierto - Operaciones permitidas
                            </Badge>
                          )}
                          
                          {/* Botón Reabrir Cierre - Solo si está activo (bloqueado) */}
                          {datosCierre.diaBloqueado && hasPermission('cierres', 'reabrir') && (
                            <Button 
                              variant="warning" 
                              size="sm"
                              onClick={handleReabrirCierre}
                              title="Reabrir cierre para permitir operaciones"
                              style={{ borderRadius: "8px", padding: "0.4rem 0.8rem" }}
                            >
                              <FaUnlock className="me-1" />
                              Reabrir
                            </Button>
                          )}
                          
                          {/* Botón Eliminar Cierre */}
                          {canDelete('cierres') && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={handleEliminarCierre}
                              title="Eliminar cierre permanentemente"
                              style={{ borderRadius: "8px", padding: "0.4rem 0.8rem" }}
                            >
                              <FaTrash className="me-1" />
                              Eliminar
                            </Button>
                          )}
                        </>
                      )}
                    </Col>
                  </Row>
                  
                  {/* Información detallada del cierre */}
                  {datosCierre?.cierre && (
                    <div className="mt-3 p-3 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', borderRadius: "12px" }}>
                      <Row>
                        <Col md={6}>
                          <h6 className="text-muted mb-3" style={{ fontWeight: "600" }}>
                            <FaCheckCircle className="me-2 text-success" />
                            Información del Cierre
                          </h6>
                          <p className="mb-2">
                            <strong>Cerrado por:</strong> {datosCierre.cierre.usuario?.nombre || 'N/A'}
                          </p>
                          <p className="mb-2">
                            <strong>Hora:</strong> {datosCierre.cierre.hora_cierre}
                          </p>
                          {datosCierre.cierre.observaciones && (
                            <p className="mb-0">
                              <strong>Observaciones:</strong> {datosCierre.cierre.observaciones}
                            </p>
                          )}
                        </Col>
                        {datosCierre.cierre.estado === 'Reabierto' && (
                          <Col md={6}>
                            <h6 className="text-warning mb-3" style={{ fontWeight: "600" }}>
                              <FaUnlock className="me-2" />
                              Información de Reapertura
                            </h6>
                            <p className="mb-2">
                              <strong>Reabierto por:</strong> {datosCierre.cierre.usuarioReapertura?.nombre || 'N/A'}
                            </p>
                            <p className="mb-2">
                              <strong>Fecha:</strong> {datosCierre.cierre.fecha_reapertura 
                                ? new Date(datosCierre.cierre.fecha_reapertura).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'N/A'}
                            </p>
                            {datosCierre.cierre.motivo_reapertura && (
                              <p className="mb-0 text-danger">
                                <strong>Motivo:</strong> {datosCierre.cierre.motivo_reapertura}
                              </p>
                            )}
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3 text-muted">Cargando datos...</p>
            </div>
          ) : datosCierre ? (
            <>
              {/* Resumen del Día */}
              <Row className="mb-4 g-3">
                <Col md={3} sm={6}>
                  <Card className="text-center border-0 shadow-sm" style={{ borderRadius: "12px", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Card.Body className="p-4">
                      <FaDollarSign size={32} className="text-primary mb-3" />
                      <h6 className="text-muted mb-2" style={{ fontWeight: "500" }}>Total Esperado</h6>
                      <h3 className="text-primary mb-0" style={{ fontWeight: "700" }}>L. {parseFloat(datosCierre.totalEsperado.toString()).toFixed(2)}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="text-center border-0 shadow-sm" style={{ borderRadius: "12px", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Card.Body className="p-4">
                      <FaFileInvoice size={32} className="text-success mb-3" />
                      <h6 className="text-muted mb-2" style={{ fontWeight: "500" }}>Total Cobrado</h6>
                      <h3 className="text-success mb-0" style={{ fontWeight: "700" }}>L. {parseFloat(datosCierre.totalCobrado.toString()).toFixed(2)}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className={`text-center border-0 shadow-sm`} style={{ borderRadius: "12px", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Card.Body className="p-4">
                      <FaCashRegister size={32} className={`text-${datosCierre.diferencia >= 0 ? 'success' : 'danger'} mb-3`} />
                      <h6 className="text-muted mb-2" style={{ fontWeight: "500" }}>Diferencia</h6>
                      <h3 className={`text-${datosCierre.diferencia >= 0 ? 'success' : 'danger'} mb-0`} style={{ fontWeight: "700" }}>
                        L. {parseFloat(datosCierre.diferencia.toString()).toFixed(2)}
                      </h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="text-center border-0 shadow-sm" style={{ borderRadius: "12px", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Card.Body className="p-4">
                      <FaCalendar size={32} className="text-info mb-3" />
                      <h6 className="text-muted mb-2" style={{ fontWeight: "500" }}>Total Citas</h6>
                      <h3 className="text-info mb-0" style={{ fontWeight: "700" }}>{datosCierre.citasPorEstado.total}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Estadísticas de Citas */}
              <Row className="mb-4">
                <Col md={12}>
                  <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                    <Card.Header className="bg-light border-0" style={{ borderRadius: "12px 12px 0 0" }}>
                      <h5 className="mb-0" style={{ fontWeight: "600" }}>Estadísticas de Citas</h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row className="g-3">
                        <Col md={2} sm={4} xs={6} className="text-center">
                          <Badge bg="success" className="p-3 w-100" style={{ borderRadius: "8px", fontSize: "0.9rem" }}>
                            Pagadas: {datosCierre.citasPorEstado.pagadas}
                          </Badge>
                        </Col>
                        <Col md={2} sm={4} xs={6} className="text-center">
                          <Badge bg="warning" text="dark" className="p-3 w-100" style={{ borderRadius: "8px", fontSize: "0.9rem" }}>
                            Pendientes: {datosCierre.citasPorEstado.pendientes}
                          </Badge>
                        </Col>
                        <Col md={2} sm={4} xs={6} className="text-center">
                          <Badge bg="info" className="p-3 w-100" style={{ borderRadius: "8px", fontSize: "0.9rem" }}>
                            Confirmadas: {datosCierre.citasPorEstado.confirmadas}
                          </Badge>
                        </Col>
                        <Col md={2} sm={4} xs={6} className="text-center">
                          <Badge bg="success" className="p-3 w-100" style={{ borderRadius: "8px", fontSize: "0.9rem" }}>
                            Completadas: {datosCierre.citasPorEstado.completadas}
                          </Badge>
                        </Col>
                        <Col md={2} sm={4} xs={6} className="text-center">
                          <Badge bg="danger" className="p-3 w-100" style={{ borderRadius: "8px", fontSize: "0.9rem" }}>
                            Canceladas: {datosCierre.citasPorEstado.canceladas}
                          </Badge>
                        </Col>
                        <Col md={2} sm={4} xs={6} className="text-center">
                          {/* Botón Cerrar Caja - Solo si no hay cierre o está reabierto */}
                          {(!datosCierre.cierreExistente || !datosCierre.diaBloqueado) && canCreate('cierres') ? (
                            <Button 
                              variant="primary" 
                              onClick={handleCerrarCaja}
                              className="w-100"
                              style={{ borderRadius: "8px", padding: "0.6rem", fontWeight: "500" }}
                            >
                              <FaCashRegister className="me-2" />
                              {datosCierre.cierreExistente && !datosCierre.diaBloqueado ? 'Re-cerrar Caja' : 'Cerrar Caja'}
                            </Button>
                          ) : (!datosCierre.cierreExistente || !datosCierre.diaBloqueado) && !canCreate('cierres') ? (
                            <Button 
                              variant="secondary" 
                              disabled
                              className="w-100"
                              title="No tienes permiso para crear cierres"
                              style={{ borderRadius: "8px", padding: "0.6rem" }}
                            >
                              <FaLock className="me-2" />
                              Sin Permiso
                            </Button>
                          ) : null}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Lista de Citas */}
              <Row className="mb-4">
                <Col md={12}>
                  <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                    <Card.Header className="bg-light border-0" style={{ borderRadius: "12px 12px 0 0" }}>
                      <h5 className="mb-0" style={{ fontWeight: "600" }}>Citas del Día</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
                        <Table hover className="align-middle mb-0">
                          <thead style={{ backgroundColor: "#f8f9fa" }}>
                            <tr>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Hora</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Paciente</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Terapeuta</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Total</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Pagado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {datosCierre.citas.length > 0 ? (
                              datosCierre.citas.map((cita) => (
                                <tr key={cita.id_cita}>
                                  <td className="py-3 px-4">{cita.hora_inicio}</td>
                                  <td className="py-3 px-4">{cita.paciente.nombre} {cita.paciente.apellido}</td>
                                  <td className="py-3 px-4">{cita.terapeuta.nombre} {cita.terapeuta.apellido}</td>
                                  <td className="py-3 px-4">{getEstadoBadge(cita.estado)}</td>
                                  <td className="py-3 px-4">
                                    <strong className="text-success">L. {parseFloat(cita.total.toString()).toFixed(2)}</strong>
                                  </td>
                                  <td className="py-3 px-4">
                                    {cita.Recibo && cita.Recibo.estado === 'Activo' ? (
                                      <Badge bg="success" style={{ borderRadius: "6px", padding: "0.4rem 0.6rem" }}>
                                        <FaCheckCircle className="me-1" />
                                        {cita.Recibo.numero_recibo}
                                      </Badge>
                                    ) : (
                                      <Badge bg="secondary" style={{ borderRadius: "6px", padding: "0.4rem 0.6rem" }}>No pagado</Badge>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center text-muted py-5">
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
                  <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                    <Card.Header className="bg-light border-0" style={{ borderRadius: "12px 12px 0 0" }}>
                      <h5 className="mb-0" style={{ fontWeight: "600" }}>Recibos del Día</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
                        <Table hover className="align-middle mb-0">
                          <thead style={{ backgroundColor: "#f8f9fa" }}>
                            <tr>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Número de Recibo</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Hora</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Paciente</th>
                              <th className="py-3 px-4" style={{ fontWeight: "600" }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {datosCierre.recibos.length > 0 ? (
                              datosCierre.recibos.map((recibo) => (
                                <tr key={recibo.id_recibo}>
                                  <td className="py-3 px-4"><strong>{recibo.numero_recibo}</strong></td>
                                  <td className="py-3 px-4">{new Date(recibo.fecha_cobro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
                                  <td className="py-3 px-4">
                                    {recibo.Cita?.paciente 
                                      ? `${recibo.Cita.paciente.nombre} ${recibo.Cita.paciente.apellido}`
                                      : 'N/A'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <strong className="text-success">L. {parseFloat(recibo.total.toString()).toFixed(2)}</strong>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center text-muted py-5">
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
            <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
              <Card.Body className="text-center py-5">
                <p className="text-muted">No hay datos disponibles</p>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Confirmación de Cierre */}
      <Modal show={showModalCierre} onHide={() => setShowModalCierre(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#2E8B57", color: "white", border: "none" }}>
          <Modal.Title style={{ fontWeight: "600" }}>Confirmar Cierre de Caja</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="mb-4">¿Está seguro de realizar el cierre de caja para la fecha <strong>{fecha instanceof Date ? formatDate(fecha) : ''}</strong>?</p>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Observaciones (opcional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese observaciones sobre el cierre..."
              style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
            />
          </Form.Group>
          {datosCierre && (
            <div className="alert alert-info border-0" style={{ borderRadius: "8px", backgroundColor: "#e7f3ff" }}>
              <strong>Resumen:</strong><br />
              Total Esperado: L. {parseFloat(datosCierre.totalEsperado.toString()).toFixed(2)}<br />
              Total Cobrado: L. {parseFloat(datosCierre.totalCobrado.toString()).toFixed(2)}<br />
              Diferencia: L. {parseFloat(datosCierre.diferencia.toString()).toFixed(2)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowModalCierre(false)}
            style={{ borderRadius: "8px", padding: "0.5rem 1.5rem" }}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmarCierre} 
            disabled={loadingCierre}
            style={{ borderRadius: "8px", padding: "0.5rem 1.5rem", backgroundColor: "#2E8B57", border: "none" }}
          >
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
      <Modal show={showHistorial} onHide={() => setShowHistorial(false)} size="xl" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#2E8B57', color: 'white', border: "none" }}>
          <Modal.Title style={{ fontWeight: "600" }}>
            <FaHistory className="me-2" />
            Historial de Cierres de Caja
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingHistorial ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
              <p className="mt-3 text-muted">Cargando historial...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <Table hover className="align-middle mb-0">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha</th>
                      <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th>
                      <th className="py-3 px-4 text-end" style={{ fontWeight: "600" }}>Total Cobrado</th>
                      <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Citas</th>
                      <th className="py-3 px-4" style={{ fontWeight: "600" }}>Cerrado por</th>
                      <th className="py-3 px-4" style={{ fontWeight: "600" }}>Reapertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cierres.length > 0 ? (
                      cierres.map((cierre) => (
                        <tr key={cierre.id_cierre}>
                          <td className="py-3 px-4">
                            <div>
                              <strong>{new Date(cierre.fecha_cierre).toLocaleDateString('es-ES', { 
                                weekday: 'short', 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}</strong>
                              <br />
                              <small className="text-muted">
                                <FaClock className="me-1" />
                                {cierre.hora_cierre}
                              </small>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {cierre.estado === 'Activo' ? (
                              <Badge bg="danger" style={{ borderRadius: "6px", padding: "0.4rem 0.6rem" }}>
                                <FaLock className="me-1" /> Bloqueado
                              </Badge>
                            ) : (
                              <Badge bg="warning" text="dark" style={{ borderRadius: "6px", padding: "0.4rem 0.6rem" }}>
                                <FaUnlock className="me-1" /> Reabierto
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-end">
                            <div>
                              <strong className="text-success">
                                L. {parseFloat(cierre.total_cobrado.toString()).toFixed(2)}
                              </strong>
                              <br />
                              <small className={cierre.diferencia >= 0 ? 'text-success' : 'text-danger'}>
                                {cierre.diferencia >= 0 ? '+' : ''}
                                L. {parseFloat(cierre.diferencia.toString()).toFixed(2)}
                              </small>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge bg="info" className="px-3 py-2" style={{ borderRadius: "6px" }}>
                              {cierre.total_citas}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <strong>{cierre.usuario?.nombre || 'N/A'}</strong>
                              {cierre.observaciones && (
                                <>
                                  <br />
                                  <small className="text-muted" title={cierre.observaciones}>
                                    📝 {cierre.observaciones.length > 30 
                                      ? cierre.observaciones.substring(0, 30) + '...' 
                                      : cierre.observaciones}
                                  </small>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {cierre.estado === 'Reabierto' ? (
                              <div>
                                <strong className="text-warning">
                                  {cierre.usuarioReapertura?.nombre || 'N/A'}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {cierre.fecha_reapertura && new Date(cierre.fecha_reapertura).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </small>
                                {cierre.motivo_reapertura && (
                                  <>
                                    <br />
                                    <small className="text-danger" title={cierre.motivo_reapertura}>
                                      ⚠️ {cierre.motivo_reapertura.length > 25 
                                        ? cierre.motivo_reapertura.substring(0, 25) + '...' 
                                        : cierre.motivo_reapertura}
                                    </small>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-5">
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
        <Modal.Footer style={{ border: "none" }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowHistorial(false)}
            style={{ borderRadius: "8px", padding: "0.5rem 1.5rem" }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Reabrir Cierre */}
      <Modal show={showModalReabrir} onHide={() => setShowModalReabrir(false)} centered>
        <Modal.Header closeButton className="bg-warning" style={{ border: "none" }}>
          <Modal.Title className="d-flex align-items-center" style={{ fontWeight: "600" }}>
            <FaExclamationTriangle className="me-2" />
            Reabrir Cierre de Caja
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="alert alert-warning border-0" style={{ borderRadius: "8px" }}>
            <strong>⚠️ Advertencia:</strong> Al reabrir el cierre, se permitirán nuevamente las siguientes operaciones para la fecha <strong>{fecha instanceof Date ? formatDate(fecha) : ''}</strong>:
            <ul className="mt-2 mb-0">
              <li>Crear y editar citas</li>
              <li>Cobrar citas (generar recibos)</li>
              <li>Anular recibos</li>
            </ul>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Motivo de reapertura *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={motivoReapertura}
              onChange={(e) => setMotivoReapertura(e.target.value)}
              placeholder="Ingrese el motivo por el cual necesita reabrir el cierre..."
              required
              style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
            />
            <Form.Text className="text-muted">
              Este motivo quedará registrado para auditoría.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowModalReabrir(false)}
            style={{ borderRadius: "8px", padding: "0.5rem 1.5rem" }}
          >
            Cancelar
          </Button>
          <Button 
            variant="warning" 
            onClick={confirmarReapertura} 
            disabled={loadingReabrir || !motivoReapertura.trim()}
            style={{ borderRadius: "8px", padding: "0.5rem 1.5rem" }}
          >
            {loadingReabrir ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              <>
                <FaUnlock className="me-2" />
                Confirmar Reapertura
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CierresTable;
