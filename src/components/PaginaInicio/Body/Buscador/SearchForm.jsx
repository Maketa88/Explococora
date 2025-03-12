import axios from "axios";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import commonKeywordsData from "../../../../data/commonKeywords.json";
import conditionPatternsData from "../../../../data/conditionPatterns.json";
import routesData from "../../../../data/routes.json";
import timePatternsData from "../../../../data/timePatterns.json";

export const SearchForm = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [routes, setRoutes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allRoutes, setAllRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showAIRouteGenerator, setShowAIRouteGenerator] = useState(false);
  const [generatingRoute, setGeneratingRoute] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState(null);

  // Cargar todas las rutas al iniciar el componente
  useEffect(() => {
    // Función para procesar las rutas con palabras clave y datos adicionales
    const processRoutes = (routes) => {
      return routes.map((route) => {
        // Calcular duración en minutos
        let durationInMinutes = 0;

        if (route.durationInMinutes) {
          // Si ya tiene la propiedad, usarla directamente
          durationInMinutes = route.durationInMinutes;
        } else if (route.duracion) {
          // Convertir la duración de texto a minutos
          durationInMinutes = convertToMinutes(route.duracion);
        }

        // Crear información de duración formateada para búsquedas
        let tiempoFormateado = "";
        if (durationInMinutes > 0) {
          const horas = Math.floor(durationInMinutes / 60);
          const minutos = Math.round(durationInMinutes % 60);

          if (horas > 0) {
            tiempoFormateado += `${horas} hora${horas !== 1 ? "s" : ""}`;
          }
          if (minutos > 0) {
            tiempoFormateado += `${horas > 0 ? " y " : ""}${minutos} minuto${
              minutos !== 1 ? "s" : ""
            }`;
          }
        }

        // Procesar rangos de tiempo (ej: "1-2 horas")
        let tiempoMinimo = 0;
        let tiempoMaximo = 0;

        if (route.duracion && typeof route.duracion === "string") {
          const rangeMatch = route.duracion.match(
            /(\d+)[\s-]+(\d+)\s*(h|hr|hrs|hora|horas)/i
          );
          if (rangeMatch) {
            tiempoMinimo = parseInt(rangeMatch[1]) * 60;
            tiempoMaximo = parseInt(rangeMatch[2]) * 60;
          }
        }

        // Categoría de tiempo para búsquedas cualitativas
        let categoriaTiempo = "";
        if (durationInMinutes <= 60) categoriaTiempo = "muy corta";
        else if (durationInMinutes <= 120) categoriaTiempo = "corta";
        else if (durationInMinutes <= 180) categoriaTiempo = "media-corta";
        else if (durationInMinutes <= 240) categoriaTiempo = "media";
        else if (durationInMinutes <= 300) categoriaTiempo = "media-larga";
        else if (durationInMinutes <= 360) categoriaTiempo = "larga";
        else categoriaTiempo = "muy larga";

        // Si la ruta no tiene estado, la establecemos como activa por defecto para las búsquedas
        const estado = route.estado || "Activa";

        // Incluir todas las rutas para búsquedas de tiempo, independientemente de su estado
        return {
          ...route,
          keywords: generateKeywords(route),
          durationInMinutes: durationInMinutes,
          tiempoFormateado: tiempoFormateado,
          categoriaTiempo: categoriaTiempo,
          tiempoMinimo: tiempoMinimo || durationInMinutes * 0.8, // Usar 80% del tiempo si no hay rango explícito
          tiempoMaximo: tiempoMaximo || durationInMinutes * 1.2, // Usar 120% del tiempo si no hay rango explícito
          estado: estado,
          // Campos para puntuación
          activityScore: 0,
          difficultyScore: 0,
          timeScore: 0,
          nameScore: 0,
          featuresScore: 0,
        };
      });
    };

    const fetchAllRoutes = async () => {
      setIsSearching(true);
      try {
        const response = await axios.get("http://localhost:10101/rutas");
        if (Array.isArray(response.data)) {
          // Preprocesar los datos para optimizar búsquedas
          setAllRoutes(processRoutes(response.data));
        } else {
          setError("La respuesta de la API no tiene el formato esperado");
          // Usar datos de muestra del archivo JSON en caso de formato incorrecto
          setAllRoutes(processRoutes(routesData));
        }
      } catch (err) {
        console.error("Error al cargar rutas:", err);
        setError(
          "No se pudieron cargar las rutas. Por favor, intente más tarde."
        );

        // En caso de error, usar datos de muestra del archivo JSON
        console.log("Usando datos de muestra como respaldo");
        setAllRoutes(processRoutes(routesData));
      } finally {
        setIsSearching(false);
      }
    };

    fetchAllRoutes();

    // Cargar historial de búsqueda desde localStorage
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory).slice(0, 5));
      } catch (e) {
        console.error("Error al cargar historial de búsqueda:", e);
      }
    }
  }, []);

  // Generar palabras clave para cada ruta para búsqueda optimizada
  const generateKeywords = (route) => {
    const keywords = [];

    // Añadir nombre de ruta y sus partes
    if (route.nombreRuta) {
      keywords.push(route.nombreRuta.toLowerCase());
      keywords.push(...route.nombreRuta.toLowerCase().split(/\s+/));
    }

    // Añadir descripción y sus partes clave
    if (route.descripcion) {
      keywords.push(
        ...route.descripcion
          .toLowerCase()
          .split(/[.,;:!?()[\]{}'"\s<>]+/) // Separar por puntuación y espacios
          .filter((word) => word.length > 3)
      ); // Solo palabras significativas
    }

    // Añadir dificultad
    if (route.dificultad) {
      keywords.push(route.dificultad.toLowerCase());

      // Añadir sinónimos de dificultad
      if (
        route.dificultad.toLowerCase() === "facil" ||
        route.dificultad.toLowerCase() === "fácil"
      ) {
        keywords.push(
          "sencilla",
          "principiante",
          "suave",
          "tranquila",
          "básica",
          "simple"
        );
      } else if (route.dificultad.toLowerCase() === "moderada") {
        keywords.push("intermedia", "media", "regular", "normal", "estándar");
      } else if (
        route.dificultad.toLowerCase() === "desafiante" ||
        route.dificultad.toLowerCase() === "difícil"
      ) {
        keywords.push(
          "complicada",
          "intensa",
          "exigente",
          "dura",
          "avanzada",
          "compleja"
        );
      }
    }

    // Añadir duración con términos precisos
    if (route.durationInMinutes) {
      const duracionMinutos = route.durationInMinutes;

      // Añadir valores exactos
      keywords.push(duracionMinutos.toString());

      // Añadir tiempo formateado (2 horas y 30 minutos)
      if (route.tiempoFormateado) {
        keywords.push(route.tiempoFormateado);
      }

      // Añadir horas redondeadas
      const horasRedondeadas = Math.round(duracionMinutos / 60);
      if (horasRedondeadas > 0) {
        keywords.push(
          `${horasRedondeadas} hora${horasRedondeadas !== 1 ? "s" : ""}`
        );
      }

      // Añadir minutos redondeados a múltiplos de 15
      const minutosRedondeados = Math.round(duracionMinutos / 15) * 15;
      keywords.push(`${minutosRedondeados} minutos`);

      // Añadir categoría de tiempo
      if (route.categoriaTiempo) {
        keywords.push(route.categoriaTiempo);
        keywords.push(`ruta ${route.categoriaTiempo}`);
        keywords.push(`duración ${route.categoriaTiempo}`);
      }

      // Palabras clave específicas sobre duración
      if (duracionMinutos <= 60) {
        keywords.push(
          "menos de una hora",
          "menos 1 hora",
          "ruta corta",
          "ruta rápida",
          "1 hora"
        );
      } else if (duracionMinutos <= 120) {
        keywords.push(
          "1-2 horas",
          "una hora",
          "dos horas",
          "2 horas",
          "ruta corta",
          "una hora y media"
        );
        if (duracionMinutos >= 90) keywords.push("1.5 horas", "hora y media");
      } else if (duracionMinutos <= 180) {
        keywords.push(
          "2-3 horas",
          "dos horas",
          "tres horas",
          "3 horas",
          "ruta media"
        );
      } else if (duracionMinutos <= 240) {
        keywords.push(
          "3-4 horas",
          "tres horas",
          "cuatro horas",
          "4 horas",
          "ruta media"
        );
      } else if (duracionMinutos <= 300) {
        keywords.push(
          "4-5 horas",
          "cuatro horas",
          "cinco horas",
          "5 horas",
          "ruta larga"
        );
      } else {
        keywords.push(
          "más de 5 horas",
          "6 horas",
          "ruta larga",
          "ruta extensa",
          "todo el día"
        );
      }
    }

    // Añadir duración y variantes
    if (route.duracion) {
      keywords.push(route.duracion.toLowerCase());

      // Normalizar variantes de duración para mejorar búsqueda
      const durationMinutes = convertToMinutes(route.duracion);
      keywords.push(
        durationMinutes.toString(),
        `${durationMinutes}min`,
        `${durationMinutes} min`,
        `${durationMinutes} minutos`,
        `${Math.round((durationMinutes / 60) * 10) / 10}h`,
        `${Math.round((durationMinutes / 60) * 10) / 10} horas`
      );

      // Clasificar por tiempo
      if (durationMinutes <= 120) {
        keywords.push("corta", "breve", "rápida", "express");
      } else if (durationMinutes <= 240) {
        keywords.push("media", "moderada", "estándar");
      } else {
        keywords.push("larga", "extensa", "completa", "día completo");
      }
    }

    // Añadir tipo de actividad y sinónimos
    if (route.tipoActividad) {
      keywords.push(route.tipoActividad.toLowerCase());
      keywords.push(...route.tipoActividad.toLowerCase().split(/\s+|\sy\s/));

      if (route.tipoActividad.toLowerCase().includes("cabalgata")) {
        keywords.push(
          "caballo",
          "caballos",
          "equitación",
          "montar",
          "paseo a caballo",
          "montada"
        );
      }

      if (route.tipoActividad.toLowerCase().includes("caminata")) {
        keywords.push(
          "senderismo",
          "trekking",
          "hiking",
          "caminar",
          "excursión",
          "excursion",
          "paseo",
          "andar"
        );
      }
    }

    // Añadir atracciones basadas en el nombre y descripción
    if (
      route.nombreRuta &&
      route.nombreRuta.toLowerCase().includes("mirador")
    ) {
      keywords.push(
        "vista",
        "vistas",
        "panorámica",
        "panorama",
        "paisaje",
        "paisajes",
        "fotografía",
        "fotografia"
      );
    }

    if (route.descripcion) {
      if (
        route.descripcion.toLowerCase().includes("río") ||
        route.descripcion.toLowerCase().includes("rio")
      ) {
        keywords.push(
          "agua",
          "río",
          "rio",
          "ríos",
          "rios",
          "cascada",
          "natural"
        );
      }

      if (route.descripcion.toLowerCase().includes("valle")) {
        keywords.push("valle", "valles", "llanura", "planicie");
      }

      if (
        route.descripcion.toLowerCase().includes("montaña") ||
        route.descripcion.toLowerCase().includes("montana")
      ) {
        keywords.push(
          "montaña",
          "montana",
          "montañas",
          "montanas",
          "cumbre",
          "cima",
          "altura",
          "elevación",
          "elevacion"
        );
      }

      if (
        route.descripcion.toLowerCase().includes("cóndor") ||
        route.descripcion.toLowerCase().includes("condor")
      ) {
        keywords.push(
          "aves",
          "pájaros",
          "pajaros",
          "fauna",
          "naturaleza",
          "animales",
          "vida silvestre",
          "avistamiento"
        );
      }

      if (
        route.descripcion.toLowerCase().includes("estatua") ||
        route.descripcion.toLowerCase().includes("virgen")
      ) {
        keywords.push(
          "religioso",
          "religión",
          "religion",
          "espiritual",
          "cultural",
          "histórico",
          "historico",
          "monumento"
        );
      }

      if (
        route.descripcion.toLowerCase().includes("palma") ||
        route.descripcion.toLowerCase().includes("cera")
      ) {
        keywords.push(
          "palmas",
          "palmeras",
          "flora",
          "vegetación",
          "vegetacion",
          "plantas",
          "bosque",
          "árboles",
          "arboles"
        );
      }
    }

    // Extraer características específicas de cada ruta
    if (route.nombreRuta) {
      const nombreLower = route.nombreRuta.toLowerCase();

      if (nombreLower.includes("camino")) {
        keywords.push(
          "sendero",
          "ruta principal",
          "vía",
          "via",
          "acceso",
          "camino"
        );
      }

      if (nombreLower.includes("peña")) {
        keywords.push(
          "roca",
          "piedra",
          "formación",
          "formacion",
          "geológico",
          "geologico"
        );
      }

      if (nombreLower.includes("casa")) {
        keywords.push(
          "edificio",
          "construcción",
          "construccion",
          "vivienda",
          "refugio",
          "histórico",
          "historico"
        );
      }

      if (nombreLower.includes("esperanza")) {
        keywords.push("tranquilidad", "paz", "inspiración", "inspiracion");
      }
    }

    // Estado de la ruta
    if (route.estado) {
      keywords.push(route.estado.toLowerCase());

      if (route.estado.toLowerCase() === "activa") {
        keywords.push("disponible", "abierta", "accesible");
      } else {
        keywords.push(
          "cerrada",
          "no disponible",
          "mantenimiento",
          "clausurada"
        );
      }
    }

    // Añadir calificación y palabras relacionadas
    if (route.calificacion) {
      keywords.push(route.calificacion.toString());

      if (route.calificacion >= 4) {
        keywords.push("excelente", "muy buena", "popular", "recomendada");
      } else if (route.calificacion >= 3) {
        keywords.push("buena", "agradable", "decente");
      } else {
        keywords.push("básica", "simple");
      }
    }

    // Eliminar duplicados y devolver array de palabras clave únicas
    return [...new Set(keywords)].filter(Boolean);
  };

  // Función para convertir cualquier duración a minutos con detección avanzada
  const convertToMinutes = (durationText) => {
    if (!durationText) return 0;

    // Normalizar el texto eliminando caracteres innecesarios y convirtiendo a minúsculas
    const text = durationText
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ") // normalizar espacios
      .replace(/^([0-9]+)$/, "$1 minutos"); // Si solo hay un número, asumimos minutos

    // Patrones para rangos de tiempo (1-2 horas, 30-45 minutos)
    const rangeHoursMatch = text.match(
      /(\d+[\s-]+\d+)\s*(h|hr|hrs|hora|horas)/i
    );
    const rangeMinutesMatch = text.match(
      /(\d+[\s-]+\d+)\s*(m|min|mins|minuto|minutos)/i
    );

    // Patrones para tiempos específicos
    const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hora|horas)/i);
    const minsMatch = text.match(/(\d+)\s*(m|min|mins|minuto|minutos)/i);
    const secsMatch = text.match(/(\d+)\s*(s|sec|seg|segundo|segundos)/i);

    // Patrones de tiempo compuestos (2h 30min, 2:30h, 2h30)
    const compositeMatch = text.match(/(\d+)\s*h\w*\s*(?:y\s*)?(\d+)\s*m/i);
    const timeFormatMatch = text.match(/(\d+):(\d+)\s*(?:h|hora|horas)?/i);
    const shortCompositeMatch = text.match(/(\d+)h(\d+)/i);

    let totalMinutes = 0;

    // Procesar rangos de tiempo - usamos el valor promedio
    if (rangeHoursMatch) {
      // Extraer los dos valores del rango
      const rangeParts = rangeHoursMatch[1].split(/[\s-]+/).map(Number);
      if (rangeParts.length >= 2) {
        const startHours = rangeParts[0];
        const endHours = rangeParts[1];
        totalMinutes = ((startHours + endHours) / 2) * 60;
      }
    } else if (rangeMinutesMatch) {
      // Extraer los dos valores del rango
      const rangeParts = rangeMinutesMatch[1].split(/[\s-]+/).map(Number);
      if (rangeParts.length >= 2) {
        const startMinutes = rangeParts[0];
        const endMinutes = rangeParts[1];
        totalMinutes = (startMinutes + endMinutes) / 2;
        console.log(
          `  Rango de minutos: ${startMinutes}-${endMinutes} minutos ≈ ${totalMinutes} minutos`
        );
      }
    }
    // Proceso de formatos de tiempo compuestos
    else if (compositeMatch) {
      const hours = parseInt(compositeMatch[1]);
      const minutes = parseInt(compositeMatch[2]);
      totalMinutes = hours * 60 + minutes;
      console.log(
        `  Tiempo compuesto: ${hours}h ${minutes}m = ${totalMinutes} minutos`
      );
    } else if (timeFormatMatch) {
      const hours = parseInt(timeFormatMatch[1]);
      const minutes = parseInt(timeFormatMatch[2]);
      totalMinutes = hours * 60 + minutes;
      console.log(
        `  Formato HH:MM: ${hours}:${minutes} = ${totalMinutes} minutos`
      );
    } else if (shortCompositeMatch) {
      const hours = parseInt(shortCompositeMatch[1]);
      const minutes = parseInt(shortCompositeMatch[2]);
      totalMinutes = hours * 60 + minutes;
      console.log(
        `  Formato corto: ${hours}h${minutes} = ${totalMinutes} minutos`
      );
    }
    // Proceso normal de tiempo
    else {
      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1]);
        totalMinutes += hours * 60;
        console.log(`  Horas: ${hours} = ${hours * 60} minutos`);
      }

      if (minsMatch) {
        const minutes = parseInt(minsMatch[1]);
        totalMinutes += minutes;
        `  Minutos: ${minutes}`;
      }

      if (secsMatch) {
        const seconds = parseInt(secsMatch[1]);
        totalMinutes += seconds / 60;
        `  Segundos: ${seconds} = ${seconds / 60} minutos`;
      }
    }

    // Patrones de tiempo verbales (dos horas y media)
    if (totalMinutes === 0) {
      if (text.includes("media hora")) {
        totalMinutes = 30;
        console.log("  Expresión verbal: media hora = 30 minutos");
      } else if (
        text.includes("un cuarto de hora") ||
        text.includes("cuarto de hora")
      ) {
        totalMinutes = 15;
        ("  Expresión verbal: cuarto de hora = 15 minutos");
      } else if (text.includes("tres cuartos de hora")) {
        totalMinutes = 45;
        ("  Expresión verbal: tres cuartos de hora = 45 minutos");
      } else if (text.includes("hora y media")) {
        totalMinutes = 90;
        console.log("  Expresión verbal: hora y media = 90 minutos");
      } else if (text.includes("dos horas y media")) {
        totalMinutes = 150;
        ("  Expresión verbal: dos horas y media = 150 minutos");
      }

      // Detectar números escritos como palabras
      const wordNumbers = {
        una: 1,
        un: 1,
        dos: 2,
        tres: 3,
        cuatro: 4,
        cinco: 5,
        seis: 6,
        siete: 7,
        ocho: 8,
        nueve: 9,
        diez: 10,
        once: 11,
        doce: 12,
      };

      for (const [word, value] of Object.entries(wordNumbers)) {
        if (
          text.includes(`${word} hora`) &&
          !text.includes(`${word} horas y`)
        ) {
          totalMinutes += value * 60;
          console.log(
            `  Número verbal: ${word} hora(s) = ${value * 60} minutos`
          );
        }
        if (text.includes(`${word} minuto`)) {
          totalMinutes += value;
          console.log(`  Número verbal: ${word} minuto(s) = ${value} minutos`);
        }
      }
    }

    // Si no se encontró ningún patrón pero hay un número solo, intentamos determinarlo inteligentemente
    if (totalMinutes === 0) {
      // Primero verificamos si es un número solo
      const soloNumero = text.match(/^(\d+)$/);
      if (soloNumero) {
        const num = parseInt(soloNumero[1]);
        // Determinar automáticamente:
        // - Números <= 12 son probablemente horas
        // - Números > 12 y <= 120 pueden ser minutos o un tiempo en notación decimal (1.5h)
        // - Números > 120 son casi seguro minutos
        if (num <= 12) {
          totalMinutes = num * 60;
          console.log(
            `  Número solo (como horas): ${num} = ${totalMinutes} minutos`
          );
        } else if (num <= 120) {
          // Si es un múltiplo común de 15 o 30, probablemente son minutos
          if (num % 15 === 0 || num % 30 === 0) {
            totalMinutes = num;
            console.log(`  Número solo (como minutos): ${num} minutos`);
          } else {
            // Si no, podría ser una notación de tiempo decimal como 1.5 horas
            totalMinutes = num * 60;
            console.log(
              `  Número solo (como horas): ${num} = ${totalMinutes} minutos`
            );
          }
        } else {
          totalMinutes = num;
          console.log(`  Número grande (como minutos): ${num} minutos`);
        }
      }

      // Buscar cualquier número en el texto
      if (totalMinutes === 0) {
        const justNumber = text.match(/(\d+(?:\.\d+)?)/);
        if (justNumber) {
          const num = parseFloat(justNumber[1]);
          // Si el número está precedido o seguido por "hora" o "minuto", respetamos eso
          if (text.includes("hora") || text.includes("hr")) {
            totalMinutes = num * 60;
            console.log(
              `  Número en contexto de horas: ${num} = ${totalMinutes} minutos`
            );
          } else if (text.includes("minuto") || text.includes("min")) {
            totalMinutes = num;
            console.log(`  Número en contexto de minutos: ${num} minutos`);
          }
          // Si no hay contexto, usamos la misma lógica de determinación
          else if (num <= 12) {
            totalMinutes = num * 60;
            console.log(
              `  Número sin contexto (como horas): ${num} = ${totalMinutes} minutos`
            );
          } else {
            totalMinutes = num;
            console.log(`  Número sin contexto (como minutos): ${num} minutos`);
          }
        }
      }
    }

    if (totalMinutes > 0) {
      `  Resultado final: ${totalMinutes} minutos`;
    } else {
      ("  No se pudo determinar la duración");
    }

    return totalMinutes;
  };

  // Convertir los patrones de texto del archivo JSON a objetos RegExp
  const convertPatternsToRegExp = (patternsData) => {
    const result = {};
    for (const [key, patterns] of Object.entries(patternsData)) {
      result[key] = patterns.map((pattern) => new RegExp(pattern, "i"));
    }
    return result;
  };

  // Función para calcular puntuación de relevancia de una ruta para una búsqueda
  const calculateRelevanceScore = (route, query) => {
    if (!query.trim()) return 0;

    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery
      .split(/\s+/)
      .filter((term) => term.length > 1);

    // Inicialización de puntajes
    let score = 0;

    // Inicializar objeto para detalles del puntaje (útil para debugging)
    const scoreDetails = {
      totalScore: 0,
      condicionDetectada: null,
      duracionPuntos: 0,
      nombrePuntos: 0,
      descripcionPuntos: 0,
      dificultadPuntos: 0,
      actividadPuntos: 0,
      caracteristica: false,
    };

    // Factores eliminatorios

    // 1. Solo considerar rutas activas
    if (route.estado && route.estado.toLowerCase() !== "activa") {
      return 0;
    }

    // Usar los patrones importados del archivo JSON
    const condicionPatterns = convertPatternsToRegExp(conditionPatternsData);

    // Verificar si la búsqueda contiene algún patrón de condición física
    let tipoRutaRecomendada = null;
    let intensidadRecomendacion = 0;

    // Buscar patrones de condición física
    for (const [tipo, patrones] of Object.entries(condicionPatterns)) {
      for (const patron of patrones) {
        if (patron.test(normalizedQuery)) {
          tipoRutaRecomendada = tipo;
          intensidadRecomendacion = 100; // Alta confianza cuando hay mención explícita
          `Detectada condición física para ${tipo}: ${
            normalizedQuery.match(patron)[0]
          }`;
          break;
        }
      }
      if (tipoRutaRecomendada) break;
    }

    // Ajustar puntuación basada en la recomendación detectada
    if (tipoRutaRecomendada && route.dificultad) {
      const dificultadRuta = route.dificultad.toLowerCase();

      if (
        tipoRutaRecomendada === "rutasFaciles" &&
        (dificultadRuta === "facil" || dificultadRuta === "fácil")
      ) {
        score += intensidadRecomendacion;
      } else if (
        tipoRutaRecomendada === "rutasModeradamente" &&
        dificultadRuta === "moderada"
      ) {
        score += intensidadRecomendacion;
      } else if (
        tipoRutaRecomendada === "rutasDificiles" &&
        (dificultadRuta === "desafiante" ||
          dificultadRuta === "difícil" ||
          dificultadRuta === "dificil")
      ) {
        score += intensidadRecomendacion;
      }
    }

    // Análisis de intención
    const duracionPattern =
      /(\d+[-\s]+\d+\s+horas?|[<>]\s*\d+\s+horas?|\d+\s*h|\bhoras?\b|\btiempo\b|\bduración\b|\bdemorar\b)/i;
    const actividadPattern =
      /\b(cabalgata|caminata|senderismo|trekking|hiking|caballo|caballos|caminar|excursión|paseo)\b/i;
    const dificultadPattern =
      /\b(fácil|facil|moderada|difícil|dificil|desafiante|extrema|intensa|sencilla|complicada|principiante|avanzada)\b/i;
    const miradorPattern =
      /\b(mirador|vista|vistas|panorama|panorámica|paisaje)\b/i;
    const especificosPattern =
      /\b(río|rio|ríos|rios|cascada|valle|montaña|montana|cóndor|condor|virgen|palma|cera|estatua)\b/i;

    // Detectar intenciones específicas
    const quiereDuracion =
      duracionPattern.test(normalizedQuery) || isTimeSearch(normalizedQuery);
    const quiereActividad = actividadPattern.test(normalizedQuery);
    const quiereDificultad =
      dificultadPattern.test(normalizedQuery) || tipoRutaRecomendada !== null;
    const quiereMirador = miradorPattern.test(normalizedQuery);
    const quiereCaracteristica = especificosPattern.test(normalizedQuery);

    // ¡NUEVO! - Detector específico para consultas que buscan rutas de 60 minutos
    const esConsultaHora =
      /\b(una|1)\s+(hora)\b|\b(sesenta|60)\s+(minutos|min|mins)\b|\bruta\s+de\s+(una|1)\s+hora\b|\bruta\s+de\s+(sesenta|60)\s+minutos\b|\brecorrido\s+de\s+(una|1)\s+hora\b|\bdure\s+(una|1)\s+hora\b|\bdure\s+(sesenta|60)\s+minutos\b/i.test(
        normalizedQuery
      );

    // ¡NUEVO! - Detector para búsquedas de tiempo cercano a 1 hora (20-50 minutos)
    const tiempoMinutosRegex =
      /\b(20|veinte|25|veinticinco|30|treinta|35|treinta\s+y\s+cinco|40|cuarenta|45|cuarenta\s+y\s+cinco|50|cincuenta)\s+(minutos|min|mins)\b/i;
    const mediaHoraRegex = /\bmedia\s+hora\b/i;
    const cuartoHoraRegex = /\bcuarto\s+de\s+hora\b/i;

    const tiempoMinutosMatch = normalizedQuery.match(tiempoMinutosRegex);
    const esMediaHora = mediaHoraRegex.test(normalizedQuery);
    const esCuartoHora = cuartoHoraRegex.test(normalizedQuery);

    // Determinar si es una búsqueda de tiempo cercano a una hora (20-50 minutos)
    const esTiempoCercanoHora =
      tiempoMinutosMatch || esMediaHora || esCuartoHora;

    // Extraer el tiempo solicitado para registrarlo
    let tiempoSolicitado = "";
    if (tiempoMinutosMatch) {
      tiempoSolicitado = tiempoMinutosMatch[0];
    } else if (esMediaHora) {
      tiempoSolicitado = "media hora";
    } else if (esCuartoHora) {
      tiempoSolicitado = "cuarto de hora";
    }

    // Tratar cualquier consulta de tiempo entre 20-50 minutos como una búsqueda de 60 minutos
    const tratarComoConsultaHora = esConsultaHora || esTiempoCercanoHora;

    // ¡MODIFICADO! - Añadir puntuación específica para rutas de ~60 minutos
    if (tratarComoConsultaHora && route.duracion) {
      const duracionMinutos = convertToMinutes(route.duracion);

      // Calcular qué tan cerca está de 60 minutos
      // 30-45 minutos: puntuación moderada
      // 45-75 minutos: puntuación alta (ideal)
      // 75-90 minutos: puntuación moderada
      if (duracionMinutos >= 45 && duracionMinutos <= 75) {
        score += 200; // Bonificación alta para coincidencia ideal
        scoreDetails.duracionPuntos += 200;
        console.log(
          `¡Coincidencia ideal de 60 minutos! Ruta ${route.nombreRuta} (${duracionMinutos} min): +200 puntos`
        );
      } else if (
        (duracionMinutos >= 30 && duracionMinutos < 45) ||
        (duracionMinutos > 75 && duracionMinutos <= 90)
      ) {
        score += 100; // Bonificación moderada para coincidencia cercana
        scoreDetails.duracionPuntos += 100;
        console.log(
          `Coincidencia cercana a 60 minutos. Ruta ${route.nombreRuta} (${duracionMinutos} min): +100 puntos`
        );
      }
    }

    // Lista de palabras clave comunes para autocompletado
    const commonKeywords = commonKeywordsData;

    // Buscar posibles autocompletados para los términos parciales
    const expandedTerms = [];
    queryTerms.forEach((term) => {
      // Añadir el término original
      expandedTerms.push(term);

      // Si el término es corto (posible prefijo), expandirlo
      if (term.length >= 2 && term.length <= 4) {
        const possibleCompletions = commonKeywords[term.toLowerCase()];
        if (possibleCompletions) {
          expandedTerms.push(...possibleCompletions);
        }
      }

      // También buscar si alguna palabra clave común comienza con ese prefijo
      for (const [prefix, completions] of Object.entries(commonKeywords)) {
        if (
          prefix.startsWith(term) ||
          completions.some((c) => c.startsWith(term))
        ) {
          expandedTerms.push(...completions);
        }
      }
    });

    // Eliminar duplicados de términos expandidos
    const uniqueExpandedTerms = [...new Set(expandedTerms)];

    // Coincidencia con nombre (mayor prioridad)
    if (route.nombreRuta) {
      const routeName = route.nombreRuta.toLowerCase();

      // Coincidencia exacta
      if (routeName === normalizedQuery) {
        score += 100;
      }
      // Coincidencia parcial
      else if (routeName.includes(normalizedQuery)) {
        score += 50;
      }
      // Coincidencia de palabras clave en el nombre
      else {
        uniqueExpandedTerms.forEach((term) => {
          if (term.length > 2 && routeName.includes(term)) {
            score += 15;
          }
        });
      }
    }

    // Coincidencia con duración
    if (quiereDuracion) {
      // Calcular el tiempo de la consulta
      const queryTime = convertToMinutes(normalizedQuery);

      // Obtener el tiempo de la ruta
      let routeTime = route.durationInMinutes;

      // Si la ruta no tiene durationInMinutes pero tiene duracion como string, convertirlo
      if (!routeTime && route.duracion) {
        routeTime = convertToMinutes(route.duracion);
      }

      console.log(
        `Comparando tiempos: "${normalizedQuery}" (${queryTime}min) vs "${route.nombreRuta}" (${routeTime}min)`
      );

      if (queryTime > 0 && routeTime > 0) {
        // Variables para ajustar la puntuación final
        let timeScore = 0;
        let scoreExplanation = "";

        // 1. Detectar consultas de rango o comparación
        const menosDeMatch = normalizedQuery.match(
          /menos\s+de\s+(\d+)|<\s*(\d+)|menor\s+(?:a|que)\s+(\d+)/i
        );
        const masDeMatch = normalizedQuery.match(
          /más\s+de\s+(\d+)|>\s*(\d+)|mayor\s+(?:a|que)\s+(\d+)/i
        );

        if (menosDeMatch) {
          // Extraer el valor numérico de la comparación
          const matchValue =
            menosDeMatch[1] || menosDeMatch[2] || menosDeMatch[3];

          // Determinar si son horas o minutos basado en:
          // 1. Si hay una unidad explícita en el texto
          // 2. Si no hay unidad, usar la magnitud del número (≤12 probablemente son horas)
          const unidadExplicita = normalizedQuery.match(
            /\b(hora|horas|minuto|minutos|min)\b/i
          );
          const esHoras = unidadExplicita
            ? /hora/i.test(unidadExplicita[0])
            : parseInt(matchValue) <= 12;

          // Convertir el límite a minutos
          const limitTime = parseInt(matchValue) * (esHoras ? 60 : 1);

          if (routeTime < limitTime) {
            // La puntuación depende de qué tan cerca está al límite
            // - Si está muy por debajo del límite: puntuación alta
            // - Si está cerca del límite: puntuación media
            const ratio = routeTime / limitTime;
            timeScore = Math.max(50, Math.round(100 - ratio * 50)); // Mínimo 50, máximo 100

            scoreExplanation = `Menos de ${matchValue} ${
              esHoras ? "horas" : "minutos"
            } ✓ (${Math.round(ratio * 100)}% del límite)`;
          } else {
            // Si excede el límite, asignar una puntuación baja pero no cero
            // cuanto más exceda, menor puntuación
            const exceso = Math.min(1, (routeTime - limitTime) / limitTime);
            timeScore = Math.max(0, Math.round(40 - exceso * 40)); // Máximo 40, mínimo 0

            scoreExplanation = `Menos de ${matchValue} ${
              esHoras ? "horas" : "minutos"
            } ✗ (${Math.round((routeTime / limitTime) * 100)}% del límite)`;
          }
        } else if (masDeMatch) {
          // Extraer el valor numérico de la comparación
          const matchValue = masDeMatch[1] || masDeMatch[2] || masDeMatch[3];

          // Determinar si son horas o minutos
          const unidadExplicita = normalizedQuery.match(
            /\b(hora|horas|minuto|minutos|min)\b/i
          );
          const esHoras = unidadExplicita
            ? /hora/i.test(unidadExplicita[0])
            : parseInt(matchValue) <= 12;

          // Convertir el límite a minutos
          const limitTime = parseInt(matchValue) * (esHoras ? 60 : 1);

          if (routeTime > limitTime) {
            // La puntuación depende de qué tan por encima está del límite
            // - Si está justo por encima: puntuación alta
            // - Si está muy por encima: puntuación media (para evitar excesos)
            const ratio = Math.min(2, routeTime / limitTime); // Máximo 2x
            timeScore = Math.max(50, Math.round(100 - (ratio - 1) * 50)); // Mínimo 50, máximo 100

            scoreExplanation = `Más de ${matchValue} ${
              esHoras ? "horas" : "minutos"
            } ✓ (${Math.round(ratio * 100)}% del límite)`;
          } else {
            // Si está por debajo del límite, asignar una puntuación baja pero no cero
            const deficit = Math.min(1, (limitTime - routeTime) / limitTime);
            timeScore = Math.max(0, Math.round(40 - deficit * 40)); // Máximo 40, mínimo 0

            scoreExplanation = `Más de ${matchValue} ${
              esHoras ? "horas" : "minutos"
            } ✗ (${Math.round((routeTime / limitTime) * 100)}% del límite)`;
          }
        }
        // 2. Coincidencia aproximada con tiempo específico
        else {
          // Diferentes tolerancias basadas en la duración de la consulta
          let maxAcceptableDiff;

          if (queryTime <= 60) {
            // Hasta 1 hora
            maxAcceptableDiff = Math.max(15, queryTime * 0.25); // Al menos 15min o 25%
          } else if (queryTime <= 180) {
            // 1-3 horas
            maxAcceptableDiff = Math.max(20, queryTime * 0.2); // Al menos 20min o 20%
          } else {
            // >3 horas
            maxAcceptableDiff = Math.max(30, queryTime * 0.25); // Al menos 30min o 25%
          }

          const timeDiff = Math.abs(routeTime - queryTime);
          const diffPercentage = (timeDiff / queryTime) * 100;

          if (timeDiff <= maxAcceptableDiff) {
            // Calcular puntuación: 100 para coincidencia exacta, disminuyendo linealmente
            // hasta 40 en el límite de la diferencia aceptable
            const accuracy = 1 - timeDiff / maxAcceptableDiff;
            timeScore = Math.round(40 + accuracy * 60); // Escala de 40-100

            scoreExplanation = `Cerca de ${Math.round(
              queryTime
            )} minutos ✓ (±${Math.round(diffPercentage)}%, diff=${Math.round(
              timeDiff
            )}min)`;
          } else {
            // Fuera del rango aceptable, pero aún así podría ser relevante
            // Puntuación inversamente proporcional a qué tan lejos está
            const exceso = Math.min(
              1,
              (timeDiff - maxAcceptableDiff) / (maxAcceptableDiff * 2)
            );
            timeScore = Math.max(0, Math.round(40 - exceso * 40)); // Escala de 0-40

            scoreExplanation = `Lejos de ${Math.round(
              queryTime
            )} minutos ↓ (±${Math.round(diffPercentage)}%, diff=${Math.round(
              timeDiff
            )}min)`;
          }
        }

        // 3. Aplicar la puntuación al score total
        if (timeScore > 0) {
          score += timeScore;
          console.log(
            `  Puntuación de tiempo para "${route.nombreRuta}": ${timeScore} - ${scoreExplanation}`
          );
        }
      } else {
        // 4. Búsqueda de duración cualitativa usando términos expandidos
        const shortTimeTerms = [
          "corta",
          "corto",
          "breve",
          "rápida",
          "rapida",
          "rápido",
          "rapido",
          "express",
        ];
        const mediumTimeTerms = [
          "media",
          "medio",
          "moderada",
          "moderado",
          "regular",
          "estándar",
          "estandar",
        ];
        const longTimeTerms = [
          "larga",
          "largo",
          "extensa",
          "extenso",
          "completa",
          "completo",
          "prolongada",
          "prolongado",
          "duradera",
        ];

        // Ver qué términos cualitativos aparecen en la consulta o los términos expandidos
        const hayCortaQuery =
          uniqueExpandedTerms.some((t) => shortTimeTerms.includes(t)) ||
          shortTimeTerms.some((t) => normalizedQuery.includes(t));

        const hayMediaQuery =
          uniqueExpandedTerms.some((t) => mediumTimeTerms.includes(t)) ||
          mediumTimeTerms.some((t) => normalizedQuery.includes(t));

        const hayLargaQuery =
          uniqueExpandedTerms.some((t) => longTimeTerms.includes(t)) ||
          longTimeTerms.some((t) => normalizedQuery.includes(t));

        // Ver en qué categoría cae la ruta
        const esRutaCorta = routeTime > 0 && routeTime <= 120; // <= 2 horas
        const esRutaMedia = routeTime > 120 && routeTime <= 240; // 2-4 horas
        const esRutaLarga = routeTime > 240; // > 4 horas

        let timeScore = 0;
        let scoreExplanation = "";

        // Asignar puntuación según la coincidencia
        if (hayCortaQuery && esRutaCorta) {
          timeScore = 80;
          scoreExplanation = "Ruta corta ✓";
        } else if (hayMediaQuery && esRutaMedia) {
          timeScore = 80;
          scoreExplanation = "Ruta media ✓";
        } else if (hayLargaQuery && esRutaLarga) {
          timeScore = 80;
          scoreExplanation = "Ruta larga ✓";
        }
        // Coincidencias cercanas (ej: buscó corta pero es media-baja)
        else if (hayCortaQuery && esRutaMedia && routeTime <= 180) {
          timeScore = 40;
          scoreExplanation = "Ruta corta ~ media-baja";
        } else if (hayMediaQuery && esRutaCorta && routeTime >= 90) {
          timeScore = 40;
          scoreExplanation = "Ruta media ~ corta-alta";
        } else if (hayMediaQuery && esRutaLarga && routeTime <= 300) {
          timeScore = 40;
          scoreExplanation = "Ruta media ~ larga-baja";
        } else if (hayLargaQuery && esRutaMedia && routeTime >= 180) {
          timeScore = 40;
          scoreExplanation = "Ruta larga ~ media-alta";
        }

        if (timeScore > 0) {
          score += timeScore;
          console.log(
            `  Puntuación cualitativa de tiempo para "${route.nombreRuta}": ${timeScore} - ${scoreExplanation}`
          );
        }
      }
    }

    // Coincidencia con dificultad usando términos expandidos
    if (route.dificultad) {
      const dificultadRuta = route.dificultad.toLowerCase();

      // Mapeo de sinónimos de dificultad
      const mapaDificultad = {
        facil: [
          "fácil",
          "facil",
          "sencilla",
          "principiante",
          "suave",
          "tranquila",
          "básica",
          "simple",
        ],
        moderada: [
          "moderada",
          "media",
          "intermedia",
          "regular",
          "normal",
          "estándar",
          "estandar",
        ],
        desafiante: [
          "desafiante",
          "difícil",
          "dificil",
          "complicada",
          "intensa",
          "exigente",
          "dura",
          "avanzada",
          "compleja",
        ],
      };

      // Buscar si alguno de los términos expandidos coincide con la dificultad
      for (const [nivel, sinonimos] of Object.entries(mapaDificultad)) {
        if (
          uniqueExpandedTerms.some(
            (term) =>
              sinonimos.includes(term) ||
              sinonimos.some((s) => s.startsWith(term) && term.length >= 3)
          )
        ) {
          // Normalizar la dificultad de la ruta
          let dificultadNormalizada = dificultadRuta;

          for (const [n, s] of Object.entries(mapaDificultad)) {
            if (s.includes(dificultadRuta)) {
              dificultadNormalizada = n;
              break;
            }
          }

          // Coincidencia exacta de dificultad
          if (nivel === dificultadNormalizada) {
            score += 80;
            break;
          }
        }
      }
    }

    // Coincidencia con tipo de actividad usando términos expandidos
    if (route.tipoActividad) {
      const routeActividad = route.tipoActividad.toLowerCase();

      // Términos de cabalgata y sus prefijos
      const cabalgataTerms = ["cabalgata", "caballo", "caballos", "cab"];
      // Términos de caminata y sus prefijos
      const caminataTerms = [
        "caminata",
        "senderismo",
        "caminar",
        "trekking",
        "hiking",
        "cam",
        "sen",
      ];

      // Quiere cabalgata
      if (
        uniqueExpandedTerms.some(
          (t) =>
            cabalgataTerms.includes(t) ||
            cabalgataTerms.some((c) => c.startsWith(t) && t.length >= 2)
        )
      ) {
        if (
          routeActividad.includes("cabalgata") ||
          routeActividad.includes("caballo")
        ) {
          score += 70;
        }
      }

      // Quiere caminata
      if (
        uniqueExpandedTerms.some(
          (t) =>
            caminataTerms.includes(t) ||
            caminataTerms.some((c) => c.startsWith(t) && t.length >= 2)
        )
      ) {
        if (
          routeActividad.includes("caminata") ||
          routeActividad.includes("senderismo")
        ) {
          score += 70;
        }
      }
    }

    // Coincidencia con atractivos específicos usando términos expandidos
    if (route.nombreRuta) {
      const routeName = route.nombreRuta.toLowerCase();
      const routeDesc = (route.descripcion || "").toLowerCase();

      // Mapeo de características específicas
      const caracteristicas = [
        {
          terms: ["mirador", "mir", "vista", "vist", "panorámica", "pan"],
          fields: [routeName],
          contains: ["mirador"],
        },
        {
          terms: ["río", "rio", "ríos", "rios", "agua"],
          fields: [routeName, routeDesc],
          contains: ["río", "rio", "ríos", "rios"],
        },
        { terms: ["valle", "val"], fields: [routeDesc], contains: ["valle"] },
        {
          terms: ["cóndor", "condor", "con", "ave", "aves", "pájaro", "pajaro"],
          fields: [routeName, routeDesc],
          contains: ["cóndor", "condor"],
        },
        {
          terms: ["virgen", "vir", "maría", "maria", "estatua", "monumento"],
          fields: [routeName, routeDesc],
          contains: ["virgen", "estatua", "maría", "maria"],
        },
        {
          terms: ["palma", "palmas", "pal", "cera"],
          fields: [routeName, routeDesc],
          contains: ["palma", "palmas", "cera"],
        },
        {
          terms: ["casa", "cas", "esperanza", "esp"],
          fields: [routeName],
          contains: ["casa", "esperanza"],
        },
        { terms: ["peña", "peñ"], fields: [routeName], contains: ["peña"] },
        {
          terms: ["planchon", "pla"],
          fields: [routeName],
          contains: ["planchon"],
        },
      ];

      for (const { terms, fields, contains } of caracteristicas) {
        // Si alguno de los términos expandidos coincide con esta característica
        if (
          uniqueExpandedTerms.some(
            (t) =>
              terms.includes(t) ||
              terms.some((term) => term.startsWith(t) && t.length >= 2)
          )
        ) {
          // Buscar en los campos especificados
          if (fields.some((field) => contains.some((c) => field.includes(c)))) {
            score += 60;

            // Bonificación si la característica está en el nombre
            if (contains.some((c) => routeName.includes(c))) {
              score += 20;
            }
          }
        }
      }
    }

    // Análisis de términos individuales en palabras clave
    uniqueExpandedTerms.forEach((term) => {
      if (term.length < 2) return; // Ignorar términos muy cortos

      // Buscar coincidencias en palabras clave
      route.keywords.forEach((keyword) => {
        if (keyword === term) {
          score += 8;
        } else if (keyword.includes(term) && term.length > 2) {
          score += 5;
        } else if (term.includes(keyword) && keyword.length > 2) {
          score += 3;
        }
        // Fuzzy matching - coincidir prefijos
        else if (keyword.startsWith(term) && term.length >= 2) {
          // Puntaje proporcional a la longitud del prefijo
          const matchRatio = term.length / keyword.length;
          score += Math.min(6, matchRatio * 8);
        }
      });
    });

    // Ajuste por calificación de la ruta (para desempatar)
    if (route.calificacion) {
      score += Math.min(10, route.calificacion * 2); // Máx 10 puntos adicionales
    }

    // Actualizar el objeto scoreDetails con los valores acumulados
    scoreDetails.totalScore = score;
    scoreDetails.tiempoSolicitado = tiempoSolicitado; // Añadir el tiempo solicitado a los detalles

    // Guardar desglose de puntuación para depuración
    route.scoreDetails = {
      query: normalizedQuery,
      expandedTerms: uniqueExpandedTerms,
      condicionDetectada: tipoRutaRecomendada,
      score,
      duracionPuntos: scoreDetails.duracionPuntos, // Añadir detalle de puntos por duración
      esConsultaHora: esConsultaHora, // Indicar si se detectó búsqueda de 60 minutos
      esTiempoCercanoHora: esTiempoCercanoHora, // Indicar si se detectó búsqueda de tiempo cercano
      tiempoSolicitado: tiempoSolicitado, // Añadir el tiempo solicitado originalmente
      intenciones: {
        duracion: quiereDuracion,
        actividad: quiereActividad,
        dificultad: quiereDificultad,
        mirador: quiereMirador,
        caracteristica: quiereCaracteristica,
      },
    };

    return score;
  };

  // Detecta si la búsqueda es relacionada con tiempo con mejor detección
  const isTimeSearch = (query) => {
    if (!query || typeof query !== "string") return false;

    // Normalizar la consulta
    const queryLower = query.toLowerCase().trim();
    `Analizando si es búsqueda de tiempo: "${queryLower}"`;

    // 1. Formatos de tiempo explícitos
    const explicitTimePatterns = timePatternsData.map(
      (pattern) => new RegExp(pattern, "i")
    );

    for (const pattern of explicitTimePatterns) {
      if (pattern.test(queryLower)) {
        console.log(`  Coincide con formato de tiempo explícito: ${pattern}`);
        return true;
      }
    }

    // 2. Patrones de comparación de tiempo
    const comparisonPatterns = [
      /\bmenos\s+de\s+(\d+)\b/i,
      /\bmás\s+de\s+(\d+)\b/i,
      /\bmayor\s+(?:a|que)\s+(\d+)\b/i,
      /\bmenor\s+(?:a|que)\s+(\d+)\b/i,
      /\b<\s*(\d+)\b/,
      /\b>\s*(\d+)\b/,
    ];

    for (const pattern of comparisonPatterns) {
      const match = queryLower.match(pattern);
      if (match) {
        const num = parseInt(match[1]);
        const hasTimeUnit =
          /\b(h|hr|hrs|hora|horas|m|min|mins|minuto|minutos)\b/i.test(
            queryLower
          );

        // Si tiene unidad de tiempo o es un número razonable para tiempo, lo consideramos búsqueda de tiempo
        if (hasTimeUnit || (num > 0 && num <= 240)) {
          console.log(`  Coincide con patrón de comparación: ${pattern}`);
          return true;
        }
      }
    }

    // 3. Palabras clave de duración
    const durationKeywordsPattern =
      /\b(tiempo|duración|durar|tarda|demora|duration|durante|duracion)\b/i;
    if (durationKeywordsPattern.test(queryLower)) {
      console.log(`  Contiene palabra clave de duración`);
      return true;
    }

    // 4. Descriptores cualitativos de tiempo
    const qualitativeTimePattern =
      /\b(corta|corto|larga|largo|breve|extensa|extenso|rápida|rapida|rápido|rapido|express|media|mediana|extendida|completa|completo)\b/i;
    if (
      qualitativeTimePattern.test(queryLower) &&
      /\b(ruta|camino|recorrido|caminata|duración|tiempo)\b/i.test(queryLower)
    ) {
      console.log(`  Contiene descriptor cualitativo de tiempo con contexto`);
      return true;
    }

    // 5. Expresiones verbales de tiempo
    const verbalTimePatterns = [
      /\bmedia\s+hora\b/i,
      /\bcuarto\s+de\s+hora\b/i,
      /\btres\s+cuartos\s+de\s+hora\b/i,
      /\bhora\s+y\s+media\b/i,
      /\b(una|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\s+(hora|horas)\b/i,
      /\b(una|un|dos|tres|cuatro|cinco|diez|quince|veinte|treinta|cuarenta|cincuenta)\s+(minuto|minutos)\b/i,
    ];

    for (const pattern of verbalTimePatterns) {
      if (pattern.test(queryLower)) {
        console.log(`  Coincide con expresión verbal de tiempo: ${pattern}`);
        return true;
      }
    }

    // 6. Búsqueda de solo números (60, 90, 2, etc.)
    const soloNumero = queryLower.match(/^(\d+)$/);
    if (soloNumero) {
      const num = parseInt(soloNumero[1]);
      // Filtrar para números relevantes a tiempo
      // - 1-24 (posibles horas)
      // - 30, 45, 60, 90, etc. (posibles minutos o medidas de tiempo)
      if (
        (num >= 1 && num <= 24) ||
        (num % 15 === 0 && num <= 180) ||
        (num % 30 === 0 && num <= 360)
      ) {
        console.log(`  Número solo en rango relevante para tiempo: ${num}`);
        return true;
      }
    }

    // 7. Búsqueda genérica que contiene números con posible significado de tiempo
    const timeNumberPattern = /\b([1-9]|1[0-9]|2[0-4])\b/;
    if (
      timeNumberPattern.test(queryLower) &&
      !queryLower.match(
        /\b(km|kilómetro|kilometro|metros|persona|gente|grupo|años|edad)\b/i
      )
    ) {
      // Si el número aparece junto a palabras relacionadas con rutas y no con distancia
      if (/\b(ruta|recorrido|caminata|duración|tiempo)\b/i.test(queryLower)) {
        console.log(`  Número con contexto de tiempo: ${queryLower}`);
        return true;
      }
    }

    // Retornar falso si ninguna condición se cumplió

    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch && onSearch({ query: searchQuery });

    // Verificar si hay texto de búsqueda
    if (!searchQuery.trim()) {
      alert("Por favor, ingresa un término de búsqueda para generar una ruta");
      return;
    }

    // Guardar búsqueda en historial si hay texto
    if (
      searchQuery.trim().length > 2 &&
      !searchHistory.includes(searchQuery.trim())
    ) {
      const newHistory = [searchQuery.trim(), ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }

    // Mostrar el recuadro de IA generando rutas
    setShowAIRouteGenerator(true);
    setGeneratingRoute(true);
    setGeneratedRoute(null);
    setRoutes([]); // Limpiar resultados anteriores

    // Simular el proceso de generación de ruta con IA
    setTimeout(() => {
      setGeneratingRoute(false);

      // Solo usar rutas activas
      let rutasFiltradas = allRoutes.filter(
        (route) => route.estado?.toLowerCase() === "activa"
      );

      // Aplicar filtro de búsqueda si hay texto
      if (searchQuery.trim()) {
        // Calcular puntuación de relevancia para cada ruta
        const scoredRoutes = rutasFiltradas.map((route) => ({
          ...route,
          relevanceScore: calculateRelevanceScore(route, searchQuery),
        }));

        // Detectar si se ha reconocido alguna condición física
        const condicionDetectada =
          scoredRoutes.length > 0
            ? scoredRoutes[0].scoreDetails?.condicionDetectada
            : null;

        // Filtrar rutas con alguna coincidencia
        let matchingRoutes = scoredRoutes.filter(
          (route) => route.relevanceScore > 0
        );

        // ¡NUEVO! - Detector para búsquedas de tiempo cercano a 1 hora (20-50 minutos)
        const tiempoMinutosRegex =
          /\b(20|veinte|25|veinticinco|30|treinta|35|treinta\s+y\s+cinco|40|cuarenta|45|cuarenta\s+y\s+cinco|50|cincuenta)\s+(minutos|min|mins)\b/i;
        const mediaHoraRegex = /\bmedia\s+hora\b/i;
        const cuartoHoraRegex = /\bcuarto\s+de\s+hora\b/i;

        const tiempoMinutosMatch = searchQuery
          .toLowerCase()
          .match(tiempoMinutosRegex);
        const esMediaHora = mediaHoraRegex.test(searchQuery.toLowerCase());
        const esCuartoHora = cuartoHoraRegex.test(searchQuery.toLowerCase());

        // Determinar si es una búsqueda de tiempo cercano a una hora (20-50 minutos)
        const esTiempoCercanoHora =
          tiempoMinutosMatch || esMediaHora || esCuartoHora;

        // Extraer el tiempo solicitado para mencionarlo en el mensaje
        let tiempoSolicitado = "";
        if (tiempoMinutosMatch) {
          tiempoSolicitado = tiempoMinutosMatch[0];
        } else if (esMediaHora) {
          tiempoSolicitado = "media hora";
        } else if (esCuartoHora) {
          tiempoSolicitado = "cuarto de hora";
        }

        // ¡MODIFICADO! - Procesar cualquier búsqueda de tiempo (incluidos 20-50 min) como búsqueda de 60 minutos
        const esConsultaHora =
          /\b(una|1)\s+(hora)\b|\b(sesenta|60)\s+(minutos|min|mins)\b|\bruta\s+de\s+(una|1)\s+hora\b|\bruta\s+de\s+(sesenta|60)\s+minutos\b|\brecorrido\s+de\s+(una|1)\s+hora\b|\bdure\s+(una|1)\s+hora\b|\bdure\s+(sesenta|60)\s+minutos\b/i.test(
            searchQuery.toLowerCase().trim()
          ) || esTiempoCercanoHora;

        if (esConsultaHora && matchingRoutes.length > 0) {
          console.log(
            "Búsqueda de tiempo detectada - aproximando a 60 minutos"
          );

          // Filtrar solo rutas que estén cerca de 60 minutos
          const rutasCercaDe60Min = matchingRoutes.filter((route) => {
            const duracionMinutos = convertToMinutes(route.duracion);
            // Aceptar rutas entre 45-75 minutos (± 15 min de 60)
            return duracionMinutos >= 45 && duracionMinutos <= 75;
          });

          // Si encontramos rutas cerca de 60 minutos, usar solo esas
          if (rutasCercaDe60Min.length > 0) {
            console.log(
              `Encontradas ${rutasCercaDe60Min.length} rutas cercanas a 60 minutos`
            );
            matchingRoutes = rutasCercaDe60Min;
          } else {
            console.log(
              "No se encontraron rutas cercanas a 60 minutos, ampliando rango"
            );
            // Si no hay rutas en el rango ideal, ampliar a 30-90 minutos
            const rutasRangoAmpliado = matchingRoutes.filter((route) => {
              const duracionMinutos = convertToMinutes(route.duracion);
              return duracionMinutos >= 30 && duracionMinutos <= 90;
            });

            if (rutasRangoAmpliado.length > 0) {
              matchingRoutes = rutasRangoAmpliado;
            }
          }
        }

        // Si no hay coincidencias exactas pero la búsqueda es corta (posible prefijo),
        // intentar buscar coincidencias con cualquier puntuación
        if (matchingRoutes.length === 0 && searchQuery.trim().length <= 4) {
          console.log(
            "Búsqueda corta sin coincidencias exactas. Usando coincidencias parciales."
          );

          // Asignar un puntaje mínimo a todas las rutas y ordenarlas por relevancia
          matchingRoutes = rutasFiltradas
            .map((route) => {
              // Calcular una puntuación basada en la coincidencia con prefijos
              let prefixScore = 0;

              // Revisar si el término de búsqueda es un prefijo de alguna palabra clave
              route.keywords.forEach((keyword) => {
                if (keyword.startsWith(searchQuery.toLowerCase().trim())) {
                  prefixScore += 10 * (searchQuery.length / keyword.length);
                }
              });

              // Usar nombre de la ruta para aumentar relevancia
              if (
                route.nombreRuta &&
                route.nombreRuta
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase().trim())
              ) {
                prefixScore += 20;
              }

              // Usar la dificultad como criterio adicional
              if (
                route.dificultad &&
                route.dificultad
                  .toLowerCase()
                  .startsWith(searchQuery.toLowerCase().trim())
              ) {
                prefixScore += 30;
              }

              return {
                ...route,
                relevanceScore: prefixScore,
              };
            })
            .filter((route) => route.relevanceScore > 0);

          // Si encontramos coincidencias parciales, ordenarlas por puntuación
          if (matchingRoutes.length > 0) {
            console.log(
              `Se encontraron ${matchingRoutes.length} coincidencias parciales.`
            );
          }
        }

        // Si encontramos coincidencias (exactas o parciales), procesarlas
        if (matchingRoutes.length > 0) {
          `Se encontraron ${matchingRoutes.length} coincidencias de búsqueda.`;

          // Ordenar por puntuación de relevancia (descendente)
          matchingRoutes.sort((a, b) => b.relevanceScore - a.relevanceScore);

          // Si se está buscando rutas fáciles, asegurarse de mostrar todas las disponibles
          const buscandoRutaFacil =
            searchQuery.toLowerCase().includes("fac") ||
            searchQuery.toLowerCase().includes("fácil") ||
            searchQuery.toLowerCase().includes("facil") ||
            condicionDetectada === "rutasFaciles";

          if (buscandoRutaFacil) {
            // Asignar puntuación adicional a todas las rutas fáciles
            let rutasFaciles = rutasFiltradas.filter(
              (route) =>
                route.dificultad &&
                (route.dificultad.toLowerCase() === "facil" ||
                  route.dificultad.toLowerCase() === "fácil")
            );

            `Encontradas ${rutasFaciles.length} rutas fáciles disponibles:`;
            rutasFaciles.forEach((ruta) => ` - ${ruta.nombreRuta}`);

            // Añadir rutas fáciles que no estaban en los resultados iniciales
            rutasFaciles.forEach((rutaFacil) => {
              if (!matchingRoutes.some((route) => route.id === rutaFacil.id)) {
                matchingRoutes.push({
                  ...rutaFacil,
                  relevanceScore: 50, // Puntuación base para rutas fáciles
                });
              }
            });

            // Reordenar los resultados
            matchingRoutes.sort((a, b) => b.relevanceScore - a.relevanceScore);
          }

          // Seleccionamos la mejor ruta
          let bestRoute;

          if (matchingRoutes.length === 1) {
            // Si solo hay una ruta, usamos esa
            bestRoute = matchingRoutes[0];
            `Solo hay una coincidencia: ${bestRoute.nombreRuta}`;
          } else {
            // Si hay más de una ruta, buscamos cuáles tienen puntuación similar
            // Consideramos como buenas coincidencias aquellas con al menos 85% de la puntuación de la mejor ruta
            const topScore = matchingRoutes[0].relevanceScore;

            // Para búsquedas parciales (prefijos) usamos un umbral más bajo para dar más variedad
            const umbralPorcentaje =
              searchQuery.trim().length <= 4 ? 0.75 : 0.85;
            const scoreThreshold = topScore * umbralPorcentaje;

            // Filtramos las rutas con puntuación por encima del umbral
            const topRoutes = matchingRoutes.filter(
              (route) => route.relevanceScore >= scoreThreshold
            );

            `Se encontraron ${topRoutes.length} rutas de alta coincidencia con puntuación sobre ${scoreThreshold}`;

            // Elegimos una ruta aleatoria entre las mejores
            const randomIndex = Math.floor(Math.random() * topRoutes.length);
            bestRoute = topRoutes[randomIndex];

            `Seleccionada aleatoriamente: ${bestRoute.nombreRuta} (${
              randomIndex + 1
            } de ${topRoutes.length} mejores rutas)`;
          }

          "Mejor ruta encontrada:",
            bestRoute.nombreRuta,
            "con puntuación:",
            bestRoute.relevanceScore;

          // Elegir la mejor ruta generada
          if (matchingRoutes.length > 0) {
            // Determinar la mejor ruta basada en la puntuación y variación
            let bestRoute;

            // Primera opción: ruta con la puntuación más alta
            if (matchingRoutes.length === 1) {
              bestRoute = matchingRoutes[0];
              `Solo hay una ruta coincidente: ${bestRoute.nombreRuta}`;
            } else {
              // Si hay más de una ruta, buscamos cuáles tienen puntuación similar
              // Consideramos como buenas coincidencias aquellas con al menos 85%
              // de la puntuación de la mejor ruta
              const topScore = matchingRoutes[0].relevanceScore;
              const scoreThreshold = topScore * 0.85;

              // Filtramos las rutas con puntuación por encima del umbral
              const topRoutes = matchingRoutes.filter(
                (route) => route.relevanceScore >= scoreThreshold
              );

              `Se encontraron ${topRoutes.length} rutas de alta coincidencia con puntuación sobre ${scoreThreshold}`;

              // Elegimos una ruta aleatoria entre las mejores
              const randomIndex = Math.floor(Math.random() * topRoutes.length);
              bestRoute = topRoutes[randomIndex];
            }

            // Sugerimos un máximo de 3 rutas similares
            rutasFiltradas = [
              bestRoute,
              ...matchingRoutes.filter(
                (route) => route.nombreRuta !== bestRoute.nombreRuta
              ),
            ].slice(0, 3);

            // Generar la ruta principal personalizada (la mejor coincidencia)
            const aiGeneratedRoute = {
              nombreRuta: bestRoute.nombreRuta,
              dificultad: bestRoute.dificultad,
              duracion: bestRoute.duracion,
              descripcion: bestRoute.descripcion,
              calificacion: bestRoute.calificacion,
              puntos: bestRoute.puntos || generateRoutePoints(bestRoute),
              condicionDetectada: condicionDetectada,
            };

            // Mensajes personalizados basados en la condición física detectada
            if (
              condicionDetectada === "rutasFaciles" &&
              (bestRoute.dificultad.toLowerCase() === "facil" ||
                bestRoute.dificultad.toLowerCase() === "fácil")
            ) {
              aiGeneratedRoute.descripcionPersonalizada = `Hemos seleccionado una ruta fácil ideal para personas con tu condición física. ${bestRoute.descripcion} Esta ruta es perfecta para principiantes, personas con movilidad reducida o quienes simplemente prefieran un recorrido tranquilo y sin complicaciones.`;
            } else if (
              condicionDetectada === "rutasModeradamente" &&
              bestRoute.dificultad.toLowerCase() === "moderada"
            ) {
              aiGeneratedRoute.descripcionPersonalizada = `Basado en tu nivel físico, esta ruta moderada te ofrecerá un equilibrio perfecto entre desafío y disfrute. ${bestRoute.descripcion} Es ideal para personas con actividad física regular que buscan una experiencia gratificante sin llegar a ser extremadamente exigente.`;
            } else if (
              condicionDetectada === "rutasDificiles" &&
              (bestRoute.dificultad.toLowerCase() === "desafiante" ||
                bestRoute.dificultad.toLowerCase() === "difícil" ||
                bestRoute.dificultad.toLowerCase() === "dificil")
            ) {
              aiGeneratedRoute.descripcionPersonalizada = `Para tu excelente condición física, hemos seleccionado una ruta desafiante que pondrá a prueba tus habilidades. ${bestRoute.descripcion} Este recorrido es perfecto para personas activas que buscan aventura y quieren poner a prueba sus límites.`;
            }

            // ¡NUEVO! - Personalización para tiempo solicitado
            // Si detectamos una búsqueda de tiempo entre 20-50 minutos, mostramos mensaje especial
            if (esTiempoCercanoHora && tiempoSolicitado) {
              aiGeneratedRoute.descripcionPersonalizada = `Has solicitado una ruta de ${tiempoSolicitado}, pero te ofrecemos esta ruta de aproximadamente ${bestRoute.duracion} que te brindará una experiencia más completa. ${bestRoute.descripcion}`;
              aiGeneratedRoute.tituloDuracion =
                "🕐 Ruta ajustada automáticamente";
            }

            setGeneratedRoute(aiGeneratedRoute);
          } else {
            // No hay rutas que coincidan con la búsqueda
            const aiGeneratedRoute = {
              nombreRuta: `Ruta personalizada: ${searchQuery}`,
              dificultad: "Moderada",
              duracion: "2-3 horas",
              descripcion: `Lo sentimos, no encontramos una ruta que coincida exactamente con "${searchQuery}". Hemos generado esta sugerencia basada en tus intereses.`,
              calificacion: 4,
              puntos: [
                "Punto de partida en el Centro de Visitantes",
                "Mirador panorámico con vistas al valle",
                "Zona de descanso entre árboles nativos",
                "Área de interés natural con posibilidad de fauna local",
                "Punto de llegada con servicio de refrigerios",
              ],
              condicionDetectada: condicionDetectada,
            };

            // Ajustar la dificultad y descripción basado en la condición física detectada
            if (condicionDetectada === "rutasFaciles") {
              aiGeneratedRoute.dificultad = "Fácil";
              aiGeneratedRoute.duracion = "1-2 horas";
              aiGeneratedRoute.descripcionPersonalizada = `Basado en tu condición física, hemos generado una ruta fácil personalizada. Es una caminata tranquila con pendientes suaves y senderos bien marcados, perfecta para principiantes o personas que prefieren un paseo relajado.`;
            } else if (condicionDetectada === "rutasModeradamente") {
              aiGeneratedRoute.dificultad = "Moderada";
              aiGeneratedRoute.descripcionPersonalizada = `Considerando tu nivel físico medio, hemos creado una ruta moderada personalizada. Tiene un equilibrio entre tramos sencillos y algunos desafíos puntuales, ideal para personas con cierta experiencia.`;
            } else if (condicionDetectada === "rutasDificiles") {
              aiGeneratedRoute.dificultad = "Desafiante";
              aiGeneratedRoute.duracion = "3-4 horas";
              aiGeneratedRoute.descripcionPersonalizada = `Para una persona activa como tú, hemos generado una ruta desafiante personalizada. Incluye pendientes pronunciadas y terrenos variados que pondrán a prueba tu resistencia y habilidad, ofreciendo una verdadera aventura.`;
            }

            setGeneratedRoute(aiGeneratedRoute);
          }
        }
      } else {
        // Sin texto de búsqueda, mostrar una ruta aleatoria activa
        if (rutasFiltradas.length > 0) {
          const randomIndex = Math.floor(Math.random() * rutasFiltradas.length);
          const selectedRoute = rutasFiltradas[randomIndex];

          const aiGeneratedRoute = {
            nombreRuta: selectedRoute.nombreRuta,
            dificultad: selectedRoute.dificultad,
            duracion: selectedRoute.duracion,
            descripcion: selectedRoute.descripcion,
            calificacion: selectedRoute.calificacion,
            puntos: selectedRoute.puntos || generateRoutePoints(selectedRoute),
          };

          setGeneratedRoute(aiGeneratedRoute);
        }
      }
    }, 8000);
  };

  // Actualizar resultados mientras el usuario escribe - Desactivamos la búsqueda automática y las sugerencias
  useEffect(() => {
    // Ya no generamos sugerencias mientras se escribe
    const delaySearch = setTimeout(() => {
      // Eliminamos la generación de sugerencias
      if (!searchQuery.trim()) {
        setRoutes([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Título */}
      <h1 className="text-2xl font-bold text-white mb-4 mt-4 text-center">
        Encuentra Tu Ruta Perfecta
      </h1>

      <div className="w-full max-w-3xl px-4 search-container relative">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-3xl overflow-hidden transition-all duration-300"
        >
          <div className="flex flex-col items-center py-8 px-3">
            {/* Campo de búsqueda inteligente con botón integrado */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                {/* Eliminamos los efectos decorativos de fondo */}

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué tipo de aventura buscas hoy?"
                  className="w-full px-10 py-6 pr-44 rounded-full border border-gray-200 bg-white backdrop-blur-md focus:border-gray-200 focus:ring-0 transition-all duration-300 text-black placeholder-teal-400 outline-none focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-7 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-full transition-all duration-300 text-sm uppercase tracking-wide flex items-center shadow-lg hover:shadow-teal-500/30 group focus:outline-none active:outline-none focus:ring-0 focus:ring-offset-0 outline-none border-0 focus:border-0 active:border-0"
                >
                  <span>Buscar Aventura</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                {/* Efecto decorativo */}
                <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Eliminamos las partículas decorativas */}
              </div>
            </div>
          </div>
        </form>

        {/* Recuadro de IA generando rutas */}
        {showAIRouteGenerator && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-10 transition-all duration-300 ease-out transform scale-100 opacity-100 relative">
              {/* Botón para cerrar el recuadro */}
              <button
                onClick={() => setShowAIRouteGenerator(false)}
                className="absolute top-4 right-4 bg-teal-500 hover:bg-teal-700 rounded-full p-2 transition-colors z-10 shadow-md"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex flex-col items-center">
                {generatingRoute ? (
                  <>
                    <div className="w-full max-w-xl mb-9">
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                        <video
                          src="/videos/ia_generando.mp4"
                          autoPlay
                          loop
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Partículas animadas flotantes */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          {/* Partículas brillantes */}
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute rounded-full bg-white"
                              style={{
                                width: `${Math.random() * 6 + 2}px`,
                                height: `${Math.random() * 6 + 2}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.2,
                                animation: `float ${
                                  Math.random() * 10 + 15
                                }s linear infinite`,
                                animationDelay: `${Math.random() * 5}s`,
                              }}
                            />
                          ))}

                          {/* Burbujas de colores */}
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i + 20}
                              className="absolute rounded-full"
                              style={{
                                width: `${Math.random() * 15 + 5}px`,
                                height: `${Math.random() * 15 + 5}px`,
                                background: `rgba(${
                                  Math.random() * 100 + 20
                                }, ${Math.random() * 200 + 55}, ${
                                  Math.random() * 150 + 105
                                }, ${Math.random() * 0.3 + 0.1})`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                filter: "blur(1px)",
                                animation: `floatSlow ${
                                  Math.random() * 20 + 20
                                }s ease-in-out infinite`,
                                animationDelay: `${-Math.random() * 10}s`,
                              }}
                            />
                          ))}
                        </div>

                        {/* Efectos de IA trabajando - versión mejorada */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-36 h-36">
                            {/* Círculos concéntricos con estilos mejorados */}
                            <div className="absolute inset-0 border-4 border-teal-500/60 rounded-full opacity-40 animate-[ping_2.5s_ease-in-out_infinite]"></div>
                            <div
                              className="absolute inset-2 border-4 border-teal-400/70 rounded-full opacity-60 animate-[ping_2.8s_ease-in-out_infinite]"
                              style={{ animationDelay: "0.3s" }}
                            ></div>
                            <div
                              className="absolute inset-4 border-4 border-teal-300/80 rounded-full opacity-80 animate-[ping_3.2s_ease-in-out_infinite]"
                              style={{ animationDelay: "0.6s" }}
                            ></div>
                            <div
                              className="absolute inset-6 border-4 border-white/90 rounded-full opacity-90 animate-[ping_3.5s_ease-in-out_infinite]"
                              style={{ animationDelay: "0.9s" }}
                            ></div>

                            {/* Elemento central */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-teal-500/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <div className="w-10 h-10 bg-white/90 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      {/* Título futurista con efecto de escaneo */}
                      <div className="relative mb-9">
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 tracking-wider">
                          IA GENERANDO TU RUTA PERFECTA
                        </h2>
                        <div className="absolute inset-0 overflow-hidden">
                          <div
                            className="w-full h-1 bg-teal-400/50 absolute top-1/2 transform -translate-y-1/2"
                            style={{
                              boxShadow: "0 0 15px 3px rgba(45, 212, 191, 0.5)",
                              animation:
                                "scanline 3s ease-in-out infinite alternate",
                            }}
                          ></div>
                        </div>
                        <div className="absolute -top-4 -left-4 w-3 h-3 border-t-2 border-l-2 border-teal-300"></div>
                        <div className="absolute -top-4 -right-4 w-3 h-3 border-t-2 border-r-2 border-teal-300"></div>
                        <div className="absolute -bottom-4 -left-4 w-3 h-3 border-b-2 border-l-2 border-teal-300"></div>
                        <div className="absolute -bottom-4 -right-4 w-3 h-3 border-b-2 border-r-2 border-teal-300"></div>
                      </div>

                      {/* Contenedor principal de procesamiento de IA con efectos futuristas */}
                      <div className="mt-2 bg-gradient-to-br from-teal-900/90 to-teal-800/90 backdrop-blur-md rounded-xl p-5 w-full max-w-5xl shadow-2xl border border-teal-600/50 relative overflow-hidden">
                        {/* Efecto de "red neuronal" en el fondo */}
                        <div className="absolute inset-0 z-0 opacity-20">
                          {[...Array(15)].map((_, i) => (
                            <div
                              key={`node-${i}`}
                              className="absolute rounded-full bg-teal-200"
                              style={{
                                width: `${Math.random() * 4 + 2}px`,
                                height: `${Math.random() * 4 + 2}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                boxShadow:
                                  "0 0 6px 2px rgba(45, 212, 191, 0.7)",
                              }}
                            ></div>
                          ))}
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={`line-${i}`}
                              className="absolute bg-teal-400/30"
                              style={{
                                height: "1px",
                                width: `${Math.random() * 50 + 30}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                transform: `rotate(${Math.random() * 360}deg)`,
                                opacity: Math.random() * 0.5 + 0.3,
                              }}
                            ></div>
                          ))}
                        </div>

                        {/* Efecto de escaneo horizontal */}
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            background:
                              "linear-gradient(transparent, rgba(45, 212, 191, 0.8), transparent)",
                            backgroundSize: "100% 100%",
                            animation: "scanEffect 3s ease-in-out infinite",
                          }}
                        ></div>

                        {/* Código binario flotante */}
                        <div className="absolute inset-0 overflow-hidden text-[8px] text-teal-500/20 select-none pointer-events-none">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={`binary-${i}`}
                              className="absolute whitespace-nowrap"
                              style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                transform: `translateX(-50%)`,
                                animation: `floatBinary ${
                                  Math.random() * 10 + 20
                                }s linear infinite`,
                              }}
                            >
                              {[...Array(20)]
                                .map(() => (Math.random() > 0.5 ? "1" : "0"))
                                .join(" ")}
                            </div>
                          ))}
                        </div>

                        {/* Circuito decorativo superior */}
                        <div className="absolute top-0 left-0 right-0 h-5 overflow-hidden">
                          <div className="h-px bg-teal-500 absolute top-0 left-5 right-5"></div>
                          <div className="h-5 w-px bg-teal-500 absolute top-0 left-5"></div>
                          <div className="h-5 w-px bg-teal-500 absolute top-0 left-20"></div>
                          <div className="h-5 w-px bg-teal-500 absolute top-0 right-5"></div>
                          <div className="h-5 w-px bg-teal-500 absolute top-0 right-20"></div>
                          <div className="h-px bg-teal-500 absolute top-5 left-5 w-15"></div>
                          <div className="h-px bg-teal-500 absolute top-5 right-5 w-15"></div>
                        </div>

                        {/* Circuito decorativo inferior */}
                        <div className="absolute bottom-0 left-0 right-0 h-5 overflow-hidden">
                          <div className="h-px bg-teal-500 absolute bottom-0 left-5 right-5"></div>
                          <div className="h-5 w-px bg-teal-500 absolute bottom-0 left-5"></div>
                          <div className="h-5 w-px bg-teal-500 absolute bottom-0 left-20"></div>
                          <div className="h-5 w-px bg-teal-500 absolute bottom-0 right-5"></div>
                          <div className="h-5 w-px bg-teal-500 absolute bottom-0 right-20"></div>
                          <div className="h-px bg-teal-500 absolute bottom-5 left-5 w-15"></div>
                          <div className="h-px bg-teal-500 absolute bottom-5 right-5 w-15"></div>
                        </div>

                        {/* Componentes de análisis - en disposición horizontal */}
                        <div className="grid grid-cols-3 gap-12 relative z-10">
                          {/* Primer componente: Analizando preferencias */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center mb-1">
                              <div className="w-8 h-8 bg-teal-950 rounded-lg flex items-center justify-center shadow-lg border border-teal-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-700/30 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-teal-300"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-teal-400/10 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center h-16">
                              <p className="text-xs font-bold text-teal-300 tracking-wider uppercase">
                                ANALIZANDO PREFERENCIAS
                              </p>
                              <div className="flex justify-center h-6">
                                <span className="inline-flex">
                                  <span className="animate-bounce mx-px text-teal-400">
                                    ●
                                  </span>
                                  <span
                                    className="animate-bounce mx-px text-teal-400"
                                    style={{ animationDelay: "0.2s" }}
                                  >
                                    ●
                                  </span>
                                  <span
                                    className="animate-bounce mx-px text-teal-400"
                                    style={{ animationDelay: "0.4s" }}
                                  >
                                    ●
                                  </span>
                                </span>
                              </div>
                              <div className="text-xs text-teal-400 font-mono h-4 flex items-center justify-center">
                                100%
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-teal-950 rounded-md overflow-hidden relative mt-1">
                              <div className="absolute inset-0 opacity-25">
                                {[...Array(4)].map((_, i) => (
                                  <div
                                    key={`tick-a-${i}`}
                                    className="absolute w-px h-full bg-teal-300"
                                    style={{ left: `${i * (100 / 3)}%` }}
                                  ></div>
                                ))}
                              </div>
                              <div
                                className="h-full rounded-md relative overflow-hidden"
                                style={{ width: "100%" }}
                              >
                                <div
                                  className="absolute inset-0 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 rounded-md"
                                  style={{
                                    backgroundSize: "200% 100%",
                                    animation: "shimmer 2s infinite linear",
                                  }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-teal-300/20"></div>
                              </div>
                            </div>
                          </div>

                          {/* Segundo componente: Identificando puntos */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center mb-1">
                              <div className="w-8 h-8 bg-teal-950 rounded-lg flex items-center justify-center shadow-lg border border-teal-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-700/30 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-teal-300"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div
                                  className="absolute -bottom-4 -left-4 w-8 h-8 bg-teal-400/10 rounded-full animate-pulse"
                                  style={{ animationDelay: "0.3s" }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center h-16">
                              <p className="text-xs font-bold text-teal-300 tracking-wider uppercase">
                                IDENTIFICANDO PUNTOS
                              </p>
                              <div className="flex justify-center h-6">
                                <span className="inline-flex">
                                  <span className="animate-bounce mx-px text-teal-400">
                                    ●
                                  </span>
                                  <span
                                    className="animate-bounce mx-px text-teal-400"
                                    style={{ animationDelay: "0.2s" }}
                                  >
                                    ●
                                  </span>
                                  <span
                                    className="animate-bounce mx-px text-teal-400"
                                    style={{ animationDelay: "0.4s" }}
                                  >
                                    ●
                                  </span>
                                </span>
                              </div>
                              <div className="text-xs text-teal-400 font-mono h-4 flex items-center justify-center">
                                75%
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-teal-950 rounded-md overflow-hidden relative mt-1">
                              <div className="absolute inset-0 opacity-25">
                                {[...Array(4)].map((_, i) => (
                                  <div
                                    key={`tick-b-${i}`}
                                    className="absolute w-px h-full bg-teal-300"
                                    style={{ left: `${i * (100 / 3)}%` }}
                                  ></div>
                                ))}
                              </div>
                              <div
                                className="h-full rounded-md relative overflow-hidden"
                                style={{ width: "75%" }}
                              >
                                <div
                                  className="absolute inset-0 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 rounded-md"
                                  style={{
                                    backgroundSize: "200% 100%",
                                    animation: "shimmer 2s infinite linear",
                                  }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-teal-300/20"></div>
                              </div>
                            </div>
                          </div>

                          {/* Tercer componente: Optimizando ruta */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center mb-1">
                              <div className="w-8 h-8 bg-teal-950 rounded-lg flex items-center justify-center shadow-lg border border-teal-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-700/30 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-teal-300"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div
                                  className="absolute -bottom-4 -left-4 w-8 h-8 bg-teal-400/10 rounded-full animate-pulse"
                                  style={{ animationDelay: "0.6s" }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center h-16">
                              <p className="text-xs font-bold text-teal-300 tracking-wider uppercase">
                                OPTIMIZANDO RUTA
                              </p>
                              <div className="flex justify-center h-6">
                                <span className="inline-flex">
                                  <span className="animate-bounce mx-px text-teal-400">
                                    ●
                                  </span>
                                  <span
                                    className="animate-bounce mx-px text-teal-400"
                                    style={{ animationDelay: "0.2s" }}
                                  >
                                    ●
                                  </span>
                                  <span
                                    className="animate-bounce mx-px text-teal-400"
                                    style={{ animationDelay: "0.4s" }}
                                  >
                                    ●
                                  </span>
                                </span>
                              </div>
                              <div className="text-xs text-teal-400 font-mono h-4 flex items-center justify-center">
                                45%
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-teal-950 rounded-md overflow-hidden relative mt-1">
                              <div className="absolute inset-0 opacity-25">
                                {[...Array(4)].map((_, i) => (
                                  <div
                                    key={`tick-c-${i}`}
                                    className="absolute w-px h-full bg-teal-300"
                                    style={{ left: `${i * (100 / 3)}%` }}
                                  ></div>
                                ))}
                              </div>
                              <div
                                className="h-full rounded-md relative overflow-hidden"
                                style={{ width: "45%" }}
                              >
                                <div
                                  className="absolute inset-0 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 rounded-md"
                                  style={{
                                    backgroundSize: "200% 100%",
                                    animation: "shimmer 2s infinite linear",
                                  }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-teal-300/20"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  generatedRoute && (
                    <>
                      <div className="w-full max-w-2xl mb-8">
                        <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                          <img
                            src="https://cdn.pixabay.com/photo/2023/05/17/15/57/ai-generated-8000455_1280.jpg"
                            alt="Ruta generada por IA"
                            className="w-full h-full object-cover"
                          />
                          {/* Decoración de esquinas */}
                          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white/40 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white/40 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-white/40 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white/40 rounded-br-lg"></div>

                          {/* Gradiente de superposición mejorado */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 flex flex-col justify-end p-6">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 animate-pulse"></div>
                              <h3 className="text-white text-2xl font-bold tracking-wide drop-shadow-md">
                                {generatedRoute.nombreRuta}
                              </h3>
                            </div>

                            <div className="flex items-center space-x-3 mb-2">
                              <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm">
                                {generatedRoute.dificultad}
                              </span>
                              <span className="flex items-center text-white/90 bg-black/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                <Clock className="w-4 h-4 mr-1" />{" "}
                                {generatedRoute.duracion}
                              </span>
                            </div>

                            <p className="text-white/90 backdrop-blur-sm bg-black/20 p-2 rounded-lg inline-block">
                              <span className="font-medium">
                                Ruta generada por IA
                              </span>{" "}
                              • Hecha para ti
                            </p>
                          </div>

                          {/* Efecto de completado */}
                          <div className="absolute top-4 right-4 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full p-2 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* ¡NUEVO! - Destacar información de duración especial */}
                      {generatedRoute.tituloDuracion && (
                        <div className="w-full max-w-2xl -mt-4 mb-6">
                          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                              <span className="text-yellow-800 font-medium">
                                {generatedRoute.tituloDuracion}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="w-full max-w-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                          ¡Ruta generada con éxito!
                        </h2>
                        <p className="text-gray-700 mb-6">
                          {generatedRoute.descripcionPersonalizada ||
                            generatedRoute.descripcion}
                        </p>

                        {/* Mapa interactivo con la ruta */}
                        <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 shadow-md">
                          <div className="relative aspect-[16/9]">
                            <img
                              src="https://cdn.pixabay.com/photo/2023/05/02/21/08/ai-generated-7966746_1280.png"
                              alt="Mapa de ruta"
                              className="w-full h-full object-cover"
                            />

                            {/* Puntos en el mapa */}
                            <div className="absolute top-[20%] left-[15%]">
                              <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                                1
                              </div>
                            </div>
                            <div className="absolute top-[35%] left-[30%]">
                              <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                                2
                              </div>
                            </div>
                            <div className="absolute top-[45%] left-[50%]">
                              <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                                3
                              </div>
                            </div>
                            <div className="absolute top-[60%] left-[65%]">
                              <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                                4
                              </div>
                            </div>
                            <div className="absolute top-[75%] left-[80%]">
                              <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                                5
                              </div>
                            </div>

                            {/* Línea de ruta */}
                            <svg
                              className="absolute inset-0 w-full h-full"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M15,20 Q25,25 30,35 T50,45 T65,60 T80,75"
                                fill="none"
                                stroke="#0d9488"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="6,6"
                                style={{
                                  strokeDashoffset: "0",
                                }}
                              />
                            </svg>

                            {/* Información de la ruta */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">Distancia total</p>
                                  <p className="text-lg font-bold">5.2 km</p>
                                </div>
                                <div>
                                  <p className="font-medium">Elevación</p>
                                  <p className="text-lg font-bold">+320m</p>
                                </div>
                                <div>
                                  <p className="font-medium">Tipo de terreno</p>
                                  <p className="text-lg font-bold">Mixto</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-teal-50 rounded-xl p-6 mb-6">
                          <h3 className="text-lg font-semibold text-teal-800 mb-4">
                            Puntos de interés
                          </h3>
                          <div className="space-y-0">
                            {generatedRoute.puntos.map((punto, index) => (
                              <div key={index} className="flex items-start">
                                <div className="relative">
                                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 border-2 border-teal-500 z-10 relative">
                                    <span className="text-teal-600 font-bold text-xs">
                                      {index + 1}
                                    </span>
                                  </div>
                                  {index < generatedRoute.puntos.length - 1 && (
                                    <div className="absolute top-8 left-1/2 w-0.5 h-16 -translate-x-1/2 bg-teal-300" />
                                  )}
                                </div>
                                <div className="ml-4 mb-12">
                                  <span className="text-gray-800 font-medium">
                                    {punto}
                                  </span>
                                  {index === 0 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Inicio de tu aventura
                                    </p>
                                  )}
                                  {index ===
                                    generatedRoute.puntos.length - 1 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Fin del recorrido
                                    </p>
                                  )}
                                  {index > 0 &&
                                    index <
                                      generatedRoute.puntos.length - 1 && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        Punto de interés #{index}
                                      </p>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 mt-6">
                          <button
                            onClick={() => setShowAIRouteGenerator(false)}
                            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                          >
                            Cerrar
                          </button>

                          <button
                            className="px-5 py-2.5 bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm"
                            onClick={() => {
                              // Simular compartir la ruta
                              alert(
                                "Compartiendo ruta: " +
                                  generatedRoute.nombreRuta
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                            Compartir
                          </button>

                          <button
                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm"
                            onClick={() => {
                              // Simular descarga de la ruta
                              alert(
                                "Descargando ruta: " + generatedRoute.nombreRuta
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Descargar
                          </button>

                          <button
                            className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm"
                            onClick={() => {
                              // Simular guardar en favoritos
                              alert(
                                "Guardando en favoritos: " +
                                  generatedRoute.nombreRuta
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                            Favoritos
                          </button>
                        </div>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-md w-full max-w-4xl mx-auto flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3 mt-0.5 text-red-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-medium">Ocurrió un error durante la búsqueda</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Resultados de Rutas */}
      {routes.length > 0 && !isSearching && (
        <div className="mt-8 w-full max-w-4xl space-y-4 px-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Rutas Recomendadas
          </h2>
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white/90 backdrop-blur-md rounded-lg p-5 shadow-md hover:shadow-lg transition-all border border-gray-100 h-full flex flex-col"
              >
                <h3 className="text-lg font-bold text-teal-700">
                  {route.nombreRuta}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <p>{route.duracion}</p>
                  </div>
                  <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                    {route.dificultad}
                  </span>
                </div>

                <p className="text-gray-700 my-3 flex-grow">
                  {route.descripcion}
                </p>

                <div className="mt-4">
                  <div className="relative">
                    {/* Simulamos puntos de ruta basados en la distancia */}
                    {generateRoutePoints(route).map((point, i, arr) => (
                      <div key={i} className="flex items-start mb-4">
                        <div className="relative">
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 border-2 border-teal-500 z-10 relative">
                            <MapPin className="h-4 w-4 text-teal-600" />
                          </div>
                          {i < arr.length - 1 && (
                            <div className="absolute top-8 left-1/2 w-0.5 h-full -translate-x-1/2 bg-teal-300" />
                          )}
                        </div>
                        <div className="ml-3 mt-1.5">
                          <span className="text-gray-800 text-sm font-medium">
                            {point}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para generar puntos de ruta simulados
function generateRoutePoints(route) {
  // Si la ruta ya tiene puntos definidos, usarlos
  if (route.puntos && Array.isArray(route.puntos) && route.puntos.length > 0) {
    return route.puntos;
  }

  const points = ["Punto de partida - Centro de Visitantes"];

  // Determinar qué puntos incluir según el nombre y descripción de la ruta
  if (route.nombreRuta) {
    const routeName = route.nombreRuta.toLowerCase();

    // Características específicas por nombre de ruta
    if (routeName.includes("planchon")) {
      points.push(
        "Sendero del Planchon",
        "Mirador con vistas al valle",
        "Área de descanso"
      );
    }

    if (routeName.includes("peña") && routeName.includes("virgen")) {
      points.push(
        "Sendero ascendente",
        "Área de preparación",
        "Peña de la Virgen - Monumento religioso"
      );
    }

    if (routeName.includes("casa") && routeName.includes("esperanza")) {
      points.push(
        "Camino empedrado",
        "Bosque de transición",
        "Casa La Esperanza - Edificación histórica"
      );
    }

    if (routeName.includes("mirador") && routeName.includes("camino")) {
      points.push("Sendero principal", "Mirador con vistas panorámicas");
    }

    if (routeName.includes("mirador") && routeName.includes("río")) {
      points.push("Sendero junto al río", "Mirador de observación del río");
    }

    if (routeName.includes("palmas")) {
      points.push(
        "Sendero entre palmas de cera",
        "Bosque de Palmas de Cera - Flora única",
        "Mirador de las Palmas"
      );
    }

    if (routeName.includes("cóndor") || routeName.includes("condor")) {
      points.push(
        "Sendero de montaña",
        "Zona de vegetación de altura",
        "Mirador del Cóndor - Punto de avistamiento"
      );
    }

    // Combinaciones específicas
    if (routeName.includes("camino") && routeName.includes("peña")) {
      if (!points.some((p) => p.includes("Mirador"))) {
        points.push("Mirador del Camino");
      }
      if (!points.some((p) => p.includes("Peña"))) {
        points.push("Peña de la Virgen");
      }
    }

    if (routeName.includes("camino") && routeName.includes("palma")) {
      if (!points.some((p) => p.includes("Mirador del Camino"))) {
        points.push("Mirador del Camino");
      }
      if (!points.some((p) => p.includes("Palmas"))) {
        points.push("Mirador de las Palmas");
      }
    }

    if (routeName.includes("camino") && routeName.includes("río")) {
      if (!points.some((p) => p.includes("Mirador"))) {
        points.push("Mirador del Camino");
      }
      if (!points.some((p) => p.includes("río") || p.includes("Río"))) {
        points.push("Paseo junto al río - Sendero fluvial");
      }
    }
  }

  // Añadir puntos genéricos si no hay suficientes puntos específicos
  if (points.length < 3) {
    points.push("Sendero natural");
  }

  if (points.length < 4) {
    points.push("Área de descanso - Zona natural");
  }

  // Añadir dificultad al final basado en la dificultad de la ruta
  if (route.dificultad) {
    const dificultad = route.dificultad.toLowerCase();
    if (dificultad === "facil" || dificultad === "fácil") {
      points.push("Tramo final - Pendiente suave");
    } else if (dificultad === "moderada") {
      points.push("Tramo final - Pendiente moderada");
    } else if (dificultad === "desafiante" || dificultad === "difícil") {
      points.push("Tramo final - Pendiente pronunciada");
    }
  }

  // Añadir punto de llegada
  points.push("Punto de llegada - Regreso al Centro de Visitantes");

  // Devolver los puntos únicos (eliminar duplicados)
  return [...new Set(points)];
}
