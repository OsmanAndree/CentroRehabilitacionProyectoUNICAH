import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaBox, FaSearch, FaPlus, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import ProductosForm from './Forms/ProductosForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ProductosReport from './Reports/ProductosReport';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  cantidad_disponible: number;
}

function ProductosTable() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [search, setSearch] = useState<string>("");
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
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
    };

    const crearProducto = () => {
        setProductoSeleccionado(null);
        setShowForm(true);
        toast.info("Creando nuevo producto");
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setProductoSeleccionado(null);
    };

    const productosFiltrados = productos.filter(e => 
        `${e.nombre}`.toLowerCase().includes(search.toLowerCase())
    );

    // Determinar si estamos en un dispositivo móvil
    const isMobile = windowWidth < 768;

    return (
        <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
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
            <Card.Header className="bg-gradient py-3"
              style={{ 
                backgroundColor: "#2E8B57",
                borderRadius: "20px 20px 0 0",
                border: "none"
              }}>
              <Row className="align-items-center">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <FaBox size={24} className="text-white me-2" />
                    <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                      Gestión de Productos
                    </h4>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                    <Button 
                      variant="light" 
                      onClick={crearProducto}
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        borderRadius: "10px",
                        padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        width: isMobile ? "100%" : "auto",
                        fontSize: isMobile ? "0.9rem" : "1rem"
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
                    <PDFDownloadLink
                      document={<ProductosReport productos={productosFiltrados} />}
                      fileName="Reporte_Productos.pdf"
                      className={`btn btn-success ${isMobile ? 'w-100' : ''}`}
                      style={{
                        borderRadius: "10px",
                        padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                        fontWeight: "500",
                        color: "white",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "0.9rem" : "1rem"
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
                      {({ loading }) => (
                        <div className="d-flex align-items-center justify-content-center w-100">
                          <FaFilePdf className="me-2" />
                          {loading ? "Generando..." : isMobile ? "Descargar" : "Descargar Reporte"}
                        </div>
                      )}
                    </PDFDownloadLink>
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="p-3 p-md-4">
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
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-3 text-muted">Cargando productos...</p>
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No se encontraron productos.</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
                  <Table hover className="align-middle mb-0">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Nombre</th>
                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Descripción</th>
                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Categoría</th>
                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Cantidad</th>
                        <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.map((producto, index) => (
                        <tr key={producto.id_producto}>
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">{producto.nombre}</td>
                          <td className="py-3 px-4">{producto.descripcion}</td>
                          <td className="py-3 px-4">{producto.categoria}</td>
                          <td className="py-3 px-4">{producto.cantidad_disponible}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => editarProducto(producto)}
                                style={{ 
                                  borderRadius: "8px",
                                  padding: "0.4rem 0.6rem"
                                }}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => eliminarProducto(producto.id_producto)}
                                style={{ 
                                  borderRadius: "8px",
                                  padding: "0.4rem 0.6rem"
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
                </div>
              )}
            </Card.Body>
          </Card>

          {showForm && (
            <ProductosForm 
              show={showForm} 
              handleClose={cerrarFormulario} 
              handleSubmit={handleSubmit}
              productoEditar={productoSeleccionado}
            />
          )}
        </Container>
    );
}

export default ProductosTable;