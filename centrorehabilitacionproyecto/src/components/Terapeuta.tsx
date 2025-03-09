import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import TerapeutasForm from './Forms/TerapeutasForm';
import { toast } from 'react-toastify';

interface Terapeuta {
  id_terapeuta: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
}

function TerapeutasTable() {
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState<Terapeuta | null>(null);
  const [search, setSearch] = useState<string>("");

  const obtenerTerapeutas = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/terapeutas/getterapeutas')
      .then(response => {
        setTerapeutas(response.data.result);
      })
      .catch(error => {
        console.error("Error al obtener terapeutas:", error);
        toast.error("No se pudieron cargar los terapeutas.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerTerapeutas();
  }, [obtenerTerapeutas]);

  const eliminarTerapeuta = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este terapeuta?")) return;

    axios.delete(`http://localhost:3002/Api/terapeutas/deleteterapeutas?terapeuta_id=${id}`)
      .then(() => {
        setTerapeutas(prev => prev.filter(t => t.id_terapeuta !== id));
        toast.success("Terapeuta eliminado con éxito.");
      })
      .catch(error => {
        console.error("Error al eliminar terapeuta:", error);
        toast.error("Hubo un problema al eliminar el terapeuta.");
      });
  };

  const handleSubmit = () => {
    obtenerTerapeutas();
    toast.success("Terapeuta guardado con éxito.");
  };

  const editarTerapeuta = (terapeuta: Terapeuta) => {
    setTerapeutaSeleccionado(terapeuta);
    setShowForm(true);
  };

  const crearTerapeuta = () => {
    setTerapeutaSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setTerapeutaSeleccionado(null);
  };

  const terapeutasFiltrados = terapeutas.filter(t =>
    `${t.nombre} ${t.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
        <Card.Header className="text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
          <h5 className="mb-0">Lista de Terapeutas</h5>
          <Button variant="light" onClick={crearTerapeuta} className="text-dark">
            <FaPlus /> Nuevo Terapeuta
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar terapeuta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Row>

          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" style={{ color: "#155724" }} />
              <p>Cargando terapeutas...</p>
            </div>
          ) : (
            <Table responsive striped bordered hover className="table-sm text-center"
              style={{ borderRadius: "10px", overflow: "hidden" }}>
              <thead style={{ backgroundColor: "#155724", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Especialidad</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {terapeutasFiltrados.length > 0 ? (
                  terapeutasFiltrados.map((terapeuta, index) => (
                    <tr key={terapeuta.id_terapeuta}>
                      <td>{index + 1}</td>
                      <td>{terapeuta.nombre}</td>
                      <td>{terapeuta.apellido}</td>
                      <td>{terapeuta.especialidad}</td>
                      <td>{terapeuta.telefono}</td>
                      <td>
                        <Button variant="success" size="sm" onClick={() => editarTerapeuta(terapeuta)} className="me-2">
                          <FaEdit /> Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => eliminarTerapeuta(terapeuta.id_terapeuta)}>
                          <FaTrash /> Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">No se encontraron terapeutas.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <TerapeutasForm
          terapeutaEditar={terapeutaSeleccionado}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}
    </Container>
  );
}

export default TerapeutasTable;
