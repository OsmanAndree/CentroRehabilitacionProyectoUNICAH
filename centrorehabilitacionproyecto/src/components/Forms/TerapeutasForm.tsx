import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaUserMd, FaUser, FaStethoscope, FaPhone } from 'react-icons/fa';

interface Terapeuta {
    id_terapeuta?: number;
    nombre: string;
    apellido: string;
    especialidad: string;
    telefono: string;
}

interface TerapeutasFormProps {
    terapeutaEditar: Terapeuta | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
}

function TerapeutasForm({
    show,
    handleClose,
    handleSubmit,
    terapeutaEditar,
}: TerapeutasFormProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [telefono, setTelefono] = useState('');

    useEffect(() => {
        if (terapeutaEditar) {
            setNombre(terapeutaEditar.nombre);
            setApellido(terapeutaEditar.apellido);
            setEspecialidad(terapeutaEditar.especialidad);
            setTelefono(terapeutaEditar.telefono);
        } else {
            setNombre('');
            setApellido('');
            setEspecialidad('');
            setTelefono('');
        }
    }, [terapeutaEditar]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const terapeuta: Terapeuta = {
            nombre,
            apellido,
            especialidad,
            telefono,
        };

        if (terapeutaEditar && terapeutaEditar.id_terapeuta) {
            axios.put(`http://localhost:3002/Api/terapeutas/updateterapeutas?terapeuta_id=${terapeutaEditar.id_terapeuta}`, terapeuta)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al editar terapeuta:', error);
                });
        } else {
            axios.post('http://localhost:3002/Api/terapeutas/insertterapeutas', terapeuta)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al crear terapeuta:', error);
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
                        <FaUserMd className="me-2" size={24} />
                        <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
                            {terapeutaEditar ? 'Editar Terapeuta' : 'Nuevo Terapeuta'}
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
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese el nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px"
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaUser className="me-2" />
                                    Apellido
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese el apellido"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    required
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px"
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaStethoscope className="me-2" />
                                    Especialidad
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese la especialidad"
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                    required
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px"
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaPhone className="me-2" />
                                    Teléfono
                                </Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Ingrese el teléfono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px"
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

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
                            {terapeutaEditar ? 'Guardar Cambios' : 'Crear Terapeuta'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default TerapeutasForm;