import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Diagnostico } from '../../components/Diagnosticos'; 

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DiagnosticosState {
  diagnosticos: Diagnostico[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: DiagnosticosState = {
  diagnosticos: [],
  status: 'idle',
  error: null,
  pagination: null,
};

export const fetchDiagnosticos = createAsyncThunk(
  'diagnosticos/fetchDiagnosticos', 
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await axios.get('http://localhost:3002/Api/diagnostico/getDiagnosticos', {
      params: { page, limit, search }
    });
    return {
      diagnosticos: response.data.result as Diagnostico[],
      pagination: response.data.pagination as PaginationInfo
    };
  }
);

export const deleteDiagnostico = createAsyncThunk('diagnosticos/deleteDiagnostico', async (id: number) => {
  await axios.delete(`http://localhost:3002/Api/diagnostico/deleteDiagnosticos?diagnostico_id=${id}`);
  return id;
});

export const darAltaDiagnostico = createAsyncThunk('diagnosticos/darAlta', async (id: number) => {
  await axios.patch(`http://localhost:3002/Api/diagnostico/updateAlta?diagnostico_id=${id}`);
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
      .addCase(fetchDiagnosticos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.diagnosticos = action.payload.diagnosticos;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDiagnosticos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Algo salió mal';
      })
      .addCase(deleteDiagnostico.fulfilled, (state, action: PayloadAction<number>) => {
        state.diagnosticos = state.diagnosticos.filter(d => d.id_diagnostico !== action.payload);
      })
      .addCase(darAltaDiagnostico.fulfilled, (state, action: PayloadAction<number>) => {
        const index = state.diagnosticos.findIndex(d => d.id_diagnostico === action.payload);
        
        if (index !== -1) {
          state.diagnosticos[index].alta_medica = true;
        }
      });
  },
});

export default diagnosticosSlice.reducer;