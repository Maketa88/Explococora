import axios from "axios";

// URL base para las peticiones de rutas
const API_URL = "http://localhost:10101";

// Crear una instancia de axios con la URL base
const rutasApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Servicio para obtener todas las rutas disponibles
 * @returns {Promise} Promesa con los datos de las rutas
 */
export const obtenerRutas = async () => {
  try {
    const response = await rutasApi.get("/rutas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener las rutas:", error);
    throw error;
  }
};



export const obtenerFotosRuta = async (idRuta) => {
  try {
    // Verificar que el ID sea válido antes de hacer la petición
    if (!idRuta || isNaN(idRuta)) {
      console.warn("ID de ruta no válido:", idRuta);
      return [];
    }

    console.log(`Obteniendo fotos para la ruta ${idRuta}...`);
    const response = await axios.get(
      `${API_URL}/rutas/fotos-publicas/${idRuta}`
    );
    console.log(`Respuesta de la API para ruta ${idRuta}:`, response.data);

    let fotosArray = [];

    if (response.data && response.data.fotos) {
      const fotos = response.data.fotos;

      // Caso 1: Array de strings (URLs directas)
      if (
        Array.isArray(fotos) &&
        fotos.length > 0 &&
        typeof fotos[0] === "string"
      ) {
        fotosArray = fotos;
      }
      // Caso 2: Array de objetos con propiedad foto
      else if (
        Array.isArray(fotos) &&
        fotos.length > 0 &&
        fotos[0] &&
        typeof fotos[0] === "object" &&
        fotos[0].foto
      ) {
        fotosArray = fotos.map((item) => item.foto);
      }
      // Caso 3: Array anidado
      else if (
        Array.isArray(fotos) &&
        fotos.length > 0 &&
        Array.isArray(fotos[0])
      ) {
        const primerElemento = fotos[0];

        primerElemento.forEach((item) => {
          if (
            item &&
            typeof item === "object" &&
            item.foto &&
            typeof item.foto === "string"
          ) {
            fotosArray.push(item.foto);
          } else if (typeof item === "string") {
            fotosArray.push(item);
          }
        });
      }
    }

    return fotosArray;
  } catch (error) {
    console.error(`Error al obtener fotos para la ruta ${idRuta}:`, error);
    return [];
  }
};

/**
 * Obtiene las coordenadas de una ruta específica
 * Para efectos de demostración, genera coordenadas ficticias basadas en el ID
 * En un caso real, estas coordenadas vendrían de la API
 * @param {number} idRuta - ID de la ruta
 * @returns {Object} Objeto con coordenadas de inicio, fin y puntos intermedios
 */
export const obtenerCoordenadasRuta = async (idRuta) => {
  try {
    // En un caso real, harías una petición al backend:
    // const response = await rutasApi.get(`/rutas/coordenadas/${idRuta}`);
    // return response.data;
    
    // Para efectos de demostración, generamos coordenadas ficticias
    // El backend debería devolver las coordenadas reales de las rutas
    
    // Base centrada en Colombia
    const baseLatitud = 4.6 + (idRuta % 5) * 0.3;
    const baseLongitud = -74.1 - (idRuta % 7) * 0.4;
    
    // Generar algunos puntos de interés ficticios
    const puntosInteres = [];
    const cantidadPuntos = 2 + (idRuta % 3); // 2-4 puntos por ruta
    
    for (let i = 0; i < cantidadPuntos; i++) {
      // Generar punto entre el inicio y fin
      const factor = (i + 1) / (cantidadPuntos + 1);
      puntosInteres.push({
        nombre: `Punto de interés ${i + 1}`,
        coordenadas: [
          baseLongitud + (factor * 0.5),
          baseLatitud + (factor * 0.3)
        ]
      });
    }
    
    return {
      inicio: [baseLongitud, baseLatitud],
      fin: [baseLongitud + 0.5, baseLatitud + 0.3],
      puntosInteres: puntosInteres
    };
  } catch (error) {
    console.error(`Error al obtener coordenadas para la ruta ${idRuta}:`, error);
    // Retornar coordenadas por defecto en caso de error
    return {
      inicio: [-74.1, 4.6], // Bogotá
      fin: [-75.6, 6.2],    // Medellín
      puntosInteres: []
    };
  }
};

export default {
  obtenerRutas,
  obtenerFotosRuta,
  obtenerCoordenadasRuta
};
