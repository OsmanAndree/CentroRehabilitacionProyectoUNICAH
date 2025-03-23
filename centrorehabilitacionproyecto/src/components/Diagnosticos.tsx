import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import DiagnosticosForm from './Forms/DiagnosticosForm';
import { toast } from 'react-toastify';

interface Diagnostico {
  id_diagnostico: number;
  id_paciente: number;
  id_terapeuta: number;
  descripcion: string;
  tratamiento: string;
  paciente?: {
    nombre: string;
    apellido: string;
  };
  terapeuta?: {
    nombre: string;
    especialidad: string;
  };
}

function DiagnosticosTable() {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<Diagnostico | null>(null);
  const [search, setSearch] = useState<string>("");

  const obtenerDiagnosticos = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/diagnostico/getDiagnosticos')
      .then(response => {
        setDiagnosticos(response.data.result);
      })
      .catch(error => {
        console.error("Error al obtener diagnósticos:", error);
        toast.error("No se pudieron cargar los diagnósticos.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerDiagnosticos();
  }, [obtenerDiagnosticos]);

  const eliminarDiagnostico = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este diagnóstico?")) return;

    axios.delete(`http://localhost:3002/Api/diagnostico/deleteDiagnosticos?diagnostico_id=${id}`)
      .then(() => {
        setDiagnosticos(prev => prev.filter(d => d.id_diagnostico !== id));
        toast.success("Diagnóstico eliminado con éxito.");
      })
      .catch(error => {
        console.error("Error al eliminar diagnóstico:", error);
        toast.error("Hubo un problema al eliminar el diagnóstico.");
      });
  };

  const handleSubmit = () => {
    obtenerDiagnosticos();
    toast.success("Diagnóstico guardado con éxito.");
  };

  const editarDiagnostico = (diagnostico: Diagnostico) => {
    setDiagnosticoSeleccionado(diagnostico);
    setShowForm(true);
  };

  const crearDiagnostico = () => {
    setDiagnosticoSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setDiagnosticoSeleccionado(null);
  };

  const diagnosticosFiltrados = diagnosticos.filter(d =>
    `${d.paciente?.nombre} ${d.paciente?.apellido} ${d.terapeuta?.nombre}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
        <Card.Header className="text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
          <h5 className="mb-0" style={{ fontWeight: 'bold' }}>Lista de Diagnósticos</h5>
          <Button variant="light" onClick={crearDiagnostico} className="text-dark">
            <FaPlus /> Nuevo Diagnóstico
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar diagnóstico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Row>

          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" style={{ color: "#155724" }} />
              <p>Cargando diagnósticos...</p>
            </div>
          ) : (
            <Table responsive striped bordered hover className="table-sm text-center"
              style={{ borderRadius: "10px", overflow: "hidden" }}>
              <thead style={{ backgroundColor: "#155724", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Paciente</th>
                  <th>Terapeuta</th>
                  <th>Especialidad</th>
                  <th>Descripción</th>
                  <th>Tratamiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticosFiltrados.length > 0 ? (
                  diagnosticosFiltrados.map((diagnostico, index) => (
                    <tr key={diagnostico.id_diagnostico}>
                      <td>{index + 1}</td>
                      <td>{`${diagnostico.paciente?.nombre} ${diagnostico.paciente?.apellido}`}</td>
                      <td>{diagnostico.terapeuta?.nombre}</td>
                      <td>{diagnostico.terapeuta?.especialidad}</td>
                      <td>{diagnostico.descripcion}</td>
                      <td>{diagnostico.tratamiento}</td>
                      <td>
                        <Button variant="success" size="sm" onClick={() => editarDiagnostico(diagnostico)} className="me-2">
                          <FaEdit /> Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => eliminarDiagnostico(diagnostico.id_diagnostico)}>
                          <FaTrash /> Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">No se encontraron diagnósticos.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <DiagnosticosForm
          diagnosticoEditar={diagnosticoSeleccionado}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}
    </Container>
  );
}

export default DiagnosticosTable;
