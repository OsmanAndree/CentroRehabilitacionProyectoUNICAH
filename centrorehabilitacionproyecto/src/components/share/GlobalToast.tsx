import { ToastContainer } from 'react-toastify';
import { createPortal } from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';


const GlobalToast = () => {
    if (typeof window === "undefined") {
    return null;
    }

    return createPortal(
    <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
    />,
    document.body 
    );
};

export default GlobalToast;
