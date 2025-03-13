import axios from 'axios';

// URL base para las peticiones de rutas
const API_URL = 'http://localhost:10101';

// Crear una instancia de axios con la URL base
const rutasApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Servicio para obtener todas las rutas disponibles
 * @returns {Promise} Promesa con los datos de las rutas
 */
export const obtenerRutas = async () => {
  try {
    const response = await rutasApi.get('/rutas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las rutas:', error);
    throw error;
  }
};

/**
 * Servicio para obtener una ruta por su ID
 * @param {string|number} id - ID de la ruta a buscar
 * @returns {Promise} Promesa con los datos de la ruta
 */
export const obtenerRutaPorId = async (id) => {
  try {
    const response = await rutasApi.get(`/rutas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la ruta con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Servicio para buscar rutas por término
 * @param {string} termino - Término de búsqueda
 * @returns {Promise} Promesa con los resultados de la búsqueda
 */
export const buscarRutas = async (termino) => {
  try {
    const response = await rutasApi.get(`/rutas/buscar`, {
      params: { q: termino }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al buscar rutas con el término "${termino}":`, error);
    throw error;
  }
};

/**
 * Servicio para filtrar rutas por dificultad
 * @param {string} dificultad - Nivel de dificultad (Facil, Moderada, Desafiante)
 * @returns {Promise} Promesa con las rutas filtradas
 */
export const filtrarRutasPorDificultad = async (dificultad) => {
  try {
    const response = await rutasApi.get(`/rutas/filtrar`, {
      params: { dificultad }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al filtrar rutas por dificultad "${dificultad}":`, error);
    throw error;
  }
};

export default {
  obtenerRutas,
  obtenerRutaPorId,
  buscarRutas,
  filtrarRutasPorDificultad
}; 