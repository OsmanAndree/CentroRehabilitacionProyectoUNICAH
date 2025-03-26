import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FaCalendar, FaUserClock, FaClock, FaUser, FaNotesMedical, FaClipboardCheck } from 'react-icons/fa';

interface Cita {
  id_cita?: number;
  id_paciente: number;
  id_terapeuta: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  tipo_terapia?: string;
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
}

interface CitasFormModalProps {
  citaEditar: Cita | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

function CitasFormModal({
  show,
  handleClose,
  handleSubmit,
  citaEditar,
}: CitasFormModalProps) {
  const [idTerapeuta, setIdTerapeuta] = useState<number>(1);
  const [fecha, setFecha] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [tipoTerapia, setTipoTerapia] = useState('');
  const [idPaciente, setIdPaciente] = useState<number>(1);
  const [estado, setEstado] = useState<'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada'>('Pendiente');

  const [terapeutas, setTerapeutas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [blockedIntervals, setBlockedIntervals] = useState<{ id: number; inicio: string; fin: string }[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3002/Api/terapeutas/getterapeutas')
      .then(response => setTerapeutas(response.data.result))
      .catch(error => console.error('Error al obtener terapeutas', error));

    axios.get('http://localhost:3002/Api/pacientes/getpacientes')
      .then(response => setPacientes(response.data.result))
      .catch(error => console.error('Error al obtener pacientes', error));
  }, []);

  useEffect(() => {
    if (citaEditar) {
      const terapeutaId = citaEditar.terapeuta?.id_terapeuta || 1;
      const fechaVal = parseLocalDate(citaEditar.fecha);
      setIdTerapeuta(terapeutaId);
      setFecha(fechaVal);
      setHoraInicio(citaEditar.hora_inicio);
      setHoraFin(citaEditar.hora_fin);
      setIdPaciente(citaEditar.id_paciente);
      setEstado(citaEditar.estado);
      setTipoTerapia(citaEditar.tipo_terapia || '');

      const fechaStr = formatLocalDate(fechaVal);
      axios.get(`http://localhost:3002/Api/citas/getcitas?fecha=${fechaStr}&id_terapeuta=${terapeutaId}`)
        .then(response => {
          const intervals = response.data.result
            .map((cita: any) => ({
              id: cita.id_cita,
              inicio: cita.hora_inicio,
              fin: cita.hora_fin
            }))
            .sort((a: any, b: any) => a.inicio.localeCompare(b.inicio));
          setBlockedIntervals(intervals);
        })
        .catch(error => console.error("Error obteniendo citas del terapeuta:", error));
    }
  }, [citaEditar]);

  useEffect(() => {
    const fechaStr = formatLocalDate(fecha);
    axios.get(`http://localhost:3002/Api/citas/getcitas?fecha=${fechaStr}&id_terapeuta=${idTerapeuta}`)
      .then(response => {
        const intervals = response.data.result
          .map((cita: any) => ({
            id: cita.id_cita,
            inicio: cita.hora_inicio,
            fin: cita.hora_fin
          }))
          .sort((a: any, b: any) => a.inicio.localeCompare(b.inicio));
        setBlockedIntervals(intervals);
      })
      .catch(error => console.error("Error obteniendo citas del terapeuta:", error));
  }, [fecha, idTerapeuta]);

  useEffect(() => {
    if (horaInicio && tipoTerapia) {
      const [hh, mm] = horaInicio.split(':').map(Number);
      const duracion = tipoTerapia === 'Fisica' ? 30 : (tipoTerapia === 'Neurologica' ? 20 : 0);
      if (duracion > 0) {
        const inicioDate = new Date();
        inicioDate.setHours(hh, mm, 0, 0);
        const finDate = new Date(inicioDate.getTime() + duracion * 60000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        setHoraFin(`${pad(finDate.getHours())}:${pad(finDate.getMinutes())}:00`);
      }
    }
  }, [horaInicio, tipoTerapia]);

  const handleHoraInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoraInicio(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duracion = tipoTerapia === 'Fisica' ? 30 : (tipoTerapia === 'Neurologica' ? 20 : 0);
    const [hStart, mStart] = horaInicio.split(':').map(Number);
    const newStart = hStart * 60 + mStart;
    const [hEnd, mEnd] = horaFin.split(':').map(Number);
    const newEnd = hEnd * 60 + mEnd;

    const intervalConflict = blockedIntervals.some(interval => {
      if (citaEditar && interval.id === citaEditar.id_cita) return false;
      const [bHStart, bMStart] = interval.inicio.split(':').map(Number);
      const [bHEnd, bMEnd] = interval.fin.split(':').map(Number);
      const blockedStart = bHStart * 60 + bMStart;
      const blockedEnd = bHEnd * 60 + bMEnd;
      return newStart < blockedEnd && newEnd > blockedStart;
    });
    if (intervalConflict) {
      alert("El intervalo de tiempo seleccionado se superpone con otra cita.");
      return;
    }

    const cita = {
      fecha: formatLocalDate(fecha),
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      id_paciente: idPaciente,
      id_terapeuta: idTerapeuta,
      estado,
      tipo_terapia: tipoTerapia,
      duracion_min: duracion
    };
    if (citaEditar && citaEditar.id_cita) {
      (cita as any).id_cita = citaEditar.id_cita;
      axios.put(`http://localhost:3002/Api/citas/updatecita?cita_id=${citaEditar.id_cita}`, cita)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => console.error('Error al editar cita:', error));
    } else {
      axios.post('http://localhost:3002/Api/citas/insertcita', cita)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => console.error('Error al crear cita:', error));
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered
      size="lg"
      backdrop="static"
      className="custom-modal"
    >
      <Modal.Header 
        className="border-0 position-relative"
        style={{
          background: "linear-gradient(135deg, #2E8B57 0%, #1a5735 100%)",
          borderRadius: "15px 15px 0 0",
          padding: "1.5rem"
        }}
      >
        <Modal.Title className="text-white">
          <div className="d-flex align-items-center">
            <FaCalendar className="me-2" size={24} />
            <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
              {citaEditar ? 'Editar Cita' : 'Nueva Cita'}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "2rem" }}>
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaUserClock className="me-2" />
                  Terapeuta
                </Form.Label>
                <Form.Select
                  value={idTerapeuta}
                  onChange={(e) => setIdTerapeuta(Number(e.target.value))}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="">Seleccione un terapeuta</option>
                  {terapeutas.map((terapeuta) => (
                    <option key={terapeuta.id_terapeuta} value={terapeuta.id_terapeuta}>
                      {terapeuta.nombre} {terapeuta.apellido}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaCalendar className="me-2" />
                  Fecha
                </Form.Label>
                <div className="custom-datepicker-container">
                  <DatePicker 
                    onChange={(value) => setFecha(value ? (value as Date) : new Date())}
                    value={fecha}
                    className="form-control custom-datepicker"
                    clearIcon={null}
                    calendarIcon={null}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {blockedIntervals.length > 0 && (
            <div className="mb-4 p-3" style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}>
              <strong className="d-block mb-2">
                <FaClock className="me-2" />
                Horarios ocupados para esta fecha:
              </strong>
              <ul className="list-unstyled mb-0">
                {blockedIntervals.map((interval, i) => (
                  <li key={i} className="text-muted">
                    • {interval.inicio} - {interval.fin}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaClock className="me-2" />
                  Hora de Inicio
                </Form.Label>
                <Form.Control
                  type="time"
                  value={horaInicio}
                  onChange={handleHoraInicioChange}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaClock className="me-2" />
                  Hora de Fin
                </Form.Label>
                <Form.Control
                  type="time"
                  value={horaFin}
                  disabled
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaNotesMedical className="me-2" />
                  Tipo de Terapia
                </Form.Label>
                <Form.Select
                  value={tipoTerapia}
                  onChange={(e) => setTipoTerapia(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="">Seleccione un tipo de terapia</option>
                  <option value="Fisica">Terapia Física (30 min)</option>
                  <option value="Neurologica">Terapia Neurológica (20 min)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaClipboardCheck className="me-2" />
                  Estado
                </Form.Label>
                <Form.Select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada')}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Completada">Completada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaUser className="me-2" />
                  Paciente
                </Form.Label>
                <Form.Select
                  value={idPaciente}
                  onChange={(e) => setIdPaciente(Number(e.target.value))}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="">Seleccione un paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id_paciente} value={paciente.id_paciente}>
                      {paciente.nombre} {paciente.apellido}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px"
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="success" 
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                backgroundColor: "#2E8B57"
              }}
            >
              {citaEditar ? 'Guardar Cambios' : 'Crear Cita'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default CitasFormModal;