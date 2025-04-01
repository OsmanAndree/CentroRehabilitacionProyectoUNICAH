import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Card, Table, Button, Spinner, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFileInvoice, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';
import ComprasForm from './Forms/ComprasForm';
import ComprasView from './Forms/ComprasView';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ComprasReport from './Reports/ComprasReport';

interface Compra {
  id_compra: number;
  fecha: string;
  donante: string;
  total: number;
  detalle: {
    id_detalle: number;
    id_producto: number;
    cantidad: number;
    costo_unitario: number;
  }[];
}

interface Producto {
  id_producto: number;
  nombre: string;
}

function Compras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showView, setShowView] = useState<boolean>(false);
  const [compraVista, setCompraVista] = useState<Compra | null>(null);
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

  const obtenerCompras = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/compras/getCompras')
      .then(response => {
        setCompras(response.data.result);
        toast.success("Compras cargadas exitosamente");
      })
      .catch(error => {
        console.error("Error al cargar compras:", error);
        toast.error("Error al cargar compras");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerCompras();
  }, [obtenerCompras]);
  
  useEffect(() => {
    axios.get('http://localhost:3002/Api/productos/getProductos')
      .then(response => {
        setProductos(response.data.result);
      })
      .catch(error => console.error("Error al cargar productos:", error));
  }, []);
  
  const eliminarCompra = (id_compra: number) => {
    if (!window.confirm("¿Está seguro que desea inactivar esta compra?")) return;
    axios.delete(`http://localhost:3002/Api/compras/deleteCompra?id_compra=${id_compra}`)
      .then(() => {
        setCompras(prev => prev.filter(c => c.id_compra !== id_compra));
        toast.success("Compra inactivada exitosamente");
      })
      .catch(error => {
        console.error("Error al inactivar compra:", error);
        toast.error("Error al inactivar compra");
      });
  };

  const handleSubmit = () => {
    obtenerCompras();
    toast.success("Compra guardada exitosamente");
  };

  const editarCompra = (compra: Compra) => {
    setCompraSeleccionada(compra);
    setShowForm(true);
    toast.info("Editando compra");
  };

  const verCompra = (compra: Compra) => {
    setCompraVista(compra);
    setShowView(true);
  };

  const crearCompra = () => {
    setCompraSeleccionada(null);
    setShowForm(true);
    toast.info("Creando nueva compra");
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setCompraSeleccionada(null);
  };

  const cerrarVista = () => {
    setShowView(false);
    setCompraVista(null);
  };

  const comprasFiltradas = compras.filter(c =>
    c.donante.toLowerCase().includes(search.toLowerCase())
  );

  // Determinar si estamos en un dispositivo móvil
  const isMobile = windowWidth < 768;

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3"
          style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaShoppingCart size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                  Gestión de Compras
                </h4>
              </div>
            </Col>
            <Col xs={12} md={6} className="d-flex justify-content-md-end">
              <Button 
                variant="light" 
                onClick={crearCompra} 
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
                <FaPlus className="me-2" /> Nueva Compra
              </Button>
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
                  placeholder="Buscar por donante..."
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
              <p className="mt-3 text-muted">Cargando compras...</p>
            </div>
          ) : comprasFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No se encontraron compras</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Donante</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Total</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasFiltradas.map((compra, index) => (
                    <tr key={compra.id_compra}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{new Date(compra.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</td>
                      <td className="py-3 px-4">{compra.donante}</td>
                      <td className="py-3 px-4">{compra.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-center'}`} style={{ gap: isMobile ? '8px' : '6px' }}>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            onClick={() => verCompra(compra)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem",
                              width: isMobile ? "100%" : "auto"
                            }}
                          >
                            <FaEye className={isMobile ? "me-2" : ""} /> {isMobile && "Ver"}
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => editarCompra(compra)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem",
                              width: isMobile ? "100%" : "auto"
                            }}
                          >
                            <FaEdit className={isMobile ? "me-2" : ""} /> {isMobile && "Editar"}
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarCompra(compra.id_compra)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem",
                              width: isMobile ? "100%" : "auto"
                            }}
                          >
                            <FaTrash className={isMobile ? "me-2" : ""} /> {isMobile && "Eliminar"}
                          </Button>
                          <PDFDownloadLink
                            document={<ComprasReport compra={compra} productos={productos} />}
                            fileName={`Factura_Compra_${compra.id_compra}.pdf`}
                            className={`btn btn-outline-primary btn-sm ${isMobile ? 'w-100' : ''}`}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem"
                            }}
                          >
                            {({ loading }) => (
                              <span>
                                <FaFileInvoice className={isMobile ? "me-2" : ""} /> 
                                {loading ? "Generando..." : (isMobile ? "Factura" : "")}
                              </span>
                            )}
                          </PDFDownloadLink>
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
        <ComprasForm
          compraEditar={compraSeleccionada}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}
      {showView && (
        <ComprasView
          compra={compraVista}
          show={showView}
          handleClose={cerrarVista}
        />
      )}
    </Container>
  );
}

export default Compras;