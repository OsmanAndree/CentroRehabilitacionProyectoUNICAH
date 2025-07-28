import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Paciente } from "../../components/Pacientes";

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

export const fetchPacientes = createAsyncThunk(
  "pacientes/fetchPacientes",
  async () => {
    const response = await axios.get(
      "http://localhost:3002/Api/pacientes/getpacientes"
    );
    return response.data.result as Paciente[];
  }
);

export const deletePaciente = createAsyncThunk(
  "pacientes/deletePaciente",
  async (id: number) => {
    await axios.delete(
      `http://localhost:3002/Api/pacientes/deletepacientes?paciente_id=${id}`
    );
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
      .addCase(
        fetchPacientes.fulfilled,
        (state, action: PayloadAction<Paciente[]>) => {
          state.status = "succeeded";
          state.pacientes = action.payload;
        }
      )
      .addCase(fetchPacientes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Algo salió mal";
      })
      .addCase(
        deletePaciente.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.pacientes = state.pacientes.filter(
            (p) => p.id_paciente !== action.payload
          );
        }
      );
  },
});

export default pacientesSlice.reducer;
