import './sidebar.css';
import { IoIosLogOut } from "react-icons/io";
import { useState } from 'react';
// Importar iconos (puedes cambiarlos por los que prefieras)
import { FaUsers, FaUserInjured, FaMoneyBillWave, FaStethoscope, 
         FaBoxes, FaCalendarAlt, FaWarehouse, FaUserCog } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); 

  const toggleSidebar = () => {
    setIsOpen(!isOpen);  
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <img className='logo' src="/src/img/logo.png" alt="Logo" />
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isOpen ? '<' : '>'} {}
        </button>
      </div>
      
      <ul className="nav-links">
        <li className="active">
          <a href="/">
            <FaUsers className="icon" />
            <span className="link-text">Encargados</span>
          </a>
        </li>
        <li>
          <a href="/">
            <FaUserInjured className="icon" />
            <span className="link-text">Pacientes</span>
          </a>
        </li>
        <li>
          <a href="/">
            <FaMoneyBillWave className="icon" />
            <span className="link-text">Prestamos</span>
          </a>
        </li>
        <li>
          <a href="/">
            <FaStethoscope className="icon" />
            <span className="link-text">Diagnostico</span>
          </a>
        </li>
        <li>
          <a href="/">
            <FaBoxes className="icon" />
            <span className="link-text">Productos</span>
          </a>
        </li>
        <li>
          <a href="/">
            <FaCalendarAlt className="icon" />
            <span className="link-text">Cita</span>
          </a>
        </li>
        <li>
          <a href="/">
            <FaWarehouse className="icon" />
            <span className="link-text">Bodega</span>
          </a>
        </li>
        <li>
          <a href="/">
            <FaUserCog className="icon" />
            <span className="link-text">Usuario</span>
          </a>
        </li>
      </ul>
      
      <div className='Btnlogout'>
        <IoIosLogOut className="icon" />
        <span className="link-text">Cerrar sesión</span>
      </div>
    </div>
  );
}

export default Sidebar;
