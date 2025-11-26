import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Encargado } from '../../components/Encargados'; 

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EncargadosState {
  encargados: Encargado[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: EncargadosState = {
  encargados: [],
  status: 'idle',
  error: null,
  pagination: null,
};

export const fetchEncargados = createAsyncThunk(
  'encargados/fetchEncargados', 
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await axios.get('http://localhost:3002/Api/encargados/getEncargados', {
      params: { page, limit, search }
    });
    return {
      encargados: response.data.result as Encargado[],
      pagination: response.data.pagination as PaginationInfo
    };
  }
);

export const deleteEncargado = createAsyncThunk('encargados/deleteEncargado', async (id: number) => {
  await axios.delete(`http://localhost:3002/Api/encargados/deleteEncargados?encargado_id=${id}`);
  return id;
});

const encargadosSlice = createSlice({
  name: 'encargados',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEncargados.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEncargados.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.encargados = action.payload.encargados;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEncargados.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Algo salió mal';
      })
      .addCase(deleteEncargado.fulfilled, (state, action: PayloadAction<number>) => {
        state.encargados = state.encargados.filter(e => e.id_encargado !== action.payload);
      });
  },
});

export default encargadosSlice.reducer;