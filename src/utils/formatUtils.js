/**
 * Utilidades para formatear datos en la aplicación
 */

/**
 * Formatea una fecha para mostrarla en la interfaz de usuario
 * @param {string|Date} fechaStr - Fecha en formato string o Date
 * @param {boolean} includeTime - Indica si se debe incluir la hora en el formato
 * @returns {string} - Fecha formateada en formato legible (DD/MM/YYYY o DD/MM/YYYY HH:MM)
 */
export const formatearFecha = (fechaStr, includeTime = true) => {
  if (!fechaStr) return "Fecha no disponible";
  
  try {
    // Intentar convertir a objeto Date si es un string
    const fecha = fechaStr instanceof Date ? fechaStr : new Date(fechaStr);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      // Intentar parsear formatos específicos si la fecha no es válida
      if (typeof fechaStr === 'string') {
        // Intentar con formato YYYY-MM-DD HH:MM:SS
        const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}):(\d{2}))?$/);
        if (match) {
          // Usamos destructuring y omitimos el primer elemento (match completo)
          const [, year, month, day, hour = 0, minute = 0, second = 0] = match;
          const parsedDate = new Date(year, month - 1, day, hour, minute, second);
          
          if (!isNaN(parsedDate.getTime())) {
            // Formato para mostrar día, mes, año
            const options = {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            };
            
            // Añadir opciones de hora y minutos si se solicita
            if (includeTime) {
              options.hour = '2-digit';
              options.minute = '2-digit';
            }
            
            return new Intl.DateTimeFormat('es-ES', options).format(parsedDate);
          }
        }
      }
      
      // Si no se pudo parsear, devolver el string original
      return fechaStr;
    }
    
    // Formato para mostrar día, mes, año
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    
    // Añadir opciones de hora y minutos si se solicita
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('es-ES', options).format(fecha);
  } catch (e) {
    console.error("Error al formatear fecha:", e);
    return fechaStr; // Devolver la fecha original si hay error
  }
};

/**
 * Convierte una fecha del formato DD/MM/YYYY al formato YYYY-MM-DD para la base de datos
 * @param {string} fechaUsuario - Fecha en formato DD/MM/YYYY
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const formatearFechaParaDB = (fechaUsuario) => {
  if (!fechaUsuario) return null;
  
  // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaUsuario)) {
    return fechaUsuario;
  }
  
  // Convertir de DD/MM/YYYY a YYYY-MM-DD
  const partes = fechaUsuario.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  
  // Si no se pudo convertir, devolver el original
  return fechaUsuario;
};

/**
 * Combina una fecha y una hora en un formato ISO sin problemas de zona horaria
 * @param {string} fechaStr - Fecha en formato YYYY-MM-DD
 * @param {string} horaStr - Hora en formato HH:MM
 * @returns {string} - Fecha y hora en formato ISO 8601
 */
export const combinarFechaHoraISO = (fechaStr, horaStr) => {
  if (!fechaStr) return null;
  
  try {
    // Extraer componentes individuales
    const [anio, mes, dia] = fechaStr.split('-').map(num => parseInt(num));
    const [hora, minutos] = (horaStr || '00:00').split(':').map(num => parseInt(num));
    
    // Crear fecha usando los componentes individuales (evita problemas de zona horaria)
    const fecha = new Date(anio, mes - 1, dia, hora, minutos, 0);
    
    // Construir string ISO manualmente para evitar conversiones de zona horaria
    // Un formato ISO simple: YYYY-MM-DDTHH:MM:SS.000Z
    return fecha.toISOString();
  } catch (error) {
    console.error('Error al combinar fecha y hora:', error);
    return null;
  }
};

/**
 * Combina una fecha y una hora en un objeto Date
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @returns {Date} - Objeto Date combinado
 */
export const combinarFechaHora = (fecha, hora) => {
  if (!fecha) return null;
  
  try {
    // Por defecto usamos 00:00 si no hay hora
    const horaCompleta = hora || '00:00';
    return new Date(`${fecha}T${horaCompleta}:00`);
  } catch (e) {
    console.error("Error al combinar fecha y hora:", e);
    return null;
  }
};

/**
 * Convierte una fecha ISO a formato YYYY-MM-DD (formato para inputs date)
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const isoAFechaInput = (fechaISO) => {
  if (!fechaISO) return '';
  try {
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return '';
    return fecha.toISOString().split('T')[0];
  } catch (e) {
    console.error("Error al convertir fecha ISO a formato input:", e);
    return '';
  }
};

/**
 * Muestra una fecha y hora ISO en formato legible para el usuario
 * @param {string} fechaISO - Fecha y hora en formato ISO
 * @returns {string} - Fecha y hora en formato DD/MM/YYYY HH:MM
 */
export const mostrarFechaHoraLegible = (fechaISO) => {
  if (!fechaISO) return 'No disponible';
  try {
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return fechaISO;
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Error al mostrar fecha y hora legible:", e);
    return fechaISO;
  }
}; 