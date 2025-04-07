import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { combinarFechaHoraISO, generarTimestampMySQL } from '../../utils/formatUtils';
import { ServiciosAdicionales } from './ServiciosAdicionales';
import { DetalleServiciosAdicionales } from './DetalleServiciosAdicionales';

export const FormularioReservaRuta = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { idRuta } = useParams();
  const location = useLocation();
  const rutaInfo = location.state?.rutaInfo;
  
  const [cargando] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    cantidadPersonas: 1,
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '08:00'
  });

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
  
  // Estado para servicios adicionales
  const [serviciosAdicionales, setServiciosAdicionales] = useState([]);
  
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

  // Corrección de la función que calcula el total
  const calcularTotalReserva = () => {
    // Subtotal de la reserva (precio unitario × cantidad de personas)
    const subtotalReserva = formData.cantidadPersonas * Number(rutaInfo?.precio || 0);
    
    // Total de servicios adicionales
    const subtotalServicios = serviciosAdicionales.reduce((total, item) => 
      total + (parseFloat(item.servicio.precio) * item.cantidad), 0);
    
    // Retornar suma correcta
    return subtotalReserva + subtotalServicios;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar si hay rutaInfo y los datos necesarios
    if (!rutaInfo || !rutaInfo.idRuta) {
      setError('Error: No se encontró la información de la ruta');
      return;
    }
    
    // Validaciones básicas
    if (!formData.fechaInicio || !formData.fechaFin || !formData.horaInicio) {
      setError(t('camposRequeridos', 'Todos los campos son requeridos'));
      return;
    }
    
    // Obtener token del localStorage para verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/Ingreso', { 
        state: { 
          mensaje: t('debesIniciarSesion', 'Debes iniciar sesión para reservar una ruta'),
          redireccion: `/NuestrasRutas/${idRuta}`
        } 
      });
      return;
    }

    // Usar nuestra utilidad para combinar fecha y hora correctamente
    const fechaInicioISO = combinarFechaHoraISO(formData.fechaInicio, formData.horaInicio);
    const fechaFinISO = combinarFechaHoraISO(formData.fechaFin, formData.horaInicio);
    
    // Generar el timestamp actual para la fecha de reserva
    const fechaReservaMySQL = generarTimestampMySQL();
    
    // Asegúrate de que serviciosAdicionales sea un array válido
    const serviciosParaEnviar = Array.isArray(serviciosAdicionales) ? 
      serviciosAdicionales : [];
      
    console.log("Enviando servicios a autorización:", serviciosParaEnviar);
    
    navigate('/VistaCliente/reserva/autorizacion-menores', {
      state: {
        formData: {
          ...formData,
          fechaInicioISO,
          fechaFinISO,
          fechaReservaMySQL
        },
        rutaInfo: {
          ...rutaInfo,
          radicado: rutaInfo.radicado
        },
        idRuta,
        serviciosAdicionales: serviciosParaEnviar
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

  console.log("Datos disponibles:", { 
    serviciosAdicionales, 
    location: location.state 
  });

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Fondo decorativo inspirado en el Valle del Cocora */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

        {/* Siluetas de palmeras de cera */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg
            viewBox="0 0 1200 600"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Silueta de montaña con árboles */}
            <path
              d="M0,600 L300,200 L400,300 L500,150 L600,250 L800,100 L1000,300 L1200,200 L1200,600 Z"
              fill="#047857"
              opacity="0.3"
            />
            
            {/* Arroyo serpenteante */}
            <path
              d="M0,450 C100,430 150,470 250,440 C350,410 400,450 500,430 C600,410 650,450 750,430 C850,410 900,450 1000,430 C1100,410 1150,450 1200,430 L1200,500 C1100,520 1050,480 950,500 C850,520 800,480 700,500 C600,520 550,480 450,500 C350,520 300,480 200,500 C100,520 50,480 0,500 Z"
              fill="#047857"
              opacity="0.4"
            />
            
            {/* Silueta de árbol 1 - pino */}
            <path
              d="M200,600 L200,400 L150,400 L200,350 L170,350 L220,300 L190,300 L240,250 L210,250 L250,200 L230,200 L270,150 L250,150 L280,100 L310,150 L290,150 L330,200 L310,200 L350,250 L320,250 L370,300 L340,300 L390,350 L360,350 L410,400 L360,400 L360,600 Z"
              fill="#047857"
              opacity="0.7"
            />
            
            {/* Silueta de árbol 2 - frondoso */}
            <path
              d="M600,600 L600,350 C600,350 550,300 570,250 C590,200 630,220 650,180 C670,140 700,160 720,130 C740,100 780,120 800,150 C820,180 850,160 870,200 C890,240 930,220 950,270 C970,320 920,350 920,350 L920,600 Z"
              fill="#047857"
              opacity="0.7"
            />
            
            {/* Silueta de árbol 3 - roble */}
            <path
              d="M1000,600 L1000,400 C1000,400 950,380 960,340 C970,300 1000,320 1010,280 C1020,240 1050,260 1060,220 C1070,180 1100,200 1110,240 C1120,280 1150,260 1160,300 C1170,340 1200,320 1200,360 C1200,400 1150,400 1150,400 L1150,600 Z"
              fill="#047857"
              opacity="0.7"
            />
            
            {/* Flores en el campo - grupo 1 */}
            <g opacity="0.6">
              <circle cx="150" cy="500" r="15" fill="#047857" />
              <circle cx="170" cy="485" r="15" fill="#047857" />
              <circle cx="190" cy="500" r="15" fill="#047857" />
              <circle cx="170" cy="515" r="15" fill="#047857" />
              <circle cx="170" cy="500" r="10" fill="#047857" />
            </g>
            
            {/* Flores en el campo - grupo 2 */}
            <g opacity="0.6">
              <circle cx="450" cy="520" r="15" fill="#047857" />
              <circle cx="470" cy="505" r="15" fill="#047857" />
              <circle cx="490" cy="520" r="15" fill="#047857" />
              <circle cx="470" cy="535" r="15" fill="#047857" />
              <circle cx="470" cy="520" r="10" fill="#047857" />
            </g>
            
            {/* Flores en el campo - grupo 3 */}
            <g opacity="0.6">
              <circle cx="750" cy="500" r="15" fill="#047857" />
              <circle cx="770" cy="485" r="15" fill="#047857" />
              <circle cx="790" cy="500" r="15" fill="#047857" />
              <circle cx="770" cy="515" r="15" fill="#047857" />
              <circle cx="770" cy="500" r="10" fill="#047857" />
            </g>
            
            {/* Mariposas */}
            <g opacity="0.7">
              {/* Mariposa 1 */}
              <path
                d="M300,200 C320,180 340,190 330,210 C340,230 320,240 300,220 C280,240 260,230 270,210 C260,190 280,180 300,200 Z"
                fill="#047857"
              />
              {/* Mariposa 2 */}
              <path
                d="M700,150 C720,130 740,140 730,160 C740,180 720,190 700,170 C680,190 660,180 670,160 C660,140 680,130 700,150 Z"
                fill="#047857"
              />
              {/* Mariposa 3 */}
              <path
                d="M900,250 C920,230 940,240 930,260 C940,280 920,290 900,270 C880,290 860,280 870,260 C860,240 880,230 900,250 Z"
                fill="#047857"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto">
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

            {/* Sección de servicios adicionales */}
            <ServiciosAdicionales 
              onServiciosChange={setServiciosAdicionales}
              cantidadPersonas={formData.cantidadPersonas}
            />

            {/* Resumen de la reserva - Diseño profesional mejorado */}
            {formData.cantidadPersonas > 0 && rutaInfo?.precio && (
              <div className="mt-6">
                {/* Tarjeta principal */}
                <div className="bg-white rounded-xl shadow-sm border border-teal-100 overflow-hidden">
                  {/* Cabecera */}
                  <div className="bg-teal-600 px-6 py-4 relative">
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <h3 className="text-xl font-bold text-white">{t('resumenReserva', 'Resumen de la reserva')}</h3>
                    </div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3V21H21V3H3Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 9H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 21V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 divide-y divide-teal-100">
                    {/* Sección 1: Detalles de la Ruta */}
                    <div className="pb-5">
                      <div className="flex items-center mb-4">
                        <div className="bg-teal-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">{t('detallesRuta', 'Detalles de la ruta')}</h4>
                      </div>
                      
                      <div className="space-y-3 pl-11">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {t('precioUnitario', 'Precio unitario')}
                          </div>
                          <span className="font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                            ${Number(rutaInfo.precio).toLocaleString('es-CO')} COP
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            {t('cantidadPersonas', 'Cantidad de personas')}
                          </div>
                          <span className="font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full">{formData.cantidadPersonas}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-teal-100">
                          <div className="flex items-center text-gray-800 font-medium">
                            <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {t('subtotalReserva', 'Subtotal reserva')}
                          </div>
                          <span className="font-semibold text-teal-800 bg-teal-100 px-3 py-1 rounded-md">
                            ${(formData.cantidadPersonas * Number(rutaInfo.precio)).toLocaleString('es-CO')} COP
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sección 2: Servicios Adicionales */}
                    {serviciosAdicionales.length > 0 && (
                      <div className="py-5">
                        <div className="flex items-center mb-4">
                          <div className="bg-teal-100 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">{t('serviciosAdicionales', 'Servicios adicionales')}</h4>
                        </div>
                        
                        <div className="space-y-2 pl-11">
                          {serviciosAdicionales.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-1.5 border-b border-dashed border-teal-50 last:border-0">
                              <div className="flex items-center text-gray-700">
                                <svg className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>{item.servicio.nombre} x {item.cantidad}</span>
                              </div>
                              <span className="font-medium text-teal-700">${parseInt(item.servicio.precio * item.cantidad).toLocaleString('es-CO')}</span>
                            </div>
                          ))}
                          
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-teal-100">
                            <div className="flex items-center text-gray-800 font-medium">
                              <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              {t('subtotalServicios', 'Subtotal servicios')}
                            </div>
                            <span className="font-semibold text-teal-800 bg-teal-100 px-3 py-1 rounded-md">
                              ${serviciosAdicionales.reduce((total, item) => 
                                total + (item.servicio.precio * item.cantidad), 0).toLocaleString('es-CO')} COP
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Sección 3: Total General */}
                    <div className="pt-5">
                      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <svg className="w-6 h-6 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span className="text-white font-bold text-lg">{t('totalGeneral', 'Total general')}:</span>
                          </div>
                          <div className="bg-white text-teal-800 font-bold text-xl px-4 py-1.5 rounded-lg shadow-sm">
                            ${calcularTotalReserva().toLocaleString('es-CO')} COP
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información importante */}
                <div className="mt-5 bg-white rounded-xl p-4 border border-teal-100 shadow-sm">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="font-semibold text-gray-800">{t('informacionImportante', 'Información importante')}:</h3>
                  </div>
                  <ul className="pl-7 space-y-2">
                    <li className="flex items-start text-gray-600">
                      <svg className="w-4 h-4 mt-1 mr-2 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {t('notaCapacidad', 'La reserva está sujeta a disponibilidad.')}
                    </li>
                    <li className="flex items-start text-gray-600">
                      <svg className="w-4 h-4 mt-1 mr-2 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {t('notaGuia', 'Se te asignará un guía experimentado para tu aventura.')}
                    </li>
                    <li className="flex items-start text-gray-600">
                      <svg className="w-4 h-4 mt-1 mr-2 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {t('notaEquipo', 'Recomendamos llevar ropa cómoda, protector solar y agua.')}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Botones de acción mejorados */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate(`/NuestrasRutas/${idRuta}`)}
                className="group px-5 py-2.5 rounded-lg text-teal-700 bg-white border border-teal-300 hover:bg-teal-50 hover:border-teal-500 transition-all duration-200 shadow-sm flex items-center justify-center font-medium"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                {t('cancelar', 'Cancelar')}
              </button>
              
              <button
                type="submit"
                disabled={cargando || !formData.fechaInicio || !formData.fechaFin}
                className={`group px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all duration-200 flex items-center justify-center
                  ${(!formData.fechaInicio || !formData.fechaFin) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-700 hover:shadow'}`}
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('procesando', 'Procesando...')}
                  </>
                ) : (
                  <>
                    {t('continuarReserva', 'Continuar con la reserva')}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FormularioReservaRuta; 