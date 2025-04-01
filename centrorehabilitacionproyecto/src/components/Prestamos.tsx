import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaClipboardList, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import PrestamosForm from './Forms/PrestamosForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PrestamosReport from './Reports/PrestamosReport';

interface Prestamo {
    id_prestamo: number;
    id_paciente: number;
    id_producto: number;
    fecha_prestamo: string;
    fecha_devolucion: string;
    estado: 'Prestado' | 'Devuelto';
    paciente?: {
        nombre: string;
        apellido: string;
    };
    producto?: {
        nombre: string;
        descripcion: string;
    };
}

function PrestamosTable() {
const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [showForm, setShowForm] = useState<boolean>(false);
const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
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

const obtenerPrestamos = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/prestamos/getPrestamos')
    .then(response => {
        setPrestamos(response.data.result);
        toast.success("Préstamos cargados exitosamente");
    })
    .catch(error => {
        console.error("Error al obtener préstamos:", error);
        toast.error("No se pudieron cargar los préstamos.");
    })
    .finally(() => setLoading(false));
}, []);

useEffect(() => {
    obtenerPrestamos();
}, [obtenerPrestamos]);

const eliminarPrestamo = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este préstamo?")) return;

    axios.delete(`http://localhost:3002/Api/prestamos/deletePrestamo?prestamo_id=${id}`)
    .then(() => {
        setPrestamos(prev => prev.filter(p => p.id_prestamo !== id));
        toast.success("Préstamo eliminado con éxito.");
    })
    .catch(error => {
        console.error("Error al eliminar préstamo:", error);
        toast.error("Hubo un problema al eliminar el préstamo.");
    });
};

const handleSubmit = () => {
    obtenerPrestamos();
    toast.success("Préstamo guardado con éxito.");
};

const editarPrestamo = (prestamo: Prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setShowForm(true);
    toast.info("Editando préstamo");
};

const crearPrestamo = () => {
    setPrestamoSeleccionado(null);
    setShowForm(true);
    toast.info("Creando nuevo préstamo");
};

const cerrarFormulario = () => {
    setShowForm(false);
    setPrestamoSeleccionado(null);
};

const prestamosFiltrados = prestamos.filter(p =>
    `${p.paciente?.nombre} ${p.paciente?.apellido} ${p.producto?.nombre}`.toLowerCase().includes(search.toLowerCase())
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
                    <FaClipboardList size={24} className="text-white me-2" />
                    <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                        Gestión de Préstamos
                    </h4>
                </div>
            </Col>
            <Col xs={12} md={6}>
                <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                    <Button 
                        variant="light" 
                        onClick={crearPrestamo}
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
                        <FaPlus className="me-2" /> Nuevo Préstamo
                    </Button>
                    <PDFDownloadLink
                        document={<PrestamosReport prestamos={prestamosFiltrados} />}
                        fileName="Reporte_Prestamos.pdf"
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
                    placeholder="Buscar préstamo..."
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
                <p className="mt-3 text-muted">Cargando información de préstamos...</p>
            </div>
        ) : prestamosFiltrados.length === 0 ? (
            <div className="text-center py-5">
                <p className="text-muted">No se encontraron préstamos que coincidan con la búsqueda.</p>
            </div>
        ) : (
            <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Paciente</th>
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Producto</th>
                    {!isMobile && (
                        <>
                            <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha Préstamo</th>
                            <th className="py-3 px-4" style={{ fontWeight: "600" }}>Fecha Devolución</th>
                        </>
                    )}
                    <th className="py-3 px-4" style={{ fontWeight: "600" }}>Estado</th> 
                    <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                </tr>
                </thead>
                <tbody>
                    {prestamosFiltrados.map((prestamo, index) => (
                        <tr key={prestamo.id_prestamo}>
                            <td className="py-3 px-4">{index + 1}</td>
                            <td className="py-3 px-4">{`${prestamo.paciente?.nombre} ${prestamo.paciente?.apellido}`}</td>
                            <td className="py-3 px-4">{prestamo.producto?.nombre}</td>
                            {!isMobile && (
                                <>
                                    <td className="py-3 px-4">{prestamo.fecha_prestamo}</td>
                                    <td className="py-3 px-4">{prestamo.fecha_devolucion}</td>
                                </>
                            )}
                            <td className="py-3 px-4">
                                <span className={`badge ${prestamo.estado === 'Prestado' ? 'bg-success' : 'bg-primary'}`} 
                                style={{ 
                                    fontSize: '0.95rem',
                                    fontWeight: '800'
                                }}>
                                    {prestamo.estado}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-center'}`} style={{ gap: isMobile ? '8px' : '6px' }}>
                                    <Button 
                                        variant="outline-success" 
                                        size="sm" 
                                        onClick={() => editarPrestamo(prestamo)}
                                        style={{ 
                                            borderRadius: "8px",
                                            padding: "0.4rem 0.6rem",
                                            width: isMobile ? "100%" : "auto"
                                        }}
                                    >
                                        <FaEdit className={isMobile ? "me-2" : ""} /> {isMobile && "Editar"}
                                    </Button>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => eliminarPrestamo(prestamo.id_prestamo)}
                                        style={{ 
                                            borderRadius: "8px",
                                            padding: "0.4rem 0.6rem",
                                            width: isMobile ? "100%" : "auto"
                                        }}
                                    >
                                        <FaTrash className={isMobile ? "me-2" : ""} /> {isMobile && "Eliminar"}
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
        <PrestamosForm
        prestamoEditar={prestamoSeleccionado}
        show={showForm}
        handleClose={cerrarFormulario}
        handleSubmit={handleSubmit}
        />
    )}
    </Container>
);
}

export default PrestamosTable;