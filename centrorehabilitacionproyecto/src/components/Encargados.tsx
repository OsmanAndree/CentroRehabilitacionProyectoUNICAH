import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserFriends, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import EncargadosForm from './Forms/EncargadosForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EncargadosReport from './Reports/EncargadosReport';
import { PDFDownloadLink } from '@react-pdf/renderer';

export interface Encargado {
    id_encargado: number;
    nombre: string;
    apellido: string;
    telefono: string;
    direccion: string;
}

function EncargadosTable(){
    const [encargados, setEncargados] = useState<Encargado[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [encargadoSeleccionado, setEncargadoSeleccionado] = useState<Encargado | null>(null);
    const [search, setSearch] = useState<string>("");
    
    const obtenerEncargados = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:3002/Api/encargados/getEncargados')
        .then(response => {
            if (response.data && Array.isArray(response.data.result)) {
                setEncargados(response.data.result);
                toast.success("Encargados cargados exitosamente");
            } else {
                console.error("Formato de respuesta inesperado:", response.data);
                setEncargados([]);
                toast.error("Formato de respuesta inesperado");
            }
        })
        .catch(error => {
            console.error("Error al obtener encargados:", error);
            setEncargados([]); 
            toast.error("No se pudieron cargar los encargados.");
        })
        .finally(() => setLoading(false)); 
    }, []);

    useEffect(() => {
        obtenerEncargados();
    }, [obtenerEncargados]);

    const eliminarEncargado = (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este encargado?")) return;

        axios.delete(`http://localhost:3002/Api/encargados/deleteEncargados?encargado_id=${id}`)
        .then(() => {
            setEncargados(prev => prev.filter(p => p.id_encargado !== id));
            toast.success("Encargado eliminado con éxito.");
        })
        .catch(error => {
            console.error("Error al eliminar encargado:", error);
            toast.error("Hubo un problema al eliminar el encargado.");
        });
    };

    const handleSubmit = () => {
        obtenerEncargados();
        toast.success("Encargado guardado con éxito.");
    };

    const editarEncargado = (encargado: Encargado) => {
        setEncargadoSeleccionado(encargado);
        setShowForm(true);
        toast.info("Editando encargado");
    }

    const crearEncargado = () => {
        setEncargadoSeleccionado(null);
        setShowForm(true);
        toast.info("Creando nuevo encargado");
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setEncargadoSeleccionado(null);
    }

    const encargadosFiltrados = (encargados || []).filter(e => 
        `${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase())
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
                        <FaUserFriends size={24} className="text-white me-2" />
                        <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                            Gestión de Encargados
                        </h4>
                    </div>
                    <div className="d-flex align-items-center">
                        <Button 
                            variant="light" 
                            onClick={crearEncargado}
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
                            <FaPlus className="me-2" /> Nuevo Encargado
                        </Button>
                    <PDFDownloadLink
                        document={<EncargadosReport encargados={encargadosFiltrados} />}
                        fileName="Reporte_Encargados.pdf"
                        className="btn btn-success ms-2"
                        style={{
                            borderRadius: "10px",
                            padding: "0.5rem 1rem",
                            fontWeight: "500",
                            color: "white",
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
                            <div className="d-flex align-items-center">
                                <FaFilePdf className="me-2" />
                                {loading ? "Generando PDF..." : "Descargar Reporte"}
                            </div>
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
                                    placeholder="Buscar encargado..."
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
                            <p className="mt-3 text-muted">Cargando información de encargados...</p>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ borderRadius: "15px", overflow: "hidden" }}>
                            <Table hover className="align-middle mb-0">
                                <thead>
                                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                                        <th className="py-3 px-4 text-muted">#</th>
                                        <th className="py-3 px-4 text-muted">Nombre Completo</th>
                                        <th className="py-3 px-4 text-muted">Teléfono</th>
                                        <th className="py-3 px-4 text-muted">Dirección</th>
                                        <th className="py-3 px-4 text-muted text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {encargadosFiltrados.length > 0 ? (
                                        encargadosFiltrados.map((encargado, index) => (
                                            <tr key={encargado.id_encargado}>
                                                <td className="py-3 px-4">{index + 1}</td>
                                                <td className="py-3 px-4">{`${encargado.nombre} ${encargado.apellido}`}</td>
                                                <td className="py-3 px-4">{encargado.telefono}</td>
                                                <td className="py-3 px-4">{encargado.direccion}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <Button 
                                                        variant="outline-success" 
                                                        size="sm" 
                                                        onClick={() => editarEncargado(encargado)}
                                                        className="me-2"
                                                        style={{ borderRadius: "8px" }}
                                                    >
                                                        <FaEdit /> Editar
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm" 
                                                        onClick={() => eliminarEncargado(encargado.id_encargado)}
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
                                                No se encontraron encargados que coincidan con la búsqueda.
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
                <EncargadosForm
                    encargadoEditar={encargadoSeleccionado}
                    show={showForm}
                    handleClose={cerrarFormulario}
                    handleSubmit={handleSubmit}
                />
            )}
        </Container>
    );
}

export default EncargadosTable;