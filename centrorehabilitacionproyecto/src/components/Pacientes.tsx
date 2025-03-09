import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import PacientesForm from './Forms/PacientesForm';
import { toast } from 'react-toastify';

interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  telefono: string;
  direccion: string;
  id_encargado: number;
  encargado: {
    nombre: string;
    apellido: string;
  };
}

function PacientesTable() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [search, setSearch] = useState<string>("");

  const obtenerPacientes = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/pacientes/getpacientes')
      .then(response => {
        setPacientes(response.data.result);
      })
      .catch(error => {
        console.error("Error al obtener pacientes:", error);
        toast.error("No se pudieron cargar los pacientes.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerPacientes();
  }, [obtenerPacientes]);

  const eliminarPaciente = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este paciente?")) return;

    axios.delete(`http://localhost:3002/Api/pacientes/deletepacientes?paciente_id=${id}`)
      .then(() => {
        setPacientes(prev => prev.filter(p => p.id_paciente !== id));
        toast.success("Paciente eliminado con éxito.");
      })
      .catch(error => {
        console.error("Error al eliminar paciente:", error);
        toast.error("Hubo un problema al eliminar el paciente.");
      });
  };

  const handleSubmit = () => {
    obtenerPacientes();
    toast.success("Paciente guardado con éxito.");
  };

  const editarPaciente = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente);
    setShowForm(true);
  };

  const crearPaciente = () => {
    setPacienteSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setPacienteSeleccionado(null);
  };

  const pacientesFiltrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
        <Card.Header className="text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
          <h5 className="mb-0">Lista de Pacientes</h5>
          <Button variant="light" onClick={crearPaciente} className="text-dark">
            <FaPlus /> Nuevo Paciente
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Row>

          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" style={{ color: "#155724" }} />
              <p>Cargando pacientes...</p>
            </div>
          ) : (
            <Table responsive striped bordered hover className="table-sm text-center"
              style={{ borderRadius: "10px", overflow: "hidden" }}>
              <thead style={{ backgroundColor: "#155724", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Fecha de Nacimiento</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Encargado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((paciente, index) => (
                    <tr key={paciente.id_paciente}>
                      <td>{index + 1}</td>
                      <td>{paciente.nombre}</td>
                      <td>{paciente.apellido}</td>
                      <td>{new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                      <td>{paciente.telefono}</td>
                      <td>{paciente.direccion}</td>
                      <td>{paciente.encargado.nombre} {paciente.encargado.apellido}</td>
                      <td>
                        <Button variant="success" size="sm" onClick={() => editarPaciente(paciente)} className="me-2">
                          <FaEdit /> Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => eliminarPaciente(paciente.id_paciente)}>
                          <FaTrash /> Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">No se encontraron pacientes.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <PacientesForm
          pacienteEditar={pacienteSeleccionado}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}
    </Container>
  );
}

export default PacientesTable;