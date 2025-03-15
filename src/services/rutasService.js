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

export default {
  obtenerRutas,
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
