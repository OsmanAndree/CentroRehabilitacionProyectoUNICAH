import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-date-picker';
import { FaUser, FaPhone, FaMapMarkerAlt, FaUserFriends, FaCalendarAlt } from 'react-icons/fa';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

interface Paciente {
  id_paciente?: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  telefono: string;
  direccion: string;
  id_encargado: number;
}

interface PacientesFormModalProps {
  pacienteEditar: Paciente | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

function PacientesFormModal({
  show,
  handleClose,
  handleSubmit,
  pacienteEditar,
}: PacientesFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [encargados, setEncargados] = useState([]);
  const [idEncargado, setIdEncargado] = useState<number>(1);

  useEffect(() => {
    axios.get('http://localhost:3002/Api/encargados/getencargados')
      .then(response => {
        setEncargados(response.data.result);
        if (pacienteEditar) {
          setNombre(pacienteEditar.nombre);
          setApellido(pacienteEditar.apellido);
          setFechaNacimiento(new Date(pacienteEditar.fecha_nacimiento));
          setTelefono(pacienteEditar.telefono || '');
          setDireccion(pacienteEditar.direccion || '');
          setIdEncargado(pacienteEditar.id_encargado);
        }
      })
      .catch(error => {
        console.error('Error al obtener los encargados', error);
      });
  }, [pacienteEditar]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paciente: Paciente = {
      nombre,
      apellido,
      fecha_nacimiento: fechaNacimiento.toISOString(),
      telefono,
      direccion,
      id_encargado: idEncargado,
    };

    if (pacienteEditar && pacienteEditar.id_paciente) {
      axios.put(`http://localhost:3002/Api/pacientes/updatepacientes?paciente_id=${pacienteEditar.id_paciente}`, paciente)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al editar paciente:', error);
        });
    } else {
      axios.post('http://localhost:3002/Api/pacientes/insertpacientes', paciente)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al crear paciente:', error);
        });
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
            <FaUser className="me-2" size={24} />
            <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
              {pacienteEditar ? 'Editar Paciente' : 'Nuevo Paciente'}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "2rem" }}>
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">Nombre</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <FaUser className="text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    style={{
                      borderLeft: "none",
                      padding: "0.75rem",
                      backgroundColor: "#f8f9fa"
                    }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">Apellido</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <FaUser className="text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    style={{
                      borderLeft: "none",
                      padding: "0.75rem",
                      backgroundColor: "#f8f9fa"
                    }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaCalendarAlt className="me-2" />
                  Fecha de Nacimiento
                </Form.Label>
                <div className="custom-datepicker-container">
                  <DatePicker 
                    onChange={(value) => {
                      const dateValue = value as Date | null;
                      if (dateValue) {
                        setFechaNacimiento(dateValue);
                      }
                    }}
                    value={fechaNacimiento}
                    className="form-control custom-datepicker"
                    format="dd-MM-y"
                    dayPlaceholder="dd"
                    monthPlaceholder="mm"
                    yearPlaceholder="aaaa"
                    calendarIcon={null}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaPhone className="me-2" />
                  Teléfono
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Ingrese el teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa"
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold mb-2">
              <FaMapMarkerAlt className="me-2" />
              Dirección
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese la dirección completa"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              style={{
                padding: "0.75rem",
                backgroundColor: "#f8f9fa"
              }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold mb-2">
              <FaUserFriends className="me-2" />
              Encargado
            </Form.Label>
            <Form.Select
              value={idEncargado}
              onChange={(e) => setIdEncargado(Number(e.target.value))}
              required
              style={{
                padding: "0.75rem",
                backgroundColor: "#f8f9fa"
              }}
            >
              <option value="">Seleccione un encargado</option>
              {encargados.map((encargado: { id_encargado: number, nombre: string, apellido: string }) => (
                <option key={encargado.id_encargado} value={encargado.id_encargado}>
                  {encargado.nombre} {encargado.apellido}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

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
              {pacienteEditar ? 'Guardar Cambios' : 'Crear Paciente'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PacientesFormModal;
