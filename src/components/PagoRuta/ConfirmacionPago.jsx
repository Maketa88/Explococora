import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const ConfirmacionPago = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [estado, setEstado] = useState('procesando'); // procesando, exitoso, pendiente, rechazado
  const [reservaInfo, setReservaInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extraer parámetros de la URL
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const payment_id = params.get('payment_id');
    const external_reference = params.get('external_reference');
    
    // Recuperar información de reserva del localStorage
    const reservaPendiente = localStorage.getItem('reserva_pendiente');
    
    if (reservaPendiente) {
      setReservaInfo(JSON.parse(reservaPendiente));
    }
    
    // Determinar el estado basado en la respuesta de Mercado Pago
    switch (status) {
      case 'approved':
        setEstado('exitoso');
        // Actualizar el estado de la reserva en el backend
        actualizarEstadoReserva('confirmada', payment_id, external_reference);
        break;
      case 'pending':
        setEstado('pendiente');
        break;
      case 'rejected':
        setEstado('rechazado');
        // Opcional: actualizar el estado de la reserva a 'cancelada'
        actualizarEstadoReserva('cancelada', payment_id, external_reference);
        break;
      default:
        setEstado('procesando');
        // Verificar el estado de pago si no hay información clara
        if (reservaInfo?.radicado) {
          verificarEstadoPago(reservaInfo.radicado);
        }
    }
    
    // Limpiar la información de localStorage solo si fue exitoso o rechazado
    // (mantener si está pendiente)
    if (status === 'approved' || status === 'rejected') {
      localStorage.removeItem('reserva_pendiente');
    }
    
  }, [location.search]);

  // Función para actualizar el estado de la reserva en el backend
  const actualizarEstadoReserva = async (nuevoEstado, idPago, referencia) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error(t('noAutenticado', 'No estás autenticado'));
      }
      
      // Este endpoint es hipotético y debe ajustarse a tu API real
      await axios.post('http://localhost:10101/reservas/actualizar-estado', 
        {
          radicado: reservaInfo?.radicado,
          estado: nuevoEstado,
          idPago: idPago
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      setError(error.response?.data?.message || error.message);
    }
  };

  // Función para verificar el estado del pago si no viene en los parámetros
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
          setEstado('pendiente');
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
            <p className="text-gray-600 mb-6">{t('reservaConfirmada', 'Tu reserva ha sido confirmada.')}</p>
            
            {reservaInfo && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 mx-auto max-w-md">
                <p className="text-gray-700 font-medium">
                  {t('radicado', 'Número de Reserva')}: <span className="font-bold text-teal-700">{reservaInfo.radicado}</span>
                </p>
                {reservaInfo.guiaAsignado && (
                  <p className="text-gray-700 font-medium mt-2">
                    {t('guiaAsignado', 'Guía Asignado')}: <span className="font-bold text-teal-700">{reservaInfo.guiaAsignado.nombre}</span>
                  </p>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('volverInicio', 'Volver al Inicio')}
              </button>
              <button 
                onClick={() => navigate('/mis-reservas')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('verMisReservas', 'Ver Mis Reservas')}
              </button>
            </div>
          </div>
        );
        
      case 'pendiente':
        return (
          <div className="text-center">
            <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('pagoPendiente', 'Pago Pendiente')}</h2>
            <p className="text-gray-600 mb-6">{t('reservaPendiente', 'Tu reserva está pendiente de confirmación de pago.')}</p>
            
            {reservaInfo && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 mx-auto max-w-md">
                <p className="text-gray-700 font-medium">
                  {t('radicado', 'Número de Reserva')}: <span className="font-bold text-yellow-700">{reservaInfo.radicado}</span>
                </p>
              </div>
            )}
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {t('informacionPagoPendiente', 'El proceso de confirmación puede tardar hasta 24 horas. Recibirás un correo electrónico cuando se complete.')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('volverInicio', 'Volver al Inicio')}
              </button>
              <button 
                onClick={() => navigate('/mis-reservas')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('verMisReservas', 'Ver Mis Reservas')}
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
            <p className="text-gray-600 mb-6">{t('reservaNoConfirmada', 'Tu reserva no pudo ser confirmada debido a un problema con el pago.')}</p>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {t('informacionPagoRechazado', 'Por favor, intenta realizar la reserva nuevamente con otro método de pago o contacta con soporte si el problema persiste.')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('volverInicio', 'Volver al Inicio')}
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                {t('intentarNuevamente', 'Intentar Nuevamente')}
              </button>
            </div>
          </div>
        );
        
      default: // procesando
        return (
          <div className="text-center">
            <div className="bg-teal-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('procesandoPago', 'Procesando Pago')}</h2>
            <p className="text-gray-600 mb-6">{t('verificandoEstado', 'Estamos verificando el estado de tu pago...')}</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
        {error ? (
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('errorVerificacion', 'Error de Verificación')}</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              {t('volverInicio', 'Volver al Inicio')}
            </button>
          </div>
        ) : (
          renderContenido()
        )}
      </div>
    </div>
  );
};

export default ConfirmacionPago; 