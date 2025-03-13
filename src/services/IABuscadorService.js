import datosEntrenamiento from '../data/entrenamiento-buscador.json';

/**
 * Servicio para procesar consultas del buscador utilizando datos de entrenamiento
 */
class IABuscadorService {
  constructor() {
    this.datosEntrenamiento = datosEntrenamiento;
    this.consultas = this.datosEntrenamiento.consultas;
    this.recomendaciones = this.datosEntrenamiento.recomendaciones;
  }

  /**
   * Procesa una consulta de búsqueda y devuelve los filtros correspondientes
   * @param {string} consulta - La consulta del usuario
   * @returns {Object} Filtros y recomendaciones para la consulta
   */
  procesarConsulta(consulta) {
    if (!consulta || typeof consulta !== 'string') {
      return { filtros: {}, recomendaciones: [] };
    }

    // Normalizar la consulta (minúsculas, sin acentos, etc.)
    const consultaNormalizada = this.normalizarTexto(consulta);
    
    // Buscar coincidencias en los patrones de consulta
    const coincidencias = this.buscarCoincidencias(consultaNormalizada);
    
    // Combinar todos los filtros encontrados
    const filtrosCombinados = this.combinarFiltros(coincidencias);
    
    // Obtener recomendaciones basadas en los filtros
    const recomendacionesPersonalizadas = this.obtenerRecomendaciones(filtrosCombinados);
    
    return {
      filtros: filtrosCombinados,
      recomendaciones: recomendacionesPersonalizadas,
      coincidencias: coincidencias.map(c => c.texto)
    };
  }

  /**
   * Normaliza un texto para facilitar la comparación
   * @param {string} texto - Texto a normalizar
   * @returns {string} Texto normalizado
   */
  normalizarTexto(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos
  }

  /**
   * Busca coincidencias entre la consulta y los patrones de entrenamiento
   * @param {string} consultaNormalizada - Consulta normalizada
   * @returns {Array} Patrones que coinciden con la consulta
   */
  buscarCoincidencias(consultaNormalizada) {
    const coincidencias = [];

    // Recorrer todas las consultas de entrenamiento
    for (const patron of this.consultas) {
      // Normalizar el texto principal del patrón
      const patronNormalizado = this.normalizarTexto(patron.texto);
      
      // Verificar si el patrón principal coincide
      if (consultaNormalizada.includes(patronNormalizado)) {
        coincidencias.push(patron);
        continue;
      }
      
      // Verificar variaciones del patrón
      for (const variacion of patron.variaciones || []) {
        const variacionNormalizada = this.normalizarTexto(variacion);
        if (consultaNormalizada.includes(variacionNormalizada)) {
          coincidencias.push(patron);
          break;
        }
      }
    }

    return coincidencias;
  }

  /**
   * Combina los filtros de múltiples coincidencias
   * @param {Array} coincidencias - Patrones que coinciden con la consulta
   * @returns {Object} Filtros combinados
   */
  combinarFiltros(coincidencias) {
    const filtrosCombinados = {};
    
    // Si no hay coincidencias, devolver objeto vacío
    if (coincidencias.length === 0) {
      return filtrosCombinados;
    }
    
    // Combinar todos los filtros encontrados
    for (const coincidencia of coincidencias) {
      const filtros = coincidencia.filtros || {};
      
      // Añadir cada filtro al objeto combinado
      for (const [clave, valor] of Object.entries(filtros)) {
        // Si ya existe un filtro con esta clave, aplicar reglas de prioridad
        if (filtrosCombinados[clave]) {
          // Para dificultad, priorizar la más baja por seguridad
          if (clave === 'dificultad') {
            const prioridad = { 'Facil': 1, 'Moderada': 2, 'Desafiante': 3 };
            if (prioridad[valor] < prioridad[filtrosCombinados[clave]]) {
              filtrosCombinados[clave] = valor;
            }
          }
          // Para duración máxima, priorizar la más corta
          else if (clave === 'duracion_maxima') {
            const duracionActual = filtrosCombinados[clave];
            const duracionNueva = valor;
            
            // Convertir a minutos para comparar
            const minutosActual = this.convertirAMinutos(duracionActual);
            const minutosNuevo = this.convertirAMinutos(duracionNueva);
            
            if (minutosNuevo < minutosActual) {
              filtrosCombinados[clave] = valor;
            }
          }
          // Para distancia máxima, priorizar la más corta
          else if (clave === 'distancia_maxima' && valor < filtrosCombinados[clave]) {
            filtrosCombinados[clave] = valor;
          }
          // Para nombre_contiene, combinar valores
          else if (clave === 'nombre_contiene') {
            const valoresActuales = filtrosCombinados[clave].split(', ');
            const valoresNuevos = valor.split(', ');
            
            // Combinar y eliminar duplicados
            const valoresCombinados = [...new Set([...valoresActuales, ...valoresNuevos])];
            filtrosCombinados[clave] = valoresCombinados.join(', ');
          }
          // Para valoracion_minima, priorizar la mayor
          else if (clave === 'valoracion_minima' && valor > filtrosCombinados[clave]) {
            filtrosCombinados[clave] = valor;
          }
          // Para tipo_actividad, mantener el valor existente si es diferente (no hay prioridad clara)
          else if (clave === 'tipo_actividad' && valor !== filtrosCombinados[clave]) {
            // Mantenemos el existente, ya que no hay una prioridad clara entre tipos de actividad
            // Si hay una actividad combinada como "Cabalgata y Caminata", la priorizamos
            if (valor.includes(" y ") && !filtrosCombinados[clave].includes(" y ")) {
              filtrosCombinados[clave] = valor;
            }
          }
          // Para duración exacta, mantener el valor más reciente (podrían ser conflictivos)
          else if (clave === 'duracion') {
            filtrosCombinados[clave] = valor; // El último valor sobreescribe
          }
        } else {
          // Si no existe, simplemente añadirlo
          filtrosCombinados[clave] = valor;
        }
      }
    }
    
    return filtrosCombinados;
  }

  /**
   * Convierte una duración en formato texto a minutos
   * @param {string} duracion - Duración en formato texto (ej: "1 Hora", "30 Min")
   * @returns {number} Duración en minutos
   */
  convertirAMinutos(duracion) {
    if (duracion.includes('Min')) {
      return parseInt(duracion);
    } else if (duracion.includes('Hora')) {
      return parseInt(duracion) * 60;
    }
    return 9999; // Valor alto para casos no reconocidos
  }

  /**
   * Obtiene recomendaciones basadas en los filtros aplicados
   * @param {Object} filtros - Filtros aplicados
   * @returns {Array} Recomendaciones personalizadas
   */
  obtenerRecomendaciones(filtros) {
    const recomendacionesAplicables = [];
    
    // Recorrer todas las recomendaciones disponibles
    for (const recomendacion of this.recomendaciones) {
      const condicion = recomendacion.condicion;
      
      // Parsear la condición (formato: "clave=valor" o "clave>valor")
      const [clave, operadorValor] = condicion.split(/([=>])/);
      const operador = operadorValor[0];
      const valor = operadorValor.slice(1);
      
      // Verificar si la condición se cumple con los filtros actuales
      if (filtros[clave]) {
        if (operador === '=' && filtros[clave] === valor) {
          recomendacionesAplicables.push(recomendacion.mensaje);
        } else if (operador === '>') {
          // Manejar diferentes tipos de comparaciones
          let cumpleCondicion = false;
          
          if (clave === 'duracion' || clave === 'duracion_maxima') {
            // Para duración, convertir a minutos
            cumpleCondicion = this.convertirAMinutos(filtros[clave]) > this.convertirAMinutos(valor);
          } else if (clave === 'valoracion_minima' || clave === 'distancia_maxima') {
            // Para valores numéricos, convertir a número
            cumpleCondicion = parseFloat(filtros[clave]) > parseFloat(valor);
          } else {
            // Para otros casos
            cumpleCondicion = filtros[clave] > valor;
          }
          
          if (cumpleCondicion) {
            recomendacionesAplicables.push(recomendacion.mensaje);
          }
        }
      } else if (clave === 'nombre_contiene' && filtros.nombre_contiene) {
        // Caso especial para nombre_contiene que puede tener múltiples valores
        const valoresFiltro = filtros.nombre_contiene.split(', ');
        if (valoresFiltro.includes(valor)) {
          recomendacionesAplicables.push(recomendacion.mensaje);
        }
      } else if (clave === 'tipo_actividad' && filtros.tipo_actividad) {
        // Caso especial para tipo_actividad
        if (filtros.tipo_actividad.includes(valor)) {
          recomendacionesAplicables.push(recomendacion.mensaje);
        }
      }
    }
    
    return recomendacionesAplicables;
  }
}

// Exportar una instancia única del servicio
export const iaBuscadorService = new IABuscadorService(); 