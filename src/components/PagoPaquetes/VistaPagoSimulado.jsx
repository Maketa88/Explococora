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

export const VistaPagoSimulado = () => {
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
      const response = await axios.get(`http://localhost:10101/pagos-rutas/simular/${radicado}`, {
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
            rutaInfo: rutaInfo,
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

              {/* Título del formulario según método de pago */}
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {metodoPago === 'tarjeta' 
                  ? t('datosTarjeta', 'Datos de la tarjeta') 
                  : t('datosContactoEfectivo', 'Datos de contacto para pago en efectivo')}
              </h2>

              {/* Formulario de pago con tarjeta */}
              {metodoPago === 'tarjeta' && (
                <form className="space-y-4">
                  {/* Número de Tarjeta */}
                  <div>
                    <label htmlFor="numeroTarjeta" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('numeroTarjeta', 'Número de tarjeta')}
                    </label>
                    <input
                      type="text"
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      value={formPago.numeroTarjeta}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Nombre del titular */}
                  <div>
                    <label htmlFor="nombreTitular" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('nombreTitular', 'Nombre del titular')}
                    </label>
                    <input
                      type="text"
                      id="nombreTitular"
                      name="nombreTitular"
                      value={formPago.nombreTitular}
                      onChange={handleChange}
                      placeholder="Tal como aparece en la tarjeta"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Fecha de expiración y código de seguridad */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="mesExpiracion" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('mesExpiracion', 'Mes de expiración')}
                      </label>
                      <select
                        id="mesExpiracion"
                        name="mesExpiracion"
                        value={formPago.mesExpiracion}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">{t('seleccioneMes', 'Seleccione')}</option>
                        <option value="01">01</option>
                        <option value="02">02</option>
                        <option value="03">03</option>
                        <option value="04">04</option>
                        <option value="05">05</option>
                        <option value="06">06</option>
                        <option value="07">07</option>
                        <option value="08">08</option>
                        <option value="09">09</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="anioExpiracion" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('anioExpiracion', 'Año de expiración')}
                      </label>
                      <select
                        id="anioExpiracion"
                        name="anioExpiracion"
                        value={formPago.anioExpiracion}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">{t('seleccioneAnio', 'Seleccione')}</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                        <option value="2030">2030</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Código de seguridad */}
                  <div>
                    <label htmlFor="codigoSeguridad" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('codigoSeguridad', 'Código de seguridad (CVV)')}
                    </label>
                    <input
                      type="password"
                      id="codigoSeguridad"
                      name="codigoSeguridad"
                      value={formPago.codigoSeguridad}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Número de cuotas */}
                  <div>
                    <label htmlFor="cuotas" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('cuotas', 'Número de cuotas')}
                    </label>
                    <select
                      id="cuotas"
                      name="cuotas"
                      value={formPago.cuotas}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1">1 {t('cuota', 'cuota')}</option>
                      <option value="3">3 {t('cuotas', 'cuotas')}</option>
                      <option value="6">6 {t('cuotas', 'cuotas')}</option>
                      <option value="12">12 {t('cuotas', 'cuotas')}</option>
                    </select>
                  </div>
                  
                  {/* Tarjetas aceptadas */}
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">
                      {t('tarjetasAceptadas', 'Tarjetas aceptadas')}:
                    </p>
                    <div className="flex space-x-2">
                      <img src={Visa} alt="Visa" className="h-8 w-auto object-contain" />
                      <img src={Master} alt="MasterCard" className="h-8 w-auto object-contain" />
                      <img src={AmericanExpress} alt="American Express" className="h-8 w-auto object-contain" />
                      <img src={Diners} alt="Diners Club" className="h-8 w-auto object-contain" />
                    </div>
                  </div>
                </form>
              )}
              
              {/* Formulario de pago en efectivo */}
              {metodoPago === 'efectivo' && (
                <form className="space-y-4">
                  {/* Nombres */}
                  <div>
                    <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('nombres', 'Nombres')}
                    </label>
                    <input
                      type="text"
                      id="nombres"
                      name="nombres"
                      value={formEfectivo.nombres}
                      onChange={handleChangeEfectivo}
                      placeholder="Ingrese sus nombres"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  {/* Apellidos */}
                  <div>
                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('apellidos', 'Apellidos')}
                    </label>
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      value={formEfectivo.apellidos}
                      onChange={handleChangeEfectivo}
                      placeholder="Ingrese sus apellidos"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  {/* Cédula */}
                  <div>
                    <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('cedula', 'Número de cédula')}
                    </label>
                    <input
                      type="text"
                      id="cedula"
                      name="cedula"
                      value={formEfectivo.cedula}
                      onChange={handleChangeEfectivo}
                      placeholder="Ingrese su número de cédula"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  {/* Información adicional sobre pago en efectivo */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex">
                      <svg className="h-6 w-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-green-800 font-medium">
                          {t('informacionPagoEfectivo', 'Información sobre el pago en efectivo')}:
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {t('notaPagoEfectivo', 'Al seleccionar esta opción, estás confirmando tu reserva para pagarla en efectivo directamente en nuestras oficinas antes del inicio de la ruta. Recuerda que tienes hasta 48 horas antes del inicio para realizar este pago.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
            
            {/* Columna derecha: Resumen de compra */}
            <div className="md:w-5/12 border-l border-gray-200 pl-8">
              <div className="sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {t('resumenCompra', 'Resumen de compra')}
                </h2>
                
                {/* Detalles de la ruta */}
                {rutaInfo && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-teal-800 mb-2">
                      {rutaInfo.nombreRuta || 'Ruta seleccionada'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">{t('precio', 'Precio')}:</span> ${rutaInfo.precio ? rutaInfo.precio.toLocaleString('es-CO') : '0'} COP
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">{t('cantidadPersonas', 'Cantidad de personas')}:</span> {rutaInfo.cantidadPersonas || 1}
                    </p>
                    {rutaInfo.fechaInicio && (
                      <p className="text-gray-600 text-sm mb-1">
                        <span className="font-medium">{t('fechaRuta', 'Fecha de la ruta')}:</span> {new Date(rutaInfo.fechaInicio).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Resumen de costos */}
                <div className="mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">{t('subtotal', 'Subtotal')}:</span>
                    <span className="font-medium">
                      ${rutaInfo ? (rutaInfo.precio * (rutaInfo.cantidadPersonas || 1)).toLocaleString('es-CO') : '0'} COP
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">{t('impuestos', 'Impuestos')}:</span>
                    <span className="font-medium">$0 COP</span>
                  </div>
                  <div className="flex justify-between py-4 font-bold text-lg">
                    <span>{t('total', 'Total')}:</span>
                    <span className="text-teal-700">
                      ${rutaInfo ? (rutaInfo.precio * (rutaInfo.cantidadPersonas || 1)).toLocaleString('es-CO') : '0'} COP
                    </span>
                  </div>
                </div>
                
                {/* Mensaje de seguridad */}
                <div className="mb-6 flex items-start p-3 bg-blue-50 rounded border border-blue-200">
                  <img 
                    src={Pago} 
                    alt="Seguridad" 
                    className="w-10 h-10 mr-3"
                  />
                  <p className="text-sm text-blue-800">
                    {metodoPago === 'tarjeta'
                      ? t('seguridadPago', 'Todas las transacciones son procesadas de forma segura. Tus datos financieros nunca son almacenados.')
                      : t('seguridadReserva', 'Tu reserva será confirmada inmediatamente. Recuerda realizar el pago en efectivo dentro del plazo establecido para garantizar tu cupo.')}
                  </p>
                </div>
                
                {/* Botones de acción */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={procesarPagoSimulado}
                    disabled={!camposCompletos || cargando}
                    className={`w-full py-3 px-4 flex items-center justify-center rounded-lg transition-all duration-300 ${
                      camposCompletos && !cargando
                        ? metodoPago === 'tarjeta'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {cargando ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('procesando', 'Procesando...')}
                      </>
                    ) : (
                      metodoPago === 'tarjeta'
                        ? t('pagarAhora', 'Pagar ahora')
                        : t('reservarAhora', 'Reservar ahora')
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={cancelarPago}
                    disabled={cargando}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300"
                  >
                    {t('cancelar', 'Cancelar')}
                  </button>
                </div>
                
                {/* Mensaje de error */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPagoSimulado; 