import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';

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
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>{bodegaEditar ? 'Editar Registro de Bodega' : 'Crear Registro de Bodega'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-3">
            <Col md={6}>
            <Form.Group className="mb-3">
            <Form.Label>Producto</Form.Label>
            <Form.Control
              as="select"
              value={idProducto}
              onChange={(e) => setIdProducto(Number(e.target.value))}
              required
            >
              <option value="">Seleccione un producto</option>
              {producto.map((producto: { id_producto: number, nombre: string }) => (
                <option key={producto.id_producto} value={producto.id_producto}>
                  {producto.nombre}
                </option>
              ))}
            </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese la cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                required
               />
</Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                <Form.Label>Ubicación</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese la ubicación"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    required
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="success" type="submit" className="me-2">
              {bodegaEditar ? 'Guardar Cambios' : 'Crear Registro de Bodega'}
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default BodegaFormModal;