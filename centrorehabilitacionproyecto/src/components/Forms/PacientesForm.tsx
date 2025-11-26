import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios'; 

// --- RUTAS DE IMPORTACIÓN ---
// Ajusta esto según dónde guardaste este archivo.
// Si está en src/components/Forms/, usa "../../"
import { AppDispatch, RootState } from '../../app/store';
import { 
  createPaciente, 
  updatePaciente, 
  Paciente 
} from '../../features/pacientes/pacientesSlice'; 

interface PacientesFormProps {
  show: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  pacienteEditar: Paciente | null;
}

interface Encargado {
  id_encargado: number;
  nombre: string;
  apellido: string;
}

// Estado inicial del formulario
const initialState = {
  nombre: '',
  apellido: '',
  fecha_nacimiento: '',
  telefono: '',
  direccion: '',
  id_encargado: '', 
  
  // --- CAMPOS NUEVOS ---
  numero_identidad: '',
  genero: '2', // Por defecto 2 (Indefinido)
  lugar_procedencia: ''
};

const PacientesForm = ({ show, handleClose, handleSubmit, pacienteEditar }: PacientesFormProps) => {
  const dispatch: AppDispatch = useDispatch();
  
  // 1. IMPORTANTE: Traemos la lista de pacientes para verificar duplicados
  const { pacientes } = useSelector((state: RootState) => state.pacientes);

  const [listaEncargados, setListaEncargados] = useState<Encargado[]>([]);
  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);

  // --- EFECTO 1: CARGAR ENCARGADOS DESDE LA API ---
  useEffect(() => {
    const cargarEncargados = async () => {
      try {
        // Asegúrate que tu backend esté corriendo en el puerto 3002
        const response = await axios.get('http://localhost:3002/Api/encargados/getencargados');
        
        if (response.data && response.data.result) {
            setListaEncargados(response.data.result);
        }
      } catch (error) {
        console.error("Error al cargar encargados:", error);
        // Opcional: no mostrar error si es algo menor
      }
    };
    
    if (show) {
        cargarEncargados();
    }
  }, [show]);

  // --- EFECTO 2: RELLENAR DATOS SI ES EDICIÓN ---
  useEffect(() => {
    if (pacienteEditar) {
      setFormData({
        nombre: pacienteEditar.nombre,
        apellido: pacienteEditar.apellido,
        // Ajustamos la fecha para que el input type="date" la lea bien
        fecha_nacimiento: pacienteEditar.fecha_nacimiento ? pacienteEditar.fecha_nacimiento.split('T')[0] : '',
        telefono: pacienteEditar.telefono,
        direccion: pacienteEditar.direccion,
        
        // Si el encargado es null, ponemos cadena vacía para el select
        id_encargado: pacienteEditar.id_encargado ? pacienteEditar.id_encargado.toString() : '',
        
        numero_identidad: pacienteEditar.numero_identidad || '',
        genero: (pacienteEditar.genero !== null && pacienteEditar.genero !== undefined) ? pacienteEditar.genero.toString() : '2',
        lugar_procedencia: pacienteEditar.lugar_procedencia || ''
      });
    } else {
      setFormData(initialState);
    }
    setValidated(false);
  }, [pacienteEditar, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Validación nativa de HTML (campos required vacíos, tipos incorrectos, etc.)
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // --- INICIO DE VALIDACIONES PERSONALIZADAS ---

    const identidadLimpia = formData.numero_identidad.trim();

    // Solo validamos si escribió algo en identidad
    if (identidadLimpia !== "") {
        
        // 1. VALIDACIÓN DE FORMATO (13 DÍGITOS)
        // Quitamos los guiones para contar solo los números
        const soloNumeros = identidadLimpia.replace(/-/g, '');
        
        if (soloNumeros.length !== 13) {
            toast.warning("El número de identidad debe tener exactamente 13 dígitos.");
            return; // Detenemos el guardado
        }

        // 2. VALIDACIÓN DE DUPLICADOS
        // Buscamos si existe otro paciente con esa misma identidad
        const existeDuplicado = pacientes.find(p => 
            // Que la identidad coincida...
            p.numero_identidad === identidadLimpia &&
            // ... Y que NO sea el mismo paciente que estamos editando (para no bloquearse a sí mismo)
            p.id_paciente !== pacienteEditar?.id_paciente
        );

        if (existeDuplicado) {
            toast.error(`Error: Esa identidad ya pertenece a un paciente.`);
            return; // Detenemos el guardado
        }
    }
    // --- FIN DE VALIDACIONES ---

    // Lógica para enviar NULL si no se seleccionó encargado
    let encargadoFinal = null;
    if (formData.id_encargado && formData.id_encargado !== "") {
        encargadoFinal = parseInt(formData.id_encargado);
    }

    const pacienteData: any = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      fecha_nacimiento: formData.fecha_nacimiento, 
      telefono: formData.telefono,
      direccion: formData.direccion,
      // Usamos la variable procesada (número o null)
      id_encargado: encargadoFinal,
      
      numero_identidad: identidadLimpia,
      lugar_procedencia: formData.lugar_procedencia,
      genero: parseInt(formData.genero) 
    };

    try {
      if (pacienteEditar) {
        // ACTUALIZAR
        await dispatch(updatePaciente({ 
            ...pacienteEditar, 
            ...pacienteData 
        })).unwrap();
        toast.success("Paciente actualizado correctamente");
      } else {
        // CREAR
        await dispatch(createPaciente(pacienteData)).unwrap();
        toast.success("Paciente creado correctamente");
      }
      
      handleSubmit(); // Recargar la tabla
      handleClose();  // Cerrar el modal
      
    } catch (error: any) {
      console.error("Error al guardar:", error);
      toast.error(error.message || "Error al guardar el paciente");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          {pacienteEditar ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={onSubmit}>
          
          {/* Fila 1 */}
          <Row className="mb-3">
            <Form.Group as={Col} md={4} controlId="numero_identidad">
              <Form.Label>Número de Identidad</Form.Label>
              <Form.Control
                type="text"
                placeholder="0000-0000-00000"
                name="numero_identidad"
                value={formData.numero_identidad}
                onChange={handleChange}
                // (Opcional) Puedes poner un pattern aquí también si quieres validación visual roja
                // pattern="[0-9-]{13,15}"
              />
              <Form.Text className="text-muted">
                Debe tener 13 dígitos.
              </Form.Text>
            </Form.Group>

            <Form.Group as={Col} md={4} controlId="nombre">
              <Form.Label>Nombres <span className="text-danger">*</span></Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Ej. Juan Carlos"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4} controlId="apellido">
              <Form.Label>Apellidos <span className="text-danger">*</span></Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Ej. Pérez López"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
            </Form.Group>
          </Row>

          {/* Fila 2 */}
          <Row className="mb-3">
            <Form.Group as={Col} md={4} controlId="fecha_nacimiento">
              <Form.Label>Fecha de Nacimiento <span className="text-danger">*</span></Form.Label>
              <Form.Control
                required
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4} controlId="genero">
              <Form.Label>Género</Form.Label>
              <Form.Select name="genero" value={formData.genero} onChange={handleChange}>
                <option value="0">Masculino</option>
                <option value="1">Femenino</option>
                <option value="2">Indefinido</option>
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} md={4} controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. 9999-9999"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          {/* Fila 3: Procedencia y Encargado */}
          <Row className="mb-3">
            <Form.Group as={Col} md={6} controlId="lugar_procedencia">
              <Form.Label>Lugar de Procedencia</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. Danlí, El Paraíso"
                name="lugar_procedencia"
                value={formData.lugar_procedencia}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} md={6} controlId="id_encargado">
              {/* Etiqueta Opcional */}
              <Form.Label>Encargado (Opcional)</Form.Label>
              <Form.Select 
                // SIN REQUIRED
                name="id_encargado" 
                value={formData.id_encargado} 
                onChange={handleChange}
              >
                {/* Opción vacía para enviar NULL */}
                <option value="">-- Sin Encargado / Paciente Independiente --</option>
                
                {listaEncargados.map((enc) => (
                  <option key={enc.id_encargado} value={enc.id_encargado}>
                    {enc.nombre} {enc.apellido}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>

          {/* Fila 4 */}
          <Form.Group className="mb-3" controlId="direccion">
            <Form.Label>Dirección Domiciliaria</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Dirección completa..."
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              {pacienteEditar ? 'Actualizar Datos' : 'Guardar Paciente'}
            </Button>
          </div>

        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PacientesForm;