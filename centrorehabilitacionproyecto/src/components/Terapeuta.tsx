import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import TerapeutasForm from './Forms/TerapeutasForm';
import { toast } from 'react-toastify';

interface Terapeuta {
  id_terapeuta: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
}

function TerapeutasTable() {
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState<Terapeuta | null>(null);

  useEffect(() => {
    obtenerTerapeutas();
  }, []);

  const obtenerTerapeutas = () => {
    setLoading(true);
    axios.get('http://localhost:3002/Api/terapeutas/getterapeutas')
      .then(response => {
        setTerapeutas(response.data.result);
        setLoading(false);
      })
      .catch(error => {
        toast.error("Hubo un error al obtener los terapeutas");
        setLoading(false);
      });
  };

  const eliminarTerapeuta = (id: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este terapeuta?")) {
      axios.delete(`http://localhost:3002/Api/terapeutas/deleteterapeutas?terapeuta_id=${id}`)
        .then(() => {
          setTerapeutas(terapeutas.filter(terapeuta => terapeuta.id_terapeuta !== id));
          toast.success("Terapeuta eliminado con éxito");
        })
        .catch(error => {
          toast.error("Hubo un error al eliminar el terapeuta");
        });
    }
  };

  const handleSubmit = () => {
    obtenerTerapeutas();
    toast.success("Terapeuta guardado con éxito");
  };

  const editarTerapeuta = (terapeuta: Terapeuta) => {
    setTerapeutaSeleccionado(terapeuta);
    setShowForm(true);
  };

  const crearTerapeuta = () => {
    setTerapeutaSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setTerapeutaSeleccionado(null);
  };

  return (
    <div>
      <Button variant="primary" onClick={crearTerapeuta} className="mb-3">
        Crear Terapeuta
      </Button>

      {showForm && (
        <TerapeutasForm 
          terapeutaEditar={terapeutaSeleccionado}
          show={showForm}
          handleClose={cerrarFormulario}
          handleSubmit={handleSubmit}
        />
      )}

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Especialidad</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6}>Cargando terapeutas...</td>
            </tr>
          ) : terapeutas.length > 0 ? (
            terapeutas.map((terapeuta, index) => (
              <tr key={terapeuta.id_terapeuta}>
                <td>{index + 1}</td>
                <td>{terapeuta.nombre}</td>
                <td>{terapeuta.apellido}</td>
                <td>{terapeuta.especialidad}</td>
                <td>{terapeuta.telefono}</td>
                <td>
                  <Button variant="warning" onClick={() => editarTerapeuta(terapeuta)} className="me-2">
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => eliminarTerapeuta(terapeuta.id_terapeuta)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No se encontraron terapeutas.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default TerapeutasTable;
