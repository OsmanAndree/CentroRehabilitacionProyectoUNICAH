import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaClipboardList, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import DiagnosticosForm from './Forms/DiagnosticosForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import RecetaReport from './Reports/RecetaReport';
import { PDFDownloadLink } from '@react-pdf/renderer';

export interface Diagnostico {
  id_diagnostico: number;
  id_paciente: number;
  id_terapeuta: number;
  descripcion: string;
  tratamiento: string;
  paciente: {
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
  };
  terapeuta: {
    nombre: string;
    apellido: string;
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
        toast.success("Diagnósticos cargados exitosamente");
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
    toast.info("Editando diagnóstico");
  };

  const crearDiagnostico = () => {
    setDiagnosticoSeleccionado(null);
    setShowForm(true);
    toast.info("Creando nuevo diagnóstico");
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setDiagnosticoSeleccionado(null);
  };

  const diagnosticosFiltrados = diagnosticos.filter(d =>
    `${d.paciente?.nombre} ${d.paciente?.apellido} ${d.terapeuta?.nombre}`.toLowerCase().includes(search.toLowerCase())
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
            <FaClipboardList size={24} className="text-white me-2" />
            <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
              Gestión de Diagnósticos
            </h4>
          </div>
          <Button 
            variant="light" 
            onClick={crearDiagnostico}
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
            <FaPlus className="me-2" /> Nuevo Diagnóstico
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
                  placeholder="Buscar diagnóstico..."
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
              <p className="mt-3 text-muted">Cargando información de diagnósticos...</p>
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
                    <th className="py-3 px-4 text-muted">Paciente</th>
                    <th className="py-3 px-4 text-muted">Terapeuta</th>
                    <th className="py-3 px-4 text-muted">Especialidad</th>
                    <th className="py-3 px-4 text-muted" style={{ width: "20%" }}>Descripción</th> {/* Ajusta el ancho */}
                    <th className="py-3 px-4 text-muted">Tratamiento</th>
                    <th className="py-3 px-4 text-muted text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticosFiltrados.length > 0 ? (
                    diagnosticosFiltrados.map((diagnostico, index) => (
                      <tr key={diagnostico.id_diagnostico}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{`${diagnostico.paciente?.nombre} ${diagnostico.paciente?.apellido}`}</td>
                        <td className="py-3 px-4">{diagnostico.terapeuta?.nombre}</td>
                        <td className="py-3 px-4">{diagnostico.terapeuta?.especialidad}</td>
                        <td className="py-3 px-4 text-truncate" style={{ maxWidth: "200px" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{diagnostico.descripcion}</Tooltip>}
                          >
                            <span>{diagnostico.descripcion}</span>
                          </OverlayTrigger>
                        </td>
                        <td className="py-3 px-4">{diagnostico.tratamiento}</td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => editarDiagnostico(diagnostico)}
                            className="me-2"
                            style={{ borderRadius: "8px" }}
                          >
                            <FaEdit /> Editar
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarDiagnostico(diagnostico.id_diagnostico)}
                            style={{ borderRadius: "8px" }}
                          >
                            <FaTrash /> Eliminar
                          </Button>
                          <PDFDownloadLink
                            document={<RecetaReport diagnostico={diagnostico} />}
                            fileName={`Receta_Diagnostico_${diagnostico.id_diagnostico}.pdf`}
                            className="btn btn-outline-primary btn-sm ms-2"
                            style={{ borderRadius: "8px" }}
                          >
                            {({ loading }) => (
                              <span>
                                <FaFilePdf className="me-2" />
                                {loading ? "Generando..." : "Receta"}
                              </span>
                            )}
                          </PDFDownloadLink>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        No se encontraron diagnósticos que coincidan con la búsqueda.
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
