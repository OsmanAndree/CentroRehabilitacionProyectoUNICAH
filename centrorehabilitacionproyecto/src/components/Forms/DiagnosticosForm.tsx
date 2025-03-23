import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Diagnostico {
    id_diagnostico?: number;
    id_paciente: number;
    id_terapeuta: number;
    descripcion: string;
    tratamiento: string;
}

interface Paciente {
    id_paciente: number;
    nombre: string;
    apellido: string;
}

interface Terapeuta {
    id_terapeuta: number;
    nombre: string;
    especialidad: string;
}

interface DiagnosticosFormModalProps {
    diagnosticoEditar: Diagnostico | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
}

function DiagnosticosForm({
    show,
    handleClose,
    handleSubmit,
    diagnosticoEditar,
}: DiagnosticosFormModalProps) {
    const [idPaciente, setIdPaciente] = useState('');
    const [idTerapeuta, setIdTerapeuta] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);

    useEffect(() => {
        axios.get('http://localhost:3002/Api/pacientes/getPacientes')
            .then(response => setPacientes(response.data.result))
            .catch(error => console.error('Error al cargar pacientes:', error));

        axios.get('http://localhost:3002/Api/terapeutas/getTerapeutas')
            .then(response => setTerapeutas(response.data.result))
            .catch(error => console.error('Error al cargar terapeutas:', error));

        if (diagnosticoEditar) {
            setIdPaciente(diagnosticoEditar.id_paciente.toString());
            setIdTerapeuta(diagnosticoEditar.id_terapeuta.toString());
            setDescripcion(diagnosticoEditar.descripcion);
            setTratamiento(diagnosticoEditar.tratamiento);
        } else {
            setIdPaciente('');
            setIdTerapeuta('');
            setDescripcion('');
            setTratamiento('');
        }
    }, [diagnosticoEditar]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const diagnostico: Diagnostico = {
            id_paciente: parseInt(idPaciente),
            id_terapeuta: parseInt(idTerapeuta),
            descripcion,
            tratamiento,
        };

        if (diagnosticoEditar && diagnosticoEditar.id_diagnostico) {
            axios.put(`http://localhost:3002/Api/diagnostico/updateDiagnosticos?diagnostico_id=${diagnosticoEditar.id_diagnostico}`, diagnostico)
                .then(() => {
                    handleSubmit();
                    handleClose();
                    toast.success('Diagnóstico guardado exitosamente');
                })
                .catch(error => {
                    console.error('Error al editar diagnóstico:', error);
                    toast.error('Error al guardar el diagnóstico');
                });
        } else {
            axios.post('http://localhost:3002/Api/diagnostico/insertDiagnosticos', diagnostico)
                .then(() => {
                    handleSubmit();
                    handleClose();
                    toast.success('Diagnóstico guardado exitosamente');
                })
                .catch(error => {
                    console.error('Error al insertar diagnóstico:', error);
                    toast.error('Error al guardar el diagnóstico');
                });
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>{diagnosticoEditar ? 'Editar Diagnóstico' : 'Crear Diagnóstico'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Form onSubmit={handleFormSubmit}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Paciente</Form.Label>
                                <Form.Select
                                    value={idPaciente}
                                    onChange={(e) => setIdPaciente(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione un paciente</option>
                                    {pacientes.map(paciente => (
                                        <option key={paciente.id_paciente} value={paciente.id_paciente}>
                                            {`${paciente.nombre} ${paciente.apellido}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Terapeuta</Form.Label>
                                <Form.Select
                                    value={idTerapeuta}
                                    onChange={(e) => setIdTerapeuta(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione un terapeuta</option>
                                    {terapeutas.map(terapeuta => (
                                        <option key={terapeuta.id_terapeuta} value={terapeuta.id_terapeuta}>
                                            {`${terapeuta.nombre} - ${terapeuta.especialidad}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Ingrese la descripción del diagnóstico"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Tratamiento</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Ingrese el tratamiento recomendado"
                                    value={tratamiento}
                                    onChange={(e) => setTratamiento(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button variant="success" type="submit" className="me-2">
                            {diagnosticoEditar ? 'Guardar Cambios' : 'Crear Diagnóstico'}
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

export default DiagnosticosForm;
