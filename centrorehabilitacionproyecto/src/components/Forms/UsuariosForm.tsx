import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaUserShield, FaToggleOn, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';

interface Role {
    id_role: number;
    nombre: string;
    descripcion?: string;
    is_admin: boolean;
}

interface Usuario {
    id_usuario?: number;
    nombre: string;
    email: string;
    password: string;
    rol: 'Administrador' | 'Terapeuta' | 'Encargado';
    estado: 'Activo' | 'Inactivo';
    roles?: Role[];
}

interface UsuariosFormProps {
    usuarioEditar: Usuario | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
}

function UsuariosForm({
    show,
    handleClose,
    handleSubmit,
    usuarioEditar,
}: UsuariosFormProps) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState<'Administrador' | 'Terapeuta' | 'Encargado'>('Terapeuta');
    const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
    const [showPassword, setShowPassword] = useState(false);
    
    // Sistema de roles dinámicos
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    const getToken = () => localStorage.getItem('token');

    // Cargar roles disponibles
    useEffect(() => {
        setLoadingRoles(true);
        axios.get('http://localhost:3002/Api/roles/getallroles', {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then(response => {
                setAvailableRoles(response.data.result || []);
            })
            .catch(error => {
                console.error("Error al cargar roles:", error);
                // Si falla, mantener el sistema legacy
            })
            .finally(() => setLoadingRoles(false));
    }, []);

    useEffect(() => {
        if (usuarioEditar) {
            setNombre(usuarioEditar.nombre);
            setEmail(usuarioEditar.email);
            setPassword('');
            setRol(usuarioEditar.rol);
            setEstado(usuarioEditar.estado);
            // Cargar roles asignados si existen
            if (usuarioEditar.roles && usuarioEditar.roles.length > 0) {
                setSelectedRoles(usuarioEditar.roles.map(r => r.id_role));
            } else {
                // Intentar mapear el rol legacy a un rol dinámico
                const legacyRole = availableRoles.find(r => r.nombre === usuarioEditar.rol);
                if (legacyRole) {
                    setSelectedRoles([legacyRole.id_role]);
                } else {
                    setSelectedRoles([]);
                }
            }
        } else {
            setNombre('');
            setEmail('');
            setPassword('');
            setRol('Terapeuta');
            setEstado('Activo');
            setSelectedRoles([]);
        }
    }, [usuarioEditar, availableRoles]);

    const handleRoleToggle = (roleId: number) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId);
            } else {
                return [...prev, roleId];
            }
        });

        // Actualizar el campo rol legacy basado en el primer rol seleccionado
        const selectedRole = availableRoles.find(r => r.id_role === roleId);
        if (selectedRole) {
            const roleName = selectedRole.nombre as 'Administrador' | 'Terapeuta' | 'Encargado';
            if (['Administrador', 'Terapeuta', 'Encargado'].includes(roleName)) {
                setRol(roleName);
            }
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const usuario: Record<string, unknown> = {
            nombre,
            email,
            rol, // Campo legacy
            estado,
            roles: selectedRoles // Roles dinámicos
        };

        if (password) {
            usuario.password = password;
        }

        const headers = { Authorization: `Bearer ${getToken()}` };

        if (usuarioEditar && usuarioEditar.id_usuario) {
            axios.put(`http://localhost:3002/Api/usuarios/updateusuarios?id_usuario=${usuarioEditar.id_usuario}`, usuario, { headers })
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al editar usuario:', error);
                    alert(error.response?.data?.message || 'Error al editar usuario');
                });
        } else {
            axios.post('http://localhost:3002/Api/usuarios/insertusuarios', usuario, { headers })
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al crear usuario:', error);
                    alert(error.response?.data?.message || 'Error al crear usuario');
                });
        }
    };

    const getRoleBadgeVariant = (role: Role): string => {
        if (role.is_admin) return 'warning';
        if (role.nombre === 'Terapeuta') return 'info';
        return 'secondary';
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            centered
            size="lg"
            backdrop="static"
            className="custom-modal"
        >
            <Modal.Header 
                className="border-0 position-relative"
                style={{
                    background: "linear-gradient(135deg, #2E8B57 0%, #1a5735 100%)",
                    borderRadius: "15px 15px 0 0",
                    padding: "1.5rem"
                }}
            >
                <Modal.Title className="text-white">
                    <div className="d-flex align-items-center">
                        <FaUser className="me-2" size={24} />
                        <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
                            {usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </span>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: "2rem" }}>
                <Form onSubmit={handleFormSubmit}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaUser className="me-2" />
                                    Nombre
                                </Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        <FaUser className="text-muted" />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingrese el nombre completo"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                        style={{
                                            borderLeft: "none",
                                            padding: "0.75rem",
                                            backgroundColor: "#f8f9fa"
                                        }}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaEnvelope className="me-2" />
                                    Email
                                </Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        <FaEnvelope className="text-muted" />
                                    </span>
                                    <Form.Control
                                        type="email"
                                        placeholder="Ingrese el email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            borderLeft: "none",
                                            padding: "0.75rem",
                                            backgroundColor: "#f8f9fa"
                                        }}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaLock className="me-2" />
                                    Contraseña {usuarioEditar && '(Dejar vacío para mantener)'}
                                </Form.Label>
                                <InputGroup>
                                    <span className="input-group-text bg-light border-0">
                                        <FaLock className="text-muted" />
                                    </span>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder={usuarioEditar ? "••••••••" : "Ingrese la contraseña"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required={!usuarioEditar}
                                        style={{
                                            borderLeft: "none",
                                            padding: "0.75rem",
                                            backgroundColor: "#f8f9fa"
                                        }}
                                    />
                                    <Button 
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ 
                                            borderColor: '#ced4da',
                                            backgroundColor: "#f8f9fa"
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaToggleOn className="me-2" />
                                    Estado
                                </Form.Label>
                                <Form.Select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
                                    required
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#f8f9fa"
                                    }}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Sección de Roles Dinámicos */}
                    <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                        <Form.Label className="fw-semibold mb-3 d-flex align-items-center">
                            <FaShieldAlt className="me-2 text-success" />
                            Roles del Usuario
                            {loadingRoles && <Spinner animation="border" size="sm" className="ms-2" />}
                        </Form.Label>
                        
                        {!loadingRoles && availableRoles.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                                {availableRoles.map((role) => (
                                    <Badge
                                        key={role.id_role}
                                        bg={selectedRoles.includes(role.id_role) ? getRoleBadgeVariant(role) : 'light'}
                                        text={selectedRoles.includes(role.id_role) ? 'white' : 'dark'}
                                        className="p-2 d-flex align-items-center"
                                        style={{ 
                                            cursor: 'pointer',
                                            border: selectedRoles.includes(role.id_role) ? 'none' : '1px solid #dee2e6',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => handleRoleToggle(role.id_role)}
                                    >
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedRoles.includes(role.id_role)}
                                            onChange={() => {}}
                                            className="me-2"
                                            style={{ margin: 0 }}
                                        />
                                        {role.nombre}
                                        {role.is_admin && <span className="ms-1">👑</span>}
                                    </Badge>
                                ))}
                            </div>
                        ) : !loadingRoles ? (
                            // Fallback al sistema legacy si no hay roles dinámicos
                            <Form.Select
                                value={rol}
                                onChange={(e) => setRol(e.target.value as 'Administrador' | 'Terapeuta' | 'Encargado')}
                                required
                                style={{
                                    padding: "0.75rem",
                                    backgroundColor: "white"
                                }}
                            >
                                <option value="Administrador">Administrador</option>
                                <option value="Terapeuta">Terapeuta</option>
                                <option value="Encargado">Encargado</option>
                            </Form.Select>
                        ) : null}
                        
                        {selectedRoles.length === 0 && !loadingRoles && availableRoles.length > 0 && (
                            <small className="text-muted mt-2 d-block">
                                Selecciona al menos un rol para el usuario
                            </small>
                        )}
                    </div>

                    {/* Campo legacy oculto - mantiene compatibilidad */}
                    <input type="hidden" value={rol} />

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px"
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="success" 
                            type="submit"
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px",
                                backgroundColor: "#2E8B57"
                            }}
                            disabled={selectedRoles.length === 0 && availableRoles.length > 0}
                        >
                            {usuarioEditar ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default UsuariosForm;
