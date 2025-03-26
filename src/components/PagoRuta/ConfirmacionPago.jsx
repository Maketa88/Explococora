import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatearFecha } from '../../utils/formatUtils';

export const ConfirmacionPago = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [estado, setEstado] = useState('procesando'); // procesando, exitoso, rechazado
  const [reservaInfo, setReservaInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si vino de un pago con Mercado Libre (state de navegación)
    if (location.state?.pagoSimulado) {
      setEstado('exitoso');
      setReservaInfo({
        radicado: location.state.radicado,
        fechaCreacion: new Date().toISOString(),
        idPago: location.state.idPago
      });
      
      // Si el pago fue exitoso, eliminamos la reserva pendiente
      localStorage.removeItem('reserva_pendiente');
      return;
    }
    
    // Recuperar información de reserva del localStorage
    const reservaPendiente = localStorage.getItem('reserva_pendiente');
    
    if (reservaPendiente) {
      setReservaInfo(JSON.parse(reservaPendiente));
      // Verificar el estado de pago
      if (reservaInfo?.radicado) {
        verificarEstadoPago(reservaInfo.radicado);
      }
    } else {
      setError(t('noReservaInfo', 'No se encontró información de la reserva'));
    }
    
  }, [location, reservaInfo?.radicado, t]);

  // Función para verificar el estado del pago
  const verificarEstadoPago = async (radicado) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error(t('noAutenticado', 'No estás autenticado'));
      }
      
      // Este endpoint es hipotético y debe ajustarse a tu API real
      const response = await axios.get(`http://localhost:10101/reservas/info-reserva?radicado=${radicado}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.estado) {
        if (response.data.estado === 'confirmada') {
          setEstado('exitoso');
        } else if (response.data.estado === 'cancelada') {
          setEstado('rechazado');
        } else {
          setEstado('procesando');
        }
      }
      
    } catch (error) {
      console.error('Error al verificar estado de pago:', error);
      setError(error.response?.data?.message || error.message);
    }
  };

  // Renderizar contenido según el estado
  const renderContenido = () => {
    switch (estado) {
      case 'exitoso':
        return (
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('pagoExitoso', '¡Pago Exitoso!')}</h2>
            <p className="text-gray-600 mb-6">
              {t('reservaConfirmadaSimulada', 'Tu reserva ha sido confirmada con el método de pago Mercado Libre.')}
            </p>
            
            {reservaInfo && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 mx-auto max-w-md">
                <p className="text-gray-700 font-medium">
                  {t('radicado', 'Número de Reserva')}: <span className="font-bold text-teal-700">{reservaInfo.radicado}</span>
                </p>
                <p className="text-gray-700 font-medium mt-2">
                  {t('numeroPago', 'Número de pago')}: <span className="font-bold text-teal-700">184841580058</span>
                </p>
               
                {reservaInfo.fechaCreacion && (
                  <p className="text-gray-700 font-medium mt-2">
                    {t('fechaReserva', 'Fecha de Reserva')}: <span className="font-bold text-teal-700">{formatearFecha(reservaInfo.fechaCreacion)}</span>
                  </p>
                )}
                {reservaInfo.guiaAsignado && (
                  <p className="text-gray-700 font-medium mt-2">
                    {t('guiaAsignado', 'Guía Asignado')}: <span className="font-bold text-teal-700">{reservaInfo.guiaAsignado.nombre || `${reservaInfo.guiaAsignado.primerNombre} ${reservaInfo.guiaAsignado.primerApellido}`}</span>
                  </p>
                )}
              </div>
            )}
            
            <div className="bg-blue-100  p-4 rounded mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-950">
                    {t('notaSimulacion', 'Este es un pago Mercado Pago.Si tienes alguna duda o necesitas asistencia, por favor, contacta al administrador del sistema.')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <button 
                onClick={() => navigate('/VistaCliente')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('volverInicio', 'Volver al Inicio')}
              </button>
              <button 
                onClick={() => navigate('/VistaCliente/NuestrasRutas')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('verRutas', 'Ver Más Rutas')}
              </button>
            </div>
          </div>
        );
        
      case 'procesando':
        return (
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('procesandoPago', 'Procesando Pago')}</h2>
            <p className="text-gray-600 mb-6">{t('procesandoMensaje', 'Estamos procesando tu pago con Mercado Libre. Esto tomará solo un momento.')}</p>
            
            {reservaInfo && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 mx-auto max-w-md">
                <p className="text-gray-700 font-medium">
                  {t('radicado', 'Número de Reserva')}: <span className="font-bold text-blue-700">{reservaInfo.radicado}</span>
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
              <button 
                onClick={() => navigate('/VistaCliente')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('volverInicio', 'Volver al Inicio')}
              </button>
            </div>
          </div>
        );
        
      case 'rechazado':
        return (
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('pagoRechazado', 'Pago Rechazado')}</h2>
            <p className="text-gray-600 mb-6">{t('pagoRechazadoMensaje', 'El pago con Mercado Libre no pudo completarse. Por favor intenta nuevamente.')}</p>
            
            {error && <p className="text-red-600 mb-6">{error}</p>}
            
            <button 
              onClick={() => navigate('/VistaCliente')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              {t('volverInicio', 'Volver al Inicio')}
            </button>
          </div>
        );
        
      default:
        return (
          <div className="text-center p-8">
            <div className="bg-gray-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('cargando', 'Cargando...')}</h2>
            <p className="text-gray-600">
              {t('verificandoEstado', 'Verificando el estado de tu pago con Mercado Libre...')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {renderContenido()}
      </div>
    </div>
  );
};

export default ConfirmacionPago; 