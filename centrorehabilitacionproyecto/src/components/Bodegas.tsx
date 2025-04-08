import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaWarehouse, FaSearch, FaPlus, FaEdit, FaTrash, FaBox, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import BodegasForm from './Forms/BodegasForm';
import ProductoOut from './Forms/ProductoOut';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import BodegaReport from './Reports/BodegaReport';

interface Bodega {
  id_bodega: number;
  id_producto: number;
  cantidad: number;
  ubicacion: string;
  producto: {
    nombre: string;
  };
}

function BodegaTable() {
  const [bodega, setBodega] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<Bodega | null>(null);
  const [search, setSearch] = useState<string>("");
  const [showProductoOut, setShowProductoOut] = useState<boolean>(false);
  const [bodegaParaSacar, setBodegaParaSacar] = useState<Bodega | null>(null);
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

  const obtenerBodega = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/bodega/GetBodegas')
      .then(response => {
        setBodega(response.data.result);
        toast.success("Registros de bodega cargados exitosamente");
      })
      .catch(error => {
        console.error("Error al obtener bodegas:", error);
        toast.error("No se pudieron cargar los registros de bodega.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerBodega();
  }, [obtenerBodega]);

  const eliminarBodega = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta registro de bodega?")) return;

    axios.delete(`http://localhost:3002/Api/bodega/DeleteBodega?bodega_id=${id}`)
      .then(() => {
        setBodega(prev => prev.filter(p => p.id_bodega !== id));
        toast.success("Registro de bodega eliminado con éxito."); // Solo un toast aquí
      })
      .catch(error => {
        console.error("Error al eliminar bodega:", error);
        toast.error("Hubo un problema al eliminar el registro de bodega.");
      });
  };

  const handleSubmit = () => {
    obtenerBodega();
    toast.success("Registro de bodega guardado con éxito.");
  };

  const editarBodega = (bodega: Bodega) => {
    setBodegaSeleccionada(bodega);
    setShowForm(true);
    toast.info("Editando registro de bodega");
  };

  const crearBodega = () => {
    setBodegaSeleccionada(null);
    setShowForm(true);
    toast.info("Creando nuevo registro de bodega");
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setBodegaSeleccionada(null);
  };

  const sacarProducto = (bodega: Bodega) => {
    setBodegaParaSacar(bodega);
    setShowProductoOut(true);
    toast.info(`Preparando para sacar producto: ${bodega.producto.nombre}`);
  };

  const cerrarModalSacarProducto = () => {
    setShowProductoOut(false);
    setBodegaParaSacar(null);
  };

  const bodegasFiltradas = bodega.filter(p =>
    `${p.id_producto}`.toLowerCase().includes(search.toLowerCase())
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
                <FaWarehouse size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                  Gestión de Bodega
                </h4>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                <Button 
                  variant="light" 
                  onClick={crearBodega}
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
                  <FaPlus className="me-2" /> Nueva Bodega
                </Button>
                {bodegasFiltradas.length > 0 && (
                  <PDFDownloadLink
                    document={<BodegaReport bodegas={bodegasFiltradas} />}
                    fileName="Reporte_Bodega.pdf"
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
                )}
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
                  placeholder="Buscar en bodega..."
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
              <p className="mt-3 text-muted">Cargando información de bodega...</p>
            </div>
          ) : bodegasFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No se encontraron registros en bodega.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Producto</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Cantidad</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Ubicación</th>
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bodegasFiltradas.map((bodega, index) => (
                    <tr key={bodega.id_bodega}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{bodega.producto?.nombre ?? 'Sin producto'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${
                          bodega.cantidad > 10 ? 'bg-success' :
                          bodega.cantidad > 5 ? 'bg-warning' :
                          'bg-danger'
                        }`} style={{
                          fontSize: '0.95rem',
                          fontWeight: '800'
                        }}>
                          {bodega.cantidad}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge bg-success-light text-success" style={{ 
                              fontSize: '0.95rem',
                              fontWeight: '800'
                            }}>
                          {bodega.ubicacion}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-center'}`} style={{ gap: isMobile ? '8px' : '6px' }}>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            onClick={() => sacarProducto(bodega)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem",
                              width: isMobile ? "100%" : "auto"
                            }}
                          >
                            <FaBox className={isMobile ? "me-2" : ""} /> {isMobile ? "Sacar Producto" : ""}
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => editarBodega(bodega)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem",
                              width: isMobile ? "100%" : "auto"
                            }}
                          >
                            <FaEdit className={isMobile ? "me-2" : ""} /> {isMobile ? "Editar" : ""}
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarBodega(bodega.id_bodega)}
                            style={{ 
                              borderRadius: "8px",
                              padding: "0.4rem 0.6rem",
                              width: isMobile ? "100%" : "auto"
                            }}
                          >
                            <FaTrash className={isMobile ? "me-2" : ""} /> {isMobile ? "Eliminar" : ""}
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
        <BodegasForm
          bodegaEditar={bodegaSeleccionada}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}

      {showProductoOut && (
        <ProductoOut
          show={showProductoOut}
          handleClose={cerrarModalSacarProducto}
          bodega={bodegaParaSacar}
          onSuccess={obtenerBodega}
        />
      )}
    </Container>
  );
}

export default BodegaTable;