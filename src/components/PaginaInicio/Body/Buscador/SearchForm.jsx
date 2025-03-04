import axios from 'axios';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export const SearchForm = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
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
    const fetchAllRoutes = async () => {
      setIsSearching(true);
      try {
        const response = await axios.get('http://localhost:10101/rutas');
        if (Array.isArray(response.data)) {
          // Preprocesar los datos para optimizar búsquedas
          const processedRoutes = response.data.map(route => ({
            ...route,
            keywords: generateKeywords(route),
            durationInMinutes: convertToMinutes(route.duracion)
          }));
          setAllRoutes(processedRoutes);
        } else {
          setError("La respuesta de la API no tiene el formato esperado");
        }
      } catch (err) {
        console.error("Error al cargar rutas:", err);
        setError("No se pudieron cargar las rutas. Por favor, intente más tarde.");
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchAllRoutes();

    // Cargar historial de búsqueda desde localStorage
    const savedHistory = localStorage.getItem('searchHistory');
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
      keywords.push(...route.descripcion.toLowerCase()
        .split(/[.,;:!?()[\]{}'"\s<>]+/) // Separar por puntuación y espacios
        .filter(word => word.length > 3)); // Solo palabras significativas
    }
    
    // Añadir dificultad
    if (route.dificultad) {
      keywords.push(route.dificultad.toLowerCase());
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
        `${Math.round(durationMinutes/60 * 10) / 10}h`,
        `${Math.round(durationMinutes/60 * 10) / 10} horas`
      );
    }
    
    // Añadir ubicaciones importantes si existen
    if (route.ubicacion) {
      keywords.push(route.ubicacion.toLowerCase());
      keywords.push(...route.ubicacion.toLowerCase().split(/\s+/));
    }
    
    // Eliminar duplicados y devolver array de palabras clave únicas
    return [...new Set(keywords)].filter(Boolean);
  };

  // Función para convertir cualquier duración a minutos con detección avanzada
  const convertToMinutes = (durationText) => {
    if (!durationText) return 0;
    
    const text = durationText.toString().toLowerCase().trim();
    
    // Patrones de tiempo más completos
    const hoursMatch = text.match(/(\d+(\.\d+)?)\s*(h|hr|hrs|hora|horas)/);
    const minsMatch = text.match(/(\d+)\s*(m|min|mins|minuto|minutos)/);
    const secsMatch = text.match(/(\d+)\s*(s|sec|seg|segundo|segundos)/);
    
    // Patrones de tiempo compuestos (2h 30min)
    const compositeMatch = text.match(/(\d+)\s*h\w*\s*(\d+)\s*m/i);
    
    let totalMinutes = 0;
    
    if (compositeMatch) {
      totalMinutes = parseInt(compositeMatch[1]) * 60 + parseInt(compositeMatch[2]);
    } else {
      if (hoursMatch) {
        totalMinutes += parseFloat(hoursMatch[1]) * 60;
      }
      
      if (minsMatch) {
        totalMinutes += parseInt(minsMatch[1]);
      }
      
      if (secsMatch) {
        totalMinutes += parseInt(secsMatch[1]) / 60;
      }
    }
    
    // Patrones de tiempo verbales (dos horas y media)
    if (totalMinutes === 0) {
      if (text.includes('media hora')) totalMinutes = 30;
      else if (text.includes('un cuarto de hora')) totalMinutes = 15;
      else if (text.includes('tres cuartos de hora')) totalMinutes = 45;
      
      // Detectar números escritos como palabras
      const wordNumbers = {
        'una': 1, 'un': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10
      };
      
      for (const [word, value] of Object.entries(wordNumbers)) {
        if (text.includes(`${word} hora`)) totalMinutes += value * 60;
        if (text.includes(`${word} minuto`)) totalMinutes += value;
      }
    }
    
    // Si no se encontró ningún patrón pero hay un número, asumimos que son minutos
    if (totalMinutes === 0) {
      const justNumber = text.match(/(\d+(\.\d+)?)/);
      if (justNumber) {
        totalMinutes = parseFloat(justNumber[1]);
      }
    }
    
    return totalMinutes;
  };

  // Función para calcular puntuación de relevancia de una ruta para una búsqueda
  const calculateRelevanceScore = (route, query) => {
    if (!query.trim()) return 0;
    
    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 1);
    
    let score = 0;
    
    // 1. Coincidencia exacta con nombre (mayor prioridad)
    if (route.nombreRuta && route.nombreRuta.toLowerCase() === normalizedQuery) {
      score += 100;
    }
    
    // 2. Coincidencia parcial con nombre
    if (route.nombreRuta && route.nombreRuta.toLowerCase().includes(normalizedQuery)) {
      score += 50;
    }
    
    // 3. Coincidencia de términos individuales con palabras clave
    queryTerms.forEach(term => {
      // Comprobar coincidencias exactas en palabras clave
      route.keywords.forEach(keyword => {
        if (keyword === term) score += 10;
        else if (keyword.includes(term)) score += 5;
        else if (term.includes(keyword) && keyword.length > 3) score += 3;
      });
    });
    
    // 4. Coincidencia con duración (si la consulta parece ser una duración)
    if (isTimeSearch(normalizedQuery)) {
      const queryTimeMin = convertToMinutes(normalizedQuery);
      const routeTimeMin = route.durationInMinutes;
      
      if (queryTimeMin > 0 && routeTimeMin > 0) {
        // Calcula qué tan cerca está la duración (100% si es exacta, disminuye según la diferencia)
        const timeDiffPercentage = Math.max(0, 100 - (Math.abs(routeTimeMin - queryTimeMin) / Math.max(1, queryTimeMin)) * 100);
        score += timeDiffPercentage * 0.5; // Factor de 0.5 para equilibrar con coincidencias de texto
      }
    }
    
    // 5. Coincidencia con dificultad
    const difficulties = ['fácil', 'facil', 'moderada', 'difícil', 'dificil', 'extrema'];
    for (const difficulty of difficulties) {
      if (normalizedQuery.includes(difficulty) && 
          route.dificultad && 
          route.dificultad.toLowerCase().includes(difficulty)) {
        score += 20;
      }
    }
    
    return score;
  };

  // Detecta si la búsqueda es relacionada con tiempo con mejor detección
  const isTimeSearch = (query) => {
    // Detecta formato de tiempo estándar y palabras relacionadas
    return /\d+\s*(h|hr|hrs|hora|horas|m|min|mins|minuto|minutos|s|sec|seg|segundo|segundos)/.test(query.toLowerCase()) || 
           ((/\d+(\.\d+)?/.test(query)) && query.match(/tiempo|duración|durar|tarda|duration/i)) || 
           query.match(/media hora|un cuarto de hora|tres cuartos de hora/i) ||
           query.match(/(una|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(hora|horas|minuto|minutos)/i);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch && onSearch({ query: searchQuery });
    
    // Verificar si hay texto de búsqueda
    if (!searchQuery.trim()) {
      alert('Por favor, ingresa un término de búsqueda para generar una ruta');
      return;
    }
    
    // Guardar búsqueda en historial si hay texto
    if (searchQuery.trim().length > 2 && !searchHistory.includes(searchQuery.trim())) {
      const newHistory = [searchQuery.trim(), ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    
    // Mostrar el recuadro de IA generando rutas
    setShowAIRouteGenerator(true);
    setGeneratingRoute(true);
    setGeneratedRoute(null);
    setRoutes([]); // Limpiar resultados anteriores
    
    // Simular el proceso de generación de ruta con IA
    setTimeout(() => {
      setGeneratingRoute(false);
      
      // Base filtrada inicial
      let rutasFiltradas = allRoutes;
      
      // Aplicar filtro de búsqueda si hay texto
      if (searchQuery.trim()) {
        // Calcular puntuación de relevancia para cada ruta
        const scoredRoutes = rutasFiltradas.map(route => ({
          ...route,
          relevanceScore: calculateRelevanceScore(route, searchQuery)
        }));
        
        // Filtrar rutas con alguna coincidencia
        const matchingRoutes = scoredRoutes.filter(route => route.relevanceScore > 0);
        
        // Ordenar por puntuación de relevancia
        matchingRoutes.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Limitar a las más relevantes
        rutasFiltradas = matchingRoutes.slice(0, 5);
      }
      
      // Si no hay rutas filtradas, mostrar mensaje
      if (rutasFiltradas.length === 0) {
        // Crear una ruta genérica basada en la búsqueda
        const aiGeneratedRoute = {
          nombreRuta: `Ruta personalizada: ${searchQuery}`,
          dificultad: 'moderada',
          duracion: '2-3 horas',
          descripcion: `Una ruta personalizada basada en tu búsqueda "${searchQuery}" generada por nuestra IA.`,
          puntos: [
            'Punto de partida',
            'Mirador panorámico',
            'Zona de descanso',
            'Área de interés natural',
            'Punto de llegada'
          ]
        };
        
        setGeneratedRoute(aiGeneratedRoute);
      } else {
        // Seleccionar una ruta aleatoria de las filtradas
        const randomIndex = Math.floor(Math.random() * rutasFiltradas.length);
        const selectedRoute = rutasFiltradas[randomIndex];
        
        const aiGeneratedRoute = {
          nombreRuta: selectedRoute.nombreRuta,
          dificultad: selectedRoute.dificultad,
          duracion: selectedRoute.duracion,
          descripcion: selectedRoute.descripcion,
          puntos: selectedRoute.puntos || generateRoutePoints(selectedRoute)
        };
        
        setGeneratedRoute(aiGeneratedRoute);
      }
      
      // No ejecutamos filterRoutes() para no mostrar resultados fuera del recuadro de IA
    }, 2000);
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 transition-all duration-300 ease-out transform scale-100 opacity-100 relative">
              {/* Botón para cerrar el recuadro */}
              <button 
                onClick={() => setShowAIRouteGenerator(false)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full p-2 transition-colors z-10 shadow-md"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex flex-col items-center">
                {generatingRoute ? (
                  <>
                    <div className="w-full max-w-lg mb-8">
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src="https://cdn.pixabay.com/photo/2023/05/12/14/48/ai-generated-7989213_1280.jpg" 
                          alt="IA generando ruta" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex flex-col justify-end p-6">
                          <h3 className="text-white text-2xl font-bold">Inteligencia Artificial</h3>
                          <p className="text-white/90">Creando tu ruta personalizada...</p>
                        </div>
                        
                        {/* Efectos de IA trabajando */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-32 h-32">
                            <div className="absolute inset-0 border-4 border-teal-500 rounded-full opacity-30 animate-ping"></div>
                            <div className="absolute inset-2 border-4 border-teal-400 rounded-full opacity-50 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                            <div className="absolute inset-4 border-4 border-teal-300 rounded-full opacity-70 animate-ping" style={{ animationDelay: '0.6s' }}></div>
                            <div className="absolute inset-6 border-4 border-teal-200 rounded-full opacity-90 animate-ping" style={{ animationDelay: '0.9s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 border-t-4 border-teal-600 border-solid rounded-full animate-spin mb-4"></div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Generando tu ruta perfecta</h2>
                      <p className="text-gray-600 text-center max-w-md">
                        Nuestra IA está analizando tus preferencias y creando una ruta personalizada con los mejores puntos de interés.
                      </p>
                      
                      {/* Mensajes de procesamiento */}
                      <div className="mt-6 bg-gray-100 rounded-lg p-4 w-full max-w-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-gray-700">Analizando preferencias de búsqueda...</p>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-gray-700">Identificando puntos de interés...</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-gray-700">Optimizando ruta para mejor experiencia...</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : generatedRoute && (
                  <>
                    <div className="w-full max-w-2xl mb-8">
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src="https://cdn.pixabay.com/photo/2023/05/17/15/57/ai-generated-8000455_1280.jpg" 
                          alt="Ruta generada por IA" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex flex-col justify-end p-6">
                          <h3 className="text-white text-2xl font-bold">{generatedRoute.nombreRuta}</h3>
                          <div className="flex items-center mt-2">
                            <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm mr-3">
                              {generatedRoute.dificultad}
                            </span>
                            <span className="text-white/90 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {generatedRoute.duracion}
                            </span>
                          </div>
                        </div>
                        
                        {/* Efecto de completado */}
                        <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full max-w-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Ruta generada con éxito!</h2>
                      <p className="text-gray-700 mb-6">{generatedRoute.descripcion}</p>
                      
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
                            <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">1</div>
                          </div>
                          <div className="absolute top-[35%] left-[30%]">
                            <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">2</div>
                          </div>
                          <div className="absolute top-[45%] left-[50%]">
                            <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">3</div>
                          </div>
                          <div className="absolute top-[60%] left-[65%]">
                            <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">4</div>
                          </div>
                          <div className="absolute top-[75%] left-[80%]">
                            <div className="h-6 w-6 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">5</div>
                          </div>
                          
                          {/* Línea de ruta */}
                          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <path 
                              d="M15%,20% Q25%,25% 30%,35% T50%,45% T65%,60% T80%,75%" 
                              fill="none" 
                              stroke="#0d9488" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeDasharray="6,6"
                              style={{
                                strokeDashoffset: "0"
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
                        <h3 className="text-lg font-semibold text-teal-800 mb-4">Puntos de interés</h3>
                        <div className="space-y-0">
                          {generatedRoute.puntos.map((punto, index) => (
                            <div key={index} className="flex items-start">
                              <div className="relative">
                                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-teal-100 border-2 border-teal-500 z-10 relative">
                                  <span className="text-teal-600 font-bold text-xs">{index + 1}</span>
                                </div>
                                {index < generatedRoute.puntos.length - 1 && (
                                  <div className="absolute top-8 left-1/2 w-0.5 h-16 -translate-x-1/2 bg-teal-300" />
                                )}
                              </div>
                              <div className="ml-4 mb-12">
                                <span className="text-gray-800 font-medium">{punto}</span>
                                {index === 0 && (
                                  <p className="text-sm text-gray-600 mt-1">Inicio de tu aventura</p>
                                )}
                                {index === generatedRoute.puntos.length - 1 && (
                                  <p className="text-sm text-gray-600 mt-1">Fin del recorrido</p>
                                )}
                                {index > 0 && index < generatedRoute.puntos.length - 1 && (
                                  <p className="text-sm text-gray-600 mt-1">Punto de interés #{index}</p>
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
                            alert('Compartiendo ruta: ' + generatedRoute.nombreRuta);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Compartir
                        </button>
                        
                        <button 
                          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm"
                          onClick={() => {
                            // Simular descarga de la ruta
                            alert('Descargando ruta: ' + generatedRoute.nombreRuta);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Descargar
                        </button>
                        
                        <button 
                          className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm"
                          onClick={() => {
                            // Simular guardar en favoritos
                            alert('Guardando en favoritos: ' + generatedRoute.nombreRuta);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Favoritos
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mensajes de error */}
      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-4xl mx-auto">
          <p>{error}</p>
        </div>
      )}
      
      {/* Indicador de carga */}
      {isSearching && !showAIRouteGenerator && (
        <div className="mt-8 w-full max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
            <span className="text-teal-600 font-medium">Buscando rutas...</span>
          </div>
        </div>
      )}
      
      {/* Resultados de Rutas */}
      {routes.length > 0 && !isSearching && (
        <div className="mt-8 w-full max-w-4xl space-y-4 px-4">
          <h2 className="text-xl font-semibold text-gray-800">Rutas Recomendadas</h2>
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {routes.map((route) => (
              <div 
                key={route.id} 
                className="bg-white/90 backdrop-blur-md rounded-lg p-5 shadow-md hover:shadow-lg transition-all border border-gray-100 h-full flex flex-col"
              >
                <h3 className="text-lg font-bold text-teal-700">{route.nombreRuta}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <p>{route.duracion}</p>
                  </div>
                  <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                    {route.dificultad}
                  </span>
                </div>
                
                <p className="text-gray-700 my-3 flex-grow">{route.descripcion}</p>
                
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
                          <span className="text-gray-800 text-sm font-medium">{point}</span>
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
  
  // Si no, generar puntos simulados basados en la distancia
  const distancia = parseFloat(route.distancia) || 5;
  const numPoints = Math.max(3, Math.min(5, Math.ceil(distancia / 2)));
  
  const pointTypes = [
    'Punto de partida', 'Mirador', 'Área de descanso', 
    'Cascada', 'Río', 'Bosque', 'Cima', 'Valle', 
    'Puente', 'Zona de picnic', 'Punto de llegada'
  ];
  
  const points = [];
  points.push('Punto de partida');
  
  for (let i = 1; i < numPoints - 1; i++) {
    const randomIndex = Math.floor(Math.random() * (pointTypes.length - 2)) + 1;
    points.push(pointTypes[randomIndex]);
  }
  
  points.push('Punto de llegada');
  return points;
}
