import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import ProductosForm from './Forms/ProductosForm';
import { toast } from 'react-toastify';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  cantidad_disponible: number;
}

function ProductosTable(){
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [search, setSearch] = useState<string>("");
    
    const obtenerProductos = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:3002/Api/productos/getProductos')
        .then(response => {
            setProductos(response.data.result);
        })
        .catch(error => {
            console.error("Error al obtener productos:", error);
            toast.error("No se pudieron cargar los productos.");
        })
        .finally(() => setLoading(false)); 
    }, []);

    useEffect(() => {
        obtenerProductos();
    }, [obtenerProductos]);

    const eliminarProducto = (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

        axios.delete(`http://localhost:3002/Api/productos/deleteProductos?producto_id=${id}`)
        .then(() => {
            setProductos(prev => prev.filter(p => p.id_producto !== id));
            toast.success("Producto eliminado con éxito.");
        })
        .catch(error => {
            console.error("Error al eliminar producto:", error);
            toast.error("Hubo un problema al eliminar el producto.");
        });
    };

    const handleSubmit = () => {
        obtenerProductos();
        toast.success("Producto guardado con éxito.");
    };

    const editarProducto = (producto: Producto) => {
        setProductoSeleccionado(producto);
        setShowForm(true);
    }

    const crearProducto = () => {
        setProductoSeleccionado(null);
        setShowForm(true);
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setProductoSeleccionado(null);
    }

    const productosFiltrados = productos.filter(e => 
        `${e.nombre}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container>
          <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
            <Card.Header className="text-white d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
              <h5 className="mb-0" style={{ fontWeight: 'bold' }}>Lista de Productos</h5>
              <Button variant="light" onClick={crearProducto} className="text-dark">
                <FaPlus /> Nuevo Producto
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <InputGroup>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Row>
    
              {loading ? (
                <div className="text-center my-3">
                  <Spinner animation="border" style={{ color: "#155724" }} />
                  <p>Cargando productos...</p>
                </div>
              ) : (
                <Table responsive striped bordered hover className="table-sm text-center"
                  style={{ borderRadius: "10px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#155724", color: "white" }}>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Cantidad Disponible</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((producto, index) => (
                        <tr key={producto.id_producto}>
                          <td>{index + 1}</td>
                          <td>{producto.nombre}</td>
                          <td>{producto.descripcion}</td>
                          <td>{producto.categoria}</td>
                          <td>{producto.cantidad_disponible}</td>
                          <td>
                            <Button variant="success" size="sm" onClick={() => editarProducto(producto)} className="me-2">
                              <FaEdit /> Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => eliminarProducto(producto.id_producto)}>
                              <FaTrash /> Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center">No se encontraron productos.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
    
          {showForm && (
            <ProductosForm
              productoEditar={productoSeleccionado}
              show={showForm}
              handleClose={cerrarFormulario}
              handleSubmit={handleSubmit}
            />
          )}
        </Container>
      );
    }
    
    export default ProductosTable;