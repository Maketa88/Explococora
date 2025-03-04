import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaIdCard, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const BorrarCuenta = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cedula, setCedula] = useState(null);
  const [cedulaVerificacion, setCedulaVerificacion] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    const token = localStorage.getItem('token');
    const cedulaStr = localStorage.getItem('cedula');

    if (!token || !cedulaStr) {
      navigate('/Ingreso');
      return;
    }

    setCedula(cedulaStr);
  }, [navigate]);

  const handleEliminarCuenta = () => {
    if (!cedula) {
      setError('No se puede eliminar la cuenta sin identificación');
      return;
    }

    // Verificar que la cédula ingresada coincida
    if (cedulaVerificacion !== cedula) {
      setError('La cédula ingresada no coincide con tu cuenta');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmarEliminacion = async () => {
    if (!cedula) {
      setError('No se puede eliminar la cuenta sin identificación');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Sesión expirada');
        navigate('/Ingreso');
        return;
      }

      // Llamada al backend para eliminar la cuenta
      await axios.delete(`http://localhost:10101/cliente/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Cuenta eliminada exitosamente');
      
      // Mostrar alerta personalizada
      Swal.fire({
        html: `
          <div style="
            display: flex; 
            flex-direction: column; 
            align-items: center;
            border: 4px solid #dc2626;
            border-radius: 12px;
            padding: clamp(15px, 4vw, 30px);
            background-color: #ffffff;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 500px;
            margin: 0 auto;
          ">
            <div style="
              display: flex; 
              flex-direction: column; 
              align-items: center;
              border-radius: 8px;
              padding: clamp(10px, 2vw, 20px);
              width: 100%;
            ">
              <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                  alt="Logo ExploCocora" 
                  style="
                    width: clamp(120px, 40vw, 200px);
                    height: auto;
                    border-radius: 8px;
                    margin-bottom: clamp(15px, 4vw, 25px);
                  ">
            </div>
            <h2 style="
              font-size: clamp(20px, 5vw, 32px);
              font-weight: bold; 
              font-family: Arial, Helvetica, sans-serif; 
              color: #dc2626; 
              margin-top: clamp(10px, 3vw, 20px);
              text-align: center;
              white-space: normal;
              width: 100%;
            ">
              ¡Cuenta Eliminada!
            </h2>
            <p style="
              font-size: clamp(14px, 3vw, 20px);
              font-family: Arial, Helvetica, sans-serif; 
              color: #dc2626; 
              text-align: center; 
              margin-top: clamp(8px, 2vw, 15px);
              width: 100%;
            ">
              Lamentamos verte partir. ¡Esperamos verte pronto de nuevo!
            </p>
            <button id="cerrarAlerta" style="
              margin-top: clamp(15px, 4vw, 25px);
              padding: clamp(8px, 2vw, 15px) clamp(15px, 4vw, 25px);
              background-color: #dc2626;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: clamp(14px, 2.5vw, 18px);
              font-weight: bold;
              cursor: pointer;
              transition: background-color 0.3s ease;
              width: auto;
              min-width: 100px;
            ">
              OK
            </button>
          </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        },
        didOpen: () => {
          // Agregar estilos personalizados para hacer el modal responsivo
          const style = document.createElement('style');
          style.innerHTML = `
            .swal2-popup-custom {
              padding: 0 !important;
              width: 95% !important;
              max-width: 550px !important;
            }
            .swal2-container-custom {
              padding: 10px !important;
            }
            @media (max-width: 480px) {
              .swal2-popup-custom {
                width: 100% !important;
                margin: 5px !important;
              }
            }
          `;
          document.head.appendChild(style);
          
          document.getElementById("cerrarAlerta").addEventListener("click", () => {
            Swal.close();
            localStorage.clear();
            navigate('/Ingreso');
          });
        }
      });
      
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      
      if (error.response?.status === 401) {
        setError('No autorizado. Por favor, inicie sesión nuevamente.');
        setTimeout(() => navigate('/Ingreso'), 2000);
      } else if (error.response?.status === 404) {
        setError('Usuario no encontrado');
      } else {
        setError('Ha ocurrido un error al eliminar la cuenta. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const cancelarEliminacion = () => {
    setShowConfirmDialog(false);
    setCedulaVerificacion('');
  };

  // Si hay un error de autenticación, mostrar mensaje y redireccionar
  if (!cedula) {
    return (
      <div className="min-h-screen bg-teal-900 p-3 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-white text-base sm:text-xl font-semibold bg-teal-800/80 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-teal-600 w-full max-w-md mx-auto">
          Error de autenticación. Redirigiendo...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-900 py-4 sm:py-8 md:py-12 px-2 sm:px-4 md:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl space-y-3 sm:space-y-6 bg-teal-800/70 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl p-3 sm:p-5 md:p-8">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-teal-600 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4 shadow-lg">
            <FaTrash className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Eliminar Cuenta
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-white">
            Esta acción eliminará permanentemente tu cuenta
          </p>
        </div>

        {success ? (
          <div className="mt-2 sm:mt-4 p-2 sm:p-3 md:p-4 bg-teal-700/50 text-white text-xs sm:text-sm rounded-lg border border-teal-500 shadow-sm">
            <p className="text-center font-medium">{success}</p>
            <p className="text-center mt-1 sm:mt-2">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="mb-3 sm:mb-5 md:mb-6 p-2 sm:p-3 md:p-4 bg-teal-700/50 border border-teal-500 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <FaExclamationTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white mr-2" />
                <p className="text-white font-medium text-xs sm:text-sm md:text-base">Advertencia</p>
              </div>
              <p className="text-white text-xs sm:text-sm md:text-base text-center">
                Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta operación no se puede deshacer.
              </p>
            </div>

            <div>
              <label htmlFor="cedulaVerificacion" className="block text-xs sm:text-sm md:text-base font-medium text-white mb-1 sm:mb-2">
                Para confirmar, ingresa tu número de cédula
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-teal-300" />
                </div>
                <input
                  type="text"
                  id="cedulaVerificacion"
                  value={cedulaVerificacion}
                  onChange={(e) => setCedulaVerificacion(e.target.value)}
                  className="appearance-none block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-teal-400 bg-teal-700/50 text-white rounded-lg shadow-sm placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent text-xs sm:text-sm md:text-base"
                  placeholder="Ingresa tu cédula"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 md:p-4 bg-red-700/50 text-white text-xs sm:text-sm rounded-lg border border-red-500 shadow-sm">
                <p className="text-center">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:flex-1 inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-teal-500 shadow-sm text-xs sm:text-sm md:text-base font-medium rounded-lg text-white bg-transparent hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminarCuenta}
                className="w-full sm:flex-1 inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm md:text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                disabled={isLoading || !cedulaVerificacion}
              >
                {isLoading ? 'Procesando...' : 'Eliminar Cuenta'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación responsivo */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-teal-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto border border-teal-600 shadow-xl sm:shadow-2xl">
            <div className="mx-auto flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-teal-600 mb-2 sm:mb-3 md:mb-4">
              <FaExclamationTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white text-center mb-1 sm:mb-2">¿Estás completamente seguro?</h3>
            <p className="text-xs sm:text-sm md:text-base text-white text-center mb-3 sm:mb-4 md:mb-6">
              Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados. Una vez eliminada, no podrás recuperar tu información.
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-3">
              <button
                type="button"
                onClick={confirmarEliminacion}
                className="w-full sm:w-auto inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm md:text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs sm:text-sm md:text-base">Eliminando cuenta...</span>
                  </span>
                ) : (
                  'Sí, eliminar mi cuenta'
                )}
              </button>
              <button
                type="button"
                onClick={cancelarEliminacion}
                className="w-full sm:w-auto inline-flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-teal-500 rounded-lg shadow-sm text-xs sm:text-sm md:text-base font-medium text-white bg-transparent hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
