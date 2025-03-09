import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

interface Paciente {
    id_paciente?: number;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    telefono: string;
    direccion: string;
    id_encargado: number;
}

interface PacientesFormModalProps {
    pacienteEditar: Paciente | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
}

function PacientesFormModal({
    show,
    handleClose,
    handleSubmit,
    pacienteEditar,
}: PacientesFormModalProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [encargados, setEncargados] = useState([]);
    const [idEncargado, setIdEncargado] = useState<number>(1);

    useEffect(() => {
        axios.get('http://localhost:3002/Api/encargados/getencargados')
            .then(response => {
                setEncargados(response.data.result);
                if (pacienteEditar) {
                    setNombre(pacienteEditar.nombre);
                    setApellido(pacienteEditar.apellido);
                    setFechaNacimiento(new Date(pacienteEditar.fecha_nacimiento));
                    setTelefono(pacienteEditar.telefono || '');
                    setDireccion(pacienteEditar.direccion || '');
                    setIdEncargado(pacienteEditar.id_encargado);
                }
            })
            .catch(error => {
                console.error('Error al obtener los encargados', error);
            });
    }, [pacienteEditar]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const paciente: Paciente = {
            nombre,
            apellido,
            fecha_nacimiento: fechaNacimiento.toISOString(),
            telefono,
            direccion,
            id_encargado: idEncargado,
        };

        if (pacienteEditar && pacienteEditar.id_paciente) {
            axios.put(`http://localhost:3002/Api/pacientes/updatepacientes?paciente_id=${pacienteEditar.id_paciente}`, paciente)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al editar paciente:', error);
                });
        } else {
            axios.post('http://localhost:3002/Api/pacientes/insertpacientes', paciente)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al crear paciente:', error);
                });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{pacienteEditar ? 'Editar Paciente' : 'Crear Paciente'}</Modal.Title>
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
                        <Form.Label>Fecha de Nacimiento</Form.Label>
                        <div className="w-100">
                            <DatePicker
                                onChange={(value) => {
                                    const dateValue = value as Date | null; 
                                    if (dateValue) {
                                        setFechaNacimiento(dateValue);
                                    }
                                }}
                                value={fechaNacimiento}
                                className="custom-datetime-picker w-100"
                            />


                        </div>
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

                    <Form.Group className="mb-3">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese la dirección"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Encargado</Form.Label>
                        <Form.Control
                            as="select"
                            value={idEncargado}
                            onChange={(e) => setIdEncargado(Number(e.target.value))}
                            required
                        >
                            <option value="">Seleccione un encargado</option>
                            {encargados.map((encargado: { id_encargado: number, nombre: string, apellido: string }) => (
                                <option key={encargado.id_encargado} value={encargado.id_encargado}>
                                    {encargado.nombre} {encargado.apellido}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        {pacienteEditar ? 'Guardar Cambios' : 'Crear Paciente'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default PacientesFormModal;
