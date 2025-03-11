import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import EncargadosForm from './Forms/EncargadosForm';
import { toast } from 'react-toastify';

interface Encargado {
  id_encargado: number;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
}

function EncargadosTable(){
    const [encargados, setEncargados] = useState<Encargado[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [encargadoSeleccionado, setEncargadoSeleccionado] = useState<Encargado | null>(null);
    const [search, setSearch] = useState<string>("");
    
    const obtenerEncargados = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:3002/Api/encargados/getEncargados')
        .then(response => {
            setEncargados(response.data.result);
        })
        .catch(error => {
            console.error("Error al obtener encargados:", error);
            toast.error("No se pudieron cargar los encargados.");
        })
        .finally(() => setLoading(false)); 
    }, []);

    useEffect(() => {
        obtenerEncargados();
    }, [obtenerEncargados]);

    const eliminarEncargado = (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este encargado?")) return;

        axios.delete(`http://localhost:3002/Api/encargados/deleteEncargados?encargado_id=${id}`)
        .then(() => {
            setEncargados(prev => prev.filter(p => p.id_encargado !== id));
            toast.success("Encargado eliminado con éxito.");
        })
        .catch(error => {
            console.error("Error al eliminar encargado:", error);
            toast.error("Hubo un problema al eliminar el encargado.");
        });
    };

    const handleSubmit = () => {
        obtenerEncargados();
        toast.success("Encargado guardado con éxito.");
    };

    const editarEncargado = (encargado: Encargado) => {
        setEncargadoSeleccionado(encargado);
        setShowForm(true);
    }

    const crearEncargado = () => {
        setEncargadoSeleccionado(null);
        setShowForm(true);
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setEncargadoSeleccionado(null);
    }

    const encargadosFiltrados = encargados.filter(e => 
        `${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container>
          <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
            <Card.Header className="text-white d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
              <h5 className="mb-0" style={{ fontWeight: 'bold' }}>Lista de Encargados</h5>
              <Button variant="light" onClick={crearEncargado} className="text-dark">
                <FaPlus /> Nuevo Encargado
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <InputGroup>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar encargado..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Row>
    
              {loading ? (
                <div className="text-center my-3">
                  <Spinner animation="border" style={{ color: "#155724" }} />
                  <p>Cargando encargados...</p>
                </div>
              ) : (
                <Table responsive striped bordered hover className="table-sm text-center"
                  style={{ borderRadius: "10px", overflow: "hidden" }}>
                  <thead style={{ backgroundColor: "#155724", color: "white" }}>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Teléfono</th>
                      <th>Dirección</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {encargadosFiltrados.length > 0 ? (
                      encargadosFiltrados.map((encargado, index) => (
                        <tr key={encargado.id_encargado}>
                          <td>{index + 1}</td>
                          <td>{encargado.nombre}</td>
                          <td>{encargado.apellido}</td>
                          <td>{encargado.telefono}</td>
                          <td>{encargado.direccion}</td>
                          <td>
                            <Button variant="success" size="sm" onClick={() => editarEncargado(encargado)} className="me-2">
                              <FaEdit /> Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => eliminarEncargado(encargado.id_encargado)}>
                              <FaTrash /> Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center">No se encontraron encargados.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
    
          {showForm && (
            <EncargadosForm
              encargadoEditar={encargadoSeleccionado}
              show={showForm}
              handleClose={cerrarFormulario}
              handleSubmit={handleSubmit}
            />
          )}
        </Container>
      );
    }
    
    export default EncargadosTable;