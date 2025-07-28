import { configureStore } from '@reduxjs/toolkit';
import pacientesReducer from '../features/pacientes/pacientesSlice';
import terapeutasReducer from '../features/terapeutas/terapeutasSlice';
import bodegasReducer from '../features/bodegas/bodegasSlice';
import citasReducer from '../features/citas/citasSlice';
import comprasReducer from '../features/compras/comprasSlice';
import productosReducer from '../features/productos/productosSlice';
import diagnosticosReducer from '../features/diagnosticos/diagnosticosSlice'; 
import encargadosReducer from '../features/encargados/encargadosSlice';
import prestamosReducer from '../features/prestamos/prestamosSlice';

export const store = configureStore({
  reducer: {
    pacientes: pacientesReducer,
    terapeutas: terapeutasReducer,
    bodegas: bodegasReducer, 
    citas: citasReducer,
    compras: comprasReducer,
    productos: productosReducer,
    diagnosticos: diagnosticosReducer, 
    encargados: encargadosReducer,
    prestamos: prestamosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;