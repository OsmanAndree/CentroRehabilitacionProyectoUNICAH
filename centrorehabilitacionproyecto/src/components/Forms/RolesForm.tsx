import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { FaShieldAlt, FaSave, FaTimes, FaCheckSquare, FaSquare, FaCrown, FaKey } from 'react-icons/fa';
import axios from 'axios';

interface Permission {
    id_permission: number;
    nombre: string;
    slug: string;
    modulo: string;
    descripcion?: string;
}

interface PermissionGroup {
    modulo: string;
    nombre: string;
    permissions: Permission[];
}

interface Role {
    id_role: number;
    nombre: string;
    descripcion: string;
    is_admin: boolean;
    permissions: Permission[];
}

interface RolesFormProps {
    roleEditar: Role | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
}

const RolesForm: React.FC<RolesFormProps> = ({ roleEditar, show, handleClose, handleSubmit }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    const getToken = () => localStorage.getItem('token');

    // Cargar permisos agrupados
    useEffect(() => {
        setLoadingPermissions(true);
        axios.get('http://localhost:3002/Api/permissions/getpermissionsgrouped', {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then(response => {
                setPermissionGroups(response.data.result);
            })
            .catch(error => {
                console.error("Error al cargar permisos:", error);
            })
            .finally(() => setLoadingPermissions(false));
    }, []);

    // Cargar datos del rol si se está editando
    useEffect(() => {
        if (roleEditar) {
            setNombre(roleEditar.nombre);
            setDescripcion(roleEditar.descripcion || '');
            setIsAdmin(roleEditar.is_admin);
            setSelectedPermissions(roleEditar.permissions?.map(p => p.id_permission) || []);
        } else {
            setNombre('');
            setDescripcion('');
            setIsAdmin(false);
            setSelectedPermissions([]);
        }
    }, [roleEditar]);

    const handlePermissionToggle = (permissionId: number) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleModuleSelectAll = (modulo: string) => {
        const group = permissionGroups.find(g => g.modulo === modulo);
        if (!group) return;

        const modulePermissionIds = group.permissions.map(p => p.id_permission);
        const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Deseleccionar todos del módulo
            setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
        } else {
            // Seleccionar todos del módulo
            setSelectedPermissions(prev => {
                const newSelected = [...prev];
                modulePermissionIds.forEach(id => {
                    if (!newSelected.includes(id)) {
                        newSelected.push(id);
                    }
                });
                return newSelected;
            });
        }
    };

    const isModuleFullySelected = (modulo: string): boolean => {
        const group = permissionGroups.find(g => g.modulo === modulo);
        if (!group) return false;
        return group.permissions.every(p => selectedPermissions.includes(p.id_permission));
    };

    const isModulePartiallySelected = (modulo: string): boolean => {
        const group = permissionGroups.find(g => g.modulo === modulo);
        if (!group) return false;
        const hasSelected = group.permissions.some(p => selectedPermissions.includes(p.id_permission));
        const hasUnselected = group.permissions.some(p => !selectedPermissions.includes(p.id_permission));
        return hasSelected && hasUnselected;
    };

    const selectAllPermissions = () => {
        const allIds = permissionGroups.flatMap(g => g.permissions.map(p => p.id_permission));
        setSelectedPermissions(allIds);
    };

    const deselectAllPermissions = () => {
        setSelectedPermissions([]);
    };

    const guardarRole = async () => {
        if (!nombre.trim()) {
            alert('El nombre del rol es requerido');
            return;
        }

        setLoading(true);

        const roleData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            is_admin: isAdmin,
            permissions: selectedPermissions
        };

        try {
            if (roleEditar) {
                await axios.put(`http://localhost:3002/Api/roles/updaterole?id_role=${roleEditar.id_role}`, roleData, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
            } else {
                await axios.post('http://localhost:3002/Api/roles/insertrole', roleData, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
            }
            handleSubmit();
            handleClose();
        } catch (error: any) {
            console.error("Error al guardar rol:", error);
            alert(error.response?.data?.message || "Error al guardar el rol");
        } finally {
            setLoading(false);
        }
    };

    const getActionLabel = (slug: string): string => {
        const action = slug.split('.')[1];
        const labels: Record<string, string> = {
            'view': 'Ver',
            'create': 'Crear',
            'update': 'Editar',
            'delete': 'Eliminar'
        };
        return labels[action] || action;
    };

    const getActionColor = (slug: string): string => {
        const action = slug.split('.')[1];
        const colors: Record<string, string> = {
            'view': 'info',
            'create': 'success',
            'update': 'warning',
            'delete': 'danger'
        };
        return colors[action] || 'secondary';
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: "#2E8B57", color: "white" }}>
                <Modal.Title className="d-flex align-items-center">
                    <FaShieldAlt className="me-2" />
                    {roleEditar ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Form>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">
                                    Nombre del Rol <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: Supervisor, Auditor, Pasante..."
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    style={{ borderRadius: '10px' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Descripción</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Descripción breve del rol..."
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    style={{ borderRadius: '10px' }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col>
                            <Card className={`border ${isAdmin ? 'border-warning' : ''}`} style={{ borderRadius: '12px' }}>
                                <Card.Body className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <FaCrown className={`me-3 ${isAdmin ? 'text-warning' : 'text-muted'}`} size={24} />
                                        <div>
                                            <h6 className="mb-0 fw-bold">Super Administrador (Gate)</h6>
                                            <small className="text-muted">
                                                Este rol tendrá acceso total a todas las funciones del sistema, sin importar los permisos seleccionados.
                                            </small>
                                        </div>
                                    </div>
                                    <Form.Check
                                        type="switch"
                                        id="is-admin-switch"
                                        checked={isAdmin}
                                        onChange={(e) => setIsAdmin(e.target.checked)}
                                        style={{ transform: 'scale(1.3)' }}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {!isAdmin && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FaKey className="me-2 text-success" />
                                    Permisos del Rol
                                </h5>
                                <div>
                                    <Button 
                                        variant="outline-success" 
                                        size="sm" 
                                        className="me-2"
                                        onClick={selectAllPermissions}
                                    >
                                        <FaCheckSquare className="me-1" /> Seleccionar Todo
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        onClick={deselectAllPermissions}
                                    >
                                        <FaSquare className="me-1" /> Deseleccionar Todo
                                    </Button>
                                </div>
                            </div>

                            {loadingPermissions ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="mt-2 text-muted">Cargando permisos...</p>
                                </div>
                            ) : (
                                <Row>
                                    {permissionGroups.map((group) => (
                                        <Col md={6} lg={4} key={group.modulo} className="mb-3">
                                            <Card style={{ borderRadius: '12px', height: '100%' }}>
                                                <Card.Header 
                                                    className="d-flex justify-content-between align-items-center py-2"
                                                    style={{ 
                                                        backgroundColor: isModuleFullySelected(group.modulo) 
                                                            ? 'rgba(46, 139, 87, 0.1)' 
                                                            : '#f8f9fa',
                                                        borderRadius: '12px 12px 0 0',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => handleModuleSelectAll(group.modulo)}
                                                >
                                                    <span className="fw-bold text-capitalize d-flex align-items-center">
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={isModuleFullySelected(group.modulo)}
                                                            onChange={() => handleModuleSelectAll(group.modulo)}
                                                            className="me-2"
                                                            style={{ 
                                                                opacity: isModulePartiallySelected(group.modulo) ? 0.5 : 1 
                                                            }}
                                                        />
                                                        {group.nombre}
                                                    </span>
                                                    <Badge bg="secondary" pill>
                                                        {group.permissions.filter(p => selectedPermissions.includes(p.id_permission)).length}/{group.permissions.length}
                                                    </Badge>
                                                </Card.Header>
                                                <Card.Body className="py-2">
                                                    {group.permissions.map((permission) => (
                                                        <Form.Check
                                                            key={permission.id_permission}
                                                            type="checkbox"
                                                            id={`perm-${permission.id_permission}`}
                                                            label={
                                                                <span className="d-flex align-items-center">
                                                                    <Badge 
                                                                        bg={getActionColor(permission.slug)} 
                                                                        className="me-2"
                                                                        style={{ fontSize: '0.7rem', width: '55px' }}
                                                                    >
                                                                        {getActionLabel(permission.slug)}
                                                                    </Badge>
                                                                    <small className="text-muted">{permission.nombre}</small>
                                                                </span>
                                                            }
                                                            checked={selectedPermissions.includes(permission.id_permission)}
                                                            onChange={() => handlePermissionToggle(permission.id_permission)}
                                                            className="mb-1"
                                                        />
                                                    ))}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            <div className="mt-3 p-3 bg-light rounded">
                                <small className="text-muted">
                                    <strong>Permisos seleccionados:</strong> {selectedPermissions.length} de {permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0)}
                                </small>
                            </div>
                        </>
                    )}

                    {isAdmin && (
                        <div className="alert alert-warning d-flex align-items-center" role="alert">
                            <FaCrown className="me-2" size={20} />
                            <div>
                                <strong>Rol de Super Administrador activado.</strong>
                                <br />
                                <small>Este rol tendrá acceso total a todas las funciones sin restricciones.</small>
                            </div>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
                    <FaTimes className="me-2" /> Cancelar
                </Button>
                <Button 
                    variant="success" 
                    onClick={guardarRole}
                    disabled={loading}
                    style={{ borderRadius: '10px' }}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <FaSave className="me-2" /> {roleEditar ? 'Actualizar Rol' : 'Crear Rol'}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RolesForm;

