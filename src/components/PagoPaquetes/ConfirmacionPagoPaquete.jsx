import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Pago from "../../assets/Images/Pago.png";
import { formatearFecha } from '../../utils/formatUtils';

export const ConfirmacionPagoPaquete = () => {
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
        fechaCreacion: location.state.fechaReserva || new Date().toISOString(),
        idPago: location.state.idPago,
        metodoPago: location.state.metodoPago || 'tarjeta',
        numeroReserva: location.state.numeroReserva,
        numeroPago: location.state.numeroPago,
        paqueteInfo: location.state.paqueteInfo,
        tituloConfirmacion: location.state.tituloConfirmacion,
        mensajeConfirmacion: location.state.mensajeConfirmacion,
        informacionPago: location.state.informacionPago,
        datosContacto: location.state.datosContacto,
        fechaInicio: location.state.paqueteInfo?.fechaInicio || null,
        guiaAsignado: location.state.guiaAsignado || obtenerGuiaAsignadoDelLocalStorage()
      });
      
      // Si el pago fue exitoso, eliminamos la reserva pendiente
      localStorage.removeItem('reserva_pendiente');
      return;
    }
    
    // Recuperar información de reserva del localStorage
    const reservaPendiente = localStorage.getItem('reserva_pendiente');
    
    if (reservaPendiente) {
      const reservaData = JSON.parse(reservaPendiente);
      // Asegurarnos de que se incluya la fechaInicio si está disponible en localStorage
      setReservaInfo({
        ...reservaData,
        fechaInicio: reservaData.fechaInicio || null
      });
      // Verificar el estado de pago
      if (reservaData?.radicado) {
        verificarEstadoPago(reservaData.radicado);
      }
    } else {
      setError(t('noReservaInfo', 'No se encontró información de la reserva'));
    }
    
  }, [location, t]);

  // Función para obtener el guía asignado del localStorage
  const obtenerGuiaAsignadoDelLocalStorage = () => {
    try {
      const reservaPendiente = localStorage.getItem('reserva_pendiente');
      if (reservaPendiente) {
        const datos = JSON.parse(reservaPendiente);
        return datos.guiaAsignado || null;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener guía del localStorage:', error);
      return null;
    }
  };

  // Función para verificar el estado del pago
  const verificarEstadoPago = async (radicado) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error(t('noAutenticado', 'No estás autenticado'));
      }
      
      // Endpoint para verificar estado de pago de paquete
      const response = await axios.get(`http://localhost:10101/pago-paquetes/info-reserva?radicado=${radicado}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        // Actualizar estado del pago
        if (response.data.estado) {
          if (response.data.estado === 'confirmada') {
            setEstado('exitoso');
          } else if (response.data.estado === 'cancelada') {
            setEstado('rechazado');
          } else {
            setEstado('procesando');
          }
        }
        
        // Actualizar información del guía si está disponible
        if (response.data.guiaAsignado && reservaInfo) {
          // Crear una copia del estado actual
          const reservaActualizada = {...reservaInfo};
          
          // Actualizar la información del guía
          reservaActualizada.guiaAsignado = response.data.guiaAsignado;
          
          // Conservar la fechaInicio si existe
          if (response.data.fechaInicio) {
            reservaActualizada.fechaInicio = response.data.fechaInicio;
          }
          
          // Actualizar el estado
          setReservaInfo(reservaActualizada);
          
          console.log('Información del guía actualizada:', response.data.guiaAsignado);
        }
      }
      
    } catch (error) {
      console.error('Error al verificar estado de pago:', error);
      setError(error.response?.data?.message || error.message);
    }
  };

  // Renderizar contenido según el estado
  const renderContenido = () => {
    // Verificar si es pago en efectivo o con tarjeta (fuera del switch)
    const esEfectivo = reservaInfo?.metodoPago === 'efectivo';
    
    switch (estado) {
      case 'exitoso':
        return (
          <div className="text-center">
            <div className={`${esEfectivo ? 'bg-green-100' : 'bg-blue-100'} p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-10 h-10 ${esEfectivo ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {reservaInfo?.tituloConfirmacion || (esEfectivo ? t('reservaConfirmada', '¡Reserva Confirmada!') : t('pagoExitoso', '¡Pago Exitoso!'))}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {reservaInfo?.mensajeConfirmacion || (esEfectivo 
                ? t('reservaConfirmadaEfectivo', 'Tu reserva ha sido confirmada con el método de pago en efectivo.') 
                : t('reservaConfirmadaSimulada', 'Tu reserva ha sido confirmada con el método de pago Mercado Pago.'))}
            </p>
            
            {reservaInfo && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 mx-auto max-w-md">
                <p className="text-gray-700 font-medium">
                  {t('radicado', 'Número de Reserva')}: <span className={`font-bold ${esEfectivo ? 'text-green-700' : 'text-teal-700'}`}>
                    {reservaInfo.numeroReserva || reservaInfo.radicado}
                  </span>
                </p>
                
                {/* Mostrar número de pago solo para pagos que no son en efectivo */}
                {!esEfectivo && (
                  <p className="text-gray-700 font-medium mt-2">
                    {t('numeroPago', 'Número de pago')}: <span className="font-bold text-teal-700">
                      {reservaInfo.numeroPago || '184841580058'}
                    </span>
                  </p>
                )}
               
                <p className="text-gray-700 font-medium mt-2">
                  {t('fechaReserva', 'Fecha de Reserva')}: <span className={`font-bold ${esEfectivo ? 'text-green-700' : 'text-teal-700'}`}>
                    {reservaInfo.fechaReserva || formatearFecha(reservaInfo.fechaCreacion)}
                  </span>
                </p>
                
                {/* Mostrar la fecha de inicio del paquete */}
                {reservaInfo.fechaInicio && (
                  <p className="text-gray-700 font-medium mt-2">
                    {t('fechaPaquete', 'Fecha del Paquete')}: <span className={`font-bold ${esEfectivo ? 'text-green-700' : 'text-teal-700'}`}>
                      {formatearFecha(reservaInfo.fechaInicio)}
                    </span>
                  </p>
                )}
                
                {/* Datos de contacto para pago en efectivo */}
                {esEfectivo && reservaInfo.datosContacto && (
                  <div className="mt-1 pt-1  ">
                    
                    <p className="text-gray-700">
                      <span className="font-medium">{t('nombres', 'Nombres')}:</span> <span className="text-green-700 font-bold">{reservaInfo.datosContacto.nombres}</span>
                    </p>
                    <p className="text-gray-700 mt-2">
                      <span className="font-medium">{t('apellidos', 'Apellidos')}:</span> <span className="text-green-700 font-bold">{reservaInfo.datosContacto.apellidos}</span>
                    </p>
                    <p className="text-gray-700 mt-2">
                      <span className="font-medium">{t('cedula', 'Cédula')}:</span> <span className="text-green-700 font-bold">{reservaInfo.datosContacto.cedula}</span>
                    </p>
                    {/* Agregar total a pagar para pagos en efectivo */}
                    <p className="text-gray-700 mt-2">
                      <span className="font-medium">{t('totalPagar', 'Total a pagar')}:</span> <span className="text-green-700 font-bold">
                        ${reservaInfo.paqueteInfo ? (reservaInfo.paqueteInfo.precio * (reservaInfo.paqueteInfo.cantidadPersonas || 1)).toLocaleString('es-CO') : 0} COP
                      </span>
                    </p>
                  </div>
                )}
                
                {/* Guía asignado (si existe) */}
                {reservaInfo.guiaAsignado && (
                  <p className="text-gray-700 font-medium mt-2">
                    {t('guiaAsignado', 'Guía Asignado')}: <span className={`font-bold ${esEfectivo ? 'text-green-700' : 'text-teal-700'}`}>
                      {reservaInfo.guiaAsignado.nombre ? reservaInfo.guiaAsignado.nombre.trim() : 
                        (reservaInfo.guiaAsignado.primerNombre && reservaInfo.guiaAsignado.primerApellido) ? 
                          `${reservaInfo.guiaAsignado.primerNombre} ${reservaInfo.guiaAsignado.primerApellido}` : 
                          reservaInfo.guiaAsignado.name ? reservaInfo.guiaAsignado.name : 
                            typeof reservaInfo.guiaAsignado === 'string' ? reservaInfo.guiaAsignado : 
                              t('noAsignado', 'No asignado')}
                    </span>
                  </p>
                )}

                {/* Información específica del paquete (cuando está disponible) */}
                {reservaInfo && reservaInfo.paqueteInfo && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">{t('detallesPaquete', 'Detalles del Paquete')}</h3>
                    <p className="text-gray-700 font-medium">
                      {t('nombrePaquete', 'Nombre')}: <span className="text-teal-700">{reservaInfo.paqueteInfo.nombrePaquete}</span>
                    </p>
                    {reservaInfo.paqueteInfo.descripcion && (
                      <p className="text-gray-700 mt-1">
                        <span className="font-medium">{t('descripcion', 'Descripción')}:</span> <span className="text-teal-700">{reservaInfo.paqueteInfo.descripcion}</span>
                      </p>
                    )}
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">{t('costo', 'Costo')}:</span> <span className="text-teal-700 font-bold">${reservaInfo.paqueteInfo.precio?.toLocaleString('es-CO')} COP</span>
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">{t('personas', 'Personas')}:</span> <span className="text-teal-700">{reservaInfo.paqueteInfo.cantidadPersonas || 1}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Información del método de pago */}
            <div className={`${esEfectivo ? 'bg-green-50' : 'bg-blue-100'} p-4 rounded mb-6`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {esEfectivo ? (
                    <svg className="h-9 w-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ) : (
                    <img 
                      className="h-9 w-9 object-cover" 
                      src={Pago}
                      alt="Información de pago" 
                    />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-950">
                    {reservaInfo?.informacionPago || (esEfectivo
                      ? t('notaEfectivo', 'Recuerda que deberás pagar en efectivo al momento de tomar el paquete. Ten lista la cantidad exacta para facilitar el proceso.')
                      : t('notaSimulacion', 'Este es un pago Mercado Pago. Si tienes alguna duda o necesitas asistencia, por favor, contacta al administrador del sistema.'))}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botones de acciones */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <button
                onClick={() => navigate('/VistaCliente/MisReservas')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-300"
              >
                {t('verMisReservas', 'Ver mis Reservas')}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-300"
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
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('pagoRechazado', 'Pago Rechazado')}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t('pagoNoCompletado', 'Tu pago no pudo ser completado. Por favor, intenta con otro método de pago.')}
            </p>
            
            <div className="bg-red-50 p-4 rounded mb-6">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">
                  {t('problemaPago', 'Hubo un problema con tu pago. El cargo no se realizó a tu tarjeta.')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <button
                onClick={() => navigate(-1)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-300"
              >
                {t('intentarNuevamente', 'Intentar Nuevamente')}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-300"
              >
                {t('volverInicio', 'Volver al Inicio')}
              </button>
            </div>
          </div>
        );
      
      default: // procesando
        return (
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('procesandoPago', 'Procesando tu Pago')}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t('esperandoConfirmacion', 'Estamos esperando la confirmación de tu pago. Esto puede tardar unos momentos...')}
            </p>
            
            <div className="bg-blue-50 p-4 rounded mb-6">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-700">
                  {t('noActualizar', 'Por favor, no actualices ni cierres esta página mientras procesamos tu pago.')}
                </p>
              </div>
            </div>
            
            {/* Mostrar información de la reserva si está disponible */}
            {reservaInfo && (
              <div className="bg-white p-4 rounded-lg shadow-md mb-6 mx-auto max-w-md">
                <p className="text-gray-700 font-medium">
                  {t('radicado', 'Número de Reserva')}: <span className="font-bold text-blue-700">
                    {reservaInfo.numeroReserva || reservaInfo.radicado}
                  </span>
                </p>
                
                <p className="text-gray-700 font-medium mt-2">
                  {t('fechaReserva', 'Fecha de Reserva')}: <span className="font-bold text-blue-700">
                    {reservaInfo.fechaReserva || formatearFecha(reservaInfo.fechaCreacion)}
                  </span>
                </p>
              </div>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-300 mt-4"
            >
              {t('cancelarPagar', 'Cancelar y volver al inicio')}
            </button>
          </div>
        );
    }
  };

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 mx-auto">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('error', 'Error')}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            
            <button
              onClick={() => navigate(-1)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-5 rounded-lg shadow transition-colors duration-300"
            >
              {t('volver', 'Volver')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 mx-auto">
        {renderContenido()}
      </div>
    </div>
  );
};

export default ConfirmacionPagoPaquete; 