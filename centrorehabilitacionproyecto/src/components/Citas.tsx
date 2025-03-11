import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import CitasForm from './Forms/CitasForm';
import { toast } from 'react-toastify';

interface Cita {
  id_cita: number;
  id_paciente: number;
  id_terapeuta: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  paciente: {
    id_paciente: number;
    nombre: string;
    apellido: string;
  };
  terapeuta: {
    id_terapeuta: number;
    nombre: string;
    apellido: string;
  };
}

function CitasTable() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [searchPaciente, setSearchPaciente] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchTherapist, setSearchTherapist] = useState<string>("");

  const obtenerCitas = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/citas/getcitas')
      .then(response => {
        setCitas(response.data.result);
      })
      .catch(error => {
        console.error("Error al obtener citas:", error);
        toast.error("No se pudieron cargar las citas.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    obtenerCitas();
  }, [obtenerCitas]);

  const eliminarCita = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;
    axios.delete(`http://localhost:3002/Api/citas/deletecita?cita_id=${id}`)
      .then(() => {
        setCitas(prev => prev.filter(c => c.id_cita !== id));
        toast.success("Cita eliminada con éxito.");
      })
      .catch(error => {
        console.error("Error al eliminar cita:", error);
        toast.error("Hubo un problema al eliminar la cita.");
      });
  };

  const handleSubmit = () => {
    obtenerCitas();
    toast.success("Cita guardada con éxito.");
  };

  const editarCita = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setShowForm(true);
  };

  const crearCita = () => {
    setCitaSeleccionada(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setCitaSeleccionada(null);
  };

  const citasFiltradas = citas.filter(c => {
    const pacienteFull = `${c.paciente.nombre} ${c.paciente.apellido}`.toLowerCase();
    const terapeutaFull = `${c.terapeuta.nombre} ${c.terapeuta.apellido}`.toLowerCase();
    const fechaCita = new Date(c.fecha).toISOString().split('T')[0];
    return pacienteFull.includes(searchPaciente.toLowerCase()) &&
           (searchDate === "" || fechaCita === searchDate) &&
           terapeutaFull.includes(searchTherapist.toLowerCase());
  });

  return (
    <Container>
      <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
        <Card.Header className="text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
          <h5 className="mb-0" style={{ fontWeight: 'bold' }}>Lista de Citas</h5>
          <Button variant="light" onClick={crearCita} className="text-dark">
            <FaPlus /> Nueva Cita
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por paciente..."
                  value={searchPaciente}
                  onChange={(e) => setSearchPaciente(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="date"
                  placeholder="Buscar por fecha..."
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por terapeuta..."
                  value={searchTherapist}
                  onChange={(e) => setSearchTherapist(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" style={{ color: "#155724" }} />
              <p>Cargando citas...</p>
            </div>
          ) : (
            <Table responsive striped bordered hover className="table-sm text-center"
              style={{ borderRadius: "10px", overflow: "hidden" }}>
              <thead style={{ backgroundColor: "#155724", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                  <th>Paciente</th>
                  <th>Terapeuta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.length > 0 ? (
                  citasFiltradas.map((cita, index) => (
                    <tr key={cita.id_cita}>
                      <td>{index + 1}</td>
                      <td>{new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</td>                      <td>{cita.hora_inicio}</td>
                      <td>{cita.hora_fin}</td>
                      <td>{cita.paciente.nombre} {cita.paciente.apellido}</td>
                      <td>{cita.terapeuta.nombre} {cita.terapeuta.apellido}</td>
                      <td>{cita.estado}</td>
                      <td>
                        <Button variant="success" size="sm" onClick={() => editarCita(cita)} className="me-2">
                          <FaEdit /> Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => eliminarCita(cita.id_cita)}>
                          <FaTrash /> Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">No se encontraron citas.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {showForm && (
        <CitasForm
          citaEditar={citaSeleccionada}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}
    </Container>
  );
}

export default CitasTable;