
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Provider } from 'react-redux'; // <-- IMPORTA el Provider
import { store } from './app/store.ts'; // <-- IMPORTA tu store

// Configuración global de axios con interceptores (agrega token automáticamente)
import './utils/axiosConfig';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}> {/* <-- ENVUELVE tu App con el Provider */}
      <App />
    </Provider>
  </React.StrictMode>,
);