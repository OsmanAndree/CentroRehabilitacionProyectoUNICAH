import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaClipboard, FaUser, FaUserMd, FaFileAlt, FaPrescription } from 'react-icons/fa';

interface Diagnostico {
  id_diagnostico?: number;
  id_paciente: number;
  id_terapeuta: number;
  descripcion: string;
  tratamiento: string;
}

interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
}

interface Terapeuta {
  id_terapeuta: number;
  nombre: string;
  especialidad: string;
}

interface DiagnosticosFormModalProps {
  diagnosticoEditar: Diagnostico | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

function DiagnosticosForm({
  show,
  handleClose,
  handleSubmit,
  diagnosticoEditar,
}: DiagnosticosFormModalProps) {
  const [idPaciente, setIdPaciente] = useState('');
  const [idTerapeuta, setIdTerapeuta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3002/Api/pacientes/getPacientes')
      .then(response => setPacientes(response.data.result))
      .catch(error => console.error('Error al cargar pacientes:', error));

    axios.get('http://localhost:3002/Api/terapeutas/getTerapeutas')
      .then(response => setTerapeutas(response.data.result))
      .catch(error => console.error('Error al cargar terapeutas:', error));

    if (diagnosticoEditar) {
      setIdPaciente(diagnosticoEditar.id_paciente.toString());
      setIdTerapeuta(diagnosticoEditar.id_terapeuta.toString());
      setDescripcion(diagnosticoEditar.descripcion);
      setTratamiento(diagnosticoEditar.tratamiento);
    } else {
      setIdPaciente('');
      setIdTerapeuta('');
      setDescripcion('');
      setTratamiento('');
    }
  }, [diagnosticoEditar]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const diagnostico: Diagnostico = {
      id_paciente: parseInt(idPaciente),
      id_terapeuta: parseInt(idTerapeuta),
      descripcion,
      tratamiento,
    };

    if (diagnosticoEditar && diagnosticoEditar.id_diagnostico) {
      axios.put(`http://localhost:3002/Api/diagnostico/updateDiagnosticos?diagnostico_id=${diagnosticoEditar.id_diagnostico}`, diagnostico)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al editar diagnóstico:', error);
        });
    } else {
      axios.post('http://localhost:3002/Api/diagnostico/insertDiagnosticos', diagnostico)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al insertar diagnóstico:', error);
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
            <FaClipboard className="me-2" size={24} />
            <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
              {diagnosticoEditar ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "2rem" }}>
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">Paciente</Form.Label>
                <Form.Select
                  value={idPaciente}
                  onChange={(e) => setIdPaciente(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  <option value="">Seleccione un paciente</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id_paciente} value={paciente.id_paciente}>
                      {`${paciente.nombre} ${paciente.apellido}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">Terapeuta</Form.Label>
                <Form.Select
                  value={idTerapeuta}
                  onChange={(e) => setIdTerapeuta(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  <option value="">Seleccione un terapeuta</option>
                  {terapeutas.map(terapeuta => (
                    <option key={terapeuta.id_terapeuta} value={terapeuta.id_terapeuta}>
                      {`${terapeuta.nombre} - ${terapeuta.especialidad}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold mb-2">
              <FaFileAlt className="me-2" />
              Descripción
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese la descripción del diagnóstico"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              style={{
                padding: "0.75rem",
                backgroundColor: "#f8f9fa"
              }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold mb-2">
              <FaPrescription className="me-2" />
              Tratamiento
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese el tratamiento recomendado"
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              required
              style={{
                padding: "0.75rem",
                backgroundColor: "#f8f9fa"
              }}
            />
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
              {diagnosticoEditar ? 'Guardar Cambios' : 'Crear Diagnóstico'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default DiagnosticosForm;
