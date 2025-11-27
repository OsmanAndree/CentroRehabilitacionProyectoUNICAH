import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserFriends, FaFilePdf } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { AppDispatch, RootState } from '../app/store';
import { fetchEncargados, deleteEncargado } from '../features/encargados/encargadosSlice';
import EncargadosForm from './Forms/EncargadosForm';
import EncargadosReport from './Reports/EncargadosReport';
import PaginationComponent from './PaginationComponent';
import { usePermissions } from '../hooks/usePermissions';

export interface Encargado {
    id_encargado: number;
    nombre: string;
    apellido: string;
    telefono: string;
    direccion: string;
}

function EncargadosTable() {
    const dispatch: AppDispatch = useDispatch();
    const { encargados, status, error, pagination } = useSelector((state: RootState) => state.encargados);
    const { canCreate, canUpdate, canDelete } = usePermissions();

    const [showForm, setShowForm] = useState<boolean>(false);
    const [encargadoSeleccionado, setEncargadoSeleccionado] = useState<Encargado | null>(null);
    const [search, setSearch] = useState<string>("");
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchDebounce, setSearchDebounce] = useState<string>("");
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchEncargados({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
    }, [dispatch, currentPage, searchDebounce]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const eliminarEncargadoHandler = (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este encargado?")) return;
        dispatch(deleteEncargado(id))
            .unwrap()
            .then(() => toast.success("Encargado eliminado con éxito."))
            .catch((err) => toast.error(`Error al eliminar: ${err.message || 'Error desconocido'}`));
    };

    const handleSubmit = () => {
        dispatch(fetchEncargados({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
        toast.success("Encargado guardado con éxito.");
        cerrarFormulario();
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const isMobile = windowWidth < 768;

    return (
        <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
            <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
                {/* El resto de tu JSX no necesita cambios */}
                <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
                    <Row className="align-items-center">
                        <Col xs={12} md={6} className="mb-3 mb-md-0">
                            <div className="d-flex align-items-center">
                                <FaUserFriends size={24} className="text-white me-2" />
                                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Encargados</h4>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                                {canCreate('encargados') && (
                                    <Button variant="light" onClick={crearEncargado} className="d-flex align-items-center justify-content-center">
                                        <FaPlus className="me-2" /> Nuevo Encargado
                                    </Button>
                                )}
                                {encargados.length > 0 && (
                                    <PDFDownloadLink
                                        document={<EncargadosReport encargados={encargados} />}
                                        fileName="Reporte_Encargados.pdf"
                                        className={`btn btn-success ${isMobile ? 'w-100' : ''}`}
                                    >
                                        {({ loading }) => (
                                            <div className="d-flex align-items-center justify-content-center w-100">
                                                <FaFilePdf className="me-2" />
                                                {loading ? "Generando..." : "Descargar Reporte"}
                                            </div>
                                        )}
                                    </PDFDownloadLink>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-3 p-md-4">
                    <Row className="mb-4">
                        <div className="col-md-6 col-lg-4">
                            <InputGroup style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" }}>
                                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "none", paddingLeft: "1.2rem" }}>
                                    <FaSearch className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar encargado..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                                />
                            </InputGroup>
                        </div>
                    </Row>

                    {status === 'loading' && encargados.length === 0 ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando encargados...</p></div>
                    ) : status === 'failed' ? (
                        <div className="text-center py-5"><p className="text-danger">Error: {error}</p></div>
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
                                    {encargados.length > 0 ? (
                                        encargados.map((encargado, index) => (
                                            <tr key={encargado.id_encargado}>
                                                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="py-3 px-4">{`${encargado.nombre} ${encargado.apellido}`}</td>
                                                <td className="py-3 px-4">{encargado.telefono}</td>
                                                <td className="py-3 px-4">{encargado.direccion}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {canUpdate('encargados') && (
                                                            <Button variant="outline-primary" size="sm" onClick={() => editarEncargado(encargado)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                                                                <FaEdit />
                                                            </Button>
                                                        )}
                                                        {canDelete('encargados') && (
                                                            <Button variant="outline-danger" size="sm" onClick={() => eliminarEncargadoHandler(encargado.id_encargado)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                                                                <FaTrash />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={5} className="text-center py-5 text-muted">No se encontraron encargados.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    <PaginationComponent 
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                    />
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
