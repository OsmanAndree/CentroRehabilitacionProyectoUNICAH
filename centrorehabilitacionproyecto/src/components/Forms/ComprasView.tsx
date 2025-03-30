import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Table, Row, Col, Card } from 'react-bootstrap';
import { FaShoppingCart, FaCalendarAlt, FaHandHoldingUsd, FaMoneyBillWave, FaBoxes, FaTimes } from 'react-icons/fa';

interface Detalle {
  id_detalle: number;
  id_producto: number;
  cantidad: number;
  costo_unitario: number;
}

interface Compra {
  id_compra: number;
  fecha: string;
  donante: string;
  total: number;  
  detalle: Detalle[];
}

interface Producto {
  id_producto: number;
  nombre: string;
}

interface ComprasViewProps {
  show: boolean;
  handleClose: () => void;
  compra: Compra | null;
}

function ComprasView({ show, handleClose, compra }: ComprasViewProps) {
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

  const getNombreProducto = (id: number) => {
    const producto = productos.find(p => p.id_producto === id);
    return producto ? producto.nombre : id;
  };

  if (!compra) return null;
  const formatTotal = (total: any) => {
    const numTotal = Number(total);
    return isNaN(numTotal) ? '0.00' : numTotal.toFixed(2);
  };

  const formatCosto = (costo: any) => {
    const numCosto = Number(costo);
    return isNaN(numCosto) ? '0.00' : numCosto.toFixed(2);
  };

  const calcularSubtotal = (cantidad: any, costo: any) => {
    const numCantidad = Number(cantidad);
    const numCosto = Number(costo);
    
    if (isNaN(numCantidad) || isNaN(numCosto)) {
      return '0.00';
    }
    
    return (numCantidad * numCosto).toFixed(2);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
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
              Detalles de Compra
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "2rem" }}>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt className="text-success me-2" />
                    <span className="fw-semibold">Fecha:</span>
                  </div>
                  <div className="ps-4">
                    {compra.fecha ? new Date(compra.fecha + 'T00:00:00').toLocaleDateString('es-ES') : 'Fecha no disponible'}
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaHandHoldingUsd className="text-success me-2" />
                    <span className="fw-semibold">Donante:</span>
                  </div>
                  <div className="ps-4">
                    {compra.donante || 'No especificado'}
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaMoneyBillWave className="text-success me-2" />
                    <span className="fw-semibold">Total:</span>
                  </div>
                  <div className="ps-4">
                    L. {formatTotal(compra.total)}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="mb-3 d-flex align-items-center">
          <FaBoxes className="text-success me-2" />
          <h5 className="fw-semibold mb-0">Detalles de la Compra</h5>
        </div>
        
        <Table responsive striped bordered hover className="shadow-sm">
          <thead className="bg-light">
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Costo Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {compra.detalle && compra.detalle.length > 0 ? (
              compra.detalle.map((det, index) => (
                <tr key={det.id_detalle || index}>
                  <td>{getNombreProducto(det.id_producto)}</td>
                  <td>{det.cantidad}</td>
                  <td>L. {formatCosto(det.costo_unitario)}</td>
                  <td>L. {calcularSubtotal(det.cantidad, det.costo_unitario)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-3">No hay detalles disponibles</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer className="border-0 d-flex justify-content-end" style={{ padding: "1rem 2rem 2rem" }}>
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px"
          }}
        >
          <FaTimes className="me-2" /> Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ComprasView;