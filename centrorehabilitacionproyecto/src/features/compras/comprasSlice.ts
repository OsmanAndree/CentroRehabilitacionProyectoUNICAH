import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Compra } from "../../components/Compras";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ComprasState {
  compras: Compra[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: ComprasState = {
  compras: [],
  status: "idle",
  error: null,
  pagination: null,
};

export const fetchCompras = createAsyncThunk(
  "compras/fetchCompras",
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await axios.get(
      "http://localhost:3002/Api/compras/getCompras",
      { params: { page, limit, search } }
    );
    return {
      compras: response.data.result as Compra[],
      pagination: response.data.pagination as PaginationInfo
    };
  }
);

export const deleteCompra = createAsyncThunk(
  "compras/deleteCompra",
  async (id: number) => {
    await axios.delete(
      `http://localhost:3002/Api/compras/deleteCompra?id_compra=${id}`
    );
    return id;
  }
);

const comprasSlice = createSlice({
  name: "compras",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompras.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCompras.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.compras = action.payload.compras;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchCompras.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Algo salió mal";
      })
      .addCase(
        deleteCompra.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.compras = state.compras.filter(
            (c) => c.id_compra !== action.payload
          );
        }
      );
  },
});

export default comprasSlice.reducer;
