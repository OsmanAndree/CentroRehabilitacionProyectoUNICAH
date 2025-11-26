import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Modal, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FaCalendar, FaUserClock, FaClock, FaUser, FaNotesMedical, FaClipboardCheck, FaUsers, FaPlus, FaTimes, FaSearch, FaDollarSign, FaConciergeBell } from 'react-icons/fa';

interface Cita {
  id_cita?: number;
  id_paciente: number;
  id_terapeuta: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  tipo_terapia?: string;
  total?: number;
  paciente?: {
    id_paciente: number;
    nombre: string;
    apellido: string;
  };
  terapeuta?: {
    id_terapeuta: number;
    nombre: string;
    apellido: string;
  };
  servicios?: Array<{
    id_servicio: number;
    nombre: string;
    costo: number;
  }>;
}

interface CitasFormModalProps {
  citaEditar: Cita | null;
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

function CitasFormModal({
  show,
  handleClose,
  handleSubmit,
  citaEditar,
}: CitasFormModalProps) {
  const [idTerapeuta, setIdTerapeuta] = useState<number>(1);
  const [fecha, setFecha] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [tipoTerapia, setTipoTerapia] = useState('');
  const [idPaciente, setIdPaciente] = useState<number>(1);
  const [estado, setEstado] = useState<'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada'>('Pendiente');
  const [modoMultiple, setModoMultiple] = useState<boolean>(false);
  const [pacientesSeleccionados, setPacientesSeleccionados] = useState<Array<{id: number; nombre: string; apellido: string}>>([]);
  const [searchPaciente, setSearchPaciente] = useState<string>('');
  const [showPacienteSelect, setShowPacienteSelect] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const [terapeutas, setTerapeutas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Array<{id: number; nombre: string; costo: number}>>([]);
  const [searchServicio, setSearchServicio] = useState<string>('');
  const [showServicioSelect, setShowServicioSelect] = useState<boolean>(false);
  const servicioSelectRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState<number>(0);
  const [blockedIntervals, setBlockedIntervals] = useState<{ id: number; inicio: string; fin: string }[]>([]);
  const [capacityInfo, setCapacityInfo] = useState<{
    disponible: boolean;
    capacidadMaxima: number;
    citasExistentes: number;
    cuposDisponibles: number;
    hora: string;
  } | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

  useEffect(() => {
    axios.get('http://localhost:3002/Api/terapeutas/getterapeutas')
      .then(response => setTerapeutas(response.data.result))
      .catch(error => console.error('Error al obtener terapeutas', error));

    axios.get('http://localhost:3002/Api/pacientes/getpacientes')
      .then(response => setPacientes(response.data.result))
      .catch(error => console.error('Error al obtener pacientes', error));

    axios.get('http://localhost:3002/Api/servicios/getServicios?includeInactivos=false')
      .then(response => setServicios(response.data.result))
      .catch(error => console.error('Error al obtener servicios', error));
  }, []);

  useEffect(() => {
    if (citaEditar) {
      const terapeutaId = citaEditar.terapeuta?.id_terapeuta || 1;
      // Parsear fecha correctamente sin problemas de zona horaria
      const fechaStr = citaEditar.fecha.split('T')[0]; // Obtener solo YYYY-MM-DD
      const fechaVal = parseLocalDate(fechaStr);
      setIdTerapeuta(terapeutaId);
      setFecha(fechaVal);
      setHoraInicio(citaEditar.hora_inicio);
      // Calcular hora_fin automáticamente (1 hora después)
      const [hh, mm] = citaEditar.hora_inicio.split(':').map(Number);
      const inicioDate = new Date();
      inicioDate.setHours(hh, mm, 0, 0);
      const finDate = new Date(inicioDate.getTime() + 60 * 60000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setHoraFin(`${pad(finDate.getHours())}:${pad(finDate.getMinutes())}:00`);
      setIdPaciente(citaEditar.id_paciente);
      setEstado(citaEditar.estado);
      setTipoTerapia(citaEditar.tipo_terapia || '');
      setModoMultiple(false); // Desactivar modo múltiple al editar
      setPacientesSeleccionados([]);
      
      // Cargar servicios de la cita si existen
      // Sequelize devuelve los servicios como "Servicios" (mayúscula) por el nombre del modelo
      const serviciosData = (citaEditar as any).Servicios || citaEditar.servicios;
      
      if (serviciosData && Array.isArray(serviciosData) && serviciosData.length > 0) {
        const serviciosFormateados = serviciosData.map((servicio: any) => ({
          id: servicio.id_servicio || servicio.id,
          nombre: servicio.nombre || '',
          costo: parseFloat(servicio.costo || 0)
        }));
        setServiciosSeleccionados(serviciosFormateados);
        // Calcular total
        const totalCalculado = serviciosFormateados.reduce((sum: number, s: any) => sum + s.costo, 0);
        setTotal(totalCalculado);
      } else {
        // Si no hay servicios, usar el total de la cita si existe
        setServiciosSeleccionados([]);
        setTotal(citaEditar.total || 0);
      }

      // Filtrar solo citas de la fecha específica
      axios.get(`http://localhost:3002/Api/citas/getcitas?fecha=${fechaStr}&id_terapeuta=${terapeutaId}`)
        .then(response => {
          // Filtrar por fecha exacta para asegurar que solo sean de ese día
          const intervals = response.data.result
            .filter((cita: any) => {
              // Parsear fecha sin problemas de zona horaria
              const citaFechaStr = cita.fecha.split('T')[0] || cita.fecha;
              return citaFechaStr === fechaStr;
            })
            .map((cita: any) => ({
              id: cita.id_cita,
              inicio: cita.hora_inicio,
              fin: cita.hora_fin
            }))
            .sort((a: any, b: any) => a.inicio.localeCompare(b.inicio));
          setBlockedIntervals(intervals);
        })
        .catch(error => console.error("Error obteniendo citas del terapeuta:", error));
    } else {
      // Resetear al crear nueva cita
      setModoMultiple(false);
      setPacientesSeleccionados([]);
      setServiciosSeleccionados([]);
      setTotal(0);
      setIdPaciente(1);
    }
  }, [citaEditar]);

  // Calcular total cuando cambian los servicios seleccionados
  useEffect(() => {
    const nuevoTotal = serviciosSeleccionados.reduce((sum, servicio) => sum + servicio.costo, 0);
    setTotal(nuevoTotal);
  }, [serviciosSeleccionados]);

  useEffect(() => {
    if (fecha && idTerapeuta) {
      const fechaStr = formatLocalDate(fecha);
      axios.get(`http://localhost:3002/Api/citas/getcitas?fecha=${fechaStr}&id_terapeuta=${idTerapeuta}`)
        .then(response => {
          // Filtrar por fecha exacta para asegurar que solo sean de ese día
          const intervals = response.data.result
            .filter((cita: any) => {
              // Parsear fecha sin problemas de zona horaria
              const citaFechaStr = cita.fecha.split('T')[0] || cita.fecha;
              return citaFechaStr === fechaStr;
            })
            .map((cita: any) => ({
              id: cita.id_cita,
              inicio: cita.hora_inicio,
              fin: cita.hora_fin
            }))
            .sort((a: any, b: any) => a.inicio.localeCompare(b.inicio));
          setBlockedIntervals(intervals);
        })
        .catch(error => console.error("Error obteniendo citas del terapeuta:", error));
    }
  }, [fecha, idTerapeuta]);

  useEffect(() => {
    if (horaInicio) {
      // Siempre 1 hora de duración
      const [hh, mm] = horaInicio.split(':').map(Number);
      const inicioDate = new Date();
      inicioDate.setHours(hh, mm, 0, 0);
      const finDate = new Date(inicioDate.getTime() + 60 * 60000); // 60 minutos = 1 hora
      const pad = (n: number) => n.toString().padStart(2, '0');
      setHoraFin(`${pad(finDate.getHours())}:${pad(finDate.getMinutes())}:00`);
    }
  }, [horaInicio]);

  // Verificar capacidad cuando cambian fecha, hora, tipo de terapia o terapeuta
  useEffect(() => {
    if (fecha && horaInicio && tipoTerapia && idTerapeuta) {
      const fechaStr = formatLocalDate(fecha);
      setLoadingCapacity(true);
      
      const idCitaExcluir = citaEditar?.id_cita;
      const params = new URLSearchParams({
        fecha: fechaStr,
        hora_inicio: horaInicio,
        tipo_terapia: tipoTerapia,
        id_terapeuta: idTerapeuta.toString()
      });
      
      if (idCitaExcluir) {
        params.append('id_cita_excluir', idCitaExcluir.toString());
      }

      axios.get(`http://localhost:3002/Api/citas/checkCapacity?${params.toString()}`)
        .then(response => {
          setCapacityInfo(response.data);
        })
        .catch(error => {
          console.error('Error verificando capacidad:', error);
          setCapacityInfo(null);
        })
        .finally(() => {
          setLoadingCapacity(false);
        });
    } else {
      setCapacityInfo(null);
    }
  }, [fecha, horaInicio, tipoTerapia, idTerapeuta, citaEditar]);

  const handleHoraInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoraInicio(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos requeridos estén completos
    if (!tipoTerapia || !horaInicio || !idTerapeuta) {
      alert("Por favor complete todos los campos requeridos.");
      return;
    }

    // Validar pacientes seleccionados
    if (modoMultiple) {
      if (pacientesSeleccionados.length === 0) {
        alert("Por favor seleccione al menos un paciente.");
        return;
      }
      
      // Validar capacidad para todos los pacientes
      if (capacityInfo) {
        const pacientesAInsertar = pacientesSeleccionados.length;
        const cuposNecesarios = pacientesAInsertar;
        
        if (cuposNecesarios > capacityInfo.cuposDisponibles) {
          alert(
            `No hay suficiente capacidad. Necesita ${cuposNecesarios} cupo(s) pero solo hay ${capacityInfo.cuposDisponibles} disponible(s) ` +
            `para ${tipoTerapia === 'Fisica' ? 'Terapia Física' : 'Terapia Neurológica'} en la hora ${capacityInfo.hora}. ` +
            `Máximo permitido: ${capacityInfo.capacidadMaxima} paciente(s) por hora. ` +
            `Actualmente hay ${capacityInfo.citasExistentes} cita(s) en esta hora.`
          );
          return;
        }
      }
    } else {
      if (!idPaciente) {
        alert("Por favor seleccione un paciente.");
        return;
      }

      // Validar capacidad antes de enviar (modo simple)
      if (capacityInfo && !capacityInfo.disponible) {
        alert(
          `No se puede crear/editar la cita. Capacidad máxima alcanzada para ${tipoTerapia === 'Fisica' ? 'Terapia Física' : 'Terapia Neurológica'} ` +
          `en la hora ${capacityInfo.hora}. Máximo permitido: ${capacityInfo.capacidadMaxima} paciente(s). ` +
          `Actualmente hay ${capacityInfo.citasExistentes} cita(s) en esta hora.`
        );
        return;
      }
    }

    // Siempre 60 minutos (1 hora) de duración
    const duracion = 60;

    setLoadingSubmit(true);

    if (citaEditar && citaEditar.id_cita) {
      // Modo edición (solo un paciente)
      const serviciosIds = serviciosSeleccionados.map(s => s.id);
      const cita = {
        fecha: formatLocalDate(fecha),
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        id_paciente: idPaciente,
        id_terapeuta: idTerapeuta,
        estado,
        tipo_terapia: tipoTerapia,
        duracion_min: duracion,
        servicios: serviciosIds,
        total: total,
        id_cita: citaEditar.id_cita
      };
      
      axios.put(`http://localhost:3002/Api/citas/updatecita?cita_id=${citaEditar.id_cita}`, cita)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          const errorMessage = error.response?.data?.error || error.message || 'Error al editar cita';
          alert(errorMessage);
          console.error('Error al editar cita:', error);
        })
        .finally(() => {
          setLoadingSubmit(false);
        });
    } else if (modoMultiple && pacientesSeleccionados.length > 0) {
      // Modo múltiple: crear varias citas
      const serviciosIds = serviciosSeleccionados.map(s => s.id);
      const citas = pacientesSeleccionados.map(pac => ({
        fecha: formatLocalDate(fecha),
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        id_paciente: pac.id,
        id_terapeuta: idTerapeuta,
        estado,
        tipo_terapia: tipoTerapia,
        duracion_min: duracion,
        servicios: serviciosIds,
        total: total
      }));

      axios.post('http://localhost:3002/Api/citas/insertCitasMultiple', { citas })
        .then(() => {
          alert(`Se crearon ${citas.length} cita(s) exitosamente.`);
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          const errorMessage = error.response?.data?.error || error.message || 'Error al crear citas';
          alert(errorMessage);
          console.error('Error al crear citas:', error);
        })
        .finally(() => {
          setLoadingSubmit(false);
        });
    } else {
      // Modo simple: crear una cita
      const serviciosIds = serviciosSeleccionados.map(s => s.id);
      const cita = {
        fecha: formatLocalDate(fecha),
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        id_paciente: idPaciente,
        id_terapeuta: idTerapeuta,
        estado,
        tipo_terapia: tipoTerapia,
        duracion_min: duracion,
        servicios: serviciosIds,
        total: total
      };
      
      axios.post('http://localhost:3002/Api/citas/insertcita', cita)
        .then(() => {
          handleSubmit();
          handleClose();
        })
        .catch(error => {
          const errorMessage = error.response?.data?.error || error.message || 'Error al crear cita';
          alert(errorMessage);
          console.error('Error al crear cita:', error);
        })
        .finally(() => {
          setLoadingSubmit(false);
        });
    }
  };

  const handleToggleModoMultiple = () => {
    if (!citaEditar) {
      setModoMultiple(!modoMultiple);
      if (!modoMultiple) {
        // Al activar modo múltiple, limpiar selección simple
        setIdPaciente(1);
      } else {
        // Al desactivar modo múltiple, limpiar selección múltiple
        setPacientesSeleccionados([]);
        setSearchPaciente('');
        setShowPacienteSelect(false);
      }
    }
  };

  const handleCloseForm = () => {
    // Limpiar estados al cerrar
    setModoMultiple(false);
    setPacientesSeleccionados([]);
    setSearchPaciente('');
    setShowPacienteSelect(false);
    handleClose();
  };

  const handleAgregarPaciente = (pacienteId?: number) => {
    let pacienteEncontrado;
    
    if (pacienteId) {
      // Si se pasa un ID, buscar directamente
      pacienteEncontrado = pacientes.find(p => p.id_paciente === pacienteId);
    } else {
      // Buscar paciente por nombre o apellido
      if (!searchPaciente.trim()) {
        return;
      }

      pacienteEncontrado = pacientes.find(p => {
        const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
        const busqueda = searchPaciente.toLowerCase();
        return nombreCompleto.includes(busqueda) || 
               p.nombre.toLowerCase().includes(busqueda) || 
               p.apellido.toLowerCase().includes(busqueda);
      });
    }

    if (!pacienteEncontrado) {
      alert("No se encontró un paciente con ese nombre. Por favor busque y seleccione de la lista.");
      return;
    }

    // Verificar si ya está seleccionado
    if (pacientesSeleccionados.some(p => p.id === pacienteEncontrado.id_paciente)) {
      alert("Este paciente ya está seleccionado.");
      setSearchPaciente('');
      setShowPacienteSelect(false);
      return;
    }

    // Validar capacidad antes de agregar
    if (capacityInfo && pacientesSeleccionados.length >= capacityInfo.cuposDisponibles) {
      alert(`No se pueden seleccionar más pacientes. Solo hay ${capacityInfo.cuposDisponibles} cupo(s) disponible(s).`);
      return;
    }

    setPacientesSeleccionados(prev => [...prev, {
      id: pacienteEncontrado.id_paciente,
      nombre: pacienteEncontrado.nombre,
      apellido: pacienteEncontrado.apellido
    }]);
    setSearchPaciente('');
    setShowPacienteSelect(false);
  };

  const handleEliminarPaciente = (idPaciente: number) => {
    setPacientesSeleccionados(prev => prev.filter(p => p.id !== idPaciente));
  };

  // Filtrar pacientes para el select searchable
  const pacientesFiltrados = pacientes.filter(p => {
    if (!searchPaciente.trim()) return false;
    const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
    const busqueda = searchPaciente.toLowerCase();
    return nombreCompleto.includes(busqueda) || 
           p.nombre.toLowerCase().includes(busqueda) || 
           p.apellido.toLowerCase().includes(busqueda);
  }).slice(0, 10); // Limitar a 10 resultados

  // Cerrar el select cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowPacienteSelect(false);
      }
      if (servicioSelectRef.current && !servicioSelectRef.current.contains(event.target as Node)) {
        setShowServicioSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAgregarServicio = (servicioId?: number) => {
    let servicioEncontrado;
    
    if (servicioId) {
      servicioEncontrado = servicios.find(s => s.id_servicio === servicioId);
    } else {
      if (!searchServicio.trim()) {
        return;
      }
      servicioEncontrado = servicios.find(s => {
        const nombreCompleto = s.nombre.toLowerCase();
        const busqueda = searchServicio.toLowerCase();
        return nombreCompleto.includes(busqueda);
      });
    }

    if (!servicioEncontrado) {
      alert("No se encontró un servicio con ese nombre.");
      return;
    }

    if (serviciosSeleccionados.some(s => s.id === servicioEncontrado.id_servicio)) {
      alert("Este servicio ya está seleccionado.");
      setSearchServicio('');
      setShowServicioSelect(false);
      return;
    }

    setServiciosSeleccionados(prev => [...prev, {
      id: servicioEncontrado.id_servicio,
      nombre: servicioEncontrado.nombre,
      costo: parseFloat(servicioEncontrado.costo || 0)
    }]);
    setSearchServicio('');
    setShowServicioSelect(false);
  };

  const handleEliminarServicio = (idServicio: number) => {
    setServiciosSeleccionados(prev => prev.filter(s => s.id !== idServicio));
  };

  // Filtrar servicios para el select searchable
  const serviciosFiltrados = servicios.filter(s => {
    if (!searchServicio.trim()) return false;
    const nombreCompleto = s.nombre.toLowerCase();
    const busqueda = searchServicio.toLowerCase();
    return nombreCompleto.includes(busqueda);
  }).slice(0, 10);

  return (
    <Modal 
      show={show} 
      onHide={handleCloseForm} 
      centered
      size="lg"
      backdrop="static"
      className="custom-modal"
    >
      <Modal.Header 
        className="border-0 position-relative"
        style={{
          background: "linear-gradient(135deg, #2E8B57 0%, #1a5735 100%)",
          borderRadius: "15px 15px 0 0",
          padding: "1.5rem"
        }}
      >
        <Modal.Title className="text-white">
          <div className="d-flex align-items-center">
            <FaCalendar className="me-2" size={24} />
            <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>
              {citaEditar ? 'Editar Cita' : 'Nueva Cita'}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "2rem" }}>
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaUserClock className="me-2" />
                  Terapeuta
                </Form.Label>
                <Form.Select
                  value={idTerapeuta}
                  onChange={(e) => setIdTerapeuta(Number(e.target.value))}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="">Seleccione un terapeuta</option>
                  {terapeutas.map((terapeuta) => (
                    <option key={terapeuta.id_terapeuta} value={terapeuta.id_terapeuta}>
                      {terapeuta.nombre} {terapeuta.apellido}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaCalendar className="me-2" />
                  Fecha
                </Form.Label>
                <div className="custom-datepicker-container">
                  <DatePicker 
                    onChange={(value) => setFecha(value ? (value as Date) : new Date())}
                    value={fecha}
                    className="form-control custom-datepicker"
                    clearIcon={null}
                    calendarIcon={null}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {capacityInfo && horaInicio && tipoTerapia && (
            <div className={`mb-4 p-3 ${
              modoMultiple 
                ? (pacientesSeleccionados.length <= capacityInfo.cuposDisponibles ? 'alert alert-info' : 'alert alert-warning')
                : (capacityInfo.disponible ? 'alert alert-info' : 'alert alert-danger')
            }`} style={{
              borderRadius: "8px",
              border: `1px solid ${
                modoMultiple
                  ? (pacientesSeleccionados.length <= capacityInfo.cuposDisponibles ? '#bee5eb' : '#fff3cd')
                  : (capacityInfo.disponible ? '#bee5eb' : '#f5c6cb')
              }`
            }}>
              <strong className="d-block mb-2">
                <FaClock className="me-2" />
                Capacidad para {tipoTerapia === 'Fisica' ? 'Terapia Física' : 'Terapia Neurológica'} en la hora {capacityInfo.hora}:
              </strong>
              <div className="mb-2">
                {modoMultiple ? (
                  <>
                    {pacientesSeleccionados.length > 0 && (
                      <div className="mb-2">
                        <span className={pacientesSeleccionados.length <= capacityInfo.cuposDisponibles ? 'text-success' : 'text-warning'}>
                          {pacientesSeleccionados.length <= capacityInfo.cuposDisponibles ? '✓' : '⚠'} 
                          {' '}Seleccionado(s): {pacientesSeleccionados.length} paciente(s)
                        </span>
                      </div>
                    )}
                    <div>
                      <span className={capacityInfo.cuposDisponibles > 0 ? 'text-info' : 'text-danger'}>
                        {capacityInfo.cuposDisponibles > 0 ? '✓' : '✗'} 
                        {' '}Disponible: {capacityInfo.cuposDisponibles} de {capacityInfo.capacidadMaxima} cupo(s)
                        {capacityInfo.citasExistentes > 0 && ` (${capacityInfo.citasExistentes} cita(s) ya programada(s))`}
                      </span>
                    </div>
                    {pacientesSeleccionados.length > capacityInfo.cuposDisponibles && (
                      <div className="mt-2 text-warning">
                        <strong>⚠ Advertencia:</strong> Ha seleccionado más pacientes ({pacientesSeleccionados.length}) de los cupos disponibles ({capacityInfo.cuposDisponibles})
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {capacityInfo.disponible ? (
                      <span className="text-success">
                        ✓ Disponible: {capacityInfo.cuposDisponibles} de {capacityInfo.capacidadMaxima} cupo(s) disponible(s)
                        {capacityInfo.citasExistentes > 0 && ` (${capacityInfo.citasExistentes} cita(s) ya programada(s))`}
                      </span>
                    ) : (
                      <span className="text-danger">
                        ✗ Capacidad máxima alcanzada: {capacityInfo.citasExistentes} de {capacityInfo.capacidadMaxima} cupo(s) ocupado(s)
                      </span>
                    )}
                  </>
                )}
              </div>
              <small className="text-muted d-block">
                {tipoTerapia === 'Fisica' 
                  ? 'Duración: 1 hora. Máximo 3 pacientes por hora con 1 terapeuta para Terapia Física'
                  : 'Duración: 1 hora. Máximo 2 pacientes por hora con 1 terapeuta para Terapia Neurológica'}
              </small>
            </div>
          )}

          {blockedIntervals.length > 0 && (
            <div className="mb-4 p-3" style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}>
              <strong className="d-block mb-2">
                <FaClock className="me-2" />
                Horarios ocupados para esta fecha:
              </strong>
              <ul className="list-unstyled mb-0">
                {blockedIntervals.map((interval, i) => (
                  <li key={i} className="text-muted">
                    • {interval.inicio} - {interval.fin}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaClock className="me-2" />
                  Hora (Duración: 1 hora)
                </Form.Label>
                <Form.Control
                  type="time"
                  value={horaInicio}
                  onChange={handleHoraInicioChange}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                />
                <Form.Text className="text-muted">
                  La cita tendrá una duración de 1 hora completa
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaNotesMedical className="me-2" />
                  Tipo de Terapia
                </Form.Label>
                <Form.Select
                  value={tipoTerapia}
                  onChange={(e) => setTipoTerapia(e.target.value)}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="">Seleccione un tipo de terapia</option>
                  <option value="Fisica">Terapia Física (1 hora - Máx. 3 pacientes)</option>
                  <option value="Neurologica">Terapia Neurológica (1 hora - Máx. 2 pacientes)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaClipboardCheck className="me-2" />
                  Estado
                </Form.Label>
                <Form.Select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada')}
                  required
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Completada">Completada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              {!citaEditar && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label={
                      <span>
                        <FaUsers className="me-2" />
                        Agregar múltiples pacientes (mismo horario)
                      </span>
                    }
                    checked={modoMultiple}
                    onChange={handleToggleModoMultiple}
                    style={{ fontSize: "1rem", fontWeight: "500" }}
                  />
                </Form.Group>
              )}
              
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaUser className="me-2" />
                  {modoMultiple ? 'Pacientes' : 'Paciente'}
                  {modoMultiple && capacityInfo && (
                    <span className="text-muted ms-2" style={{ fontSize: "0.9rem" }}>
                      ({pacientesSeleccionados.length} seleccionado(s) de {capacityInfo.cuposDisponibles} disponible(s))
                    </span>
                  )}
                </Form.Label>
                
                {modoMultiple ? (
                  <div>
                    {/* Selector searchable con botón + */}
                    <div className="mb-3" ref={selectRef} style={{ position: "relative" }}>
                      <InputGroup>
                        <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                          <FaSearch className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Buscar paciente por nombre o apellido..."
                          value={searchPaciente}
                          onChange={(e) => {
                            setSearchPaciente(e.target.value);
                            setShowPacienteSelect(e.target.value.length > 0);
                          }}
                          onFocus={() => {
                            if (searchPaciente.length > 0) {
                              setShowPacienteSelect(true);
                            }
                          }}
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "0",
                            border: "1px solid #dee2e6"
                          }}
                        />
                        <Button
                          variant="success"
                          onClick={handleAgregarPaciente}
                          disabled={
                            !searchPaciente.trim() ||
                            (capacityInfo && pacientesSeleccionados.length >= capacityInfo.cuposDisponibles)
                          }
                          style={{
                            borderRadius: "0 8px 8px 0",
                            backgroundColor: "#2E8B57",
                            border: "1px solid #2E8B57"
                          }}
                        >
                          <FaPlus /> Agregar
                        </Button>
                      </InputGroup>

                      {/* Dropdown de resultados de búsqueda */}
                      {showPacienteSelect && searchPaciente.trim() && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            backgroundColor: "white",
                            border: "1px solid #dee2e6",
                            borderRadius: "0 0 8px 8px",
                            maxHeight: "200px",
                            overflowY: "auto",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                          }}
                        >
                          {pacientesFiltrados.length === 0 ? (
                            <div className="p-3 text-muted text-center">
                              No se encontraron pacientes
                            </div>
                          ) : (
                            pacientesFiltrados.map((paciente) => {
                              const yaSeleccionado = pacientesSeleccionados.some(p => p.id === paciente.id_paciente);
                              return (
                                <div
                                  key={paciente.id_paciente}
                                  onClick={() => {
                                    if (!yaSeleccionado) {
                                      handleAgregarPaciente(paciente.id_paciente);
                                    }
                                  }}
                                  style={{
                                    padding: "0.75rem",
                                    cursor: yaSeleccionado ? "not-allowed" : "pointer",
                                    backgroundColor: yaSeleccionado ? "#f8f9fa" : "white",
                                    opacity: yaSeleccionado ? 0.6 : 1,
                                    borderBottom: "1px solid #f0f0f0"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!yaSeleccionado) {
                                      e.currentTarget.style.backgroundColor = "#e9ecef";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!yaSeleccionado) {
                                      e.currentTarget.style.backgroundColor = "white";
                                    }
                                  }}
                                >
                                  {paciente.nombre} {paciente.apellido}
                                  {yaSeleccionado && (
                                    <span className="text-muted ms-2" style={{ fontSize: "0.85rem" }}>
                                      (ya seleccionado)
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lista de pacientes seleccionados */}
                    {pacientesSeleccionados.length > 0 && (
                      <div style={{
                        border: "1px solid #dee2e6",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        backgroundColor: "#f8f9fa"
                      }}>
                        <strong className="d-block mb-2" style={{ fontSize: "0.9rem" }}>
                          Pacientes seleccionados ({pacientesSeleccionados.length}):
                        </strong>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {pacientesSeleccionados.map((pac) => (
                            <div
                              key={pac.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem 0.75rem",
                                backgroundColor: "#2E8B57",
                                color: "white",
                                borderRadius: "6px",
                                fontSize: "0.9rem"
                              }}
                            >
                              <span>{pac.nombre} {pac.apellido}</span>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleEliminarPaciente(pac.id)}
                                style={{
                                  padding: 0,
                                  color: "white",
                                  textDecoration: "none",
                                  lineHeight: 1
                                }}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pacientesSeleccionados.length === 0 && (
                      <div className="text-muted text-center p-3" style={{
                        border: "1px dashed #dee2e6",
                        borderRadius: "8px",
                        backgroundColor: "#f8f9fa"
                      }}>
                        No hay pacientes seleccionados. Use el buscador arriba para agregar pacientes.
                      </div>
                    )}
                  </div>
                ) : (
                  <Form.Select
                    value={idPaciente}
                    onChange={(e) => setIdPaciente(Number(e.target.value))}
                    required
                    disabled={citaEditar !== null}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px"
                    }}
                  >
                    <option value="">Seleccione un paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.id_paciente} value={paciente.id_paciente}>
                        {paciente.nombre} {paciente.apellido}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Sección de Servicios */}
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaConciergeBell className="me-2" />
                  Servicios
                  {serviciosSeleccionados.length > 0 && (
                    <span className="text-muted ms-2" style={{ fontSize: "0.9rem" }}>
                      ({serviciosSeleccionados.length} seleccionado(s))
                    </span>
                  )}
                </Form.Label>
                
                <div ref={servicioSelectRef} style={{ position: "relative" }}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                      <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar servicio por nombre..."
                      value={searchServicio}
                      onChange={(e) => {
                        setSearchServicio(e.target.value);
                        setShowServicioSelect(e.target.value.length > 0);
                      }}
                      onFocus={() => {
                        if (searchServicio.length > 0) {
                          setShowServicioSelect(true);
                        }
                      }}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "0",
                        border: "1px solid #dee2e6"
                      }}
                    />
                    <Button
                      variant="success"
                      onClick={() => handleAgregarServicio()}
                      disabled={!searchServicio.trim()}
                      style={{
                        borderRadius: "0 8px 8px 0",
                        backgroundColor: "#2E8B57",
                        border: "1px solid #2E8B57"
                      }}
                    >
                      <FaPlus /> Agregar
                    </Button>
                  </InputGroup>

                  {/* Dropdown de resultados de búsqueda */}
                  {showServicioSelect && searchServicio.trim() && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: "white",
                        border: "1px solid #dee2e6",
                        borderRadius: "0 0 8px 8px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                      }}
                    >
                      {serviciosFiltrados.length === 0 ? (
                        <div className="p-3 text-muted text-center">
                          No se encontraron servicios
                        </div>
                      ) : (
                        serviciosFiltrados.map((servicio) => {
                          const yaSeleccionado = serviciosSeleccionados.some(s => s.id === servicio.id_servicio);
                          return (
                            <div
                              key={servicio.id_servicio}
                              onClick={() => {
                                if (!yaSeleccionado) {
                                  handleAgregarServicio(servicio.id_servicio);
                                }
                              }}
                              style={{
                                padding: "0.75rem",
                                cursor: yaSeleccionado ? "not-allowed" : "pointer",
                                backgroundColor: yaSeleccionado ? "#f8f9fa" : "white",
                                opacity: yaSeleccionado ? 0.6 : 1,
                                borderBottom: "1px solid #f0f0f0"
                              }}
                              onMouseEnter={(e) => {
                                if (!yaSeleccionado) {
                                  e.currentTarget.style.backgroundColor = "#e9ecef";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!yaSeleccionado) {
                                  e.currentTarget.style.backgroundColor = "white";
                                }
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <span>{servicio.nombre}</span>
                                <span className="text-muted">L. {parseFloat(servicio.costo || 0).toFixed(2)}</span>
                              </div>
                              {yaSeleccionado && (
                                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                  (ya seleccionado)
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de servicios seleccionados */}
                {serviciosSeleccionados.length > 0 && (
                  <div style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    marginTop: "0.5rem"
                  }}>
                    <strong className="d-block mb-2" style={{ fontSize: "0.9rem" }}>
                      Servicios seleccionados ({serviciosSeleccionados.length}):
                    </strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      {serviciosSeleccionados.map((serv) => (
                        <div
                          key={serv.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 0.75rem",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "0.9rem"
                          }}
                        >
                          <span>{serv.nombre} - L. {serv.costo.toFixed(2)}</span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleEliminarServicio(serv.id)}
                            style={{
                              padding: 0,
                              color: "white",
                              textDecoration: "none",
                              lineHeight: 1
                            }}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <strong>Total:</strong>
                      <strong className="text-success" style={{ fontSize: "1.2rem" }}>
                        L. {total.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}

                {serviciosSeleccionados.length === 0 && (
                  <div className="text-muted text-center p-3" style={{
                    border: "1px dashed #dee2e6",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa"
                  }}>
                    No hay servicios seleccionados. Use el buscador arriba para agregar servicios.
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Button 
              variant="outline-secondary" 
              onClick={handleCloseForm}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px"
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="success" 
              type="submit"
              disabled={
                loadingCapacity || 
                loadingSubmit ||
                (capacityInfo !== null && !capacityInfo.disponible && !modoMultiple) ||
                (modoMultiple && pacientesSeleccionados.length === 0) ||
                (modoMultiple && capacityInfo && pacientesSeleccionados.length > capacityInfo.cuposDisponibles)
              }
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                backgroundColor: "#2E8B57",
                opacity: (
                  loadingCapacity || 
                  loadingSubmit ||
                  (capacityInfo !== null && !capacityInfo.disponible && !modoMultiple) ||
                  (modoMultiple && pacientesSeleccionados.length === 0) ||
                  (modoMultiple && capacityInfo && pacientesSeleccionados.length > capacityInfo.cuposDisponibles)
                ) ? 0.6 : 1
              }}
            >
              {loadingSubmit 
                ? 'Guardando...' 
                : loadingCapacity 
                  ? 'Verificando...' 
                  : citaEditar 
                    ? 'Guardar Cambios' 
                    : modoMultiple && pacientesSeleccionados.length > 0
                      ? `Crear ${pacientesSeleccionados.length} Cita(s)`
                      : 'Crear Cita'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default CitasFormModal;