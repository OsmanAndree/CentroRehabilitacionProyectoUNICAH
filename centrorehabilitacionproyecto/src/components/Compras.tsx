import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Card, Table, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import axios from 'axios';
import ComprasForm from './Forms/ComprasForm';
import ComprasView from './Forms/ComprasView';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

function Compras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  
  // Nueva vista
  const [showView, setShowView] = useState<boolean>(false);
  const [compraVista, setCompraVista] = useState<Compra | null>(null);

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

  return (
    <Container fluid className="px-5 py-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
        <Card.Header className="bg-gradient d-flex justify-content-between align-items-center py-3"
          style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
          <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Compras</h4>
          <Button variant="light" onClick={crearCompra} className="d-flex align-items-center"
            style={{
              borderRadius: "10px",
              padding: "0.5rem 1rem",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}>
            <FaPlus className="me-2" /> Nueva Compra
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
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted">Cargando compras...</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "15px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4 text-muted">#</th>
                    <th className="py-3 px-4 text-muted">Fecha</th>
                    <th className="py-3 px-4 text-muted">Donante</th>
                    <th className="py-3 px-4 text-muted">Total</th>
                    <th className="py-3 px-4 text-muted text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasFiltradas.length > 0 ? (
                    comprasFiltradas.map((compra, index) => (
                      <tr key={compra.id_compra}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{new Date(compra.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</td>
                        <td className="py-3 px-4">{compra.donante}</td>
                        <td className="py-3 px-4">{compra.total}</td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="outline-info" size="sm" onClick={() => verCompra(compra)}
                            className="me-2" style={{ borderRadius: "8px" }}>
                            <FaEye /> Ver
                          </Button>
                          <Button variant="outline-success" size="sm" onClick={() => editarCompra(compra)}
                            className="me-2" style={{ borderRadius: "8px" }}>
                            <FaEdit /> Editar
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => eliminarCompra(compra.id_compra)}
                            style={{ borderRadius: "8px" }}>
                            <FaTrash /> Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        No se encontraron compras
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