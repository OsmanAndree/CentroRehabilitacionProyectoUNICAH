import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

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
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{terapeutaEditar ? 'Editar Terapeuta' : 'Crear Terapeuta'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleFormSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese el nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese el apellido"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Especialidad</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese la especialidad"
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese el teléfono"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        {terapeutaEditar ? 'Guardar Cambios' : 'Crear Terapeuta'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default TerapeutasForm;