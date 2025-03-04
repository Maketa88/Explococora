import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, MapPin, Search, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export const SearchForm = ({ onSearch }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allRoutes, setAllRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Cargar todas las rutas al iniciar el componente
  useEffect(() => {
    const fetchAllRoutes = async () => {
      setIsSearching(true);
      try {
        const response = await axios.get('http://localhost:10101/rutas');
        if (Array.isArray(response.data)) {
          setAllRoutes(response.data);
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
  }, []);

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

  const handleSearch = () => {
    if (!selectedDifficulty) {
      setError("Por favor, selecciona un nivel de dificultad");
      return;
    }

    setIsSearching(true);
    setShowAnimation(true);
    
    // Simular tiempo de búsqueda y animación
    setTimeout(() => {
      const filteredRoutes = applyDifficultyFilter(selectedDifficulty);
      
      // Limitar a 5 rutas aleatorias para mostrar variedad
      const shuffled = [...filteredRoutes].sort(() => 0.5 - Math.random());
      const finalRoutes = shuffled.slice(0, 5);
      
      setRoutes(finalRoutes);
      
      // Notificar al componente padre sobre los resultados de búsqueda
      if (onSearch) {
        onSearch(finalRoutes);
      }
      
      // Mantener la animación visible por un tiempo antes de mostrar resultados
      setTimeout(() => {
        setShowAnimation(false);
        setIsSearching(false);
        
        // Solo mostrar resultados si hay rutas encontradas
        if (finalRoutes.length > 0) {
          setShowResults(true);
        } else {
          // Si no hay resultados, mostrar un error temporal
          setError("No se encontraron rutas para el nivel de dificultad seleccionado. Intenta con otro nivel.");
          setTimeout(() => setError(null), 4000); // El error desaparece después de 4 segundos
        }
      }, 3000);
    }, 1000);
  };

  // Función para cerrar los resultados
  const handleCloseResults = () => {
    setShowResults(false);
  };

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Contenedor principal de búsqueda - Rediseñado como un solo input */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-50 overflow-hidden relative">
          {/* Efectos de fondo decorativos */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-8 -top-8 h-32 w-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-40"></div>
            <div className="absolute -left-8 -bottom-8 h-24 w-24 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-full opacity-30"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-full blur-xl"></div>
          </div>
          
          {/* Input único con todos los elementos integrados */}
          <div className="relative p-3">
            <div className="flex items-center flex-wrap gap-2 bg-gray-50/80 rounded-xl border border-blue-100 shadow-inner p-3">
              {/* Etiqueta de dificultad al inicio */}
              <div className="flex items-center mr-2">
                <Zap className="w-5 h-5 text-amber-500 mr-1" />
                <span className="text-gray-700 font-medium">Dificultad</span>
              </div>
              
              {/* Opciones de dificultad en el medio */}
              <div className="flex-1 flex items-center justify-center gap-2">
                <DifficultyPill
                  title="Fácil" 
                  icon="🌱"
                  color="emerald"
                  isSelected={selectedDifficulty === 'facil'}
                  onClick={() => setSelectedDifficulty('facil')}
                />
                
                <DifficultyPill 
                  title="Moderada" 
                  icon="⛰️"
                  color="blue"
                  isSelected={selectedDifficulty === 'moderada'}
                  onClick={() => setSelectedDifficulty('moderada')}
                />
                
                <DifficultyPill 
                  title="Desafiante" 
                  icon="🏔️"
                  color="orange"
                  isSelected={selectedDifficulty === 'desafiante'}
                  onClick={() => setSelectedDifficulty('desafiante')}
                />
              </div>
              
              {/* Botón de búsqueda al final */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 flex items-center whitespace-nowrap"
              >
                <Search className="w-4 h-4 mr-1" />
                <span>Buscar Aventura</span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Mensajes de error */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg w-full max-w-lg mx-auto text-sm shadow-sm"
          >
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Animación de búsqueda */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <div className="max-w-xl w-full">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 backdrop-blur-sm z-10"></div>
                
                <div className="relative z-20 p-5 text-center">
                  <h3 className="text-xl font-bold text-white mb-4">Creando tu aventura perfecta</h3>
                  
                  <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl mb-5 overflow-hidden relative">
                    {/* Efecto de generación de imagen */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full absolute">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ 
                            x: ['-100%', '100%'],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5,
                            ease: "linear"
                          }}
                        />
                      </div>
                      
                      <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500"
                      animate={{ opacity: [1, 0.7, 0.5, 0.3, 0.1, 0] }}
                      transition={{ duration: 3, ease: "easeOut" }}
                    />
                    
                    {/* Pixeles que aparecen gradualmente */}
                    <motion.div 
                      className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 2 }}
                    >
                      {Array.from({ length: 48 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          className="bg-white/10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: Math.random() }}
                          transition={{ 
                            delay: Math.random() * 2,
                            duration: 0.5
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                  
                  <p className="text-white/90 mb-4 text-sm">
                    Analizando terrenos, clima y condiciones para ofrecerte la mejor experiencia
                  </p>
                  
                  <div className="flex justify-center space-x-2">
                    <motion.div 
                      className="h-2 w-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1, repeatDelay: 0.2 }}
                    />
                    <motion.div 
                      className="h-2 w-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1, repeatDelay: 0.3, delay: 0.1 }}
                    />
                    <motion.div 
                      className="h-2 w-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1, repeatDelay: 0.4, delay: 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Resultados de Rutas como superposición */}
      <AnimatePresence>
        {showResults && routes.length > 0 && !isSearching && !showAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 flex items-start justify-center pt-4 px-2 overflow-y-auto"
            style={{ backdropFilter: 'blur(5px)' }}
          >
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="w-full max-w-5xl bg-white rounded-xl shadow-2xl relative mb-8"
            >
              {/* Botón de cierre */}
              <button 
                onClick={handleCloseResults}
                className="absolute top-2 right-2 z-50 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Cerrar resultados"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 rounded-t-xl">
                <h2 className="text-2xl font-bold mb-1">Rutas Recomendadas</h2>
                <p className="text-blue-100 text-sm">Hemos encontrado {routes.length} rutas que coinciden con tu nivel de dificultad</p>
              </div>
              
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {routes.map((route, index) => (
                  <motion.div 
                    key={route.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`${
                      index !== routes.length - 1 ? 'border-b border-blue-100 pb-4 mb-4' : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="w-full lg:w-2/3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-xl font-bold text-blue-700">{route.nombreRuta}</h3>
                          <span className={`inline-block ${getDifficultyColor(route.dificultad)} text-sm px-3 py-1 rounded-full font-medium`}>
                            {route.dificultad}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-gray-600">
                          <span className="font-medium">{route.duracion}</span>
                        </div>
                        
                        <p className="text-gray-700 my-3 text-base">{route.descripcion}</p>
                      </div>
                      
                      <div className="w-full lg:w-1/3 bg-blue-50 rounded-lg p-3 shadow-sm">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                          Puntos de la ruta
                        </h4>
                        <div className="relative">
                          {generateRoutePoints(route).map((point, i, arr) => (
                            <div key={i} className="flex items-start mb-3">
                              <div className="relative">
                                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 border-2 border-blue-500 z-10 relative">
                                  <span className="text-blue-700 font-bold text-xs">{i+1}</span>
                                </div>
                                {i < arr.length - 1 && (
                                  <div className="absolute top-6 left-1/2 w-0.5 h-full -translate-x-1/2 bg-blue-300" />
                                )}
                              </div>
                              <div className="ml-2 mt-1">
                                <span className="text-gray-800 font-medium text-sm">{point}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-xl">
                <button 
                  onClick={handleCloseResults}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-300"
                >
                  Cerrar
                </button>
                <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                  Ver todas las rutas disponibles
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente para las opciones de dificultad en forma de píldora - Versión más compacta
const DifficultyPill = ({ title, icon, color, isSelected, onClick }) => {
  const colorClasses = {
    emerald: {
      bg: isSelected ? 'bg-emerald-100' : 'bg-white hover:bg-emerald-50',
      border: isSelected ? 'border-emerald-500' : 'border-gray-200',
      text: 'text-emerald-700',
      shadow: isSelected ? 'shadow-md shadow-emerald-100/50' : 'shadow-sm'
    },
    blue: {
      bg: isSelected ? 'bg-blue-100' : 'bg-white hover:bg-blue-50',
      border: isSelected ? 'border-blue-500' : 'border-gray-200',
      text: 'text-blue-700',
      shadow: isSelected ? 'shadow-md shadow-blue-100/50' : 'shadow-sm'
    },
    orange: {
      bg: isSelected ? 'bg-orange-100' : 'bg-white hover:bg-orange-50',
      border: isSelected ? 'border-orange-500' : 'border-gray-200',
      text: 'text-orange-700',
      shadow: isSelected ? 'shadow-md shadow-orange-100/50' : 'shadow-sm'
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${colorClasses[color].bg} ${colorClasses[color].border} ${colorClasses[color].shadow} 
        border rounded-lg p-1.5 cursor-pointer transition-all duration-300 relative overflow-hidden text-center flex items-center`}
    >
      {isSelected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-green-500 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
      
      <span className="text-lg mr-1">{icon}</span>
      <h3 className={`text-xs font-bold ${colorClasses[color].text}`}>{title}</h3>
    </motion.div>
  );
};

// Función para obtener color según dificultad
const getDifficultyColor = (difficulty) => {
  const lowerDifficulty = difficulty.toLowerCase();
  
  if (lowerDifficulty.includes('fácil') || lowerDifficulty.includes('facil')) {
    return 'bg-emerald-100 text-emerald-800';
  } else if (lowerDifficulty.includes('moderada')) {
    return 'bg-blue-100 text-blue-800';
  } else {
    return 'bg-orange-100 text-orange-800';
  }
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