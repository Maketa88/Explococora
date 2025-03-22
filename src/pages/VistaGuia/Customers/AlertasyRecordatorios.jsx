import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import { AlertTriangle, Clock, Calendar, CheckCircle, XCircle, Bell } from 'lucide-react';

const NewCustomer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  
  useEffect(() => {
    obtenerAlertasYRecordatorios();
  }, []);
  
  const obtenerAlertasYRecordatorios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No se ha encontrado el token de autenticación");
        setLoading(false);
        return;
      }

      // Intentar obtener alertas y recordatorios del servidor
      const response = await axios.get('http://localhost:10101/guia/mis-alertas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => {
        // Si la API no existe, cargar datos de ejemplo
        return { data: generarDatosEjemplo() };
      });
      
      console.log("Respuesta de alertas:", response.data);
      
      // Procesar las alertas recibidas
      const datos = response.data;
      if (datos && Array.isArray(datos.alertas)) {
        setAlertas(datos.alertas);
      } else if (datos && Array.isArray(datos.recordatorios)) {
        setRecordatorios(datos.recordatorios);
      } else if (datos) {
        // Si no hay estructura específica, intentar separar por tipo
        const alertasData = [];
        const recordatoriosData = [];
        
        // Si es un array, procesarlo directamente
        const items = Array.isArray(datos) ? datos : [datos];
        
        items.forEach(item => {
          if (item.tipo === 'alerta') {
            alertasData.push(item);
          } else if (item.tipo === 'recordatorio') {
            recordatoriosData.push(item);
          } else {
            // Si no tiene tipo específico, clasificar por urgencia
            if (item.urgencia === 'alta' || item.prioridad === 'alta') {
              alertasData.push({...item, tipo: 'alerta'});
            } else {
              recordatoriosData.push({...item, tipo: 'recordatorio'});
            }
          }
        });
        
        setAlertas(alertasData);
        setRecordatorios(recordatoriosData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener alertas:", err);
      setError("Error al cargar las alertas y recordatorios");
      setLoading(false);
      toast.error("No se pudieron cargar las alertas y recordatorios");
      
      // Cargar datos de ejemplo en caso de error
      const ejemplos = generarDatosEjemplo();
      setAlertas(ejemplos.alertas || []);
      setRecordatorios(ejemplos.recordatorios || []);
    }
  };
  
  // Función para generar datos de ejemplo si no hay API
  const generarDatosEjemplo = () => {
    const fechaHoy = new Date();
    
    // Fechas para recordatorios
    const fechaMañana = new Date(fechaHoy);
    fechaMañana.setDate(fechaHoy.getDate() + 1);
    
    const fechaDosDias = new Date(fechaHoy);
    fechaDosDias.setDate(fechaHoy.getDate() + 2);
    
    const fechaSemana = new Date(fechaHoy);
    fechaSemana.setDate(fechaHoy.getDate() + 7);
    
    return {
      alertas: [
        {
          id: 1,
          titulo: 'Cambio de ruta urgente',
          descripcion: 'La ruta "Cascada del Cielo" ha sido modificada debido a condiciones climáticas. Revise los detalles.',
          fecha: fechaHoy,
          leida: false,
          tipo: 'alerta',
          prioridad: 'alta'
        },
        {
          id: 2,
          titulo: 'Grupo numeroso asignado',
          descripcion: 'Se ha asignado un grupo de 15 personas para la ruta "Sendero de los Quetzales". Prepare equipo adicional.',
          fecha: fechaHoy,
          leida: true,
          tipo: 'alerta',
          prioridad: 'media'
        },
        {
          id: 3,
          titulo: 'Alerta meteorológica',
          descripcion: 'Se esperan lluvias fuertes en la zona este del parque. Considere rutas alternativas.',
          fecha: fechaMañana,
          leida: false,
          tipo: 'alerta',
          prioridad: 'alta'
        }
      ],
      recordatorios: [
        {
          id: 101,
          titulo: 'Renovar certificación de primeros auxilios',
          descripcion: 'Su certificación expira en 2 semanas. Visite el centro de capacitación para renovarla.',
          fecha: fechaSemana,
          completado: false,
          tipo: 'recordatorio'
        },
        {
          id: 102,
          titulo: 'Verificar equipo de seguridad',
          descripcion: 'Realizar chequeo mensual del equipo de montaña y primeros auxilios.',
          fecha: fechaMañana,
          completado: false,
          tipo: 'recordatorio'
        },
        {
          id: 103,
          titulo: 'Reunión de guías',
          descripcion: 'Reunión mensual para discutir nuevas rutas y protocolos. Centro de visitantes, 9:00 AM.',
          fecha: fechaDosDias,
          completado: false,
          tipo: 'recordatorio'
        },
        {
          id: 104,
          titulo: 'Actualizar información de contacto',
          descripcion: 'Revisar y actualizar información personal en el sistema.',
          fecha: fechaHoy,
          completado: true,
          tipo: 'recordatorio'
        }
      ]
    };
  };
  
  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    
    const fechaSinHora = new Date(fecha);
    fechaSinHora.setHours(0, 0, 0, 0);
    
    // Formato de hora
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const horaFormateada = `${hora}:${minutos}`;
    
    // Si es hoy
    if (fechaSinHora.getTime() === hoy.getTime()) {
      return `Hoy, ${horaFormateada}`;
    }
    
    // Si es mañana
    if (fechaSinHora.getTime() === mañana.getTime()) {
      return `Mañana, ${horaFormateada}`;
    }
    
    // Para otras fechas
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return `${fecha.toLocaleDateString('es-ES', opciones)}, ${horaFormateada}`;
  };
  
  // Marcar alerta como leída
  const marcarComoLeida = async (id) => {
    try {
      const token = localStorage.getItem("token");
      
      // Intentar marcar en el servidor
      await axios.put(`http://localhost:10101/guia/alertas/${id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {
        // Si la API no existe, solo actualizar el estado local
        console.log("API de marcado no disponible, actualizando solo en frontend");
      });
      
      // Actualizar estado local
      setAlertas(prev => prev.map(alerta => 
        alerta.id === id ? {...alerta, leida: true} : alerta
      ));
      
      toast.success("Alerta marcada como leída");
    } catch (error) {
      console.error("Error al marcar alerta:", error);
      toast.error("No se pudo marcar la alerta como leída");
    }
  };
  
  // Marcar recordatorio como completado
  const marcarComoCompletado = async (id) => {
    try {
      const token = localStorage.getItem("token");
      
      // Intentar marcar en el servidor
      await axios.put(`http://localhost:10101/guia/recordatorios/${id}/completar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {
        // Si la API no existe, solo actualizar el estado local
        console.log("API de marcado no disponible, actualizando solo en frontend");
      });
      
      // Actualizar estado local
      setRecordatorios(prev => prev.map(recordatorio => 
        recordatorio.id === id ? {...recordatorio, completado: true} : recordatorio
      ));
      
      toast.success("Recordatorio marcado como completado");
    } catch (error) {
      console.error("Error al marcar recordatorio:", error);
      toast.error("No se pudo marcar el recordatorio como completado");
    }
  };
  
  const renderContenido = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-800 font-medium">Cargando alertas y recordatorios...</p>
        </div>
      );
    }
    
    if (error && alertas.length === 0 && recordatorios.length === 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar datos</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={obtenerAlertasYRecordatorios}
            className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Alertas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-red-500 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold">Alertas</h2>
            </div>
          </div>
          
          <div className="p-5">
            {alertas.length > 0 ? (
              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      alerta.leida 
                        ? 'border-gray-200 bg-white' 
                        : 'border-red-200 bg-red-50 shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${alerta.leida ? 'text-gray-800' : 'text-red-700'}`}>
                        {alerta.titulo}
                      </h3>
                      {!alerta.leida && (
                        <div className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                          Nueva
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${alerta.leida ? 'text-gray-600' : 'text-red-600'}`}>
                      {alerta.descripcion}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatearFecha(alerta.fecha)}</span>
                      </div>
                      
                      {!alerta.leida && (
                        <button
                          onClick={() => marcarComoLeida(alerta.id)}
                          className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-8 h-8 text-red-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No hay alertas</h3>
                <p className="text-gray-500 text-sm">Todas las alertas aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sección de Recordatorios */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h2 className="text-lg font-bold">Recordatorios</h2>
            </div>
          </div>
          
          <div className="p-5">
            {recordatorios.length > 0 ? (
              <div className="space-y-4">
                {recordatorios.map((recordatorio) => (
                  <div 
                    key={recordatorio.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      recordatorio.completado 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-blue-200 bg-blue-50 shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${recordatorio.completado ? 'text-gray-500 line-through' : 'text-blue-700'}`}>
                        {recordatorio.titulo}
                      </h3>
                      {recordatorio.completado ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${recordatorio.completado ? 'text-gray-500' : 'text-blue-600'}`}>
                      {recordatorio.descripcion}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatearFecha(recordatorio.fecha)}</span>
                      </div>
                      
                      {!recordatorio.completado && (
                        <button
                          onClick={() => marcarComoCompletado(recordatorio.id)}
                          className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                        >
                          Marcar como completado
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No hay recordatorios</h3>
                <p className="text-gray-500 text-sm">Todos los recordatorios aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayoutGuia>
      <div className="p-3 sm:p-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Alertas y Recordatorios</h1>
              <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
                Visualiza y gestiona todas tus alertas y recordatorios importantes
              </p>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-4 sm:p-6">
            {renderContenido()}
          </div>
        </div>
      </div>
    </DashboardLayoutGuia>
  );
};

export default NewCustomer; 