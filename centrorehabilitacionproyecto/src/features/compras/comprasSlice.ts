import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Compra } from "../../components/Compras";

interface ComprasState {
  compras: Compra[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ComprasState = {
  compras: [],
  status: "idle",
  error: null,
};

export const fetchCompras = createAsyncThunk(
  "compras/fetchCompras",
  async () => {
    const response = await axios.get(
      "http://localhost:3002/Api/compras/getCompras"
    );
    return response.data.result as Compra[];
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
        (state, action: PayloadAction<Compra[]>) => {
          state.status = "succeeded";
          state.compras = action.payload;
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
