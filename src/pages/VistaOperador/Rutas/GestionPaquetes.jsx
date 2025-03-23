import GestionPaquetesCompleta from '../GestionPaquetes/GestionPaquetes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GestionPaquetes = () => {
  return (
    <>
      <GestionPaquetesCompleta />
      
      {/* Contenedor de Toast específico para esta ruta */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        containerId="gestion-paquetes"
      />
    </>
  );
};

export default GestionPaquetes; 