import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Spinner, Container, Row, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import UsuariosForm from './Forms/UsuariosForm';
import { toast } from 'react-toastify';

interface Usuario {
    id_usuario: number;
    nombre: string;
    email: string;
    password: string;
    rol: 'Administrador' | 'Terapeuta' | 'Encargado';
    estado: 'Activo' | 'Inactivo';
    created_at?: Date;
}

function UsuariosTable() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [search, setSearch] = useState<string>("");

const obtenerUsuarios = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/usuarios/getusuarios')
        .then(response => {
        setUsuarios(response.data.result);
        })
        .catch(error => {
        console.error("Error al obtener usuarios:", error);
        toast.error("No se pudieron cargar los usuarios.");
    })
    .finally(() => setLoading(false));
}, []);

useEffect(() => {
    obtenerUsuarios();
}, [obtenerUsuarios]);

const eliminarUsuario = (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    axios.delete(`http://localhost:3002/Api/usuarios/deleteusuarios?id_usuario=${id}`)
    .then(() => {
        setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
        toast.success("Usuario eliminado con éxito.");
    })
    .catch(error => {
        console.error("Error al eliminar usuario:", error);
        toast.error("Hubo un problema al eliminar el usuario.");
    });
};

const handleSubmit = () => {
    obtenerUsuarios();
    toast.success("Usuario guardado con éxito.");
};

const editarUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowForm(true);
};

const crearUsuario = () => {
    setUsuarioSeleccionado(null);
    setShowForm(true);
};

const cerrarFormulario = () => {
    setShowForm(false);
    setUsuarioSeleccionado(null);
};

const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
);

return (
    <Container>
    <Card className="shadow-lg mt-4 border-0" style={{ backgroundColor: "#D4EDDA", borderRadius: "15px" }}>
        <Card.Header className="text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#155724", borderRadius: "15px 15px 0 0" }}>
            <h5 className="mb-0" style={{ fontWeight: 'bold' }}>Lista de Usuarios</h5>
            <Button variant="light" onClick={crearUsuario} className="text-dark">
            <FaPlus /> Nuevo Usuario
            </Button>
        </Card.Header>
        <Card.Body>
            <Row className="mb-3">
            <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                type="text"
                placeholder="Buscar usuario por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </InputGroup>
        </Row>

        {loading ? (
            <div className="text-center my-3">
            <Spinner animation="border" style={{ color: "#155724" }} />
            <p>Cargando usuarios...</p>
            </div>
        ) : (
            <Table responsive striped bordered hover className="table-sm text-center"
            style={{ borderRadius: "10px", overflow: "hidden" }}>
            <thead style={{ backgroundColor: "#155724", color: "white" }}>
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario, index) => (
                    <tr key={usuario.id_usuario}>
                        <td>{index + 1}</td>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.rol}</td>
                    <td>
                        <span className={`badge ${usuario.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                        {usuario.estado}
                        </span>
                    </td>
                    <td>
                        <Button variant="success" size="sm" onClick={() => editarUsuario(usuario)} className="me-2">
                            <FaEdit /> Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => eliminarUsuario(usuario.id_usuario)}>
                            <FaTrash /> Eliminar
                        </Button>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={6} className="text-center">No se encontraron usuarios.</td>
                </tr>
                )}
            </tbody>
            </Table>
        )}
        </Card.Body>
    </Card>

    {showForm && (
        <UsuariosForm
            usuarioEditar={usuarioSeleccionado}
            show={showForm}
            handleClose={cerrarFormulario}
            handleSubmit={handleSubmit}
        />
    )}
    </Container>
);
}

export default UsuariosTable;