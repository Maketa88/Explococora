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
                    width: clamp(150px, 40vw, 200px);
                    height: auto;
                    border-radius: 8px;
                    margin-bottom: clamp(15px, 4vw, 25px);
                  ">
            </div>
            <h2 style="
              font-size: clamp(24px, 5vw, 32px);
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
              font-size: clamp(16px, 3vw, 20px);
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
              min-width: 120px;
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
                margin: 10px !important;
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
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 w-full max-w-md">
          <p className="text-red-700 text-center text-sm sm:text-base">Error de autenticación. Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <FaTrash className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4 sm:mb-6">Eliminar Cuenta</h2>
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FaExclamationTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mr-2" />
                <p className="text-yellow-700 font-medium text-sm sm:text-base">Advertencia</p>
              </div>
              <p className="text-yellow-600 text-sm sm:text-base">Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta operación no se puede deshacer.</p>
            </div>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 text-center font-medium text-sm sm:text-base">{success}</p>
              <p className="text-green-600 text-center mt-2 text-sm sm:text-base">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="cedulaVerificacion" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Para confirmar, ingresa tu número de cédula
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cedulaVerificacion"
                    value={cedulaVerificacion}
                    onChange={(e) => setCedulaVerificacion(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Ingresa tu cédula"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                  <p className="text-red-700 text-center text-sm sm:text-base">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEliminarCuenta}
                  className="w-full sm:flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm sm:text-base font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  disabled={isLoading || !cedulaVerificacion}
                >
                  {isLoading ? 'Procesando...' : 'Eliminar Cuenta'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación responsivo */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-4">
              <FaExclamationTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2">¿Estás completamente seguro?</h3>
            <p className="text-sm sm:text-base text-gray-500 text-center mb-6">
              Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados. Una vez eliminada, no podrás recuperar tu información.
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={confirmarEliminacion}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm sm:text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm sm:text-base">Eliminando cuenta...</span>
                  </span>
                ) : (
                  'Sí, eliminar mi cuenta'
                )}
              </button>
              <button
                type="button"
                onClick={cancelarEliminacion}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
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
