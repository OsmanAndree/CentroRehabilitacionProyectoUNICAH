import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import NavBar from './components/share/NavBar';
import Home from './components/Home';
import PacientesTable from "./components/Pacientes";
import TerapeutasTable from './components/Terapeuta';
import CitasTable from "./components/Citas";
import Login from './components/Login';  
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const isAuthenticated = localStorage.getItem("user"); 

  return (
    <Router>
      <ToastContainer />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login/>} />
          {isAuthenticated ? (
            <>
              <Route path="/home" element={<><NavBar /><Home /></>} />
              <Route path="/pacientes" element={<><NavBar /><PacientesTable /></>} />
              <Route path="/terapeutas" element={<><NavBar /><TerapeutasTable /></>} />
              <Route path="/citas" element={<><NavBar /><CitasTable /></>} />
            </>
          ) : (
            <Navigate to="/" />
          )}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
