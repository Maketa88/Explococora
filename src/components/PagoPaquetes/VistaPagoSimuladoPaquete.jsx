import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import AmericanExpress from "../../assets/Images/american.png";
import BannerPago from "../../assets/Images/banner.png";
import Diners from "../../assets/Images/dinner.png";
import Master from "../../assets/Images/Master.png";
import Pago from "../../assets/Images/Pago.png";
import Visa from "../../assets/Images/Visa.png";

export const VistaPagoSimuladoPaquete = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // Nuevo estado para el método de pago
  
  // Estado para los campos simulados del formulario de pago
  const [formPago, setFormPago] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    mesExpiracion: '',
    anioExpiracion: '',
    codigoSeguridad: '',
    cuotas: '1'
  });

  // Estado para los campos de pago en efectivo
  const [formEfectivo, setFormEfectivo] = useState({
    nombres: '',
    apellidos: '',
    cedula: ''
  });
  
  // Obtener los datos de la reserva pasados por navigate
  const { radicado, paqueteInfo } = location.state || {};
  
  // Si no hay radicado, redirigir a la página principal
  if (!radicado) {
    navigate('/VistaCliente');
    return null;
  }

  // Función para manejar cambios en el formulario simulado
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación específica para número de tarjeta (solo números y máximo 16 dígitos)
    if (name === 'numeroTarjeta') {
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length <= 16) {
        setFormPago({ ...formPago, [name]: soloNumeros });
      }
      return;
    }
    
    // Validación para código de seguridad (solo números y máximo 4 dígitos)
    if (name === 'codigoSeguridad') {
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length <= 4) {
        setFormPago({ ...formPago, [name]: soloNumeros });
      }
      return;
    }
    
    // Para el resto de campos, actualizar normalmente
    setFormPago({ ...formPago, [name]: value });
  };

  // Función para manejar cambios en el formulario de efectivo
  const handleChangeEfectivo = (e) => {
    const { name, value } = e.target;
    
    // Validación para cédula (solo números)
    if (name === 'cedula') {
      const soloNumeros = value.replace(/\D/g, '');
      setFormEfectivo({ ...formEfectivo, [name]: soloNumeros });
      return;
    }
    
    // Para el resto de campos, actualizar normalmente
    setFormEfectivo({ ...formEfectivo, [name]: value });
  };

  // Función para cambiar el método de pago
  const cambiarMetodoPago = (metodo) => {
    setMetodoPago(metodo);
    setError(null); // Limpiar errores al cambiar método
  };

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
      const response = await axios.get(`http://localhost:10101/pago-paquetes/simular/${radicado}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Respuesta de simulación:', response.data);
      
      if (response.data && response.data.success) {
        console.log(`Simulación exitosa. ID de pago: ${response.data.idPago}`);
        
        // Mensaje personalizado según método de pago
        let mensajeExtra = metodoPago === 'efectivo' 
          ? 'Pago en efectivo registrado correctamente'
          : 'Pago con tarjeta procesado correctamente';
        
        console.log(mensajeExtra);
        
        // Obtener información del guía desde localStorage
        let guiaAsignado = null;
        try {
          const reservaPendiente = localStorage.getItem('reserva_pendiente');
          if (reservaPendiente) {
            const datos = JSON.parse(reservaPendiente);
            guiaAsignado = datos.guiaAsignado || null;
            
            // Limpiar espacios en blanco en el nombre del guía si existe
            if (guiaAsignado && typeof guiaAsignado === 'object' && guiaAsignado.nombre) {
              guiaAsignado.nombre = guiaAsignado.nombre.trim();
            }
            
            console.log('Guía asignado para el pago:', guiaAsignado);
          }
        } catch (error) {
          console.error('Error al obtener guía del localStorage:', error);
        }
        
        // Redireccionar a página de confirmación
        navigate('/VistaCliente/reserva/confirmacion', {
          state: {
            pagoSimulado: true,
            radicado: radicado,
            idPago: response.data.idPago,
            metodoPago: metodoPago,
            guiaAsignado: guiaAsignado,
            paqueteInfo: paqueteInfo,
            // Agregar datos de contacto cuando el método de pago es efectivo
            ...(metodoPago === 'efectivo' && {
              datosContacto: {
                nombres: formEfectivo.nombres,
                apellidos: formEfectivo.apellidos,
                cedula: formEfectivo.cedula
              }
            })
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

  // Verificar si los campos requeridos están completos según el método de pago
  const camposCompletos = metodoPago === 'tarjeta'
    ? (formPago.numeroTarjeta.length === 16 && 
       formPago.nombreTitular.trim() !== '' && 
       formPago.mesExpiracion !== '' &&
       formPago.anioExpiracion !== '' &&
       formPago.codigoSeguridad.length >= 3)
    : (formEfectivo.nombres.trim() !== '' &&
       formEfectivo.apellidos.trim() !== '' &&
       formEfectivo.cedula.length >= 5);

  // Calcular el precio total
  const calcularPrecioTotal = () => {
    if (!paqueteInfo?.precio || !paqueteInfo?.cantidadPersonas) return 0;
    return Number(paqueteInfo.precio) * Number(paqueteInfo.cantidadPersonas);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Encabezado con banner - solo visible para pago con tarjeta */}
        {metodoPago === 'tarjeta' && (
          <div className="w-full flex justify-center items-center py-4 bg-blue-100">
            <div className="max-w-xs">
              <img 
                src={BannerPago} 
                alt="Banner de pago" 
                className="h-20 object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Columna izquierda: Formulario de pago */}
            <div className="md:w-7/12">
              {/* Selector de método de pago */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {t('metodoPago', 'Método de pago')}
                </h2>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => cambiarMetodoPago('tarjeta')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                      metodoPago === 'tarjeta' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('tarjeta', 'Tarjeta')}
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarMetodoPago('efectivo')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                      metodoPago === 'efectivo' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('efectivo', 'Efectivo')}
                  </button>
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

              {metodoPago === 'tarjeta' ? (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {t('pagoConTarjeta', 'Pago con tarjeta')}
                  </h2>

                  {/* Tipos de tarjetas */}
                  <div className="flex mb-6 space-x-6 items-center justify-center">
                    {/* Visa */}
                    <div className="bg-white p-3  w-28 h-20 flex items-center justify-center">
                      <img src={Visa} alt="Visa" className="max-w-full max-h-full object-contain" />
                    </div>
                    
                    {/* Mastercard */}
                    <div className="bg-white p-3  w-28 h-20 flex items-center justify-center">
                      <img src={Master} alt="Mastercard" className="max-w-full max-h-full object-contain" />
                    </div>
                    
                    {/* American Express */}
                    <div className="bg-white p-3  w-28 h-20 flex items-center justify-center">
                      <img src={AmericanExpress} alt="American Express" className="max-w-full max-h-full object-contain" />
                    </div>
                    
                    {/* Diners Club */}
                    <div className="bg-white p-3  w-28 h-20 flex items-center justify-center">
                      <img src={Diners} alt="Diners Club" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>

                  {/* Formulario de tarjeta */}
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('numeroTarjeta', 'Número de tarjeta')}
                      </label>
                      <input
                        type="text"
                        name="numeroTarjeta"
                        value={formPago.numeroTarjeta}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('nombreTitular', 'Nombre y apellido del titular')}
                      </label>
                      <input
                        type="text"
                        name="nombreTitular"
                        value={formPago.nombreTitular}
                        onChange={handleChange}
                        placeholder="Como figura en la tarjeta"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fechaExpiracion', 'Fecha de expiración')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            name="mesExpiracion"
                            value={formPago.mesExpiracion}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">{t('mes', 'Mes')}</option>
                            {Array.from({ length: 12 }, (_, i) => {
                              const mes = (i + 1).toString().padStart(2, '0');
                              return (
                                <option key={mes} value={mes}>
                                  {mes}
                                </option>
                              );
                            })}
                          </select>
                          <select
                            name="anioExpiracion"
                            value={formPago.anioExpiracion}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">{t('año', 'Año')}</option>
                            {Array.from({ length: 10 }, (_, i) => {
                              const anio = (new Date().getFullYear() + i).toString();
                              return (
                                <option key={anio} value={anio}>
                                  {anio}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('codigoSeguridad', 'Código de seguridad')}
                        </label>
                        <input
                          type="password"
                          name="codigoSeguridad"
                          value={formPago.codigoSeguridad}
                          onChange={handleChange}
                          placeholder="CVV"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cuotas', 'Cuotas')}
                      </label>
                      <select
                        name="cuotas"
                        value={formPago.cuotas}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">1 cuota de ${calcularPrecioTotal().toLocaleString('es-CO')} COP</option>
                        <option value="3">3 cuotas sin interés</option>
                        <option value="6">6 cuotas sin interés</option>
                        <option value="12">12 cuotas sin interés</option>
                      </select>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {t('pagoEnEfectivo', 'Pago en efectivo')}
                  </h2>
                  
                  <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          {t('mensajeEfectivo', 'Al seleccionar esta opción, podrás pagar en efectivo al momento de tomar el paquete.')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Formulario de pago en efectivo */}
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('nombres', 'Nombres')}
                      </label>
                      <input
                        type="text"
                        name="nombres"
                        value={formEfectivo.nombres}
                        onChange={handleChangeEfectivo}
                        placeholder="Nombres completos"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('apellidos', 'Apellidos')}
                      </label>
                      <input
                        type="text"
                        name="apellidos"
                        value={formEfectivo.apellidos}
                        onChange={handleChangeEfectivo}
                        placeholder="Apellidos completos"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cedula', 'Cédula')}
                      </label>
                      <input
                        type="text"
                        name="cedula"
                        value={formEfectivo.cedula}
                        onChange={handleChangeEfectivo}
                        placeholder="Número de identificación"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>
            
            {/* Columna derecha: Resumen */}
            <div className="md:w-5/12">
              {/* Detalles de la compra */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t('detallesCompra', 'Detalles de la compra')}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('productoServicio', 'Servicio')}:</span>
                    <span className="font-medium">{paqueteInfo?.nombrePaquete || 'Paquete turístico'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('radicado', 'Referencia')}:</span>
                    <span className="font-medium text-gray-800">{radicado}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('numeroPago', 'Número de pago')}:</span>
                    <span className="font-medium text-gray-800">184841580058</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('cantidadPersonas', 'Personas')}:</span>
                    <span className="font-medium">{paqueteInfo?.cantidadPersonas || 1}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('precioUnitario', 'Precio unitario')}:</span>
                    <span className="font-medium">${paqueteInfo?.precio ? Number(paqueteInfo.precio).toLocaleString('es-CO') : 0} COP</span>
                  </div>
                  
                  <div className="border-t border-gray-200 my-2 pt-2"></div>
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-800">{t('total', 'Total')}:</span>
                    <span className="text-blue-600">
                      ${calcularPrecioTotal().toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={procesarPagoSimulado}
                  disabled={cargando || !camposCompletos}
                  className={`w-full py-3 rounded-lg ${
                    cargando || !camposCompletos
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : metodoPago === 'efectivo'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                  ) : metodoPago === 'efectivo' ? (
                    t('confirmarPagoEfectivo', 'Pagar con pago en efectivo')
                  ) : (
                    <>
                      <img 
                        src={Pago} 
                        alt="Mercado Pago" 
                        className="h-8 w-8 mr-4"
                      />
                      {t('confirmarPago', 'Pagar con Mercado Pago')}
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
              
              {/* Nota de seguridad (solo para pago con tarjeta) */}
              {metodoPago === 'tarjeta' && (
                <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  {t('pagoSeguro', 'Pago seguro procesado por Mercado Pago')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPagoSimuladoPaquete; 