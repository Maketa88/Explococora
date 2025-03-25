import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { combinarFechaHoraISO, generarTimestampMySQL } from '../../utils/formatUtils';

export const FormularioReservaRuta = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { idRuta } = useParams();
  const location = useLocation();
  const rutaInfo = location.state?.rutaInfo;
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    cantidadPersonas: 1,
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '08:00'
  });

  // Añadir nuevos estados para manejar opciones de pago
  const [radicado, setRadicado] = useState(null);
  const [mostrarOpcionesPago, setMostrarOpcionesPago] = useState(false);

  // Si no hay información de la ruta en location.state, cargarla desde la API
  useEffect(() => {
    if (!rutaInfo && idRuta) {
      const cargarInfoRuta = async () => {
        try {
          const response = await axios.get(`http://localhost:10101/rutas/${idRuta}`);
          if (response.data) {
            // Manejar la respuesta según la estructura real de tu API
          }
        } catch (error) {
          console.error('Error al cargar información de la ruta:', error);
          setError(t('errorCargandoRuta', 'No se pudo cargar la información de la ruta'));
        }
      };
      
      cargarInfoRuta();
    }
  }, [idRuta, rutaInfo, t]);

  // Calcular fecha mínima (hoy)
  const fechaMinima = new Date().toISOString().split('T')[0];
  
  // Calcular fecha máxima (6 meses desde hoy)
  const fechaMaxima = new Date();
  fechaMaxima.setMonth(fechaMaxima.getMonth() + 6);
  const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación de cantidad de personas
    if (name === 'cantidadPersonas') {
      const cantidad = parseInt(value);
      const capacidadMaxima = parseInt(rutaInfo?.capacidadMaxima || 99);
      
      if (cantidad < 1) {
        return setFormData({ ...formData, [name]: 1 });
      }
      
      if (cantidad > capacidadMaxima) {
        return setFormData({ ...formData, [name]: capacidadMaxima });
      }
    }
    
    // Validación fecha fin ≥ fecha inicio
    if (name === 'fechaInicio') {
      if (formData.fechaFin && new Date(value) > new Date(formData.fechaFin)) {
        setFormData({ 
          ...formData, 
          [name]: value,
          fechaFin: value
        });
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.fechaInicio || !formData.fechaFin || !formData.horaInicio) {
      setError(t('camposRequeridos', 'Todos los campos son requeridos'));
      return;
    }
    
    setCargando(true);
    setError(null);
    
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error(t('noAutenticado', 'No estás autenticado'));
      }

      // Usar nuestra utilidad para combinar fecha y hora correctamente
      const fechaInicioISO = combinarFechaHoraISO(formData.fechaInicio, formData.horaInicio);
      const fechaFinISO = combinarFechaHoraISO(formData.fechaFin, formData.horaInicio);
      
      // Generar el timestamp actual para la fecha de reserva
      const fechaReservaMySQL = generarTimestampMySQL();
      
      console.log('Fecha original seleccionada (inicio):', formData.fechaInicio);
      console.log('Fecha original seleccionada (fin):', formData.fechaFin);
      console.log('Fecha procesada para enviar (inicio):', fechaInicioISO);
      console.log('Fecha procesada para enviar (fin):', fechaFinISO);
      console.log('Fecha de reserva (MySQL):', fechaReservaMySQL);
      
      // Realizar petición al backend
      const response = await axios.post('http://localhost:10101/pagos-rutas/crear', 
        {
          idRuta: parseInt(idRuta),
          cantidadPersonas: parseInt(formData.cantidadPersonas),
          fechaInicio: fechaInicioISO,
          fechaFin: fechaFinISO,
          horaInicio: formData.horaInicio,
          fechaReserva: fechaReservaMySQL, // Añadir fecha de reserva en formato MySQL
          estado: 'pendiente' // Añadir estado pendiente según validación del backend
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Guardar información en localStorage para recuperarla después
      if (response.data && response.data.radicado) {
        localStorage.setItem('reserva_pendiente', JSON.stringify({
          radicado: response.data.radicado,
          fechaCreacion: fechaReservaMySQL,
          guiaAsignado: response.data.guiaAsignado || null
        }));
        
        // Almacenar el radicado en el estado para usarlo en el botón de simulación
        setRadicado(response.data.radicado);
        
        // Mostrar opciones de pago en lugar de redireccionar inmediatamente
        setMostrarOpcionesPago(true);
      } else {
        throw new Error(t('respuestaInvalida', 'La respuesta del servidor no es válida'));
      }
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      setError(error.response?.data?.message || error.message || t('errorProcesandoReserva', 'Error al procesar la reserva'));
    } finally {
      setCargando(false);
    }
  };
  
  // Función para realizar pago simulado
  const realizarPagoSimulado = () => {
    if (!radicado) {
      setError(t('datosFaltantes', 'Faltan datos para realizar el pago simulado'));
      return;
    }
    
    // Redireccionar a la vista de pago simulado
    navigate('/VistaCliente/reserva/pago-simulado', {
      state: {
        radicado: radicado,
        rutaInfo: {
          nombreRuta: rutaInfo?.nombreRuta,
          precio: rutaInfo?.precio,
          cantidadPersonas: formData.cantidadPersonas
        }
      }
    });
  };

  // Si no hay ruta, mostrar mensaje de carga o error
  if (!rutaInfo && !idRuta) {
    return (
      <div className="text-center p-4">
        {t('rutaNoEncontrada', 'No se encontró información de la ruta')}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-2">
          {t('reservarRuta', 'Reservar Ruta')}
        </h1>
        {rutaInfo && (
          <p className="text-xl text-teal-600">
            {rutaInfo.nombreRuta}
          </p>
        )}
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Información de la ruta */}
        {rutaInfo && (
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-6">
            <div className="flex flex-wrap items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">{rutaInfo.nombreRuta}</h2>
                <p className="text-teal-100">{rutaInfo.tipo} • {rutaInfo.dificultad}</p>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold">
                  ${Number(rutaInfo.precio).toLocaleString('es-CO')} <span className="text-sm font-normal">COP</span>
                </div>
                <div className="text-sm text-teal-100">{t('porPersona', 'por persona')}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Formulario de reserva */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cantidad de personas */}
            <div>
              <label htmlFor="cantidadPersonas" className="block text-sm font-medium text-gray-700 mb-1">
                {t('cantidadPersonas', 'Cantidad de personas')} *
              </label>
              <div className="flex">
                <button 
                  type="button"
                  className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-3 py-2 rounded-l-lg border border-teal-200"
                  onClick={() => handleChange({ target: { name: 'cantidadPersonas', value: Math.max(1, formData.cantidadPersonas - 1) } })}
                >
                  -
                </button>
                <input
                  type="number"
                  id="cantidadPersonas"
                  name="cantidadPersonas"
                  value={formData.cantidadPersonas}
                  onChange={handleChange}
                  min="1"
                  max={rutaInfo?.capacidadMaxima || 99}
                  className="block w-full border-teal-200 focus:ring-teal-500 focus:border-teal-500 text-center"
                  required
                />
                <button 
                  type="button"
                  className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-3 py-2 rounded-r-lg border border-teal-200"
                  onClick={() => handleChange({ target: { name: 'cantidadPersonas', value: Math.min(parseInt(rutaInfo?.capacidadMaxima || 99), formData.cantidadPersonas + 1) } })}
                >
                  +
                </button>
              </div>
              {rutaInfo && (
                <p className="mt-1 text-xs text-gray-500">
                  {t('capacidadMaxima', 'Capacidad máxima')}: {rutaInfo.capacidadMaxima} {t('personas', 'personas')}
                </p>
              )}
            </div>

            {/* Hora de inicio */}
            <div>
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                {t('horaInicio', 'Hora de inicio')} *
              </label>
              <select
                id="horaInicio"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="08:00">08:00 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">01:00 PM</option>
                <option value="14:00">02:00 PM</option>
              </select>
            </div>

            {/* Fecha de inicio */}
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fechaInicio', 'Fecha de inicio')} *
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                min={fechaMinima}
                max={fechaMaximaStr}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            {/* Fecha de fin */}
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fechaFin', 'Fecha de fin')} *
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                min={formData.fechaInicio || fechaMinima}
                max={fechaMaximaStr}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                required
                disabled={!formData.fechaInicio}
              />
            </div>
          </div>

          {/* Resumen de la reserva */}
          {formData.cantidadPersonas > 0 && rutaInfo?.precio && (
            <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-100">
              <h3 className="text-lg font-semibold text-teal-800 mb-2">{t('resumenReserva', 'Resumen de la reserva')}</h3>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('precioUnitario', 'Precio unitario')}:</span>
                  <span className="font-medium">${Number(rutaInfo.precio).toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cantidadPersonas', 'Cantidad de personas')}:</span>
                  <span className="font-medium">{formData.cantidadPersonas}</span>
                </div>
                <div className="border-t border-teal-200 my-2"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-teal-800">{t('total', 'Total')}:</span>
                  <span className="text-teal-800">${(formData.cantidadPersonas * Number(rutaInfo.precio)).toLocaleString('es-CO')} COP</span>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mt-8">
            {!mostrarOpcionesPago ? (
              <button
                type="submit"
                disabled={cargando}
                className={`w-full py-4 rounded-xl ${
                  cargando 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white'
                } font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center`}
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
                    {t('reservarAhora', 'Reservar Ahora')}
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        {t('reservaCreada', 'Reserva creada con éxito. Radicado: ')} {radicado}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {t('procederPagoSimulado', 'Continuar con el pago a través de Mercado Libre:')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={realizarPagoSimulado}
                  disabled={cargando}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                      </svg>
                      {t('pagoMercadoLibre', 'Pago Mercado Libre')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Nota importante */}
      <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2">{t('informacionImportante', 'Información importante')}:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('notaCapacidad', 'La reserva está sujeta a disponibilidad.')}</li>
          <li>{t('notaGuia', 'Se te asignará un guía experimentado para tu aventura.')}</li>
          <li>{t('notaEquipo', 'Recomendamos llevar ropa cómoda, protector solar y agua.')}</li>
          <li>{t('notaPagoSimulado', 'Estás usando un entorno de prueba con pagos simulados.')}</li>
        </ul>
      </div>
    </div>
  );
};

export default FormularioReservaRuta; 