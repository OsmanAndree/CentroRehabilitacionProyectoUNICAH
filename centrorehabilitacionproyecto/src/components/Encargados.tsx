import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
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
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
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

    // Determinar si estamos en un dispositivo móvil
    const isMobile = windowWidth < 768;

    return (
        <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
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
                <Card.Header className="bg-gradient py-3"
                    style={{ 
                        backgroundColor: "#2E8B57",
                        borderRadius: "20px 20px 0 0",
                        border: "none"
                    }}>
                    <Row className="align-items-center">
                        <Col xs={12} md={6} className="mb-3 mb-md-0">
                            <div className="d-flex align-items-center">
                                <FaUserFriends size={24} className="text-white me-2" />
                                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                                    Gestión de Encargados
                                </h4>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                                <Button 
                                    variant="light" 
                                    onClick={crearEncargado}
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                        borderRadius: "10px",
                                        padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        width: isMobile ? "100%" : "auto",
                                        fontSize: isMobile ? "0.9rem" : "1rem"
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
                                    className={`btn btn-success ${isMobile ? 'w-100' : ''}`}
                                    style={{
                                        borderRadius: "10px",
                                        padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                                        fontWeight: "500",
                                        color: "white",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: isMobile ? "0.9rem" : "1rem"
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
                                        <div className="d-flex align-items-center justify-content-center w-100">
                                            <FaFilePdf className="me-2" />
                                            {loading ? "Generando..." : isMobile ? "Descargar" : "Descargar Reporte"}
                                        </div>
                                    )}
                                </PDFDownloadLink>
                            </div>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-3 p-md-4">
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
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                            <p className="mt-3 text-muted">Cargando encargados...</p>
                        </div>
                    ) : encargadosFiltrados.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">No se encontraron encargados.</p>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
                            <Table hover className="align-middle mb-0">
                                <thead style={{ backgroundColor: "#f8f9fa" }}>
                                    <tr>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Nombre Completo</th>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Teléfono</th>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Dirección</th>
                                        <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {encargadosFiltrados.map((encargado, index) => (
                                        <tr key={encargado.id_encargado}>
                                            <td className="py-3 px-4">{index + 1}</td>
                                            <td className="py-3 px-4">{`${encargado.nombre} ${encargado.apellido}`}</td>
                                            <td className="py-3 px-4">{encargado.telefono}</td>
                                            <td className="py-3 px-4">{encargado.direccion}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        onClick={() => editarEncargado(encargado)}
                                                        style={{ 
                                                            borderRadius: "8px",
                                                            padding: "0.4rem 0.6rem"
                                                        }}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm" 
                                                        onClick={() => eliminarEncargado(encargado.id_encargado)}
                                                        style={{ 
                                                            borderRadius: "8px",
                                                            padding: "0.4rem 0.6rem"
                                                        }}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {showForm && (
                <EncargadosForm 
                    show={showForm} 
                    handleClose={cerrarFormulario} 
                    handleSubmit={handleSubmit}
                    encargadoEditar={encargadoSeleccionado}
                />
            )}
        </Container>
    );
}

export default EncargadosTable;