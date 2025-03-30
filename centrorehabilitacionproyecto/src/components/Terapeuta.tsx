import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaUserMd, FaSearch, FaPlus, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import TerapeutasForm from './Forms/TerapeutasForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TerapeutasReport from './Reports/TerapeutaReport';
import { PDFDownloadLink } from '@react-pdf/renderer';

interface Terapeuta {
  id_terapeuta: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
  estado: boolean;
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
        toast.success("Terapeutas cargados exitosamente");
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
    toast.info("Editando terapeuta");
  };

  const crearTerapeuta = () => {
    setTerapeutaSeleccionado(null);
    setShowForm(true);
    toast.info("Creando nuevo terapeuta");
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setTerapeutaSeleccionado(null);
  };

  const terapeutasFiltrados = terapeutas.filter(t =>
    `${t.nombre} ${t.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="px-5 py-4" style={{
      minHeight: '100%',
      position: 'relative'
    }}>
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
        backgroundColor: "#ffffff",
        marginBottom: '2rem'
      }}>
        <Card.Header className="bg-gradient d-flex justify-content-between align-items-center py-3"
          style={{ 
            backgroundColor: "#2E8B57",
            borderRadius: "20px 20px 0 0",
            border: "none"
          }}>
          <div className="d-flex align-items-center">
            <FaUserMd size={24} className="text-white me-2" />
            <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
              Gestión de Terapeutas
            </h4>
          </div>
          <div className="d-flex">
            <Button 
              variant="light" 
              onClick={crearTerapeuta}
              className="d-flex align-items-center me-2"
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
              <FaPlus className="me-2" /> Nuevo Terapeuta
            </Button>
            <PDFDownloadLink
              document={<TerapeutasReport terapeutas={terapeutasFiltrados} />}
              fileName="Reporte_Terapeutas.pdf"
              className="btn btn-success d-flex align-items-center"
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
              {({ loading }) => (
                <>
                  <FaFilePdf className="me-2" />
                  {loading ? 'Generando...' : 'Descargar Reporte'}
                </>
              )}
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
                  placeholder="Buscar terapeuta..."
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
              <p className="mt-3 text-muted">Cargando información de terapeutas...</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ 
              borderRadius: "15px", 
              overflow: "auto",
              maxWidth: "100%",
              display: "block"
            }}>
              <Table hover className="align-middle mb-0" style={{ minWidth: "700px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th className="py-3 px-4 text-muted">#</th>
                    <th className="py-3 px-4 text-muted">Nombre Completo</th>
                    <th className="py-3 px-4 text-muted">Especialidad</th>
                    <th className="py-3 px-4 text-muted">Teléfono</th>
                    <th className="py-3 px-4 text-muted text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {terapeutasFiltrados.length > 0 ? (
                    terapeutasFiltrados.map((terapeuta, index) => (
                      <tr key={terapeuta.id_terapeuta}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{`${terapeuta.nombre} ${terapeuta.apellido}`}</td>
                        <td className="py-3 px-4">
                          <span className="badge bg-success-light text-success" style={{ 
                            fontSize: '0.95rem',
                            fontWeight: '800'
                          }}>
                            {terapeuta.especialidad}
                          </span>
                        </td>
                        <td className="py-3 px-4">{terapeuta.telefono}</td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            onClick={() => editarTerapeuta(terapeuta)}
                            className="me-2"
                            style={{ borderRadius: "8px" }}
                          >
                            <FaEdit /> Editar
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => eliminarTerapeuta(terapeuta.id_terapeuta)}
                            style={{ borderRadius: "8px" }}
                          >
                            <FaTrash /> Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        No se encontraron terapeutas que coincidan con la búsqueda.
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