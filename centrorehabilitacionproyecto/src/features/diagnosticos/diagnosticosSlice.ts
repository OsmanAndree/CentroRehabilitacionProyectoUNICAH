import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Diagnostico } from '../../components/Diagnosticos'; 

interface DiagnosticosState {
  diagnosticos: Diagnostico[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DiagnosticosState = {
  diagnosticos: [],
  status: 'idle',
  error: null,
};

export const fetchDiagnosticos = createAsyncThunk('diagnosticos/fetchDiagnosticos', async () => {
  const response = await axios.get('http://localhost:3002/Api/diagnostico/getDiagnosticos');
  return response.data.result as Diagnostico[];
});

export const deleteDiagnostico = createAsyncThunk('diagnosticos/deleteDiagnostico', async (id: number) => {
  await axios.delete(`http://localhost:3002/Api/diagnostico/deleteDiagnosticos?diagnostico_id=${id}`);
  return id;
});

const diagnosticosSlice = createSlice({
  name: 'diagnosticos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiagnosticos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDiagnosticos.fulfilled, (state, action: PayloadAction<Diagnostico[]>) => {
        state.status = 'succeeded';
        state.diagnosticos = action.payload;
      })
      .addCase(fetchDiagnosticos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Algo salió mal';
      })
      .addCase(deleteDiagnostico.fulfilled, (state, action: PayloadAction<number>) => {
        state.diagnosticos = state.diagnosticos.filter(d => d.id_diagnostico !== action.payload);
      });
  },
});

export default diagnosticosSlice.reducer;