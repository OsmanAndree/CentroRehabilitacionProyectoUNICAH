import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaTrash, FaShoppingCart, FaCalendarAlt, FaHandHoldingUsd, FaMoneyBillWave, FaBoxes } from 'react-icons/fa';
import ProductosForm from './ProductosForm'; 

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
  abrirFormularioProductos: () => void; 
}

function ComprasForm({ compraEditar, show, handleClose, handleSubmit, abrirFormularioProductos }: ComprasFormModalProps) {
  const [fecha, setFecha] = useState('');
  const [donante, setDonante] = useState('');
  const [total, setTotal] = useState<number>(0);
  const [detalle, setDetalle] = useState<Detalle[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showProductosForm, setShowProductosForm] = useState(false);

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
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; 
      setFecha(formattedDate);
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

    const compra: Compra = { 
        fecha, 
        donante, 
        total, 
        detalle: detalle.map(det => ({
            id_producto: det.id_producto,
            cantidad: Number(det.cantidad),
            costo_unitario: Number(det.costo_unitario)
        }))
    };

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

  const handleProductoCreado = () => {
    axios.get('http://localhost:3002/Api/productos/getProductos')
      .then(response => {
        setProductos(response.data.result);
        setShowProductosForm(false);
        handleClose();
      })
      .catch(error => console.error("Error al obtener productos:", error));
  };

  const abrirFormularioProductosLocal = () => {
    abrirFormularioProductos(); 
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="xl" 
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
            <FaShoppingCart className="me-2" size={24} />
            <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
              {compraEditar ? 'Editar Compra' : 'Nueva Compra'}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "2rem" }}>
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaCalendarAlt className="me-2" />
                  Fecha
                </Form.Label>
                <Form.Control 
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaHandHoldingUsd className="me-2" />
                  Donante
                </Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Ingrese el donante"
                  value={donante}
                  onChange={(e) => setDonante(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaMoneyBillWave className="me-2" />
                  Total
                </Form.Label>
                <Form.Control 
                  type="number"
                  placeholder="Total"
                  value={total || ""}
                  readOnly
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
            <Col>
              <h5 className="mb-3 fw-semibold d-flex align-items-center">
                <FaBoxes className="me-2" />
                Detalle Compras
              </h5>
              <Table responsive striped bordered hover className="shadow-sm">
                <thead className="bg-light">
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
                        <div className="d-flex align-items-center gap-2">
                          <Form.Select
                            value={det.id_producto || ""}
                            onChange={(e) => handleDetalleChange(index, 'id_producto', e.target.value)}
                            required
                            style={{
                              padding: "0.75rem",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "8px"
                            }}
                          >
                            <option value="">Seleccione un producto</option>
                            {productos.map(p => (
                              <option key={p.id_producto} value={p.id_producto}>
                                {p.nombre}
                              </option>
                            ))}
                          </Form.Select>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={abrirFormularioProductos} 
                            style={{
                              padding: "0.2rem 0.6rem",
                              borderRadius: "8px"
                            }}
                          >
                            <FaPlus /> Nuevo
                          </Button>
                        </div>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={det.cantidad || ""}
                          onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                          required
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px"
                          }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={det.costo_unitario || ""}
                          onChange={(e) => handleDetalleChange(index, 'costo_unitario', e.target.value)}
                          required
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px"
                          }}
                        />
                      </td>
                      <td className="text-center align-middle">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleRemoveDetalle(index)}
                            style={{
                              borderRadius: "8px"
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleAddDetalle}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px"
                }}
              >
                <FaPlus className="me-1" /> Agregar Detalle
              </Button>
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
              {compraEditar ? 'Guardar Cambios' : 'Crear Compra'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
      {/* Modal para crear un nuevo producto */}
      {showProductosForm && (
        <ProductosForm
          productoEditar={null}
          show={showProductosForm}
          handleClose={() => setShowProductosForm(false)} 
          handleSubmit={handleProductoCreado} 
        />
      )}
    </Modal>
  );
}

export default ComprasForm;