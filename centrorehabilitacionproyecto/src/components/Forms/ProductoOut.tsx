import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaBox, FaWarehouse } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Bodega {
  id_bodega: number;
  id_producto: number;
  cantidad: number;
  ubicacion: string;
  producto: {
    nombre: string;
  };
}

interface ProductoOutProps {
  show: boolean;
  handleClose: () => void;
  bodega: Bodega | null;
  onSuccess: () => void;
}

const ProductoOut: React.FC<ProductoOutProps> = ({ show, handleClose, bodega, onSuccess }) => {
  const [cantidad, setCantidad] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (show) {
      setCantidad(1);
      setError('');
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bodega) {
      setError('No se ha seleccionado un producto de bodega');
      return;
    }

    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (cantidad > bodega.cantidad) {
      setError(`No hay suficiente stock. Stock disponible: ${bodega.cantidad}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const productoResponse = await axios.get(`http://localhost:3002/Api/productos/getProductos`);
      const productos = productoResponse.data.result;
      const productoActual = productos.find((p: any) => p.id_producto === bodega.id_producto);
      
      if (!productoActual) {
        throw new Error('No se encontró el producto en el inventario');
      }
      
      const nuevoStockProducto = productoActual.cantidad_disponible + cantidad;
      await axios.put(`http://localhost:3002/Api/productos/updateProductos?producto_id=${bodega.id_producto}`, {
        ...productoActual,
        cantidad_disponible: nuevoStockProducto
      });
      
      await axios.put(`http://localhost:3002/Api/bodega/UpdateBodega?bodega_id=${bodega.id_bodega}`, {
        id_bodega: bodega.id_bodega,
        id_producto: bodega.id_producto,
        cantidad: bodega.cantidad - cantidad,
        ubicacion: bodega.ubicacion
      });

      toast.success(`Se han sacado ${cantidad} unidades de ${bodega.producto.nombre} exitosamente`);
      toast.info(`Stock en Productos actualizado: ${nuevoStockProducto} unidades disponibles`);
      onSuccess(); 
      handleClose(); 
    } catch (error) {
      console.error('Error al sacar producto:', error);
      setError('Ocurrió un error al procesar la solicitud');
      toast.error('No se pudo completar la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header 
        className="bg-gradient py-3"
        style={{ 
          backgroundColor: "#f0ad4e",
          borderRadius: "0.5rem 0.5rem 0 0",
          border: "none"
        }}
      >
        <div className="d-flex align-items-center">
          <FaBox size={24} className="text-white me-2" />
          <h5 className="mb-0 text-white" style={{ fontWeight: '600' }}>
            Sacar Producto de Bodega
          </h5>
        </div>
        <Button 
          variant="link" 
          onClick={handleClose} 
          className="text-white p-0 ms-auto"
          style={{ fontSize: '1.5rem', textDecoration: 'none' }}
        >
          &times;
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        
        {bodega && (
          <Form onSubmit={handleSubmit}>
            <div className="mb-4 p-3 border rounded bg-light">
              <div className="d-flex align-items-center mb-2">
                <FaWarehouse className="text-muted me-2" />
                <h6 className="mb-0">Información del Producto</h6>
              </div>
              <p className="mb-1"><strong>Producto:</strong> {bodega.producto.nombre}</p>
              <p className="mb-1"><strong>Ubicación:</strong> {bodega.ubicacion}</p>
              <p className="mb-0">
                <strong>Stock Disponible:</strong>{' '}
                <span className={`badge ${
                  bodega.cantidad > 10 ? 'bg-success' :
                  bodega.cantidad > 5 ? 'bg-warning' :
                  'bg-danger'
                }`} style={{ fontSize: '0.9rem' }}>
                  {bodega.cantidad}
                </span>
              </p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Cantidad a Sacar</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max={bodega.cantidad}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                required
                style={{
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                }}
              />
              <Form.Text className="text-muted">
                Ingrese la cantidad de unidades que desea sacar de bodega.
              </Form.Text>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 pb-3 px-4">
        <Button 
          variant="secondary" 
          onClick={handleClose}
          style={{ borderRadius: "0.5rem" }}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          variant="warning" 
          onClick={handleSubmit}
          style={{ borderRadius: "0.5rem" }}
          disabled={loading || !bodega || cantidad <= 0 || cantidad > (bodega?.cantidad || 0)}
        >
          {loading ? 'Procesando...' : 'Confirmar Salida'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductoOut;