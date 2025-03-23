import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

interface Usuario {
    id_usuario?: number;
    nombre: string;
    email: string;
    password: string;
    rol: 'Administrador' | 'Terapeuta' | 'Encargado';
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
    const [rol, setRol] = useState<'Administrador' | 'Terapeuta' | 'Encargado'>('Encargado');
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
            setRol('Encargado');
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
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>{usuarioEditar ? 'Editar Usuario' : 'Crear Usuario'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Form onSubmit={handleFormSubmit}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese el nombre completo"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Ingrese el email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Contraseña {usuarioEditar && '(Dejar vacío para mantener)'}</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder={usuarioEditar ? "••••••••" : "Ingrese la contraseña"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required={!usuarioEditar}
                                    />
                                    <Button 
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ borderColor: '#ced4da' }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Rol</Form.Label>
                                <Form.Select
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value as 'Administrador' | 'Terapeuta' | 'Encargado')}
                                    required
                                >
                                    <option value="Administrador">Administrador</option>
                                    <option value="Terapeuta">Terapeuta</option>
                                    <option value="Encargado">Encargado</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Estado</Form.Label>
                                <Form.Select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
                                    required
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button variant="success" type="submit" className="me-2">
                            {usuarioEditar ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default UsuariosForm;
