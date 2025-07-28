import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Bodega } from '../../components/Bodegas'; 

interface BodegasState {
  bodegas: Bodega[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BodegasState = {
  bodegas: [],
  status: 'idle',
  error: null,
};

export const fetchBodegas = createAsyncThunk('bodegas/fetchBodegas', async () => {
  const response = await axios.get('http://localhost:3002/Api/bodega/GetBodegas');
  return response.data.result as Bodega[];
});

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
      .addCase(fetchBodegas.fulfilled, (state, action: PayloadAction<Bodega[]>) => {
        state.status = 'succeeded';
        state.bodegas = action.payload;
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