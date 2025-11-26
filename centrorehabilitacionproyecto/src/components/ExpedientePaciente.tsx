import { useEffect, useState } from 'react';
import { Modal, Table, Spinner, Button, Tabs, Tab, Card, Row, Col, Badge } from 'react-bootstrap';
import { FaFilePdf, FaTimes, FaClipboardList, FaCalendar } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';
import { Paciente } from '../features/pacientes/pacientesSlice';
import { Diagnostico } from './Diagnosticos';
import { Cita } from './Citas';
import ExpedienteReport from './Reports/ExpedienteReport';

interface ExpedientePacienteProps {
  show: boolean;
  handleClose: () => void;
  paciente: Paciente | null;
}

function ExpedientePaciente({ show, handleClose, paciente }: ExpedientePacienteProps) {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loadingDiagnosticos, setLoadingDiagnosticos] = useState<boolean>(false);
  const [loadingCitas, setLoadingCitas] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('diagnosticos');

  useEffect(() => {
    if (show && paciente) {
      cargarDiagnosticos();
      cargarCitas();
    } else {
      setDiagnosticos([]);
      setCitas([]);
    }
  }, [show, paciente]);

  const cargarDiagnosticos = async () => {
    if (!paciente) return;
    setLoadingDiagnosticos(true);
    try {
      const response = await axios.get('http://localhost:3002/Api/diagnostico/getDiagnosticos', {
        params: { id_paciente: paciente.id_paciente, limit: 1000 }
      });
      if (response.data && response.data.result) {
        setDiagnosticos(response.data.result);
      }
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error);
    } finally {
      setLoadingDiagnosticos(false);
    }
  };

  const cargarCitas = async () => {
    if (!paciente) return;
    setLoadingCitas(true);
    try {
      const response = await axios.get('http://localhost:3002/Api/citas/getcitas', {
        params: { id_paciente: paciente.id_paciente, limit: 1000 }
      });
      if (response.data && response.data.result) {
        setCitas(response.data.result);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoadingCitas(false);
    }
  };

  const getGeneroTexto = (g: number | null | undefined) => {
    switch (g) {
      case 0: return "Masculino";
      case 1: return "Femenino";
      case 2: return "Indefinido";
      default: return "No registrado";
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estados: { [key: string]: string } = {
      'Pendiente': 'warning',
      'Confirmada': 'success',
      'Cancelada': 'danger',
      'Completada': 'info'
    };
    return estados[estado] || 'secondary';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (!paciente) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl" 
      centered
      style={{ zIndex: 1050 }}
    >
      <Modal.Header 
        closeButton 
        style={{ 
          backgroundColor: "#2E8B57", 
          color: "white",
          borderBottom: "none"
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <FaClipboardList className="me-2" />
          Expediente de {paciente.nombre} {paciente.apellido}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ padding: '0' }}>
        {/* Información del Paciente */}
        <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: "0" }}>
          <Card.Body className="p-4">
            <Row>
              <Col md={6}>
                <h6 className="text-muted mb-3">Información Personal</h6>
                <p><strong>Identidad:</strong> {paciente.numero_identidad || 'N/A'}</p>
                <p><strong>Fecha de Nacimiento:</strong> {formatDate(paciente.fecha_nacimiento)}</p>
                <p><strong>Género:</strong> {getGeneroTexto(paciente.genero)}</p>
              </Col>
              <Col md={6}>
                <h6 className="text-muted mb-3">Contacto</h6>
                <p><strong>Teléfono:</strong> {paciente.telefono}</p>
                <p><strong>Dirección:</strong> {paciente.direccion || 'N/A'}</p>
                <p><strong>Procedencia:</strong> {paciente.lugar_procedencia || 'N/A'}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Pestañas para Diagnósticos y Citas */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="px-4"
          style={{ borderBottom: "2px solid #e9ecef" }}
        >
          <Tab 
            eventKey="diagnosticos" 
            title={
              <span>
                <FaClipboardList className="me-2" />
                Diagnósticos ({diagnosticos.length})
              </span>
            }
          >
            <div className="p-4">
              {loadingDiagnosticos ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-3 text-muted">Cargando diagnósticos...</p>
                </div>
              ) : diagnosticos.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th>Fecha</th>
                        <th>Terapeuta</th>
                        <th>Descripción</th>
                        <th>Tratamiento</th>
                        <th>Alta Médica</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticos.map((diagnostico) => (
                        <tr key={diagnostico.id_diagnostico}>
                          <td>{formatDate(diagnostico.fecha)}</td>
                          <td>
                            {diagnostico.terapeuta?.nombre} {diagnostico.terapeuta?.apellido}
                            {diagnostico.terapeuta?.especialidad && (
                              <small className="d-block text-muted">{diagnostico.terapeuta.especialidad}</small>
                            )}
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                              {diagnostico.descripcion || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                              {diagnostico.tratamiento}
                            </div>
                          </td>
                          <td>
                            {diagnostico.alta_medica ? (
                              <Badge bg="success">Sí</Badge>
                            ) : (
                              <Badge bg="secondary">No</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FaClipboardList size={48} className="mb-3" />
                  <p>No se encontraron diagnósticos para este paciente.</p>
                </div>
              )}
            </div>
          </Tab>

          <Tab 
            eventKey="citas" 
            title={
              <span>
                <FaCalendar className="me-2" />
                Citas ({citas.length})
              </span>
            }
          >
            <div className="p-4">
              {loadingCitas ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-3 text-muted">Cargando citas...</p>
                </div>
              ) : citas.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Terapeuta</th>
                        <th>Tipo de Terapia</th>
                        <th>Duración</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map((cita) => (
                        <tr key={cita.id_cita}>
                          <td>{formatDate(cita.fecha)}</td>
                          <td>{cita.hora_inicio} - {cita.hora_fin}</td>
                          <td>
                            {cita.terapeuta?.nombre} {cita.terapeuta?.apellido}
                          </td>
                          <td>{cita.tipo_terapia}</td>
                          <td>{cita.duracion_min} min</td>
                          <td>
                            <Badge bg={getEstadoBadge(cita.estado)}>
                              {cita.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FaCalendar size={48} className="mb-3" />
                  <p>No se encontraron citas para este paciente.</p>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between align-items-center" style={{ borderTop: "2px solid #e9ecef" }}>
        <div>
          {(diagnosticos.length > 0 || citas.length > 0) && (
            <PDFDownloadLink
              document={<ExpedienteReport paciente={paciente} diagnosticos={diagnosticos} citas={citas} />}
              fileName={`Expediente_${paciente.nombre}_${paciente.apellido}.pdf`}
              className="btn btn-success"
              style={{ borderRadius: "8px", fontWeight: "500" }}
            >
              {({ loading }) => (
                <span className="d-flex align-items-center">
                  <FaFilePdf className="me-2" />
                  {loading ? "Generando..." : "Exportar Expediente PDF"}
                </span>
              )}
            </PDFDownloadLink>
          )}
        </div>
        <Button variant="secondary" onClick={handleClose} style={{ borderRadius: "8px" }}>
          <FaTimes className="me-2" />
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExpedientePaciente;

