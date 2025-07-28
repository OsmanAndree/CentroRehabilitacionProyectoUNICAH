import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Prestamo } from "../../components/Prestamos";
interface PrestamosState {
  prestamos: Prestamo[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PrestamosState = {
  prestamos: [],
  status: "idle",
  error: null,
};

export const fetchPrestamos = createAsyncThunk(
  "prestamos/fetchPrestamos",
  async () => {
    const response = await axios.get(
      "http://localhost:3002/Api/prestamos/getPrestamos"
    );
    return response.data.result as Prestamo[];
  }
);

export const deletePrestamo = createAsyncThunk(
  "prestamos/deletePrestamo",
  async (id: number) => {
    await axios.delete(
      `http://localhost:3002/Api/prestamos/deletePrestamo?prestamo_id=${id}`
    );
    return id;
  }
);

const prestamosSlice = createSlice({
  name: "prestamos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrestamos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchPrestamos.fulfilled,
        (state, action: PayloadAction<Prestamo[]>) => {
          state.status = "succeeded";
          state.prestamos = action.payload;
        }
      )
      .addCase(fetchPrestamos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Algo salió mal";
      })
      .addCase(
        deletePrestamo.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.prestamos = state.prestamos.filter(
            (p) => p.id_prestamo !== action.payload
          );
        }
      );
  },
});

export default prestamosSlice.reducer;
