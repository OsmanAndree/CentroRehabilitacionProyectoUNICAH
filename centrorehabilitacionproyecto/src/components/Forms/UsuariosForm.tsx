import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
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

    useEffect(() => {
        if (usuarioEditar) {
            setNombre(usuarioEditar.nombre);
            setEmail(usuarioEditar.email);
            setPassword(''); // No mostramos la contraseña actual por seguridad
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

        // Solo incluir password si se está creando un nuevo usuario o si se ha modificado
        if (password) {
            usuario.password = password;
        }

        if (usuarioEditar && usuarioEditar.id_usuario) {
            axios.put(`http://localhost:3002/Api/usuarios/updateusuario?id_usuario=${usuarioEditar.id_usuario}`, usuario)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al editar usuario:', error);
                });
        } else {
            axios.post('http://localhost:3002/Api/usuarios/insertusuario', usuario)
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
                                <Form.Control
                                    type="password"
                                    placeholder={usuarioEditar ? "••••••••" : "Ingrese la contraseña"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!usuarioEditar}
                                />
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
