import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaUserShield, FaToggleOn } from 'react-icons/fa';
import axios from 'axios';

interface Usuario {
    id_usuario?: number;
    nombre: string;
    email: string;
    password: string;
    rol: 'Administrador' | 'Terapeuta';
    estado: 'Activo' | 'Inactivo';
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
    const [rol, setRol] = useState<'Administrador' | 'Terapeuta' >('Terapeuta');
    const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (usuarioEditar) {
            setNombre(usuarioEditar.nombre);
            setEmail(usuarioEditar.email);
            setPassword('');
            setRol(usuarioEditar.rol);
            setEstado(usuarioEditar.estado);
        } else {
            setNombre('');
            setEmail('');
            setPassword('');
            setRol('Terapeuta');
            setEstado('Activo');
        }
    }, [usuarioEditar]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const usuario: Partial<Usuario> = {
            nombre,
            email,
            rol,
            estado,
        };

        if (password) {
            usuario.password = password;
        }

        if (usuarioEditar && usuarioEditar.id_usuario) {
            axios.put(`http://localhost:3002/Api/usuarios/updateusuarios?id_usuario=${usuarioEditar.id_usuario}`, usuario)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al editar usuario:', error);
                });
        } else {
            axios.post('http://localhost:3002/Api/usuarios/insertusuarios', usuario)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al crear usuario:', error);
                });
        }
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
                                    <FaUserShield className="me-2" />
                                    Rol
                                </Form.Label>
                                <Form.Select
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value as 'Administrador' | 'Terapeuta')}
                                    required
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#f8f9fa"
                                    }}
                                >
                                    <option value="Administrador">Administrador</option>
                                    <option value="Terapeuta">Terapeuta</option>                      
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
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
