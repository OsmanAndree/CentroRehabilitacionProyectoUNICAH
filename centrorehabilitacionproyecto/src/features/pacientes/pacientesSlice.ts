import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Interfaz (Ya la tienes bien, la dejo por referencia)
export interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  telefono: string;
  direccion: string;
  id_encargado: number;
  encargado?: { 
    nombre: string;
    apellido: string;
  };
  numero_identidad?: string | null;
  genero?: number | null;
  lugar_procedencia?: string | null;
}

interface PacientesState {
  pacientes: Paciente[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PacientesState = {
  pacientes: [],
  status: "idle",
  error: null,
};

// --- CONFIGURACIÓN DE LA URL ---
// Apuntamos a la base del grupo de rutas
const BASE_URL = "http://localhost:3002/Api/pacientes";

// --- THUNKS ---

export const fetchPacientes = createAsyncThunk(
  "pacientes/fetchPacientes",
  async () => {
    // AQUÍ ESTABA EL ERROR POSIBLEMENTE: Faltaba /getpacientes
    const response = await axios.get(`${BASE_URL}/getpacientes`);
    return response.data.result as Paciente[];
  }
);

export const createPaciente = createAsyncThunk(
  "pacientes/createPaciente",
  async (nuevoPaciente: Omit<Paciente, "id_paciente" | "encargado">) => {
    // Ruta: /insertpacientes
    const response = await axios.post(`${BASE_URL}/insertpacientes`, nuevoPaciente);
    return response.data.data as Paciente;
  }
);

export const updatePaciente = createAsyncThunk(
  "pacientes/updatePaciente",
  async (paciente: Paciente) => {
    // Ruta: /updatepacientes
    const response = await axios.put(
      `${BASE_URL}/updatepacientes?paciente_id=${paciente.id_paciente}`,
      paciente
    );
    return response.data.data as Paciente;
  }
);

export const deletePaciente = createAsyncThunk(
  "pacientes/deletePaciente",
  async (id: number) => {
    // Ruta: /deletepacientes
    await axios.delete(`${BASE_URL}/deletepacientes?paciente_id=${id}`);
    return id;
  }
);

const pacientesSlice = createSlice({
  name: "pacientes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPacientes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPacientes.fulfilled, (state, action: PayloadAction<Paciente[]>) => {
        state.status = "succeeded";
        state.pacientes = action.payload;
      })
      .addCase(fetchPacientes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Algo salió mal";
      })
      .addCase(createPaciente.fulfilled, (state, action: PayloadAction<Paciente>) => {
        state.pacientes.push(action.payload);
      })
      .addCase(updatePaciente.fulfilled, (state, action: PayloadAction<Paciente>) => {
        const index = state.pacientes.findIndex((p) => p.id_paciente === action.payload.id_paciente);
        if (index !== -1) {
          state.pacientes[index] = action.payload;
        }
      })
      .addCase(deletePaciente.fulfilled, (state, action: PayloadAction<number>) => {
        state.pacientes = state.pacientes.filter(
          (p) => p.id_paciente !== action.payload
        );
      });
  },
});

export default pacientesSlice.reducer;