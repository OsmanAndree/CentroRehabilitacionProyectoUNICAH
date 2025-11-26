import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Cita } from "../../components/Citas"; 

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CitasState {
  citas: Cita[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: CitasState = {
  citas: [],
  status: "idle",
  error: null,
  pagination: null,
};

export const fetchCitas = createAsyncThunk(
  "citas/fetchCitas", 
  async (params: { page?: number; limit?: number; searchPaciente?: string; searchTherapist?: string; searchDate?: string } = {}) => {
    const { page = 1, limit = 10, searchPaciente = '', searchTherapist = '', searchDate = '' } = params;
    const response = await axios.get("http://localhost:3002/Api/citas/getcitas", {
      params: { page, limit, searchPaciente, searchTherapist, searchDate }
    });
    return {
      citas: response.data.result as Cita[],
      pagination: response.data.pagination as PaginationInfo
    };
  }
);

export const deleteCita = createAsyncThunk(
  "citas/deleteCita",
  async (id: number) => {
    await axios.delete(
      `http://localhost:3002/Api/citas/deletecita?cita_id=${id}`
    );
    return id; 
  }
);

const citasSlice = createSlice({
  name: "citas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCitas.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCitas.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.citas = action.payload.citas;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCitas.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Algo salió mal";
      })
      .addCase(deleteCita.fulfilled, (state, action: PayloadAction<number>) => {
        state.citas = state.citas.filter((c) => c.id_cita !== action.payload);
      });
  },
});

export default citasSlice.reducer;
