import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

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
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>{encargadoEditar ? 'Editar Encargado' : 'Crear Encargado'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Form onSubmit={handleFormSubmit}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese el nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese el apellido"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese el teléfono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese el teléfono"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button variant="success" type="submit" className="me-2">
                            {encargadoEditar ? 'Guardar Cambios' : 'Crear Encargado'}
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

export default EncargadosForm;