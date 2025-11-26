import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Bodega } from '../../components/Bodegas'; 

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface BodegasState {
  bodegas: Bodega[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: BodegasState = {
  bodegas: [],
  status: 'idle',
  error: null,
  pagination: null,
};

export const fetchBodegas = createAsyncThunk(
  'bodegas/fetchBodegas', 
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await axios.get('http://localhost:3002/Api/bodega/GetBodegas', {
      params: { page, limit, search }
    });
    return {
      bodegas: response.data.result as Bodega[],
      pagination: response.data.pagination as PaginationInfo
    };
  }
);

export const deleteBodega = createAsyncThunk('bodegas/deleteBodega', async (id: number) => {
  await axios.delete(`http://localhost:3002/Api/bodega/DeleteBodega?bodega_id=${id}`);
  return id; 
});

const bodegasSlice = createSlice({
  name: 'bodegas',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBodegas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBodegas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bodegas = action.payload.bodegas;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBodegas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Algo salió mal';
      })
      // Casos para deleteBodega
      .addCase(deleteBodega.fulfilled, (state, action: PayloadAction<number>) => {
        state.bodegas = state.bodegas.filter(b => b.id_bodega !== action.payload);
      });
  },
});

export default bodegasSlice.reducer;