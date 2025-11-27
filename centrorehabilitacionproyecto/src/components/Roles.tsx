import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaShieldAlt, FaKey, FaCrown } from 'react-icons/fa';
import axios from 'axios';
import RolesForm from './Forms/RolesForm';
import PaginationComponent from './PaginationComponent';

interface Permission {
    id_permission: number;
    nombre: string;
    slug: string;
    modulo: string;
}

interface Role {
    id_role: number;
    nombre: string;
    descripcion: string;
    is_admin: boolean;
    permissions: Permission[];
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

function RolesTable() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [roleSeleccionado, setRoleSeleccionado] = useState<Role | null>(null);
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchDebounce, setSearchDebounce] = useState<string>("");
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const itemsPerPage = 10;

    const getToken = () => localStorage.getItem('token');

    const obtenerRoles = useCallback((page: number = 1, searchParam: string = "") => {
        setLoading(true);
        axios.get('http://localhost:3002/Api/roles/getroles', {
            params: { page, limit: itemsPerPage, search: searchParam },
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then(response => {
                setRoles(response.data.result);
                setPagination(response.data.pagination);
            })
            .catch(error => {
                console.error("Error al obtener roles:", error);
            })
            .finally(() => setLoading(false));
    }, [itemsPerPage]);

    useEffect(() => {
        obtenerRoles(currentPage, searchDebounce);
    }, [obtenerRoles, currentPage, searchDebounce]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const eliminarRole = (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este rol?")) return;

        axios.delete(`http://localhost:3002/Api/roles/deleterole?id_role=${id}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then(() => {
                setRoles(prev => prev.filter(r => r.id_role !== id));
            })
            .catch(error => {
                console.error("Error al eliminar rol:", error);
                alert(error.response?.data?.message || "Hubo un problema al eliminar el rol.");
            });
    };

    const handleSubmit = () => {
        obtenerRoles(currentPage, searchDebounce);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const editarRole = (role: Role) => {
        setRoleSeleccionado(role);
        setShowForm(true);
    };

    const crearRole = () => {
        setRoleSeleccionado(null);
        setShowForm(true);
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setRoleSeleccionado(null);
    };

    const getPermissionCount = (permissions: Permission[]) => {
        return permissions?.length || 0;
    };

    const getModulesCount = (permissions: Permission[]) => {
        if (!permissions) return 0;
        const modules = new Set(permissions.map(p => p.modulo));
        return modules.size;
    };

    return (
        <Container fluid className="px-5 py-4">
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
                        <FaShieldAlt size={24} className="text-white me-2" />
                        <h4 className="mb-0 text-white" style={{ fontWeight: '600' }}>
                            Gestión de Roles y Permisos
                        </h4>
                    </div>
                    <Button 
                        variant="light" 
                        onClick={crearRole}
                        className="d-flex align-items-center"
                        style={{
                            borderRadius: "10px",
                            padding: "0.5rem 1rem",
                            fontWeight: "500",
                            transition: "all 0.3s ease"
                        }}
                    >
                        <FaPlus className="me-2" /> Nuevo Rol
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
                                    placeholder="Buscar rol..."
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
                            <p className="mt-3 text-muted">Cargando roles...</p>
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
                                        <th className="py-3 px-4 text-muted">Rol</th>
                                        <th className="py-3 px-4 text-muted">Descripción</th>
                                        <th className="py-3 px-4 text-muted">Tipo</th>
                                        <th className="py-3 px-4 text-muted text-center">Permisos</th>
                                        <th className="py-3 px-4 text-muted text-center">Módulos</th>
                                        <th className="py-3 px-4 text-muted text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.length > 0 ? (
                                        roles.map((role, index) => (
                                            <tr key={role.id_role}>
                                                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="d-flex align-items-center">
                                                        {role.is_admin && (
                                                            <FaCrown className="text-warning me-2" title="Super Admin" />
                                                        )}
                                                        <strong>{role.nombre}</strong>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-muted" style={{ maxWidth: '250px' }}>
                                                    {role.descripcion || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {role.is_admin ? (
                                                        <Badge bg="warning" text="dark" className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                                                            <FaCrown className="me-1" /> Super Admin
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="secondary">
                                                            Rol Estándar
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge bg="info" className="d-flex align-items-center justify-content-center" style={{ width: '80px', margin: '0 auto' }}>
                                                        <FaKey className="me-1" />
                                                        {role.is_admin ? '∞' : getPermissionCount(role.permissions)}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge bg="primary">
                                                        {role.is_admin ? 'Todos' : getModulesCount(role.permissions)}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Button 
                                                        variant="outline-success" 
                                                        size="sm" 
                                                        onClick={() => editarRole(role)}
                                                        className="me-2"
                                                        style={{ borderRadius: "8px" }}
                                                    >
                                                        <FaEdit /> Editar
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm" 
                                                        onClick={() => eliminarRole(role.id_role)}
                                                        style={{ borderRadius: "8px" }}
                                                        disabled={role.is_admin}
                                                        title={role.is_admin ? "No se puede eliminar el rol admin" : ""}
                                                    >
                                                        <FaTrash /> Eliminar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-5 text-muted">
                                                No se encontraron roles que coincidan con la búsqueda.
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
                <RolesForm
                    roleEditar={roleSeleccionado}
                    show={showForm}
                    handleClose={cerrarFormulario}
                    handleSubmit={handleSubmit}
                />
            )}
        </Container>
    );
}

export default RolesTable;

