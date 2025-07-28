import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Cita } from "../../components/Citas"; 

interface CitasState {
  citas: Cita[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CitasState = {
  citas: [],
  status: "idle",
  error: null,
};

export const fetchCitas = createAsyncThunk("citas/fetchCitas", async () => {
  const response = await axios.get("http://localhost:3002/Api/citas/getcitas");
  return response.data.result as Cita[];
});

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
      .addCase(fetchCitas.fulfilled, (state, action: PayloadAction<Cita[]>) => {
        state.status = "succeeded";
        state.citas = action.payload;
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
