import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaWarehouse, FaSearch, FaPlus, FaEdit, FaTrash, FaBox, FaFilePdf } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { AppDispatch, RootState } from '../app/store';
import { fetchBodegas, deleteBodega } from '../features/bodegas/bodegasSlice';
import BodegasForm from './Forms/BodegasForm';
import ProductoOut from './Forms/ProductoOut';
import BodegaReport from './Reports/BodegaReport';

export interface Bodega {
  id_bodega: number;
  id_producto: number;
  cantidad: number;
  ubicacion: string;
  producto: {
    nombre: string;
  };
}

function BodegaTable() {
  const dispatch: AppDispatch = useDispatch();
  const { bodegas, status, error } = useSelector((state: RootState) => state.bodegas);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<Bodega | null>(null);
  const [search, setSearch] = useState<string>("");
  const [showProductoOut, setShowProductoOut] = useState<boolean>(false);
  const [bodegaParaSacar, setBodegaParaSacar] = useState<Bodega | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBodegas());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const eliminarBodegaHandler = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro de bodega?")) return;

    dispatch(deleteBodega(id))
      .unwrap()
      .then(() => toast.success("Registro eliminado con éxito."))
      .catch((err) => toast.error(`Hubo un problema al eliminar: ${err.message || 'Error desconocido'}`));
  };

  const handleSubmit = () => {
    dispatch(fetchBodegas());
    toast.success("Operación guardada con éxito.");
  };

  const editarBodega = (bodega: Bodega) => {
    setBodegaSeleccionada(bodega);
    setShowForm(true);
  };

  const crearBodega = () => {
    setBodegaSeleccionada(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setBodegaSeleccionada(null);
  };

  const sacarProducto = (bodega: Bodega) => {
    setBodegaParaSacar(bodega);
    setShowProductoOut(true);
  };

  const cerrarModalSacarProducto = () => {
    setShowProductoOut(false);
    setBodegaParaSacar(null);
  };

  const bodegasFiltradas = bodegas.filter(b =>
    b.producto?.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const isMobile = windowWidth < 768;

  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <FaWarehouse size={24} className="text-white me-2" />
                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Bodega</h4>
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
                  <FaPlus className="me-2" /> Ingreso
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
                  >
                    {({ loading }) => (
                      <div className="d-flex align-items-center justify-content-center w-100">
                        <FaFilePdf className="me-2" />
                        {loading ? "Generando..." : "Reporte"}
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
              <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre de producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                />
              </InputGroup>
            </div>
          </Row>

          {status === 'loading' ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando registros de bodega...</p></div>
          ) : status === 'failed' ? (
             <div className="text-center py-5">
              <p className="text-danger">Error: {error}</p>
              <Button variant="secondary" size="sm" onClick={() => dispatch(fetchBodegas())}>Reintentar</Button>
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
                  {bodegasFiltradas.length > 0 ? (
                    bodegasFiltradas.map((item, index) => (
                    <tr key={item.id_bodega}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{item.producto?.nombre ?? 'Sin producto'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${
                          item.cantidad > 10 ? 'bg-success' :
                          item.cantidad > 5 ? 'bg-warning' :
                          'bg-danger'
                        }`} style={{ fontSize: '0.9rem' }}>
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.ubicacion}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button variant="outline-warning" size="sm" onClick={() => sacarProducto(item)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaBox />
                          </Button>
                          <Button variant="outline-primary" size="sm" onClick={() => editarBodega(item)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => eliminarBodegaHandler(item.id_bodega)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">No se encontraron registros que coincidan.</td></tr>
                  )}
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
          onSuccess={handleSubmit}
        />
      )}
    </Container>
  );
}

export default BodegaTable;