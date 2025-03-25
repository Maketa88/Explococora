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
  
  // Estado para los campos simulados del formulario de pago
  const [formPago, setFormPago] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
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
    formPago.fechaExpiracion !== '' && 
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

              {/* Mensaje de entorno simulado */}
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {t('entornoPrueba', 'Este es un entorno de prueba estudiantil. Puedes ingresar datos ficticios.')}
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

              {/* Tipos de tarjetas */}
              <div className="flex mb-4 space-x-2">
                <div className="bg-gray-50 p-1 rounded-md">
                  <svg className="w-10 h-8" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="6" fill="#016FD0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 28.9694L27.9528 18.9H31.7942L24.0043 37.4767L16 18.9H19.9879L24 28.9694Z" fill="white"/>
                    <path d="M9 29.176L8.42323 27.0767C8.42323 27.0767 7.63247 28.9021 5.74607 28.9021C2.44257 28.9021 0 25.2365 0 21.1339C0 15.8597 3.15672 12.8 6.0264 12.8C9.95672 12.8 11.3676 16.3934 11.3676 16.3934L12 12.8H16.7007V29.176H9ZM9.97493 20.8673C9.97493 18.6153 9.03683 16.8969 7.17859 16.8969C5.30318 16.8969 4.36512 18.6153 4.36512 20.8673C4.36512 23.1046 5.30318 24.8152 7.17854 24.8152C9.03693 24.8152 9.97493 23.1046 9.97493 20.8673Z" fill="white"/>
                    <path d="M30 29.2H26V10H30V29.2Z" fill="white"/>
                    <path d="M42 29.2H34.5L37.5 10H45L42 29.2Z" fill="white"/>
                  </svg>
                </div>
                <div className="bg-gray-50 p-1 rounded-md">
                  <svg className="w-10 h-8" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="6" fill="#F79E1B"/>
                    <path d="M14 24C14 17.9249 18.9249 13 25 13V35C18.9249 35 14 30.0751 14 24Z" fill="#EB001B"/>
                    <path d="M36 24C36 30.0751 31.0751 35 25 35V13C31.0751 13 36 17.9249 36 24Z" fill="#F79E1B"/>
                    <path d="M25 13V35C18.9249 35 14 30.0751 14 24C14 17.9249 18.9249 13 25 13Z" fill="#FF5F00"/>
                    <path d="M25 35C31.0751 35 36 30.0751 36 24C36 17.9249 31.0751 13 25 13C18.9249 13 14 17.9249 14 24C14 30.0751 18.9249 35 25 35Z" fill="none" stroke="white" strokeWidth="0.5"/>
                  </svg>
                </div>
                <div className="bg-gray-50 p-1 rounded-md">
                  <svg className="w-10 h-8" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="6" fill="#2557D6"/>
                    <path d="M20 16H28V32H20V16Z" fill="#FF5F00"/>
                    <path d="M20.5714 24C20.5714 20.7375 22.1589 17.885 24.5714 16C22.5196 14.4 19.912 13.5 17.1429 13.5C10.9285 13.5 5.85718 18.15 5.85718 24C5.85718 29.85 10.9285 34.5 17.1429 34.5C19.912 34.5 22.5196 33.6 24.5714 32C22.1589 30.1225 20.5714 27.2625 20.5714 24Z" fill="#EB001B"/>
                    <path d="M42.1429 24C42.1429 29.85 37.0715 34.5 30.8571 34.5C28.088 34.5 25.4804 33.6 23.4286 32C25.8411 30.115 27.4286 27.2625 27.4286 24C27.4286 20.7375 25.8411 17.885 23.4286 16C25.4804 14.4 28.088 13.5 30.8571 13.5C37.0715 13.5 42.1429 18.15 42.1429 24Z" fill="#F79E1B"/>
                  </svg>
                </div>
                <div className="bg-gray-50 p-1 rounded-md">
                  <svg className="w-10 h-8" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="6" fill="#0E4595"/>
                    <path d="M17.9831 31.7525H13.7453L9.78354 19.8081C9.63639 19.3303 9.3489 18.9224 8.90571 18.7284C7.66744 18.2505 6.32418 17.8426 5 17.5693V17.086H11.9202C12.7085 17.086 13.3066 17.6987 13.4283 18.3841L15.4584 26.9217L20.0513 17.086H24.0886L17.9831 31.7525ZM25.9522 31.7525H22.0933L25.1639 17.086H29.0228L25.9522 31.7525ZM34.0111 22.1324C34.0111 21.4665 33.8078 20.9099 33.0978 20.9099C31.6546 20.9099 30.8662 22.3198 30.8662 23.6616H35.5218C35.5218 22.3393 34.9746 22.1324 34.0111 22.1324ZM36.3831 28.0767H32.9235C32.9235 28.9926 33.5217 29.5248 34.3755 29.5248C35.0786 29.5248 35.6768 29.3686 36.2067 29.0953L36.5184 31.4037C35.6563 31.8035 34.6828 32 33.6309 32C30.5546 32 27.2389 30.4555 27.2389 26.5504C27.2389 22.9114 30.0791 20.0562 33.4277 20.0562C36.4431 20.0562 38.5459 22.3393 38.5459 25.2944C38.5459 26.3843 38.4242 27.3392 38.2426 28.0767H36.3831Z" fill="white"/>
                  </svg>
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
                    <input
                      type="month"
                      name="fechaExpiracion"
                      value={formPago.fechaExpiracion}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
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
                      {t('confirmarPago', 'Pagar con Mercado Libre')}
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
                {t('pagoSeguro', 'Pago seguro procesado por Mercado Libre')}
              </div>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <p className="text-xs text-gray-500">
              {t('procesoSimulado', 'Este proceso es una simulación con fines educativos. Entorno de pruebas.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPagoSimulado; 