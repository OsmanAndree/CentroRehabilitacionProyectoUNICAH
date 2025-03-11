import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';

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

interface ProductosFormModalProps {
    productoEditar: Producto | null;
    show: boolean;
    handleClose: () => void;
    handleSubmit: () => void;   
}

function ProductosForm({
    show,
    handleClose,
    handleSubmit,
    productoEditar,   
}: ProductosFormModalProps) {
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
            setCantidadDisponible(0);}
    }, [productoEditar]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const producto: Producto = {
            nombre,
            descripcion,
            categoria,
            cantidad_disponible,
        };
        
        if (productoEditar && productoEditar.id_producto) {
            axios.put(`http://localhost:3002/Api/productos/updateProductos?producto_id=${productoEditar.id_producto}`, producto)
                .then(() => {
                    handleSubmit();
                    handleClose();
                })
                .catch(error => {
                    console.error('Error al editar producto:', error);
                });
        } else {
            axios.post('http://localhost:3002/Api/productos/insertProductos', producto)
            .then(() => {
                handleSubmit();
                handleClose();
            })
            .catch(error => {
                console.error('Error al insertar producto:', error);
            });
        }
    };
    
return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>{productoEditar ? 'Editar Producto' : 'Crear Producto'}</Modal.Title>
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
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese la descripción"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Categoría</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese la categoría"
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Cantidad Disponible</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Ingrese la cantidad disponible"
                                    value={cantidad_disponible}
                                    onChange={(e) => setCantidadDisponible(Number(e.target.value))}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                        <Button variant="success" type="submit" className="me-2">
                            {productoEditar ? 'Guardar Cambios' : 'Crear Producto'}
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

export default ProductosForm;