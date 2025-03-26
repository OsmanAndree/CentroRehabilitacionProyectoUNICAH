import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

interface Encargado {
  id_encargado?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
}

interface EncargadosFormModalProps {
  encargadoEditar: Encargado | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

interface EncargadosFormModalProps {
    encargadoEditar: Encargado | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;   
}

function EncargadosForm({
    show,
    handleClose,
    handleSubmit,
    encargadoEditar,   
}: EncargadosFormModalProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    
    useEffect(() => {
        if (encargadoEditar) {
            setNombre(encargadoEditar.nombre);
            setApellido(encargadoEditar.apellido);
            setTelefono(encargadoEditar.telefono || '');
            setDireccion(encargadoEditar.direccion || '');
        } else {
            setNombre('');
            setApellido('');
            setTelefono('');
            setDireccion('');}
    }, [encargadoEditar]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const encargado: Encargado = {
            nombre,
            apellido,
            telefono,
            direccion,
        };
        
        if (encargadoEditar && encargadoEditar.id_encargado) {
            axios.put(`http://localhost:3002/Api/encargados/updateencargados?encargado_id=${encargadoEditar.id_encargado}`, encargado)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al editar encargado:', error);
                });
        } else {
            axios.post('http://localhost:3002/Api/encargados/insertencargados', encargado)
            .then(() => {
                handleSubmit();
                handleClose();
            })
            .catch(error => {
                console.error('Error al insertar encargado:', error);
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
                            {encargadoEditar ? 'Editar Encargado' : 'Nuevo Encargado'}
                        </span>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: "2rem" }}>
                <Form onSubmit={handleFormSubmit}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">Nombre</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        <FaUser className="text-muted" />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingrese el nombre"
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
                                <Form.Label className="fw-semibold mb-2">Apellido</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        <FaUser className="text-muted" />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingrese el apellido"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
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
                                        backgroundColor: "#f8f9fa"
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaMapMarkerAlt className="me-2" />
                                    Dirección
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese la dirección"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#f8f9fa"
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
                            {encargadoEditar ? 'Guardar Cambios' : 'Crear Encargado'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EncargadosForm;