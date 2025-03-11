import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
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
    <Container>
      <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
        <Card.Header className="text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
          <h5 className="mb-0" style={{ fontWeight: 'bold' }}>Registro de Bodega</h5>
          <Button variant="light" onClick={crearBodega} className="text-dark">
            <FaPlus /> Nuevo Registro de Bodega
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar bodega..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Row>

          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" style={{ color: "#155724" }} />
              <p>Cargando registro de bodegas...</p>
            </div>
          ) : (
            <Table responsive striped bordered hover className="table-sm text-center"
              style={{ borderRadius: "10px", overflow: "hidden" }}>
              <thead style={{ backgroundColor: "#155724", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bodegasFiltradas.length > 0 ? (
                  bodegasFiltradas.map((bodega, index) => (
                    <tr key={bodega.id_bodega}>
                      <td>{index + 1}</td>
                      <td>{bodega.producto?.nombre ?? 'Sin producto'}</td>
                      <td>{bodega.cantidad}</td>
                      <td>{bodega.ubicacion}</td>
                      <td>
                        <Button variant="success" size="sm" onClick={() => editarBodega(bodega)} className="me-2">
                          <FaEdit /> Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => eliminarBodega(bodega.id_bodega)}>
                          <FaTrash /> Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">No se encontraron registros de bodegas.</td>
                  </tr>
                )}
              </tbody>
            </Table>
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