import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  cantidad_disponible: number;
}

interface ProductosState {
  productos: Producto[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductosState = {
  productos: [],
  status: "idle",
  error: null,
};

export const fetchProductos = createAsyncThunk(
  "productos/fetchProductos",
  async () => {
    const response = await axios.get(
      "http://localhost:3002/Api/productos/getProductos"
    );
    return response.data.result as Producto[];
  }
);

export const deleteProducto = createAsyncThunk(
  "productos/deleteProducto",
  async (id: number) => {
    await axios.delete(
      `http://localhost:3002/Api/productos/deleteProductos?producto_id=${id}`
    );
    return id;
  }
);

const productosSlice = createSlice({
  name: "productos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchProductos.fulfilled,
        (state, action: PayloadAction<Producto[]>) => {
          state.status = "succeeded";
          state.productos = action.payload;
        }
      )
      .addCase(fetchProductos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Error al cargar productos";
      })
      .addCase(
        deleteProducto.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.productos = state.productos.filter(
            (p) => p.id_producto !== action.payload
          );
        }
      );
  },
});

export default productosSlice.reducer;
