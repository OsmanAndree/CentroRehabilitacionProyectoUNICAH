import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

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
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>{citaEditar ? 'Editar Cita' : 'Crear Cita'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Terapeuta</Form.Label>
                <Form.Control
                  as="select"
                  value={idTerapeuta}
                  onChange={(e) => setIdTerapeuta(Number(e.target.value))}
                  required
                >
                  <option value="">Seleccione un terapeuta</option>
                  {terapeutas.map((terapeuta: { id_terapeuta: number, nombre: string, apellido: string }) => (
                    <option key={terapeuta.id_terapeuta} value={terapeuta.id_terapeuta}>
                      {terapeuta.nombre} {terapeuta.apellido}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <DatePicker 
                  onChange={(value) => setFecha(value ? (value as Date) : new Date())}
                  value={fecha}
                  className="w-100 form-control"
                  clearIcon={null}
                  calendarIcon={null}
                />
              </Form.Group>
            </Col>
          </Row>
          {blockedIntervals.length > 0 && (
            <div className="mb-3">
              <strong>Horarios ocupados para esta fecha:</strong>
              <ul>
                {blockedIntervals.map((interval, i) => (
                  <li key={i}>{interval.inicio} - {interval.fin}</li>
                ))}
              </ul>
            </div>
          )}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Hora de Inicio</Form.Label>
                <Form.Control
                  type="time"
                  value={horaInicio}
                  step="600"
                  onChange={handleHoraInicioChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Hora de Fin</Form.Label>
                <Form.Control
                  type="time"
                  value={horaFin}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo de Terapia</Form.Label>
                <Form.Control 
                  as="select" 
                  value={tipoTerapia}
                  onChange={(e) => setTipoTerapia(e.target.value)}
                  required
                >
                  <option value="">Seleccione un tipo de terapia</option>
                  <option value="Fisica">Terapia Física (30 min)</option>
                  <option value="Neurologica">Terapia Neurológica (20 min)</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Control 
                  as="select" 
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada')}
                  required
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Completada">Completada</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Paciente</Form.Label>
                <Form.Control 
                  as="select" 
                  value={idPaciente}
                  onChange={(e) => setIdPaciente(Number(e.target.value))}
                  required
                >
                  <option value="">Seleccione un paciente</option>
                  {pacientes.map((paciente: { id_paciente: number, nombre: string, apellido: string }) => (
                    <option key={paciente.id_paciente} value={paciente.id_paciente}>
                      {paciente.nombre} {paciente.apellido}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit" className="me-2">
              {citaEditar ? 'Guardar Cambios' : 'Crear Cita'}
            </Button>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default CitasFormModal;