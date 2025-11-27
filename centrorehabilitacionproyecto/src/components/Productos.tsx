import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Col } from 'react-bootstrap';
import { FaBox, FaSearch, FaPlus, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { AppDispatch, RootState } from '../app/store';
import { fetchProductos, deleteProducto } from '../features/productos/productosSlice';
import ProductosForm from './Forms/ProductosForm';
import ProductosReport from './Reports/ProductosReport';
import PaginationComponent from './PaginationComponent';
import { usePermissions } from '../hooks/usePermissions';

export interface Producto {
    id_producto: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    cantidad_disponible: number;
}

function ProductosTable() {
    const dispatch: AppDispatch = useDispatch();
    const { productos, status, error, pagination } = useSelector((state: RootState) => state.productos);
    const { canCreate, canUpdate, canDelete } = usePermissions();
    
    const [showForm, setShowForm] = useState<boolean>(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [search, setSearch] = useState<string>("");
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchDebounce, setSearchDebounce] = useState<string>("");
    const itemsPerPage = 10;
    
    useEffect(() => {
        dispatch(fetchProductos({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
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

    const eliminarProductoHandler = (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

        dispatch(deleteProducto(id))
            .unwrap()
            .then(() => toast.success("Producto eliminado con éxito."))
            .catch((err) => toast.error(`Error al eliminar: ${err.message}`));
    };

    const handleSubmit = () => {
        dispatch(fetchProductos({ page: currentPage, limit: itemsPerPage, search: searchDebounce }));
        toast.success("Producto guardado con éxito.");
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const editarProducto = (producto: Producto) => {
        setProductoSeleccionado(producto);
        setShowForm(true);
    };

    const crearProducto = () => {
        setProductoSeleccionado(null);
        setShowForm(true);
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setProductoSeleccionado(null);
    };

    const isMobile = windowWidth < 768;

    return (
        <Container fluid className="px-3 px-sm-4 px-md-5 py-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
            <Card className="shadow-lg border-0" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
                <Card.Header className="bg-gradient py-3" style={{ backgroundColor: "#2E8B57", borderRadius: "20px 20px 0 0", border: "none" }}>
                    <Row className="align-items-center">
                        <Col xs={12} md={6} className="mb-3 mb-md-0">
                            <div className="d-flex align-items-center">
                                <FaBox size={24} className="text-white me-2" />
                                <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>Gestión de Productos</h4>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-md-end'}`} style={{ gap: isMobile ? '10px' : '12px' }}>
                                {canCreate('productos') && (
                                    <Button 
                                        variant="light" 
                                        onClick={crearProducto}
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
                                        <FaPlus className="me-2" /> Nuevo Producto
                                    </Button>
                                )}
                                {productos.length > 0 && (
                                    <PDFDownloadLink
                                        document={<ProductosReport productos={productos} />}
                                        fileName="Reporte_Productos.pdf"
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
                                    placeholder="Buscar producto..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ border: "none", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                                />
                            </InputGroup>
                        </div>
                    </Row>

                    {status === 'loading' ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando productos...</p></div>
                    ) : status === 'failed' ? (
                        <div className="text-center py-5"><p className="text-danger">Error: {error}</p></div>
                    ) : (
                        <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden" }}>
                            <Table hover className="align-middle mb-0">
                                <thead style={{ backgroundColor: "#f8f9fa" }}>
                                    <tr>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>#</th>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Nombre</th>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Descripción</th>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Categoría</th>
                                        <th className="py-3 px-4" style={{ fontWeight: "600" }}>Cantidad</th>
                                        <th className="py-3 px-4 text-center" style={{ fontWeight: "600" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.length > 0 ? (
                                        productos.map((producto, index) => (
                                            <tr key={producto.id_producto}>
                                                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="py-3 px-4">{producto.nombre}</td>
                                                <td className="py-3 px-4">{producto.descripcion}</td>
                                                <td className="py-3 px-4">{producto.categoria}</td>
                                                <td className="py-3 px-4">{producto.cantidad_disponible}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {canUpdate('productos') && (
                                                            <Button variant="outline-primary" size="sm" onClick={() => editarProducto(producto)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                                                                <FaEdit />
                                                            </Button>
                                                        )}
                                                        {canDelete('productos') && (
                                                            <Button variant="outline-danger" size="sm" onClick={() => eliminarProductoHandler(producto.id_producto)} style={{ borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                                                                <FaTrash />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={6} className="text-center py-5 text-muted">No se encontraron productos.</td></tr>
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
                <ProductosForm 
                    show={showForm} 
                    handleClose={cerrarFormulario} 
                    handleSubmit={handleSubmit}
                    productoEditar={productoSeleccionado}
                />
            )}
        </Container>
    );
}

export default ProductosTable;