import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Pago from "../../assets/Images/Pago.png";
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

  // Estado para controlar el dropdown personalizado
  const [isHoraDropdownOpen, setIsHoraDropdownOpen] = useState(false);
  const horaDropdownRef = useRef(null);

  // Opciones de hora para el dropdown personalizado
  const horaOptions = [
    { value: '08:00', label: '08:00 AM' },
    { value: '09:00', label: '09:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '01:00 PM' },
    { value: '14:00', label: '02:00 PM' },
  ];

  // Estados para controlar los datepickers personalizados
  const [isInicioCalendarOpen, setIsInicioCalendarOpen] = useState(false);
  const [isFinCalendarOpen, setIsFinCalendarOpen] = useState(false);
  const inicioCalendarRef = useRef(null);
  const finCalendarRef = useRef(null);
  
  // Meses en español
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
  
  // Estado para el mes y año actual de cada calendario
  const [inicioViewDate, setInicioViewDate] = useState(new Date());
  const [finViewDate, setFinViewDate] = useState(new Date());
  
  // Funciones para generar días del calendario
  const getDiasCalendario = (fecha) => {
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    
    // Primer día del mes actual
    const primerDia = new Date(year, month, 1);
    // Último día del mes actual
    const ultimoDia = new Date(year, month + 1, 0);
    
    const diasArray = [];
    
    // Días del mes anterior para completar la primera semana
    const diasAntesPrimerDia = primerDia.getDay();
    for (let i = diasAntesPrimerDia; i > 0; i--) {
      const dia = new Date(year, month, 1 - i);
      diasArray.push({
        date: dia,
        day: dia.getDate(),
        month: dia.getMonth(),
        isCurrentMonth: false,
        isToday: false,
        isDisabled: dia < new Date(fechaMinima)
      });
    }
    
    // Días del mes actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const dia = new Date(year, month, i);
      diasArray.push({
        date: dia,
        day: i,
        month: month,
        isCurrentMonth: true,
        isToday: dia.getTime() === hoy.getTime(),
        isDisabled: dia < new Date(fechaMinima) || dia > new Date(fechaMaximaStr)
      });
    }
    
    // Días del mes siguiente para completar la última semana
    const diasDespuesUltimoDia = 6 - ultimoDia.getDay();
    for (let i = 1; i <= diasDespuesUltimoDia; i++) {
      const dia = new Date(year, month + 1, i);
      diasArray.push({
        date: dia,
        day: i,
        month: dia.getMonth(),
        isCurrentMonth: false,
        isToday: false,
        isDisabled: true
      });
    }
    
    return diasArray;
  };
  
  // Manejar la selección de fecha
  const handleDateSelect = (date, tipo) => {
    // Ajustar fecha para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Crear fecha en UTC para evitar desplazamientos por zona horaria
    const adjustedDate = new Date(Date.UTC(year, month, day));
    // Formatear fecha en formato ISO y tomar solo la parte de la fecha
    const formattedDate = adjustedDate.toISOString().slice(0, 10);
    
    if (tipo === 'inicio') {
      if (formData.fechaFin && new Date(formattedDate) > new Date(formData.fechaFin)) {
        setFormData({
          ...formData,
          fechaInicio: formattedDate,
          fechaFin: formattedDate
        });
      } else {
        setFormData({
          ...formData,
          fechaInicio: formattedDate
        });
      }
      setIsInicioCalendarOpen(false);
    } else {
      setFormData({
        ...formData,
        fechaFin: formattedDate
      });
      setIsFinCalendarOpen(false);
    }
  };
  
  // Funciones para cambiar de mes
  const cambiarMes = (increment, tipo) => {
    if (tipo === 'inicio') {
      const newDate = new Date(inicioViewDate);
      newDate.setMonth(newDate.getMonth() + increment);
      setInicioViewDate(newDate);
    } else {
      const newDate = new Date(finViewDate);
      newDate.setMonth(newDate.getMonth() + increment);
      setFinViewDate(newDate);
    }
  };
  
  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    
    // Dividir la cadena de fecha en sus componentes
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    
    // Crear nueva fecha usando los componentes (asegurar que no hay desplazamiento por zona horaria)
    const date = new Date(year, month - 1, day);
    
    // Formatear para mostrar
    return `${date.getDate()} ${meses[date.getMonth()].substring(0, 3)} ${date.getFullYear()}`;
  };
  
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

  // Cerrar calendarios al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (horaDropdownRef.current && !horaDropdownRef.current.contains(event.target)) {
        setIsHoraDropdownOpen(false);
      }
      if (inicioCalendarRef.current && !inicioCalendarRef.current.contains(event.target)) {
        setIsInicioCalendarOpen(false);
      }
      if (finCalendarRef.current && !finCalendarRef.current.contains(event.target)) {
        setIsFinCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Manejar selección de hora en dropdown personalizado
  const handleHoraSelect = (value) => {
    setFormData({ ...formData, horaInicio: value });
    setIsHoraDropdownOpen(false);
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
    navigate('/VistaCliente/reserva/mercado-libre', {
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
                  className="bg-teal-600 hover:bg-teal-700 text-white h-10 w-10 rounded-l-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => handleChange({ target: { name: 'cantidadPersonas', value: Math.max(1, formData.cantidadPersonas - 1) } })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <input
                  type="text"
                  id="cantidadPersonas"
                  name="cantidadPersonas"
                  value={formData.cantidadPersonas}
                  onChange={handleChange}
                  min="1"
                  max={rutaInfo?.capacidadMaxima || 99}
                  className="block w-full border-y border-teal-300 focus:ring-teal-500 focus:border-teal-500 text-center h-10 text-lg font-medium"
                  required
                />
                <button 
                  type="button"
                  className="bg-teal-600 hover:bg-teal-700 text-white h-10 w-10 rounded-r-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => handleChange({ target: { name: 'cantidadPersonas', value: Math.min(parseInt(rutaInfo?.capacidadMaxima || 99), formData.cantidadPersonas + 1) } })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {rutaInfo && (
                <p className="mt-1 text-xs text-gray-500">
                  {t('capacidadMaxima', 'Capacidad máxima')}: {rutaInfo.capacidadMaxima} {t('personas', 'personas')}
                </p>
              )}
            </div>

            {/* Hora de inicio (Dropdown Personalizado) */}
            <div>
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                {t('horaInicio', 'Hora de inicio')} *
              </label>
              <div className="relative" ref={horaDropdownRef}>
                <button
                  type="button"
                  id="horaInicio"
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 px-3 py-2 text-left bg-white"
                  onClick={() => setIsHoraDropdownOpen(!isHoraDropdownOpen)}
                >
                  {horaOptions.find(option => option.value === formData.horaInicio)?.label || '08:00 AM'}
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
                
                {isHoraDropdownOpen && (
                  <div className="absolute mt-1 w-full z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {horaOptions.map((option) => (
                        <li
                          key={option.value}
                          className={`cursor-pointer px-3 py-2 hover:bg-teal-700 hover:text-white ${
                            formData.horaInicio === option.value ? 'bg-teal-600 text-white' : 'text-gray-900'
                          }`}
                          onClick={() => handleHoraSelect(option.value)}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Campo oculto para mantener compatibilidad con el formulario */}
                <input
                  type="hidden"
                  name="horaInicio"
                  value={formData.horaInicio}
                  required
                />
              </div>
            </div>

            {/* Fecha de inicio personalizada */}
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fechaInicio', 'Fecha de inicio')} *
              </label>
              <div className="relative" ref={inicioCalendarRef}>
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white transition-all duration-300 hover:border-teal-400"
                  onClick={() => setIsInicioCalendarOpen(!isInicioCalendarOpen)}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-gray-700">{formData.fechaInicio ? formatDisplayDate(formData.fechaInicio) : t('seleccioneFecha', 'Seleccione fecha')}</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {isInicioCalendarOpen && (
                  <div className="absolute z-20 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transform transition-all duration-300 origin-top animate-zoom-in">
                    <div className="p-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-t-lg">
                      <div className="flex justify-between items-center mb-2">
                        <button 
                          type="button" 
                          className="p-1 hover:bg-teal-700 rounded-full transition-colors duration-200"
                          onClick={() => cambiarMes(-1, 'inicio')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>
                        <h3 className="font-bold text-lg">
                          {meses[inicioViewDate.getMonth()]} {inicioViewDate.getFullYear()}
                        </h3>
                        <button 
                          type="button" 
                          className="p-1 hover:bg-teal-700 rounded-full transition-colors duration-200"
                          onClick={() => cambiarMes(1, 'inicio')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mt-1">
                        {diasSemana.map((dia, index) => (
                          <div key={index} className="text-xs text-center font-medium text-teal-100 py-1">
                            {dia}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <div className="grid grid-cols-7 gap-1">
                        {getDiasCalendario(inicioViewDate).map((dia, index) => (
                          <button
                            key={index}
                            type="button"
                            disabled={dia.isDisabled}
                            onClick={() => !dia.isDisabled && handleDateSelect(dia.date, 'inicio')}
                            className={`
                              w-9 h-9 m-0.5 text-sm rounded-full flex items-center justify-center transition-all duration-200
                              ${!dia.isCurrentMonth ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-800 hover:bg-teal-100'}
                              ${dia.isToday ? 'bg-teal-100 text-teal-800 font-medium ring-2 ring-teal-400 ring-opacity-50' : ''}
                              ${formData.fechaInicio && dia.date.toISOString().split('T')[0] === formData.fechaInicio 
                                ? 'bg-teal-600 text-white hover:bg-teal-700 font-medium shadow-md' 
                                : ''}
                              ${!dia.isDisabled 
                                ? 'hover:shadow-sm' 
                                : 'opacity-50 cursor-not-allowed bg-gray-50'}
                            `}
                          >
                            {dia.day}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 p-2 flex justify-between">
                      <button 
                        type="button"
                        className="text-xs text-teal-600 hover:text-teal-800 transition-colors duration-200"
                        onClick={() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (today >= new Date(fechaMinima) && today <= new Date(fechaMaximaStr)) {
                            handleDateSelect(today, 'inicio');
                          }
                        }}
                      >
                        {t('hoy', 'Hoy')}
                      </button>
                      <button 
                        type="button"
                        className="text-xs text-red-500 hover:text-red-700 transition-colors duration-200"
                        onClick={() => setIsInicioCalendarOpen(false)}
                      >
                        {t('cerrar', 'Cerrar')}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Campo oculto para mantener la compatibilidad con el formulario */}
                <input
                  type="hidden"
                  id="fechaInicio"
                  name="fechaInicio" 
                  value={formData.fechaInicio}
                  required
                />
              </div>
            </div>

            {/* Fecha de fin personalizada */}
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fechaFin', 'Fecha de fin')} *
              </label>
              <div className="relative" ref={finCalendarRef}>
                <button
                  type="button"
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white transition-all duration-300 hover:border-teal-400 ${!formData.fechaInicio ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={() => formData.fechaInicio && setIsFinCalendarOpen(!isFinCalendarOpen)}
                  disabled={!formData.fechaInicio}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-gray-700">{formData.fechaFin ? formatDisplayDate(formData.fechaFin) : t('seleccioneFecha', 'Seleccione fecha')}</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {isFinCalendarOpen && (
                  <div className="absolute z-20 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transform transition-all duration-300 origin-top animate-zoom-in">
                    <div className="p-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-t-lg">
                      <div className="flex justify-between items-center mb-2">
                        <button 
                          type="button" 
                          className="p-1 hover:bg-teal-700 rounded-full transition-colors duration-200"
                          onClick={() => cambiarMes(-1, 'fin')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>
                        <h3 className="font-bold text-lg">
                          {meses[finViewDate.getMonth()]} {finViewDate.getFullYear()}
                        </h3>
                        <button 
                          type="button" 
                          className="p-1 hover:bg-teal-700 rounded-full transition-colors duration-200"
                          onClick={() => cambiarMes(1, 'fin')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mt-1">
                        {diasSemana.map((dia, index) => (
                          <div key={index} className="text-xs text-center font-medium text-teal-100 py-1">
                            {dia}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <div className="grid grid-cols-7 gap-1">
                        {getDiasCalendario(finViewDate).map((dia, index) => {
                          // Asegurarse de que no se pueda seleccionar una fecha anterior a fechaInicio
                          const fechaMinParaFin = formData.fechaInicio || fechaMinima;
                          const estaDeshabilitado = dia.isDisabled || (!dia.isCurrentMonth) || (dia.date < new Date(fechaMinParaFin));
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={estaDeshabilitado}
                              onClick={() => !estaDeshabilitado && handleDateSelect(dia.date, 'fin')}
                              className={`
                                w-9 h-9 m-0.5 text-sm rounded-full flex items-center justify-center transition-all duration-200
                                ${!dia.isCurrentMonth ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-800 hover:bg-teal-100'}
                                ${dia.isToday ? 'bg-teal-100 text-teal-800 font-medium ring-2 ring-teal-400 ring-opacity-50' : ''}
                                ${formData.fechaFin && dia.date.toISOString().split('T')[0] === formData.fechaFin 
                                  ? 'bg-teal-600 text-white hover:bg-teal-700 font-medium shadow-md' 
                                  : ''}
                                ${formData.fechaInicio && dia.date.toISOString().split('T')[0] === formData.fechaInicio 
                                  ? 'bg-teal-200 text-teal-800 ring-1 ring-teal-500' 
                                  : ''}
                                ${!estaDeshabilitado 
                                  ? 'hover:shadow-sm' 
                                  : 'opacity-50 cursor-not-allowed bg-gray-50'}
                              `}
                            >
                              {dia.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 p-2 flex justify-between">
                      <button 
                        type="button"
                        className="text-xs text-teal-600 hover:text-teal-800 transition-colors duration-200"
                        onClick={() => {
                          // Seleccionar fecha de inicio si es válida y superior a fecha mínima/inicio
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const minDate = formData.fechaInicio ? new Date(formData.fechaInicio) : new Date(fechaMinima);
                          if (today >= minDate && today <= new Date(fechaMaximaStr)) {
                            handleDateSelect(today, 'fin');
                          }
                        }}
                      >
                        {t('hoy', 'Hoy')}
                      </button>
                      <button 
                        type="button"
                        className="text-xs text-red-500 hover:text-red-700 transition-colors duration-200"
                        onClick={() => setIsFinCalendarOpen(false)}
                      >
                        {t('cerrar', 'Cerrar')}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Campo oculto para mantener la compatibilidad con el formulario */}
                <input
                  type="hidden"
                  id="fechaFin"
                  name="fechaFin" 
                  value={formData.fechaFin}
                  required
                />
              </div>
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
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
                      <img 
                        src={Pago}
                        alt="Mercado Pago"
                        className="w-10 h-10 mr-2"
                      />
                      {t('pagoMercadoLibre', 'Pago Mercado Pago')}
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
          
        </ul>
      </div>
    </div>
  );
};

export default FormularioReservaRuta; 