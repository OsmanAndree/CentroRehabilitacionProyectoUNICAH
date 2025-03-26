import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaWarehouse, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import BodegasForm from './Forms/BodegasForm';
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

function BodegaTable() {
  const [bodega, setBodega] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<Bodega | null>(null);
  const [search, setSearch] = useState<string>("");

  const obtenerBodega = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/bodega/GetBodegas')
      .then(response => {
        setBodega(response.data.result);
      })
      .catch(error => {
        console.error("Error al obtener bodegas:", error);
        toast.error("No se pudieron cargar las bodegas.");
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
        toast.success("Registro de bodega eliminado con éxito.");
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
  };

  const crearBodega = () => {
    setBodegaSeleccionada(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setBodegaSeleccionada(null);
  };

  const bodegasFiltradas = bodega.filter(p =>
    `${p.id_producto}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="px-5 py-4">
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
            <FaWarehouse size={24} className="text-white me-2" />
            <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
              Gestión de Bodega
            </h4>
          </div>
          <Button 
            variant="light" 
            onClick={crearBodega}
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
            <FaPlus className="me-2" /> Nueva Bodega
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
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted">Cargando información de bodega...</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: "15px", overflow: "hidden" }}>
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th className="py-3 px-4 text-muted">#</th>
                    <th className="py-3 px-4 text-muted">Producto</th>
                    <th className="py-3 px-4 text-muted text-center">Cantidad</th>
                    <th className="py-3 px-4 text-muted">Ubicación</th>
                    <th className="py-3 px-4 text-muted text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bodegasFiltradas.length > 0 ? (
                    bodegasFiltradas.map((bodega, index) => (
                      <tr key={bodega.id_bodega}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{bodega.producto?.nombre ?? 'Sin producto'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`badge ${
                            bodega.cantidad > 10 ? 'bg-success' :
                            bodega.cantidad > 5 ? 'bg-warning' :
                            'bg-danger'
                          }`}>
                            {bodega.cantidad}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="badge bg-success-light text-success">
                            {bodega.ubicacion}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => editarBodega(bodega)}
                            className="me-2"
                            style={{ borderRadius: "8px" }}
                          >
                            <FaEdit /> Editar
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarBodega(bodega.id_bodega)}
                            style={{ borderRadius: "8px" }}
                          >
                            <FaTrash /> Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        No se encontraron registros en bodega.
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
        <BodegasForm
          bodegaEditar={bodegaSeleccionada}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}
    </Container>
  );
}

export default BodegaTable;