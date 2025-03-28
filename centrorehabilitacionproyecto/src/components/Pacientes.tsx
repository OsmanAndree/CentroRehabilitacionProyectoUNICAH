import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserPlus, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import PacientesForm from './Forms/PacientesForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PacientesReport from './PacientesReport'; 

export interface Paciente {
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
        toast.success("Pacientes cargados exitosamente");
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
    toast.info("Editando paciente");
  };

  const crearPaciente = () => {
    setPacienteSeleccionado(null);
    setShowForm(true);
    toast.info("Creando nuevo paciente");
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setPacienteSeleccionado(null);
  };

  const pacientesFiltrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="px-5 py-4">
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
        <Card.Header className="bg-gradient d-flex justify-content-between align-items-center py-3"
          style={{ 
            backgroundColor: "#2E8B57",
            borderRadius: "20px 20px 0 0",
            border: "none"
          }}>
          <div className="d-flex align-items-center">
            <FaUserPlus size={24} className="text-white me-2" />
            <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
              Gestión de Pacientes
            </h4>
          </div>
          <div className="d-flex">
            <Button 
              variant="light" 
              onClick={crearPaciente}
              className="d-flex align-items-center me-2"
              style={{
                borderRadius: "10px",
                padding: "0.5rem 1rem",
                fontWeight: "500",
                transition: "all 0.3s ease"
              }}
            >
              <FaPlus className="me-2" /> Nuevo Paciente
            </Button>
            <PDFDownloadLink
              document={<PacientesReport pacientes={pacientesFiltrados} />}
              fileName="Reporte_Pacientes.pdf"
              className="btn btn-success"
              style={{
                borderRadius: "10px",
                padding: "0.5rem 1rem",
                fontWeight: "500",
                textDecoration: "none",
                color: "white",
              }}
            >
              {({ loading }) => (loading ? "Generando PDF..." : "Descargar Reporte")}
            </PDFDownloadLink>
          </div>
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
                  placeholder="Buscar paciente..."
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
              <p className="mt-3 text-muted">Cargando información de pacientes...</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ 
              borderRadius: "15px", 
              overflow: "auto",
              maxWidth: "100%",
              display: "block"
            }}>
              <Table hover className="align-middle mb-0" style={{ minWidth: "800px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th className="py-3 px-4 text-muted">#</th>
                    <th className="py-3 px-4 text-muted">Nombre Completo</th>
                    <th className="py-3 px-4 text-muted">Fecha de Nacimiento</th>
                    <th className="py-3 px-4 text-muted">Teléfono</th>
                    <th className="py-3 px-4 text-muted">Dirección</th>
                    <th className="py-3 px-4 text-muted">Encargado</th>
                    <th className="py-3 px-4 text-muted text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.length > 0 ? (
                    pacientesFiltrados.map((paciente, index) => (
                      <tr key={paciente.id_paciente}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{`${paciente.nombre} ${paciente.apellido}`}</td>
                        <td className="py-3 px-4">
                          {new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 px-4">{paciente.telefono}</td>
                        <td className="py-3 px-4">{paciente.direccion}</td>
                        <td className="py-3 px-4">
                          {paciente.encargado.nombre} {paciente.encargado.apellido}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => editarPaciente(paciente)}
                            className="me-2"
                            style={{ borderRadius: "8px" }}
                          >
                            <FaEdit /> Editar
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarPaciente(paciente.id_paciente)}
                            style={{ borderRadius: "8px" }}
                          >
                            <FaTrash /> Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted">
                        No se encontraron pacientes que coincidan con la búsqueda.
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