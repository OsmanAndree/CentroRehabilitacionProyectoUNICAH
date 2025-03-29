import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaBox, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import ProductosForm from './Forms/ProductosForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
            toast.success("Productos cargados exitosamente");
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
        toast.info("Editando producto");
    }

    const crearProducto = () => {
        setProductoSeleccionado(null);
        setShowForm(true);
        toast.info("Creando nuevo producto");
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setProductoSeleccionado(null);
    }

    const productosFiltrados = productos.filter(e => 
        `${e.nombre}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container fluid className="px-5 py-4">
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Card className="shadow-lg border-0" style={{ 
            borderRadius: "20px",
            backgroundColor: "#ffffff"
          }}>
            <Card.Header className="bg-gradient d-flex justify-content-between align-items-center py-3"
              style={{ 
                backgroundColor: "#2E8B57",
                borderRadius: "20px 20px 0 0",
                border: "none"
              }}>
              <div className="d-flex align-items-center">
                <FaBox size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                  Gestión de Productos
                </h4>
              </div>
              <Button 
                variant="light" 
                onClick={crearProducto}
                className="d-flex align-items-center"
                style={{
                  borderRadius: "10px",
                  padding: "0.5rem 1rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <FaPlus className="me-2" /> Nuevo Producto
              </Button>
            </Card.Header>

            <Card.Body className="p-4">
              <Row className="mb-4">
                <div className="col-md-6 col-lg-4">
                  <InputGroup style={{ 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    borderRadius: "12px",
                    overflow: "hidden"
                  }}>
                    <InputGroup.Text style={{ 
                      backgroundColor: "#f8f9fa",
                      border: "none",
                      paddingLeft: "1.2rem"
                    }}>
                      <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar producto..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        border: "none",
                        padding: "0.8rem 1rem",
                        fontSize: "0.95rem"
                      }}
                    />
                  </InputGroup>
                </div>
              </Row>

              {loading ? (
                <div className="text-center my-5">
                  <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
                  <p className="mt-3 text-muted">Cargando información de productos...</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ borderRadius: "15px", overflow: "hidden" }}>
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th className="py-3 px-4 text-muted">#</th>
                        <th className="py-3 px-4 text-muted">Nombre</th>
                        <th className="py-3 px-4 text-muted">Descripción</th>
                        <th className="py-3 px-4 text-muted">Categoría</th>
                        <th className="py-3 px-4 text-muted text-center">Cantidad</th>
                        <th className="py-3 px-4 text-muted text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.length > 0 ? (
                        productosFiltrados.map((producto, index) => (
                          <tr key={producto.id_producto}>
                            <td className="py-3 px-4">{index + 1}</td>
                            <td className="py-3 px-4">{producto.nombre}</td>
                            <td className="py-3 px-4">{producto.descripcion}</td>
                            <td className="py-3 px-4">
                              <span className="badge bg-success-light text-success" style={{ 
                                fontSize: '0.95rem',
                                fontWeight: '800'
                              }}>
                                {producto.categoria}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`badge ${
                                producto.cantidad_disponible > 10 ? 'bg-success' :
                                producto.cantidad_disponible > 5 ? 'bg-warning' :
                                'bg-danger'
                              }`}>
                                {producto.cantidad_disponible}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => editarProducto(producto)}
                                className="me-2"
                                style={{ borderRadius: "8px" }}
                              >
                                <FaEdit /> Editar
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => eliminarProducto(producto.id_producto)}
                                style={{ borderRadius: "8px" }}
                              >
                                <FaTrash /> Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-5 text-muted">
                            No se encontraron productos que coincidan con la búsqueda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
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