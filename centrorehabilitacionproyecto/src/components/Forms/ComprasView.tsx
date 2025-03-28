import React from 'react';
import { Button, Modal, Table } from 'react-bootstrap';

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

interface ComprasViewProps {
  show: boolean;
  handleClose: () => void;
  compra: Compra | null;
}

function ComprasView({ show, handleClose, compra }: ComprasViewProps) {
  if (!compra) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>Ver Compra</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Fecha:</strong> {new Date(compra.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</p>
        <p><strong>Donante:</strong> {compra.donante}</p>
        <p><strong>Total:</strong> {compra.total}</p>
        <h6>Detalles Compras:</h6>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Costo Unitario</th>
            </tr>
          </thead>
          <tbody>
            {compra.detalle.map(det => (
              <tr key={det.id_detalle}>
                <td>{det.id_producto}</td>
                <td>{det.cantidad}</td>
                <td>{det.costo_unitario}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ComprasView;