import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Clock, Calendar, User, MapPin } from 'lucide-react';

const VerifiedCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [citas, setCitas] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [citasDelDia, setCitasDelDia] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);

  // Horas de trabajo diarias (ejemplo: 8am a 6pm)
  const horaInicio = 8; // 8 AM
  const horaFin = 18; // 6 PM
  
  // Duración de cada cita en horas
  const duracionCita = 2;

  // Configuración de días laborables (0 = domingo, 1 = lunes, ..., 6 = sábado)
  const diasLaborables = [1, 2, 3, 4, 5, 6]; // Lunes a sábado

  useEffect(() => {
    obtenerCitas();
  }, []);

  useEffect(() => {
    setCurrentMonth(currentDate.getMonth());
    setCurrentYear(currentDate.getFullYear());
  }, [currentDate]);

  useEffect(() => {
    if (selectedDate) {
      const fechaSeleccionada = new Date(selectedDate);
      fechaSeleccionada.setHours(0, 0, 0, 0);
      
      // Filtrar las citas del día seleccionado
      const citasFiltradas = citas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        fechaCita.setHours(0, 0, 0, 0);
        return fechaCita.getTime() === fechaSeleccionada.getTime();
      });
      
      setCitasDelDia(citasFiltradas);
      
      // Calcular horas disponibles
      calcularHorasDisponibles(fechaSeleccionada, citasFiltradas);
    }
  }, [selectedDate, citas]);

  const obtenerCitas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No se ha encontrado el token de autenticación");
        setLoading(false);
        return;
      }

      // Llamada al endpoint para obtener las citas del guía
      const response = await axios.get('https://servicio-explococora.onrender.com/guia/mis-citas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Respuesta de citas:", response.data);
      
      // Procesar las citas
      let citasData = [];
      if (Array.isArray(response.data)) {
        citasData = response.data;
      } else if (response.data && Array.isArray(response.data.citas)) {
        citasData = response.data.citas;
      } else if (response.data && typeof response.data === 'object') {
        citasData = [response.data]; // Si es un único objeto
      }
      
      // Añadir algunas citas de ejemplo si no hay citas
      if (citasData.length === 0) {
        citasData = generarCitasEjemplo();
      }
      
      setCitas(citasData);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener citas:", err);
      setError("Error al cargar las citas. Por favor, intente de nuevo más tarde.");
      setLoading(false);
      toast.error("No se pudieron cargar las citas");
    }
  };
  
  // Función para generar citas de ejemplo (para demo)
  const generarCitasEjemplo = () => {
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    const pasadoManana = new Date();
    pasadoManana.setDate(hoy.getDate() + 2);
    
    return [
      {
        id: 1,
        nombre: "Carlos Rodríguez",
        fecha: new Date(hoy.setHours(10, 0, 0, 0)),
        duracion: 2,
        ruta: "Cascada El Paraíso",
        estado: "confirmada",
        puntoEncuentro: "Parque Central",
        telefono: "123-456-7890"
      },
      {
        id: 2,
        nombre: "María López",
        fecha: new Date(hoy.setHours(14, 0, 0, 0)),
        duracion: 2,
        ruta: "Sendero de los Quetzales",
        estado: "confirmada",
        puntoEncuentro: "Centro Comercial Plaza",
        telefono: "987-654-3210"
      },
      {
        id: 3,
        nombre: "Juan Pérez",
        fecha: new Date(manana.setHours(9, 0, 0, 0)),
        duracion: 3,
        ruta: "Montaña Verde",
        estado: "pendiente",
        puntoEncuentro: "Hotel Las Palmeras",
        telefono: "555-123-4567"
      },
      {
        id: 4,
        nombre: "Laura García",
        fecha: new Date(pasadoManana.setHours(11, 0, 0, 0)),
        duracion: 2,
        ruta: "Río Azul",
        estado: "confirmada",
        puntoEncuentro: "Estación de Bus",
        telefono: "777-888-9999"
      }
    ];
  };

  // Calcular horas disponibles para un día específico
  const calcularHorasDisponibles = (fecha, citasDelDia) => {
    const diaSemana = fecha.getDay(); // 0 (domingo) a 6 (sábado)
    
    // Verificar si es un día laborable
    if (!diasLaborables.includes(diaSemana)) {
      setHorasDisponibles([]);
      return;
    }
    
    // Generar todas las horas posibles
    const todasLasHoras = [];
    for (let hora = horaInicio; hora < horaFin; hora += duracionCita) {
      todasLasHoras.push(hora);
    }
    
    // Marcar horas ocupadas
    const horasOcupadas = citasDelDia.map(cita => {
      const horaCita = new Date(cita.fecha).getHours();
      return horaCita;
    });
    
    // Filtrar horas disponibles
    const disponibles = todasLasHoras.filter(hora => !horasOcupadas.includes(hora));
    setHorasDisponibles(disponibles);
  };

  // Obtener días del mes actual
  const getDiasDelMes = () => {
    const primerDia = new Date(currentYear, currentMonth, 1);
    const ultimoDia = new Date(currentYear, currentMonth + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    
    const resultado = [];
    
    // Agregar días del mes anterior para completar la primera semana
    const primerDiaSemana = primerDia.getDay(); // 0 (domingo) a 6 (sábado)
    const diasMesAnterior = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1; // Ajuste para empezar en lunes
    
    const ultimoDiaMesAnterior = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let i = diasMesAnterior - 1; i >= 0; i--) {
      resultado.push({
        dia: ultimoDiaMesAnterior - i,
        mes: currentMonth - 1,
        ano: currentYear,
        esOtroMes: true
      });
    }
    
    // Agregar días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(currentYear, currentMonth, dia);
      const tieneCitas = citas.some(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita.getDate() === dia && 
               fechaCita.getMonth() === currentMonth && 
               fechaCita.getFullYear() === currentYear;
      });
      
      resultado.push({
        dia,
        mes: currentMonth,
        ano: currentYear,
        esOtroMes: false,
        tieneCitas,
        esDiaLaborable: diasLaborables.includes(fecha.getDay())
      });
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const ultimoDiaSemana = ultimoDia.getDay();
    const diasMesSiguienteNecesarios = ultimoDiaSemana === 0 ? 0 : 7 - ultimoDiaSemana;
    
    for (let dia = 1; dia <= diasMesSiguienteNecesarios; dia++) {
      resultado.push({
        dia,
        mes: currentMonth + 1,
        ano: currentYear,
        esOtroMes: true
      });
    }
    
    return resultado;
  };

  // Cambiar al mes anterior
  const irMesAnterior = () => {
    const nuevaFecha = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(nuevaFecha);
  };

  // Cambiar al mes siguiente
  const irMesSiguiente = () => {
    const nuevaFecha = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(nuevaFecha);
  };

  // Seleccionar una fecha
  const seleccionarFecha = (dia, mes, ano) => {
    const nuevaFecha = new Date(ano, mes, dia);
    setSelectedDate(nuevaFecha);
  };

  // Formatear la hora en formato de 12 horas
  const formatearHora = (hora) => {
    const periodo = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora % 12 || 12;
    return `${hora12}:00 ${periodo}`;
  };

  // Obtener nombre del mes
  const getNombreMes = (mes) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes];
  };

  // Obtener nombre del día de la semana
  const getNombreDia = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getDay()];
  };

  // Estado visual de la cita
  const getEstadoCita = (estado) => {
    if (!estado) return { label: "No confirmada", color: "gray" };
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes("confirm")) {
      return { label: "Confirmada", color: "emerald" };
    } else if (estadoLower.includes("cancel")) {
      return { label: "Cancelada", color: "red" };
    } else if (estadoLower.includes("pend")) {
      return { label: "Pendiente", color: "yellow" };
    } else {
      return { label: estado, color: "gray" };
    }
  };

  return (
    <DashboardLayoutGuia>
      <div className="p-3 sm:p-6">
        {/* Card principal con diseño innovador */}
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          {/* Header con estilo moderno */}
          <div className="bg-emerald-600 p-4 sm:p-6 text-white relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 right-20 sm:right-40 w-20 sm:w-40 h-20 sm:h-40 rounded-full bg-emerald-500 opacity-20 blur-xl"></div>
              <div className="absolute bottom-0 right-10 sm:right-20 w-30 sm:w-60 h-30 sm:h-60 rounded-full bg-emerald-400 opacity-10 blur-2xl"></div>
              <div className="absolute top-5 left-1/2 w-10 sm:w-20 h-10 sm:h-20 rounded-full bg-emerald-300 opacity-20 blur-md"></div>
            </div>
            
            {/* Título con estilo */}
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Calendario de Citas</h1>
              <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
                Gestiona tus citas y disponibilidad para organizar mejor tus rutas turísticas.
              </p>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex justify-center items-center py-20">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
                  <button
                    onClick={obtenerCitas}
                    className="mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-md"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna del calendario */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                    {/* Header del calendario */}
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-emerald-800">
                        {getNombreMes(currentMonth)} {currentYear}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={irMesAnterior}
                          className="p-2 rounded-full hover:bg-emerald-100 text-emerald-600 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setCurrentDate(new Date())}
                          className="px-3 py-1 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-md transition-colors"
                        >
                          Hoy
                        </button>
                        <button 
                          onClick={irMesSiguiente}
                          className="p-2 rounded-full hover:bg-emerald-100 text-emerald-600 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 mb-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => (
                        <div 
                          key={index} 
                          className="text-center text-sm font-medium text-gray-500 py-2"
                        >
                          {dia}
                        </div>
                      ))}
                    </div>
                    
                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {getDiasDelMes().map((diaInfo, index) => {
                        const isSelected = selectedDate && 
                          selectedDate.getDate() === diaInfo.dia && 
                          selectedDate.getMonth() === diaInfo.mes && 
                          selectedDate.getFullYear() === diaInfo.ano;
                          
                        const isToday = new Date().getDate() === diaInfo.dia && 
                          new Date().getMonth() === diaInfo.mes && 
                          new Date().getFullYear() === diaInfo.ano;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => seleccionarFecha(diaInfo.dia, diaInfo.mes, diaInfo.ano)}
                            disabled={diaInfo.esOtroMes || !diaInfo.esDiaLaborable}
                            className={`
                              relative h-14 sm:h-16 rounded-lg flex flex-col items-center justify-center
                              ${isSelected ? 'bg-emerald-600 text-white shadow-lg' : ''}
                              ${isToday && !isSelected ? 'bg-emerald-100 text-emerald-800' : ''}
                              ${diaInfo.esOtroMes ? 'text-gray-400 bg-gray-50' : 'text-gray-700'}
                              ${!diaInfo.esOtroMes && !isSelected && !isToday ? 'hover:bg-emerald-50' : ''}
                              ${!diaInfo.esDiaLaborable && !diaInfo.esOtroMes ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                              transition-all duration-200
                            `}
                          >
                            <span className={`text-sm sm:text-base ${isSelected ? 'font-bold' : ''}`}>
                              {diaInfo.dia}
                            </span>
                            
                            {/* Indicador de citas */}
                            {diaInfo.tieneCitas && !diaInfo.esOtroMes && (
                              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Leyenda */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-600 border-t border-gray-100 pt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-emerald-100 rounded-full mr-1.5"></div>
                        <span>Hoy</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-emerald-600 rounded-full mr-1.5"></div>
                        <span>Seleccionado</span>
                      </div>
                      <div className="flex items-center">
                        <div className="relative w-3 h-3 bg-white border border-gray-300 rounded-full mr-1.5">
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></div>
                        </div>
                        <span>Con citas</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-100 rounded-full mr-1.5"></div>
                        <span>No laborable</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Columna de citas del día */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                      <h2 className="text-xl font-bold text-emerald-800">
                        {getNombreDia(selectedDate)}, {selectedDate.getDate()} de {getNombreMes(selectedDate.getMonth())}
                      </h2>
                    </div>
                    
                    {/* Sección de citas del día */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-1.5 text-emerald-600" /> 
                        Citas programadas
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        {citasDelDia.length > 0 ? citasDelDia.map((cita, index) => {
                          const estado = getEstadoCita(cita.estado);
                          const colorClasses = {
                            "emerald": "bg-emerald-100 text-emerald-800 border-emerald-200",
                            "red": "bg-red-100 text-red-800 border-red-200",
                            "yellow": "bg-yellow-100 text-yellow-800 border-yellow-200",
                            "gray": "bg-gray-100 text-gray-800 border-gray-200"
                          };
                          
                          return (
                            <div 
                              key={index} 
                              className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium">{cita.nombre}</div>
                                <div className={`text-xs px-2 py-0.5 rounded-full ${colorClasses[estado.color]}`}>
                                  {estado.label}
                                </div>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600 mb-1.5">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                {formatearHora(new Date(cita.fecha).getHours())} - {formatearHora(new Date(cita.fecha).getHours() + cita.duracion)}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                {cita.puntoEncuentro}
                              </div>
                              
                              <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                                <span className="font-medium">Ruta:</span> {cita.ruta}
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-center py-6 text-gray-500">
                            No hay citas programadas para este día
                          </div>
                        )}
                      </div>
                      
                      {/* Horas disponibles */}
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-emerald-600" /> 
                          Disponibilidad
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {horasDisponibles.length > 0 ? horasDisponibles.map((hora, index) => (
                            <div 
                              key={index} 
                              className="py-2 px-3 bg-emerald-50 text-emerald-700 rounded-lg text-center text-sm border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              {formatearHora(hora)} - {formatearHora(hora + duracionCita)}
                            </div>
                          )) : (
                            <div className="col-span-2 text-center py-4 text-gray-500">
                              {diasLaborables.includes(selectedDate.getDay()) 
                                ? "No hay horas disponibles para este día" 
                                : "Este día no es laborable"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutGuia>
  );
};

export default VerifiedCustomers; 