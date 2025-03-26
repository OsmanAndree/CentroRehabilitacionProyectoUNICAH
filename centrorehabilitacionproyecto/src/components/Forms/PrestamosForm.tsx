import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaClipboard, FaUser, FaBox, FaCalendarAlt } from 'react-icons/fa';

interface Prestamo {
  id_prestamo?: number;
  id_paciente: number;
  id_producto: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: 'Prestado' | 'Devuelto'; 
}

interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
}

interface Producto {
  id_producto: number;
  nombre: string;
}

interface PrestamosFormModalProps {
  prestamoEditar: Prestamo | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

function PrestamosForm({
  show,
  handleClose,
  handleSubmit,
  prestamoEditar,
}: PrestamosFormModalProps) {
  const [idPaciente, setIdPaciente] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [fechaPrestamo, setFechaPrestamo] = useState('');
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const [estado, setEstado] = useState<'Prestado' | 'Devuelto'>('Prestado');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3002/Api/pacientes/getPacientes')
      .then(response => setPacientes(response.data.result))
      .catch(error => console.error('Error al cargar pacientes:', error));

    axios.get('http://localhost:3002/Api/productos/getProductos')
      .then(response => setProductos(response.data.result))
      .catch(error => console.error('Error al cargar productos:', error));

    if (prestamoEditar) {
      setIdPaciente(prestamoEditar.id_paciente.toString());
      setIdProducto(prestamoEditar.id_producto.toString());
      setFechaPrestamo(prestamoEditar.fecha_prestamo);
      setFechaDevolucion(prestamoEditar.fecha_devolucion);
      setEstado(prestamoEditar.estado); // Incluir el estado
    } else {
      setIdPaciente('');
      setIdProducto('');
      setFechaPrestamo('');
      setFechaDevolucion('');
      setEstado('Prestado'); // Incluir el estado
    }
  }, [prestamoEditar]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prestamo: Prestamo = {
      id_paciente: parseInt(idPaciente),
      id_producto: parseInt(idProducto),
      fecha_prestamo: fechaPrestamo,
      fecha_devolucion: fechaDevolucion,
      estado, // Incluir el estado
    };

    if (prestamoEditar && prestamoEditar.id_prestamo) {
      axios.put(`http://localhost:3002/Api/prestamos/updatePrestamos?prestamo_id=${prestamoEditar.id_prestamo}`, prestamo)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al editar préstamo:', error);
        });
    } else {
      axios.post('http://localhost:3002/Api/prestamos/insertPrestamos', prestamo)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al insertar préstamo:', error);
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
              {prestamoEditar ? 'Editar Préstamo' : 'Nuevo Préstamo'}
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
                <Form.Label className="fw-semibold mb-2">Producto</Form.Label>
                <Form.Select
                  value={idProducto}
                  onChange={(e) => setIdProducto(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map(producto => (
                    <option key={producto.id_producto} value={producto.id_producto}>
                      {producto.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaCalendarAlt className="me-2" />
                  Fecha de Préstamo
                </Form.Label>
                <Form.Control
                  type="date"
                  value={fechaPrestamo}
                  onChange={(e) => setFechaPrestamo(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa"
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaCalendarAlt className="me-2" />
                  Fecha de Devolución
                </Form.Label>
                <Form.Control
                  type="date"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa"
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">Estado</Form.Label>
                <Form.Select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'Prestado' | 'Devuelto')}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  <option value="Prestado">Prestado</option>
                  <option value="Devuelto">Devuelto</option>
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
              {prestamoEditar ? 'Guardar Cambios' : 'Crear Préstamo'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PrestamosForm;