import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Clock, ArrowRight, Map, TrendingUp, Tag, Filter, Sliders } from 'lucide-react';
import axios from 'axios';

export const SearchForm = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allRoutes, setAllRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all'); // 'all', 'name', 'duration', 'difficulty'
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    duration: null, // 1h, 2h, 3h, 4h, 5h, 6h
    difficulty: null // facil, moderada, desafiante
  });

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
        .split(/[.,;:!?()[\]{}'"\/\\<>]+/) // Separar por puntuación
        .flatMap(part => part.trim().split(/\s+/)) // Separar por espacios
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

  // Detecta si la búsqueda es relacionada con dificultad
  const isDifficultySearch = (query) => {
    const difficultyTerms = [
      'fácil', 'facil', 'moderada', 'difícil', 'dificil', 'extrema',
      'sencilla', 'simple', 'complicada', 'dura', 'exigente', 'principiante', 
      'intermedia', 'avanzada', 'experto'
    ];
    
    const normalizedQuery = query.toLowerCase();
    return difficultyTerms.some(term => normalizedQuery.includes(term)) ||
           normalizedQuery.includes('dificultad') ||
           normalizedQuery.includes('nivel');
  };
  
  // Generar sugerencias de búsqueda basadas en la entrada actual
  const generateSuggestions = (input) => {
    if (!input || input.length < 2) {
      setShowSuggestions(false);
      return;
    }
    
    const normalizedInput = input.toLowerCase().trim();
    const potentialSuggestions = [];
    
    // Sugerencias basadas en nombres de rutas
    allRoutes.forEach(route => {
      if (route.nombreRuta && route.nombreRuta.toLowerCase().includes(normalizedInput)) {
        potentialSuggestions.push({
          text: route.nombreRuta,
          type: 'name',
          icon: <Map className="w-4 h-4 text-blue-500" />
        });
      }
    });
    
    // Sugerencias basadas en dificultad
    if (isDifficultySearch(normalizedInput)) {
      ['Fácil', 'Moderada', 'Difícil', 'Extrema'].forEach(difficulty => {
        if (difficulty.toLowerCase().includes(normalizedInput)) {
          potentialSuggestions.push({
            text: `Rutas de dificultad ${difficulty}`,
            type: 'difficulty',
            icon: <TrendingUp className="w-4 h-4 text-orange-500" />
          });
        }
      });
    }
    
    // Sugerencias basadas en tiempo
    if (normalizedInput.match(/\d/)) {
      const timePatterns = ['minutos', 'horas', 'hora'];
      timePatterns.forEach(pattern => {
        potentialSuggestions.push({
          text: `${normalizedInput} ${pattern}`,
          type: 'time',
          icon: <Clock className="w-4 h-4 text-green-500" />
        });
      });
    }
    
    // Filtrar duplicados y limitar a 5 sugerencias
    const uniqueSuggestions = [];
    const seenTexts = new Set();
    
    for (const suggestion of potentialSuggestions) {
      if (!seenTexts.has(suggestion.text)) {
        seenTexts.add(suggestion.text);
        uniqueSuggestions.push(suggestion);
        if (uniqueSuggestions.length >= 5) break;
      }
    }
    
    setSuggestions(uniqueSuggestions);
    setShowSuggestions(uniqueSuggestions.length > 0);
  };

  // Aplicar un filtro de duración específico
  const applyDurationFilter = (hours) => {
    // Convertir horas a minutos
    const targetMinutes = hours * 60;
    
    // Establecer un rango de +/- 30 minutos
    const minTime = targetMinutes - 30;
    const maxTime = targetMinutes + 30;
    
    return allRoutes.filter(route => 
      route.durationInMinutes >= minTime && 
      route.durationInMinutes <= maxTime
    );
  };

  // Aplicar un filtro de dificultad específico
  const applyDifficultyFilter = (difficulty) => {
    // Mapeo de términos de dificultad para búsqueda más flexible
    const difficultyMap = {
      'facil': ['fácil', 'facil', 'sencilla', 'sencillo', 'principiante', 'básica', 'basica', 'simple'],
      'moderada': ['moderada', 'moderado', 'intermedia', 'intermedio', 'media', 'medio'],
      'desafiante': ['difícil', 'dificil', 'desafiante', 'extrema', 'extremo', 'avanzada', 'avanzado', 'dura', 'duro']
    };
    
    const terms = difficultyMap[difficulty] || [difficulty];
    
    return allRoutes.filter(route => 
      route.dificultad && 
      terms.some(term => route.dificultad.toLowerCase().includes(term))
    );
  };

  // Función para filtrar rutas según término de búsqueda con algoritmo mejorado
  const filterRoutes = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      if (!searchQuery.trim() && !activeFilters.duration && !activeFilters.difficulty) {
        setRoutes([]);
        setIsSearching(false);
        return;
      }
      
      const query = searchQuery.toLowerCase().trim();
      
      // Guardar búsqueda en historial si hay texto (no solo filtros)
      if (query.length > 2 && !searchHistory.includes(query)) {
        const newHistory = [query, ...searchHistory].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
      
      // Si no hay rutas, no podemos buscar
      if (!allRoutes.length) {
        setIsSearching(false);
        return;
      }
      
      // Base filtrada inicial
      let filteredRoutes = allRoutes;
      
      // Primero aplicar filtros específicos si están activos
      if (activeFilters.duration) {
        filteredRoutes = applyDurationFilter(parseInt(activeFilters.duration));
      }
      
      if (activeFilters.difficulty) {
        filteredRoutes = applyDifficultyFilter(activeFilters.difficulty);
      }
      
      // Si hay una búsqueda de texto, aplicar filtrado adicional
      if (query) {
        // Aplicar filtros según el tipo de búsqueda seleccionado
        if (searchFilter !== 'all') {
          switch (searchFilter) {
            case 'name':
              filteredRoutes = filteredRoutes.filter(route => 
                route.nombreRuta && route.nombreRuta.toLowerCase().includes(query)
              );
              break;
            case 'duration':
              if (isTimeSearch(query)) {
                const queryTimeMin = convertToMinutes(query);
                filteredRoutes = filteredRoutes.filter(route => 
                  Math.abs(route.durationInMinutes - queryTimeMin) <= Math.max(30, queryTimeMin * 0.3)
                );
              }
              break;
            case 'difficulty':
              filteredRoutes = filteredRoutes.filter(route => 
                route.dificultad && route.dificultad.toLowerCase().includes(query)
              );
              break;
          }
        }
        
        // Calcular puntuación de relevancia para cada ruta
        const scoredRoutes = filteredRoutes.map(route => ({
          ...route,
          relevanceScore: calculateRelevanceScore(route, query)
        }));
        
        // Filtrar rutas con alguna coincidencia
        const matchingRoutes = scoredRoutes.filter(route => route.relevanceScore > 0);
        
        // Ordenar por puntuación de relevancia
        matchingRoutes.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Limitar a las 10 más relevantes y eliminar la propiedad auxiliar
        const finalRoutes = matchingRoutes
          .slice(0, 10)
          .map(({ relevanceScore, ...routeData }) => routeData);
        
        setRoutes(finalRoutes);
      } else {
        // Si solo hay filtros activos sin búsqueda de texto, mostrar todas las rutas filtradas
        setRoutes(filteredRoutes.slice(0, 10));
      }
      
      setIsSearching(false);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch && onSearch({ searchQuery });
    filterRoutes();
    setShowSuggestions(false);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Aplicar filtro según tipo de sugerencia
    if (suggestion.type === 'name') setSearchFilter('name');
    else if (suggestion.type === 'difficulty') setSearchFilter('difficulty');
    else if (suggestion.type === 'time') setSearchFilter('duration');
    else setSearchFilter('all');
    
    // Ejecutar búsqueda automáticamente
    setTimeout(() => filterRoutes(), 100);
  };
  
  // Manejar selección de filtro específico
  const handleFilterSelect = (type, value) => {
    if (activeFilters[type] === value) {
      // Desactivar el filtro si ya estaba activo
      setActiveFilters({...activeFilters, [type]: null});
    } else {
      // Activar nuevo filtro
      setActiveFilters({...activeFilters, [type]: value});
    }
    
    // Ejecutar búsqueda con el nuevo filtro
    setTimeout(() => filterRoutes(), 100);
  };
  
  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setActiveFilters({duration: null, difficulty: null});
    setSearchFilter('all');
    
    if (searchQuery) {
      // Si hay una búsqueda de texto, volver a buscar solo con eso
      setTimeout(() => filterRoutes(), 100);
    } else {
      // Si no hay texto, limpiar resultados
      setRoutes([]);
    }
  };
  
  // Genera filtros para búsquedas específicas
  const filterButtons = useMemo(() => [
    { id: 'all', label: 'Todo', icon: <Search className="w-4 h-4" /> },
    { id: 'name', label: 'Nombre', icon: <Tag className="w-4 h-4" /> },
    { id: 'duration', label: 'Duración', icon: <Clock className="w-4 h-4" /> },
    { id: 'difficulty', label: 'Dificultad', icon: <TrendingUp className="w-4 h-4" /> }
  ], []);
  
  // Filtros rápidos para duración
  const durationFilters = useMemo(() => [
    { value: '1', label: '1H', minutes: 60 },
    { value: '2', label: '2H', minutes: 120 },
    { value: '3', label: '3H', minutes: 180 },
    { value: '4', label: '4H', minutes: 240 },
    { value: '5', label: '5H', minutes: 300 },
    { value: '6', label: '6H', minutes: 360 }
  ], []);
  
  // Filtros rápidos para dificultad
  const difficultyFilters = useMemo(() => [
    { value: 'facil', label: 'Fácil' },
    { value: 'moderada', label: 'Moderada' },
    { value: 'desafiante', label: 'Desafiante' }
  ], []);
  
  // Actualizar resultados mientras el usuario escribe
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      generateSuggestions(searchQuery);
      if (searchQuery.trim() || activeFilters.duration || activeFilters.difficulty) {
        filterRoutes();
      } else {
        setRoutes([]);
        setShowSuggestions(false);
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchFilter, activeFilters]);

  // Observar clicks para cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
      
      // No cerrar el panel de filtros si el clic fue dentro del panel o en el botón de filtros
      if (!e.target.closest('.filter-panel') && !e.target.closest('.filter-toggle-btn')) {
        setShowFilterPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Título */}
      <h1 className="text-3xl font-bold text-blue-700 mb-6 mt-6 text-center">
        Encuentra Tu Ruta Perfecta
      </h1>
      
      <div className="w-full max-w-4xl px-4 search-container relative">
        {/* Filtros de búsqueda */}
        <div className="flex flex-wrap justify-center mb-4 gap-2">
          {filterButtons.map(button => (
            <button
              key={button.id}
              onClick={() => setSearchFilter(button.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                searchFilter === button.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/90 text-gray-700 hover:bg-blue-50"
              }`}
            >
              {button.icon}
              <span>{button.label}</span>
            </button>
          ))}
          
          <button 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 bg-teal-600 text-white shadow-md filter-toggle-btn"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Sliders className="w-4 h-4" />
            <span>Filtros</span>
            {(activeFilters.duration || activeFilters.difficulty) && (
              <span className="bg-white text-teal-600 rounded-full w-5 h-5 flex items-center justify-center ml-1 text-xs font-bold">
                {(activeFilters.duration ? 1 : 0) + (activeFilters.difficulty ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
        
        {/* Panel de filtros específicos */}
        {showFilterPanel && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 filter-panel">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Filtros específicos</h3>
              {(activeFilters.duration || activeFilters.difficulty) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            
            {/* Filtros de duración */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Duración
              </h4>
              <div className="flex flex-wrap gap-2">
                {durationFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterSelect('duration', filter.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                      activeFilters.duration === filter.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filtros de dificultad */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Dificultad
              </h4>
              <div className="flex flex-wrap gap-2">
                {difficultyFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterSelect('difficulty', filter.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                      activeFilters.difficulty === filter.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <form 
          onSubmit={handleSubmit}
          className="w-full bg-white/80 backdrop-blur-md rounded-full shadow-lg overflow-hidden border border-white/20 hover:bg-white/90 transition-all duration-300"
        >
          <div className="flex items-center h-16">
            {/* Búsqueda de Ruta */}
            <div className="flex-1 flex items-center pl-6">
              <Search className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Busca por destino, duración (30min, 2h) o dificultad..."
                className="w-full bg-transparent text-gray-800 font-medium focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="mr-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Button */}
            <div className="pl-4 pr-2">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm uppercase tracking-wide flex items-center"
              >
                <span>Buscar</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </form>

        {/* Indicar filtros activos */}
        {(activeFilters.duration || activeFilters.difficulty) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            
            {activeFilters.duration && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                <Clock className="w-3 h-3" />
                <span>{durationFilters.find(f => f.value === activeFilters.duration)?.label}</span>
                <button 
                  onClick={() => handleFilterSelect('duration', activeFilters.duration)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            )}
            
            {activeFilters.difficulty && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>{difficultyFilters.find(f => f.value === activeFilters.difficulty)?.label}</span>
                <button 
                  onClick={() => handleFilterSelect('difficulty', activeFilters.difficulty)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            )}
            
            <button 
              onClick={clearAllFilters}
              className="text-xs text-red-500 hover:text-red-700 ml-2"
            >
              Limpiar todos
            </button>
          </div>
        )}
        
        {/* Sugerencias de búsqueda */}
        {showSuggestions && (
          <div className="absolute left-0 right-0 mt-2 z-10 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-60">
            <div className="p-2">
              {suggestions.length > 0 ? (
                <div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer rounded-lg group"
                    >
                      {suggestion.icon}
                      <span className="text-gray-800 group-hover:text-blue-700">{suggestion.text}</span>
                    </div>
                  ))}
                </div>
              ) : searchHistory.length > 0 ? (
                <div>
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Búsquedas recientes</div>
                  {searchHistory.map((query, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchQuery(query);
                        setShowSuggestions(false);
                        setTimeout(() => filterRoutes(), 100);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer rounded-lg"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{query}</span>
                    </div>
                  ))}
                </div>
              ) : null}
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
      {isSearching && (
        <div className="mt-8 w-full max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-blue-600 font-medium">Buscando rutas...</span>
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
                <h3 className="text-lg font-bold text-blue-700">{route.nombreRuta}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <p>{route.duracion}</p>
                  </div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
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
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 border-2 border-blue-500 z-10 relative">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          {i < arr.length - 1 && (
                            <div className="absolute top-8 left-1/2 w-0.5 h-full -translate-x-1/2 bg-blue-300" />
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
      
      {routes.length === 0 && !isSearching && searchQuery && (
        <div className="mt-8 w-full max-w-4xl p-6 bg-blue-50 rounded-lg text-center mx-auto">
          <p className="text-blue-800 text-lg">No se encontraron rutas que coincidan con tu búsqueda.</p>
          <p className="text-blue-600 mt-2">Intenta con otros términos o ajusta los filtros de búsqueda.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['cascada', 'fácil', '2 horas', 'bosque', 'mirador'].map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => {
                  setSearchQuery(suggestion);
                  setSearchFilter('all');
                  setTimeout(() => filterRoutes(), 100);
                }}
                className="px-3 py-1.5 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
              >
                {suggestion}
              </button>
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
