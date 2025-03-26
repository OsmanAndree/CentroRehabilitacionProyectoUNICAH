import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaWarehouse, FaBox, FaHashtag, FaMapMarkerAlt } from 'react-icons/fa';

interface Bodega {
    id_bodega?: number;
    id_producto: number;
    cantidad: number;
    ubicacion: string;
}

interface BodegaFormModalProps {
    bodegaEditar: Bodega | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
}

function BodegaFormModal({
    show,
    handleClose,
    handleSubmit,
    bodegaEditar,
}: BodegaFormModalProps) {
    const [producto, setProducto] = useState([]);
    const [idProducto, setIdProducto] = useState<number>(1);
    const [cantidad, setCantidad] = useState<number>(0);
    const [ubicacion, setUbicacion] = useState('');

    useEffect(() => {
      axios.get('http://localhost:3002/Api/productos/getProductos')
          .then(response => {
              setProducto(response.data.result);
              if (bodegaEditar) {
                  setIdProducto(bodegaEditar.id_producto);
                  setCantidad(bodegaEditar.cantidad);
                  setUbicacion(bodegaEditar.ubicacion || '');
              }
          })
          .catch(error => {
              console.error('Error al obtener los registros de bodegas', error);
          });
  }, [bodegaEditar]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bodega: Bodega = {
      id_producto: idProducto,
      cantidad,
      ubicacion,
    };

    if (bodegaEditar && bodegaEditar.id_bodega) {
      axios.put(`http://localhost:3002/Api/bodega/UpdateBodega?bodega_id=${bodegaEditar.id_bodega}`, bodega)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al editar registro de bodega:', error);
        });
    } else {
      axios.post('http://localhost:3002/Api/bodega/InsertBodega', bodega)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          console.error('Error al crear registro de bodega:', error);
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
            <FaWarehouse className="me-2" size={24} />
            <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
              {bodegaEditar ? 'Editar Registro de Bodega' : 'Nuevo Registro de Bodega'}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "2rem" }}>
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2">
                  <FaBox className="me-2" />
                  Producto
                </Form.Label>
                <Form.Select
                  value={idProducto}
                  onChange={(e) => setIdProducto(Number(e.target.value))}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="">Seleccione un producto</option>
                  {producto.map((producto: { id_producto: number, nombre: string }) => (
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
                  <FaHashtag className="me-2" />
                  Cantidad
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese la cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    textAlign: "center"
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaMapMarkerAlt className="me-2" />
                  Ubicación
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese la ubicación"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                />
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
              {bodegaEditar ? 'Guardar Cambios' : 'Crear Registro'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default BodegaFormModal;