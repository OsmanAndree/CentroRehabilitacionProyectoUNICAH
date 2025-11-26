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
  alta_medica?: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PacientesState {
  pacientes: Paciente[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: PacientesState = {
  pacientes: [],
  status: "idle",
  error: null,
  pagination: null,
};

// --- CONFIGURACIÓN DE LA URL ---
// Apuntamos a la base del grupo de rutas
const BASE_URL = "http://localhost:3002/Api/pacientes";

// --- THUNKS ---

export const fetchPacientes = createAsyncThunk(
  "pacientes/fetchPacientes",
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await axios.get(`${BASE_URL}/getpacientes`, {
      params: { page, limit, search }
    });
    return {
      pacientes: response.data.result as Paciente[],
      pagination: response.data.pagination as PaginationInfo
    };
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

export const darAltaPaciente = createAsyncThunk(
  "pacientes/darAltaPaciente",
  async (id: number) => {
    // Ruta: /darAlta
    const response = await axios.put(`${BASE_URL}/darAlta?paciente_id=${id}`);
    return response.data.data as Paciente;
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
      .addCase(fetchPacientes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pacientes = action.payload.pacientes;
        state.pagination = action.payload.pagination;
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
      })
      .addCase(darAltaPaciente.fulfilled, (state, action: PayloadAction<Paciente>) => {
        const index = state.pacientes.findIndex((p) => p.id_paciente === action.payload.id_paciente);
        if (index !== -1) {
          state.pacientes[index].alta_medica = true;
        }
      });
  },
});

export default pacientesSlice.reducer;