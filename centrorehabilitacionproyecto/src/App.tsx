import './App.css';
import Sidebar from './components/share/sidebar';

function App() {
  return (
    <>
      <header className="header">
        <h1>Encargados</h1>
      </header>
      <div className="main-content">
        <Sidebar />
      </div>
    </>
  );
}

export default App;
