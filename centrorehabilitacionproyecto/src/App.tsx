import './App.css';
import Sidebar from './components/share/sidebar';

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>Encargados</h1>
      </header>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
        <h2>Bienvenido al Panel de Encargados</h2>
        <p>Contenido de la página aquí</p>
        
        </div>
      </div>
    </div>
  );
}

export default App;
