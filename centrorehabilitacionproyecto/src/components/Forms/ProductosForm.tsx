import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaBox, FaFileAlt, FaTag, FaWarehouse, FaPlus } from 'react-icons/fa';

interface Producto {
    id_producto?: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    cantidad_disponible: number;
}

interface ProductosFormModalProps {
    productoEditar: Producto | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
}

function ProductosForm({ show, handleClose, handleSubmit, productoEditar }: ProductosFormModalProps) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [cantidad_disponible, setCantidadDisponible] = useState<number>(0);

    useEffect(() => {
        if (productoEditar) {
            setNombre(productoEditar.nombre);
            setDescripcion(productoEditar.descripcion || '');
            setCategoria(productoEditar.categoria || '');
            setCantidadDisponible(productoEditar.cantidad_disponible);
        } else {
            setNombre('');
            setDescripcion('');
            setCategoria('');
            setCantidadDisponible(0);
        }
    }, [productoEditar]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const producto: Producto = { nombre, descripcion, categoria, cantidad_disponible };
        if (productoEditar && productoEditar.id_producto) {
            axios.put(`http://localhost:3002/Api/productos/updateProductos?producto_id=${productoEditar.id_producto}`, producto)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => console.error('Error al editar producto:', error));
        } else {
            axios.post('http://localhost:3002/Api/productos/insertProductos', producto)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => console.error('Error al insertar producto:', error));
        }
    };

    const abrirFormularioProductos = () => {
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            centered
            size="lg"
            backdrop="static"
            className="custom-modal"
            style={{
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)"
            }}
        >
            <Modal.Header 
                className="border-0 position-relative"
                style={{
                    background: "linear-gradient(135deg, #007BFF 0%, #0056b3 100%)", 
                    borderRadius: "15px 15px 0 0",
                    padding: "1.5rem"
                }}
            >
                <Modal.Title className="text-white">
                    <div className="d-flex align-items-center">
                        <FaBox className="me-2" size={24} />
                        <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
                            {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
                        </span>
                    </div>
                </Modal.Title>
                <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={abrirFormularioProductos}
                    style={{
                        padding: "0.4rem 0.6rem",
                        borderRadius: "8px"
                    }}
                >
                    <FaPlus /> Nuevo
                </Button>
            </Modal.Header>
            <Modal.Body style={{ padding: "2rem", backgroundColor: "#f8f9fa" }}>
                <Form onSubmit={handleFormSubmit}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaBox className="me-2" />
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
                                        backgroundColor: "#ffffff",
                                        borderRadius: "8px"
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaFileAlt className="me-2" />
                                    Descripción
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese la descripción"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#ffffff",
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
                                    <FaTag className="me-2" />
                                    Categoría
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese la categoría"
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    required
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#ffffff",
                                        borderRadius: "8px"
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    <FaWarehouse className="me-2" />
                                    Cantidad Disponible
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Ingrese la cantidad"
                                    value={cantidad_disponible}
                                    onChange={(e) => setCantidadDisponible(Number(e.target.value))}
                                    required
                                    style={{
                                        padding: "0.75rem",
                                        backgroundColor: "#ffffff",
                                        borderRadius: "8px",
                                        textAlign: "center",
                                        fontSize: "1rem"
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
                            variant="primary" 
                            type="submit"
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px",
                                backgroundColor: "#007BFF"
                            }}
                        >
                            {productoEditar ? 'Guardar Cambios' : 'Crear Producto'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default ProductosForm;