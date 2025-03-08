import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import NavBar from './components/share/NavBar';
import Home from './components/Home';
import PacientesTable from "./components/Pacientes";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pacientes" element={<PacientesTable />} />
        </Routes>
      </main>
     
      <ToastContainer />
    </Router>
  );
}

export default App;
