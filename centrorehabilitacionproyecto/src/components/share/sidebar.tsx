import './sidebar.css';
import { IoIosLogOut } from "react-icons/io";


const Sidebar = () => {
  return (
    <div className="sidebar">
      
        <img className='logo' src="/src/img/logo.png" alt="" />
      <ul>
        <li>
            <a href="/">Encargados</a>
            <a href="/">Pacientes</a>
            <a href="/">Prestamos</a>
            <a href="/">diagnostico</a>
            <a href="/">Productos</a>
            <a href="/">Cita</a>
            <a href="/">Bodega</a>
            <a href="/">Usuario</a>
       

        </li>
      </ul>
     <div className='Btnlogout'>
     <IoIosLogOut className='ola' />
     </div>
    </div>
  );
}

export default Sidebar;