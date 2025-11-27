import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaCrown } from 'react-icons/fa';
import axios from 'axios';
import UsuariosForm from './Forms/UsuariosForm';
import PaginationComponent from './PaginationComponent';
import { usePermissions } from '../hooks/usePermissions';

interface Role {
    id_role: number;
    nombre: string;
    is_admin: boolean;
}

interface Usuario {
    id_usuario: number;
    nombre: string;
    email: string;
    password: string;
    rol?: string; // Campo legacy - opcional
    estado: 'Activo' | 'Inactivo';
    roles?: Role[]; // Roles dinámicos de la relación
    created_at?: Date;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

function UsuariosTable() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const { canCreate, canUpdate, canDelete } = usePermissions();
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchDebounce, setSearchDebounce] = useState<string>("");
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const itemsPerPage = 10;

    const obtenerUsuarios = useCallback((page: number = 1, searchParam: string = "") => {
        setLoading(true);
        axios.get('http://localhost:3002/Api/usuarios/getusuarios', {
            params: { page, limit: itemsPerPage, search: searchParam }
        })
            .then(response => {
                setUsuarios(response.data.result);
                setPagination(response.data.pagination);
                // toast.success("Usuarios cargados exitosamente"); // <--- Eliminado
            })
            .catch(error => {
                console.error("Error al obtener usuarios:", error);
                // toast.error("No se pudieron cargar los usuarios."); // <--- Eliminado
            })
            .finally(() => setLoading(false));
    }, [itemsPerPage]);

    useEffect(() => {
        obtenerUsuarios(currentPage, searchDebounce);
    }, [obtenerUsuarios, currentPage, searchDebounce]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const eliminarUsuario = (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

        axios.delete(`http://localhost:3002/Api/usuarios/deleteusuarios?id_usuario=${id}`)
            .then(() => {
                setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
                // toast.success("Usuario eliminado con éxito."); // <--- Eliminado
            })
            .catch(error => {
                console.error("Error al eliminar usuario:", error);
                // toast.error("Hubo un problema al eliminar el usuario."); // <--- Eliminado
            });
    };

    const handleSubmit = () => {
        obtenerUsuarios(currentPage, searchDebounce);
        // toast.success("Usuario guardado con éxito."); // <--- Eliminado
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const editarUsuario = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setShowForm(true);
        // toast.info("Editando usuario"); // <--- Eliminado
    };

    const crearUsuario = () => {
        setUsuarioSeleccionado(null);
        setShowForm(true);
        // toast.info("Creando nuevo usuario"); // <--- Eliminado
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setUsuarioSeleccionado(null);
    };

    return (
        <Container fluid className="px-5 py-4">
            {/* <ToastContainer ... /> // <--- Eliminado */}
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
                        <FaUsers size={24} className="text-white me-2" />
                        <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                            Gestión de Usuarios
                        </h4>
                    </div>
                    {canCreate('usuarios') && (
                        <Button 
                            variant="light" 
                            onClick={crearUsuario}
                            className="d-flex align-items-center"
                            style={{
                                borderRadius: "10px",
                                padding: "0.5rem 1rem",
                                fontWeight: "500",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <FaPlus className="me-2" /> Nuevo Usuario
                        </Button>
                    )}
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
                                    placeholder="Buscar usuario..."
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
                            <p className="mt-3 text-muted">Cargando información de usuarios...</p>
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
                                        <th className="py-3 px-4 text-muted">Nombre</th>
                                        <th className="py-3 px-4 text-muted">Email</th>
                                        <th className="py-3 px-4 text-muted">Roles</th>
                                        <th className="py-3 px-4 text-muted">Estado</th>
                                        <th className="py-3 px-4 text-muted text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length > 0 ? (
                                        usuarios.map((usuario, index) => (
                                            <tr key={usuario.id_usuario}>
                                                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="py-3 px-4">{usuario.nombre}</td>
                                                <td className="py-3 px-4">{usuario.email}</td>
                                                <td className="py-3 px-4">
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {usuario.roles && usuario.roles.length > 0 ? (
                                                            usuario.roles.map((role) => (
                                                                <Badge 
                                                                    key={role.id_role} 
                                                                    bg={role.is_admin ? 'warning' : 'info'}
                                                                    text={role.is_admin ? 'dark' : 'white'}
                                                                    className="d-flex align-items-center"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                >
                                                                    {role.is_admin && <FaCrown className="me-1" size={10} />}
                                                                    {role.nombre}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted fst-italic">Sin rol asignado</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`badge ${usuario.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                                                        {usuario.estado}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {canUpdate('usuarios') && (
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm" 
                                                            onClick={() => editarUsuario(usuario)}
                                                            className="me-2"
                                                            style={{ borderRadius: "8px" }}
                                                        >
                                                            <FaEdit /> Editar
                                                        </Button>
                                                    )}
                                                    {canDelete('usuarios') && (
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            onClick={() => eliminarUsuario(usuario.id_usuario)}
                                                            style={{ borderRadius: "8px" }}
                                                        >
                                                            <FaTrash /> Eliminar
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5 text-muted">
                                                No se encontraron usuarios que coincidan con la búsqueda.
                                            </td>
                                        </tr>
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
                <UsuariosForm
                    usuarioEditar={usuarioSeleccionado}
                    show={showForm}
                    handleClose={cerrarFormulario}
                    handleSubmit={handleSubmit}
                />
            )}
        </Container>
    );
}

export default UsuariosTable;
