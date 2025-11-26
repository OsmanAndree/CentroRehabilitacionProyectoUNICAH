import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Terapeuta } from "../../components/Terapeuta";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface TerapeutasState {
  terapeutas: Terapeuta[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: TerapeutasState = {
  terapeutas: [],
  status: "idle",
  error: null,
  pagination: null,
};

export const fetchTerapeutas = createAsyncThunk(
  "terapeutas/fetchTerapeutas",
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await axios.get(
      "http://localhost:3002/Api/terapeutas/getterapeutas",
      { params: { page, limit, search } }
    );
    return {
      terapeutas: response.data.result as Terapeuta[],
      pagination: response.data.pagination as PaginationInfo
    };
  }
);

export const deleteTerapeuta = createAsyncThunk(
  "terapeutas/deleteTerapeuta",
  async (id: number) => {
    await axios.delete(
      `http://localhost:3002/Api/terapeutas/deleteterapeutas?terapeuta_id=${id}`
    );
    return id;
  }
);

const terapeutasSlice = createSlice({
  name: "terapeutas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerapeutas.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchTerapeutas.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.terapeutas = action.payload.terapeutas;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchTerapeutas.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Algo salió mal";
      })
      .addCase(
        deleteTerapeuta.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.terapeutas = state.terapeutas.filter(
            (t) => t.id_terapeuta !== action.payload
          );
        }
      );
  },
});

export default terapeutasSlice.reducer;
