import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaConciergeBell, FaDollarSign, FaToggleOn, FaToggleOff } from 'react-icons/fa';

interface Servicio {
  id_servicio?: number;
  nombre: string;
  costo: number;
  estado: boolean;
}

interface ServiciosFormModalProps {
  servicioEditar: Servicio | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

function ServiciosForm({ show, handleClose, handleSubmit, servicioEditar }: ServiciosFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState<number>(0);
  const [estado, setEstado] = useState<boolean>(true);

  useEffect(() => {
    if (servicioEditar) {
      setNombre(servicioEditar.nombre);
      setCosto(parseFloat(servicioEditar.costo.toString()));
      setEstado(servicioEditar.estado);
    } else {
      setNombre('');
      setCosto(0);
      setEstado(true);
    }
  }, [servicioEditar]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      alert("Por favor ingrese un nombre para el servicio.");
      return;
    }

    if (costo < 0) {
      alert("El costo no puede ser negativo.");
      return;
    }

    const servicio: Servicio = { nombre, costo, estado };
    
    if (servicioEditar && servicioEditar.id_servicio) {
      axios.put(`http://localhost:3002/Api/servicios/updateServicio?servicio_id=${servicioEditar.id_servicio}`, servicio)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          const errorMessage = error.response?.data?.error || error.message || 'Error al editar servicio';
          alert(errorMessage);
          console.error('Error al editar servicio:', error);
        });
    } else {
      axios.post('http://localhost:3002/Api/servicios/insertServicio', servicio)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          const errorMessage = error.response?.data?.error || error.message || 'Error al crear servicio';
          alert(errorMessage);
          console.error('Error al crear servicio:', error);
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
            <FaConciergeBell className="me-2" size={24} />
            <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
              {servicioEditar ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                  <FaConciergeBell className="me-2" />
                  Nombre del Servicio
                </Form.Label>
                <Form.Control
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej: Terapia de Lenguaje"
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
                  <FaDollarSign className="me-2" />
                  Costo (L.)
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={costo}
                  onChange={(e) => setCosto(parseFloat(e.target.value) || 0)}
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
                  {estado ? <FaToggleOn className="me-2" size={20} /> : <FaToggleOff className="me-2" size={20} />}
                  Estado
                </Form.Label>
                <Form.Select
                  value={estado ? 'true' : 'false'}
                  onChange={(e) => setEstado(e.target.value === 'true')}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
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
              {servicioEditar ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ServiciosForm;

