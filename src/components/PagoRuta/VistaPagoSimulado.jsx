import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const VistaPagoSimulado = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  // Obtener los datos de la reserva pasados por navigate
  const { radicado, rutaInfo } = location.state || {};
  
  // Si no hay radicado, redirigir a la página principal
  if (!radicado) {
    navigate('/VistaCliente');
    return null;
  }

  // Función para procesar el pago simulado
  const procesarPagoSimulado = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error(t('noAutenticado', 'No estás autenticado'));
      }
      
      // Llamar a endpoint de simulación
      const response = await axios.get(`http://localhost:10101/pagos-rutas/simular/${radicado}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Respuesta de simulación:', response.data);
      
      if (response.data && response.data.success) {
        console.log(`Simulación exitosa. ID de pago: ${response.data.idPago}`);
        
        // Redireccionar a página de confirmación
        navigate('/VistaCliente/reserva/confirmacion', {
          state: {
            pagoSimulado: true,
            radicado: radicado,
            idPago: response.data.idPago
          }
        });
      } else {
        throw new Error(t('errorSimulacion', 'Error en la simulación del pago: Respuesta inválida del servidor'));
      }
    } catch (error) {
      console.error('Error al simular pago:', error);
      let mensajeError = t('errorSimulacionPago', 'Error al simular el pago');
      
      if (error.response) {
        if (error.response.data?.message) {
          mensajeError = `${mensajeError}: ${error.response.data.message}`;
        } else if (error.response.status === 404) {
          mensajeError = `${mensajeError}: Endpoint de simulación no encontrado`;
        }
      } else if (error.message) {
        mensajeError = `${mensajeError}: ${error.message}`;
      }
      
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  // Función para cancelar el pago
  const cancelarPago = () => {
    navigate(-1); // Volver a la página anterior
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Encabezado de la pasarela */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {t('pagoSimulado', 'Pago Simulado')}
            </h2>
            <div className="bg-white rounded-full p-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Cuerpo del formulario */}
        <div className="p-6">
          {/* Información de la reserva */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t('detallesReserva', 'Detalles de la Reserva')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('radicado', 'Número de Reserva')}:</span>
                <span className="font-medium text-gray-800">{radicado}</span>
              </div>
              
              {rutaInfo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('nombreRuta', 'Ruta')}:</span>
                    <span className="font-medium text-gray-800">{rutaInfo.nombreRuta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('precioTotal', 'Precio Total')}:</span>
                    <span className="font-bold text-teal-700">
                      ${(rutaInfo.precio * (rutaInfo.cantidadPersonas || 1)).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mensaje de entorno de prueba */}
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {t('entornoPrueba', 'Este es un entorno de prueba. En un entorno real, aquí verías las opciones de pago de Mercado Pago.')}
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={procesarPagoSimulado}
              disabled={cargando}
              className={`w-full py-3 rounded-lg ${
                cargando 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              } font-medium transition-all duration-300 flex items-center justify-center`}
            >
              {cargando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('procesando', 'Procesando...')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {t('confirmarPago', 'Confirmar Pago')}
                </>
              )}
            </button>

            <button
              onClick={cancelarPago}
              disabled={cargando}
              className="w-full py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-all duration-300"
            >
              {t('cancelar', 'Cancelar')}
            </button>
          </div>
        </div>

        {/* Pie de página */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <p className="text-xs text-gray-500">
              {t('procesadoPor', 'Procesado por')} 
              <span className="font-semibold"> ExploCocora</span> - 
              {t('entornoPruebas', 'Entorno de Pruebas')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPagoSimulado; 