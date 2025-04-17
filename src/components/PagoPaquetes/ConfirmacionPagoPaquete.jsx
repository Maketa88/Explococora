import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Pago from "../../assets/Images/Pago.png";
import { formatearFecha } from '../../utils/formatUtils';
import { PaisajeFondo } from '../UI/PaisajeFondo';

export const ConfirmacionPagoPaquete = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [estado, setEstado] = useState('procesando'); // procesando, exitoso, rechazado
  const [reservaInfo, setReservaInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Estado de location en ConfirmacionPagoPaquete:", location.state);
    
    if (location.state?.pagoSimulado) {
      setEstado('exitoso');
      
      const serviciosRecibidos = location.state.serviciosAdicionales || [];
      console.log('Servicios recibidos en confirmación paquete:', serviciosRecibidos);
      
      setReservaInfo({
        radicado: location.state.radicado,
        fechaCreacion: location.state.fechaReserva || new Date().toISOString(),
        idPago: location.state.idPago,
        metodoPago: location.state.metodoPago || 'tarjeta',
        numeroReserva: location.state.numeroReserva || location.state.radicado,
        numeroPago: location.state.numeroPago,
        paqueteInfo: location.state.paqueteInfo,
        serviciosAdicionales: serviciosRecibidos,
        tituloConfirmacion: location.state.tituloConfirmacion || 'Pago exitoso',
        mensajeConfirmacion: location.state.mensajeConfirmacion || 'Tu reserva ha sido confirmada',
        informacionPago: location.state.informacionPago,
        datosContacto: location.state.datosContacto,
        fechaInicio: location.state.paqueteInfo?.fechaInicio || null,
        guiaAsignado: location.state.guiaAsignado
      });
      
      localStorage.removeItem('reserva_pendiente');
    } else {
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

  // Función para calcular el total de servicios adicionales
  const calcularTotalServiciosAdicionales = () => {
    if (!location.state?.serviciosAdicionales || !location.state.serviciosAdicionales.length) {
      return 0;
    }
    
    return location.state.serviciosAdicionales.reduce((total, item) => {
      return total + ((item.servicio?.precio || item.precio) * item.cantidad);
    }, 0);
  };

  // Función para calcular el precio total
  const calcularPrecioTotal = () => {
    if (!reservaInfo?.paqueteInfo) return 0;
    
    const precioPaquete = (reservaInfo.paqueteInfo.precio || 0) * 
                         (reservaInfo.paqueteInfo.cantidadPersonas || 1);
    
    return precioPaquete + calcularTotalServiciosAdicionales();
  };

  // Función para formatear valores o mostrar un guión si son nulos
  const formatValue = (value) => {
    return value !== undefined && value !== null && value !== '' ? value : '—';
  };

  // Función para imprimir comprobante
  const handlePrint = () => {
    window.print();
  };

  // Agregar este useEffect para los estilos de impresión
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        /* Ocultar todo excepto el ticket */
        body * {
          visibility: hidden;
        }
        
        /* Mostrar solo el ticket */
        #ticket-confirmacion, #ticket-confirmacion * {
          visibility: visible;
        }
        
        /* Estilo para ticket centrado */
        #ticket-confirmacion {
          position: absolute;
          left: 50%;
          top: -10mm;
          transform: translateX(-50%);
          width: 80mm;
          max-width: 80mm;
          height: auto;
          border: none;
          box-shadow: none;
          
          /* Controlar saltos de página */
          page-break-after: always;
          page-break-inside: avoid;
        }
        
        /* Ajustar tamaños de texto */
        #ticket-confirmacion h2 {
          font-size: 16px !important;
          margin-bottom: 4px !important;
        }
        
        #ticket-confirmacion p {
          font-size: 12px !important;
          margin-bottom: 2px !important;
        }
        
        /* Espaciado interno reducido */
        #ticket-confirmacion .p-5 {
          padding: 10px !important;
        }
        
        #ticket-confirmacion .p-4 {
          padding: 8px !important;
        }
        
        /* Ocultar botones y barra inferior */
        .bg-gray-50 {
          display: none !important;
        }
        
        /* Asegurar que los colores se impriman */
        .bg-teal-800 {
          background-color: #0D9488 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Ajustar márgenes de página */
        @page {
          size: A4;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const printStyle = document.getElementById('print-styles');
      if (printStyle) {
        document.head.removeChild(printStyle);
      }
    };
  }, []);

  // Renderizar contenido según el estado
  const renderContenido = () => {
    // Verificar si es pago en efectivo o con tarjeta
    const esEfectivo = reservaInfo?.metodoPago === 'efectivo';
    
    switch (estado) {
      case 'exitoso':
        return (
          <div id="ticket-confirmacion" className="max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg border border-gray-200">
            {/* Cabecera - estilo corporativo verde */}
            <div className="bg-teal-800 p-5 text-center">
              <img 
                src="https://i.pinimg.com/736x/c1/6d/47/c16d47f8fe460d7ef05ff1659258f6a2.jpg" 
                alt="Explococora Logo"
                className="h-16 mx-auto mb-2 bg-white p-1 rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/160x70?text=ExploCocora";
                }}
              />
              <h2 className="text-white text-2xl font-semibold mt-2">
                {reservaInfo?.tituloConfirmacion || t('pagoConfirmado', 'Pago procesado correctamente')}
              </h2>
              <p className="text-white mt-1 mb-3">
                {reservaInfo?.mensajeConfirmacion || t('reservaConfirmada', 'Tu reserva ha sido confirmada con éxito')}
              </p>
              
              {/* Integración del detalle de compra en tarjeta blanca dentro de sección verde */}
              <div className="bg-white rounded-lg p-4 mt-4 mx-auto max-w-md text-left shadow">
                {/* Detalle del paquete principal */}
                {reservaInfo?.paqueteInfo && (
                  <>
                    <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Detalle del paquete:</h3>
                    <div className="flex justify-between py-1 text-gray-700">
                      <span>
                        {formatValue(reservaInfo.paqueteInfo.nombrePaquete)}
                        <span className="text-gray-500"> x {reservaInfo.paqueteInfo.cantidadPersonas || 1}</span>
                      </span>
                      <span className="font-medium">${parseInt(reservaInfo.paqueteInfo.precio * (reservaInfo.paqueteInfo.cantidadPersonas || 1)).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between py-1 text-green-700 font-medium border-t border-dotted border-gray-200 mt-1 pt-1">
                      <span>Subtotal paquete:</span>
                      <span>${parseInt(reservaInfo.paqueteInfo.precio * (reservaInfo.paqueteInfo.cantidadPersonas || 1)).toLocaleString('es-CO')} COP</span>
                    </div>
                  </>
                )}
                
                {/* Servicios adicionales */}
                {location.state?.serviciosAdicionales && location.state.serviciosAdicionales.length > 0 && (
                  <>
                    <h3 className="font-semibold text-gray-800 mt-4 mb-2 border-b pb-1">Servicios adicionales:</h3>
                    {location.state.serviciosAdicionales.map((item, index) => (
                      <div key={index} className="flex justify-between py-1 text-gray-700">
                        <span>
                          {formatValue((item.servicio?.nombre || item.nombre))} x {item.cantidad}
                        </span>
                        <span className="font-medium">${parseInt((item.servicio?.precio || item.precio) * item.cantidad).toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-1 text-green-700 font-medium border-t border-dotted border-gray-200 mt-1 pt-1">
                      <span>Subtotal servicios:</span>
                      <span>${calcularTotalServiciosAdicionales().toLocaleString('es-CO')} COP</span>
                    </div>
                  </>
                )}
                
                {/* Total */}
                <div className="flex justify-between mt-3 pt-2 text-lg font-bold border-t-2 border-gray-300">
                  <span className="text-gray-800">Total a pagar:</span>
                  <span className="text-green-600">
                    ${(
                      (reservaInfo?.paqueteInfo ? (reservaInfo.paqueteInfo.precio * (reservaInfo.paqueteInfo.cantidadPersonas || 1)) : 0) +
                      calcularTotalServiciosAdicionales()
                    ).toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contenido principal - Información de la reserva */}
            <div className="bg-white p-6">
              {/* Información de la reserva */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-5">
                <h3 className="text-gray-700 font-bold text-lg mb-3 border-b pb-2">
                  Información de la Reserva
                </h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Número de Reserva:</p>
                    <p className="text-green-700 font-bold">{formatValue(reservaInfo.radicado)}</p>
                  </div>
                  
                  {reservaInfo.numeroPago && (
                    <div>
                      <p className="text-gray-600 font-medium">Número de pago:</p>
                      <p className="text-green-700 font-bold">{formatValue(reservaInfo.numeroPago)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-gray-600 font-medium">Fecha de Reserva:</p>
                    <p className="font-semibold">{formatearFecha(reservaInfo.fechaCreacion)}</p>
                  </div>
                  
                  {reservaInfo.fechaInicio && (
                    <div>
                      <p className="text-gray-600 font-medium">Fecha del Paquete:</p>
                      <p className="font-semibold">{formatearFecha(reservaInfo.fechaInicio)}</p>
                    </div>
                  )}
                  
                  {/* Datos de contacto */}
                  {reservaInfo.datosContacto && (
                    <>
                      <div>
                        <p className="text-gray-600 font-medium">Nombres:</p>
                        <p className="font-semibold">{formatValue(reservaInfo.datosContacto.nombres)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Apellidos:</p>
                        <p className="font-semibold">{formatValue(reservaInfo.datosContacto.apellidos)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Cédula:</p>
                        <p className="font-semibold">{formatValue(reservaInfo.datosContacto.cedula)}</p>
                      </div>
                    </>
                  )}
                  
                  {/* Guía asignado */}
                  {reservaInfo.guiaAsignado && (
                    <div className="col-span-2">
                      <p className="text-gray-600 font-medium">Guía Asignado:</p>
                      <p className="font-semibold text-green-700">{formatValue(reservaInfo.guiaAsignado.nombre || reservaInfo.guiaAsignado)}</p>
                    </div>
                  )}
                  
                  {/* Método de pago */}
                  <div>
                    <p className="text-gray-600 font-medium">Método de pago:</p>
                    <p className="font-semibold">
                      {esEfectivo 
                        ? t('pagoEfectivo', 'Pago en efectivo')
                        : t('tarjetaCredito', 'Tarjeta de crédito')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Aviso de pago */}
              <div className={`${esEfectivo ? 'bg-green-50' : 'bg-blue-50'} p-4 rounded-lg mb-5 border-l-4 ${esEfectivo ? 'border-green-500' : 'border-blue-500'}`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {esEfectivo ? (
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ) : (
                      <img 
                        className="h-6 w-6 object-cover" 
                        src={Pago}
                        alt="Información de pago" 
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {reservaInfo?.informacionPago || (esEfectivo
                      ? t('notaEfectivo', 'Recuerda que deberás pagar en efectivo al momento de tomar el paquete turístico. Ten lista la cantidad exacta para facilitar el proceso.')
                      : t('notaSimulacion', 'Este es un pago procesado a través de Mercado Pago.'))}
                  </p>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-center gap-3 border-t border-gray-200">
                <button 
                  onClick={() => window.print()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  {t('imprimir', 'Imprimir')}
                </button>
                <button 
                  onClick={() => navigate('/VistaCliente')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors duration-300"
                >
                  {t('volverInicio', 'Volver al Inicio')}
                </button>
                <button 
                  onClick={() => navigate('/VistaCliente/Reservas')}
                  className="bg-teal-800 hover:bg-teal-900 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
                >
                  {t('verPaquetes', 'Mis reservas')}
                </button>
              </div>
              
              {/* Código QR */}
              <div className="bg-white rounded-lg p-4 mt-4 mx-auto max-w-md text-center">
                <p className="text-gray-700 text-sm mb-2">Código QR para confirmar su transacción</p>
                
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    window.location.origin + '/verificar-ticket/' + (reservaInfo?.radicado || 'ExploCocora-Reserva')
                  )}`}
                  alt="Código QR de confirmación" 
                  className="mx-auto my-2 h-32 w-32 border p-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=QR+Code";
                  }}
                />
                
                {/* Información adicional */}
                <div className="text-xs text-gray-600 mt-3 space-y-1">
                  <p>Fecha y hora: {new Date().toLocaleString('es-CO', {
                    year: 'numeric', 
                    month: 'numeric', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}</p>
                  <p>N° Aprobación: {reservaInfo?.numeroPago || `PAG-${Math.floor(100000 + Math.random() * 900000)}`}</p>
                </div>
              </div>
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
            <p className="text-gray-600 mb-6">{t('pagoRechazadoMensaje', 'El pago no pudo completarse. Por favor intenta nuevamente.')}</p>
            
            {error && <p className="text-red-600 mb-6">{error}</p>}
            
            <button 
              onClick={() => navigate('/VistaCliente')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              {t('volverInicio', 'Volver al Inicio')}
            </button>
          </div>
        );
        
      default: // procesando
        return (
          <div className="text-center p-8">
            <div className="bg-gray-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('cargando', 'Cargando...')}</h2>
            <p className="text-gray-600">
              {t('verificandoEstado', 'Verificando el estado de tu pago...')}
            </p>
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
    <div style={{ 
      position: 'relative',
      minHeight: '100vh', // Asegura que ocupe toda la altura de la ventana
      paddingBottom: '60px' // Espacio para el footer
    }}>
      <PaisajeFondo />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderContenido()}
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionPagoPaquete; 