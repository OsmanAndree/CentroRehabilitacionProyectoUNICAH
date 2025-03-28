import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Detalle {
  id_producto: number;
  cantidad: number;
  costo_unitario: number;
}

interface Compra {
  id_compra?: number;
  fecha: string;
  donante: string;
  total: number;
  detalle: Detalle[];
}

interface Producto {
  id_producto: number;
  nombre: string;
}

interface ComprasFormModalProps {
  compraEditar: Compra | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

function ComprasForm({ compraEditar, show, handleClose, handleSubmit }: ComprasFormModalProps) {
  const [fecha, setFecha] = useState('');
  const [donante, setDonante] = useState('');
  const [total, setTotal] = useState<number>(0);
  const [detalle, setDetalle] = useState<Detalle[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3002/Api/productos/getProductos')
      .then(response => {
        setProductos(response.data.result);
      })
      .catch(error => {
        console.error("Error al obtener productos:", error);
      });
  }, []);

  useEffect(() => {
    if (compraEditar) {
      setFecha(compraEditar.fecha);
      setDonante(compraEditar.donante);
      setDetalle(
        (compraEditar.detalle || []).map(det => ({
          ...det,
          cantidad: Number(det.cantidad),
          costo_unitario: Number(det.costo_unitario)
        }))
      );
    } else {
      setFecha('');
      setDonante('');
      setDetalle([]);
    }
  }, [compraEditar]);

  useEffect(() => {
    const totalCalculado = detalle.reduce(
      (acc, det) => acc + (Number(det.cantidad) * Number(det.costo_unitario)),
      0
    );
    setTotal(totalCalculado);
  }, [detalle]);

  const handleAddDetalle = () => {
    setDetalle([...detalle, { id_producto: 0, cantidad: 0, costo_unitario: 0 }]);
  };

  const handleDetalleChange = (index: number, field: keyof Detalle, value: string) => {
    const newDetalle = [...detalle];
    if (field === 'id_producto' || field === 'cantidad') {
      newDetalle[index][field] = parseInt(value) || 0;
    } else if (field === 'costo_unitario') {
      newDetalle[index][field] = parseFloat(value) || 0;
    }
    setDetalle(newDetalle);
  };

  const handleRemoveDetalle = (index: number) => {
    const newDetalle = detalle.filter((_, i) => i !== index);
    setDetalle(newDetalle);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const compra: Compra = { fecha, donante, total, detalle };
    if (compraEditar && compraEditar.id_compra) {
      axios.put(`http://localhost:3002/Api/compras/updateCompra?id_compra=${compraEditar.id_compra}`, compra)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => console.error("Error al actualizar la compra:", error));
    } else {
      axios.post('http://localhost:3002/Api/compras/createCompra', compra)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => console.error("Error al crear la compra:", error));
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>{compraEditar ? 'Editar Compra' : 'Crear Compra'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control 
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Donante</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Ingrese el donante"
                  value={donante}
                  onChange={(e) => setDonante(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Total</Form.Label>
                <Form.Control 
                  type="number"
                  placeholder="Total"
                  value={total || ""}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <h5 className="mb-3">Detalle Compras</h5>
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Costo Unitario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((det, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Select
                          value={det.id_producto || ""}
                          onChange={(e) => handleDetalleChange(index, 'id_producto', e.target.value)}
                          required
                        >
                          <option value="">Seleccione un producto</option>
                          {productos.map(p => (
                            <option key={p.id_producto} value={p.id_producto}>
                              {p.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={det.cantidad || ""}
                          onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={det.costo_unitario || ""}
                          onChange={(e) => handleDetalleChange(index, 'costo_unitario', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => handleRemoveDetalle(index)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button variant="outline-primary" size="sm" onClick={handleAddDetalle}>
                <FaPlus className="me-1" /> Agregar Detalle
              </Button>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="success" type="submit">{compraEditar ? 'Guardar Cambios' : 'Crear Compra'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ComprasForm;