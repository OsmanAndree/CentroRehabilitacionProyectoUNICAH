import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import PacientesForm from './Forms/PacientesForm';
import { toast } from 'react-toastify'; 

interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  telefono: string;
  direccion: string;
  id_encargado: number;
  encargado: {
    nombre: string;
    apellido: string;
  };
}

function PacientesTable() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

  useEffect(() => {
    axios.get('http://localhost:3002/Api/pacientes/getpacientes')
      .then(response => {
        setPacientes(response.data.result);
        setLoading(false);
      })
      .catch(error => {
        toast.error("Hubo un error al obtener los pacientes"); 
        setLoading(false);
      });
  }, []);

  const eliminarPaciente = (id: number) => {
    axios.delete(`http://localhost:3002/Api/pacientes/deletepacientes?paciente_id=${id}`)
      .then(() => {
        setPacientes(pacientes.filter(paciente => paciente.id_paciente !== id));
        toast.success("Paciente eliminado con éxito"); 
      })
      .catch(error => {
        toast.error("Hubo un error al eliminar el paciente"); 
      });
  };

  const handleSubmit = () => {
    axios.get('http://localhost:3002/Api/pacientes/getpacientes')
      .then(response => {
        setPacientes(response.data.result);
        setLoading(false);
        toast.success("Paciente guardado con éxito"); 
      })
      .catch(error => {
        toast.error("Hubo un error al obtener los pacientes"); 
        setLoading(false);
      });
  };

  const editarPaciente = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente);
    setShowForm(true);
  };

  const crearPaciente = () => {
    setPacienteSeleccionado(null);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setPacienteSeleccionado(null);
  };

  return (
    <div>
      <Button variant="primary" onClick={crearPaciente} className="mb-3">
        Crear Paciente
      </Button>
   
      {showForm && (
        <PacientesForm 
          pacienteEditar={pacienteSeleccionado}
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
            <th>Fecha de Nacimiento</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Encargado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8}>Cargando pacientes...</td>
            </tr>
          ) : pacientes.length > 0 ? (
            pacientes.map((paciente, index) => (
              <tr key={paciente.id_paciente}>
                <td>{index + 1}</td>
                <td>{paciente.nombre}</td>
                <td>{paciente.apellido}</td>
                <td>{new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                <td>{paciente.telefono}</td>
                <td>{paciente.direccion}</td>
                <td>{paciente.encargado.nombre} {paciente.encargado.apellido}</td>
                <td>
                  <Button variant="warning" onClick={() => editarPaciente(paciente)} className="me-2">
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => eliminarPaciente(paciente.id_paciente)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8}>No se encontraron pacientes.</td>
            </tr>
          )}
        </tbody>
      </Table>
      
    </div>
  );
}

export default PacientesTable;
