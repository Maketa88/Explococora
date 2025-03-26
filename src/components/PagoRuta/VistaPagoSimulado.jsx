import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Master from "../../assets/Images/Master.png";
import Visa from "../../assets/Images/Visa.png";
import AmericanExpress from "../../assets/Images/american.png";
import Diners from "../../assets/Images/dinner.png";

export const VistaPagoSimulado = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para los campos simulados del formulario de pago
  const [formPago, setFormPago] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    mesExpiracion: '',
    anioExpiracion: '',
    codigoSeguridad: '',
    cuotas: '1'
  });
  
  // Obtener los datos de la reserva pasados por navigate
  const { radicado, rutaInfo } = location.state || {};
  
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

  // Verificar si los campos requeridos están completos (solo visual)
  const camposCompletos = 
    formPago.numeroTarjeta.length === 16 && 
    formPago.nombreTitular.trim() !== '' && 
    formPago.mesExpiracion !== '' &&
    formPago.anioExpiracion !== '' &&
    formPago.codigoSeguridad.length >= 3;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Encabezado de Mercado Libre */}
        <div className="bg-yellow-400 p-5">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20C10 22.2091 8.20914 24 6 24C3.79086 24 2 22.2091 2 20C2 17.7909 3.79086 16 6 16C8.20914 16 10 17.7909 10 20Z" fill="#2D3277"/>
              <path d="M22 20C22 22.2091 20.2091 24 18 24C15.7909 24 14 22.2091 14 20C14 17.7909 15.7909 16 18 16C20.2091 16 22 17.7909 22 20Z" fill="#2D3277"/>
              <path d="M34 20C34 22.2091 32.2091 24 30 24C27.7909 24 26 22.2091 26 20C26 17.7909 27.7909 16 30 16C32.2091 16 34 17.7909 34 20Z" fill="#2D3277"/>
              <path d="M10 8C10 10.2091 8.20914 12 6 12C3.79086 12 2 10.2091 2 8C2 5.79086 3.79086 4 6 4C8.20914 4 10 5.79086 10 8Z" fill="#2D3277"/>
              <path d="M22 8C22 10.2091 20.2091 12 18 12C15.7909 12 14 10.2091 14 8C14 5.79086 15.7909 4 18 4C20.2091 4 22 5.79086 22 8Z" fill="#2D3277"/>
              <path d="M34 8C34 10.2091 32.2091 12 30 12C27.7909 12 26 10.2091 26 8C26 5.79086 27.7909 4 30 4C32.2091 4 34 5.79086 34 8Z" fill="#2D3277"/>
              <path d="M10 32C10 34.2091 8.20914 36 6 36C3.79086 36 2 34.2091 2 32C2 29.7909 3.79086 28 6 28C8.20914 28 10 29.7909 10 32Z" fill="#2D3277"/>
              <path d="M22 32C22 34.2091 20.2091 36 18 36C15.7909 36 14 34.2091 14 32C14 29.7909 15.7909 28 18 28C20.2091 28 22 29.7909 22 32Z" fill="#2D3277"/>
              <path d="M34 32C34 34.2091 32.2091 36 30 36C27.7909 36 26 34.2091 26 32C26 29.7909 27.7909 28 30 28C32.2091 28 34 29.7909 34 32Z" fill="#2D3277"/>
            </svg>
            <h1 className="text-2xl font-bold text-blue-900 ml-3">Mercado Libre</h1>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Columna izquierda: Formulario de pago */}
            <div className="md:w-7/12">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {t('pagoConTarjeta', 'Pago con tarjeta')}
              </h2>

              

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

              {/* Tipos de tarjetas */}
              <div className="flex mb-6 space-x-6 items-center justify-center">
                {/* Visa */}
                <div className="bg-white p-3 rounded-md border border-gray-200 hover:shadow-lg transition-shadow w-24 h-16 flex items-center justify-center">
                  <img src={Visa} alt="Visa" className="max-w-full max-h-full object-contain" />
                </div>
                
                {/* Mastercard */}
                <div className="bg-white p-3 rounded-md border border-gray-200 hover:shadow-lg transition-shadow w-24 h-16 flex items-center justify-center">
                  <img src={Master} alt="Mastercard" className="max-w-full max-h-full object-contain" />
                </div>
                
                {/* American Express */}
                <div className="bg-white p-3 rounded-md border border-gray-200 hover:shadow-lg transition-shadow w-24 h-16 flex items-center justify-center">
                  <img src={AmericanExpress} alt="American Express" className="max-w-full max-h-full object-contain" />
                </div>
                
                {/* Diners Club */}
                <div className="bg-white p-3 rounded-md border border-gray-200 hover:shadow-lg transition-shadow w-24 h-16 flex items-center justify-center">
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
                    <option value="1">1 cuota de ${rutaInfo ? (rutaInfo.precio * (rutaInfo.cantidadPersonas || 1)).toLocaleString('es-CO') : 0} COP</option>
                    <option value="3">3 cuotas sin interés</option>
                    <option value="6">6 cuotas sin interés</option>
                    <option value="12">12 cuotas sin interés</option>
                  </select>
                </div>
              </form>
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
                    <span className="font-medium">{rutaInfo?.nombreRuta || 'Reserva de ruta'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('radicado', 'Referencia')}:</span>
                    <span className="font-medium text-gray-800">{radicado}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('numeroPago', 'Número de pago')}:</span>
                    <span className="font-medium text-gray-800">184841580058</span>
                  </div>
                  
                  {rutaInfo && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('cantidadPersonas', 'Personas')}:</span>
                        <span className="font-medium">{rutaInfo.cantidadPersonas || 1}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('precioUnitario', 'Precio unitario')}:</span>
                        <span className="font-medium">${Number(rutaInfo.precio).toLocaleString('es-CO')} COP</span>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 my-2 pt-2"></div>
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-800">{t('total', 'Total')}:</span>
                    <span className="text-blue-600">
                      ${rutaInfo ? (rutaInfo.precio * (rutaInfo.cantidadPersonas || 1)).toLocaleString('es-CO') : 0} COP
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
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
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
              
              {/* Nota de seguridad */}
              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                {t('pagoSeguro', 'Pago seguro procesado por Mercado Pago')}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default VistaPagoSimulado; 