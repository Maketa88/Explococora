import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

export const NuestrasRutas = () => {
  const { t } = useTranslation();
  const { idRuta } = useParams(); // Obtener el parámetro de la URL
  const location = useLocation();
  const [rutas, setRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [error, setError] = useState(null);
  const [cargandoFotos, setCargandoFotos] = useState({});
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [rutaActualSlider, setRutaActualSlider] = useState(0);
  const sliderInterval = useRef(null);
  
  // Determinar si estamos en la vista de cliente
  const isClientView = location.pathname.includes('/VistaCliente');
  
  // Estados para los filtros
 

  // Función para volver a la vista anterior
  const volverAtras = () => {
    if (isClientView) {
      window.location.href = '/VistaCliente/NuestrasRutas';
    } else {
      window.location.href = '/NuestrasRutas';
    }
  };

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/rutas');

        if (Array.isArray(response.data)) {
          setRutas(response.data);
          
          // Si hay un ID de ruta en la URL, filtrar para mostrar solo esa ruta
          if (idRuta) {
            // Intentar convertir a número si es posible
            const idRutaNum = !isNaN(parseInt(idRuta)) ? parseInt(idRuta) : idRuta;
            console.log(`Buscando ruta con ID: ${idRutaNum}, tipo: ${typeof idRutaNum}`);
            
            // Buscar la ruta por ID, probando tanto con string como con número
            const rutaFiltrada = response.data.find(
              ruta => ruta.idRuta === idRutaNum || 
                     ruta.idRuta === idRuta || 
                     ruta.idRuta === String(idRutaNum)
            );
            
            if (rutaFiltrada) {
              console.log("Ruta encontrada:", rutaFiltrada);
              setRutaSeleccionada(rutaFiltrada);
              setRutasFiltradas([rutaFiltrada]);
            } else {
              console.error(`No se encontró ninguna ruta con ID: ${idRuta}`);
              setRutasFiltradas(response.data);
              setError(`No se encontró la ruta con ID: ${idRuta}`);
            }
          } else {
            setRutasFiltradas(response.data);
          }
          
          // Obtener fotos para cada ruta
          response.data.forEach(ruta => {
            // Verificar que la ruta tenga un ID válido
            if (ruta && ruta.idRuta && !isNaN(ruta.idRuta)) {
              setCargandoFotos(prev => ({...prev, [ruta.idRuta]: true}));
              obtenerFotosRuta(ruta.idRuta);
            }
          });
        } else {
          throw new Error("La respuesta no es un array");
        }
      } catch (error) {
        console.error("Error al obtener las rutas:", error);
        setError(error.message);
      }
    };

    fetchRutas();
  }, [idRuta]);
  
  // Configurar el slider automático
  useEffect(() => {
    if (!rutaSeleccionada && rutas.length > 0) {
      sliderInterval.current = setInterval(() => {
        setRutaActualSlider(prevIndex => (prevIndex + 1) % rutas.length);
      }, 8000); // Cambiar cada 5 segundos
    }
    
    return () => {
      if (sliderInterval.current) {
        clearInterval(sliderInterval.current);
      }
    };
  }, [rutas, rutaSeleccionada]);
  
  // Función para obtener las fotos de una ruta específica
  const obtenerFotosRuta = async (idRuta) => {
    try {
      // Verificar que el ID sea válido antes de hacer la petición
      if (!idRuta || isNaN(idRuta)) {
        console.warn("ID de ruta no válido:", idRuta);
        setCargandoFotos(prev => ({...prev, [idRuta]: false}));
        return;
      }
      
      const response = await axios.get(`http://localhost:10101/rutas/fotos-publicas/${idRuta}`);
      
      if (response.data && response.data.fotos && Array.isArray(response.data.fotos)) {
        let fotosArray = [];
        
        // Extraer las URLs de las fotos según la estructura exacta
        const primerElemento = response.data.fotos[0];
        
        if (Array.isArray(primerElemento)) {
          // Extraer las URLs de los objetos en el primer elemento
          primerElemento.map(item => {
            if (item && typeof item === 'object' && item.foto && typeof item.foto === 'string') {
              fotosArray.push(item.foto);
            }
          });
        }
        
        // Limitar a solo 4 fotos
        const fotosFiltradas = fotosArray.slice(0, 4);
        
        if (fotosFiltradas.length > 0) {
          setRutasConFotos(prevState => ({
            ...prevState,
            [idRuta]: fotosFiltradas
          }));
        }
      }
      setCargandoFotos(prev => ({...prev, [idRuta]: false}));
    } catch (error) {
      console.error(`Error al obtener fotos para la ruta ${idRuta}:`, error);
      setCargandoFotos(prev => ({...prev, [idRuta]: false}));
    }
  };

  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-center text-green-600">
          {rutaSeleccionada ? rutaSeleccionada.nombreRuta : t('tituloRutas', 'Nuestras Rutas')}
        </h1>
        
        {rutaSeleccionada && (
          <button
            onClick={volverAtras}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('volver', 'Volver')}
          </button>
        )}
      </div>
      
      {!rutaSeleccionada && (
        <>
          {/* Slider destacado */}
          {Array.isArray(rutasFiltradas) && rutasFiltradas.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-teal-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {t('rutaDestacada', 'Ruta Destacada')}
              </h2>
              
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Columna izquierda - Galería */}
                  <div className="bg-teal-50 p-3 sm:p-6 shadow-lg border border-teal-200 h-full">
                    {cargandoFotos[rutasFiltradas[rutaActualSlider]?.idRuta] ? (
                      <div className="flex justify-center items-center h-64 bg-teal-100 rounded-xl">
                        <div className="animate-pulse flex space-x-3">
                          <div className="h-3 w-3 bg-teal-600 rounded-full animate-bounce"></div>
                          <div className="h-3 w-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-3 w-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    ) : rutasConFotos[rutasFiltradas[rutaActualSlider]?.idRuta] && rutasConFotos[rutasFiltradas[rutaActualSlider]?.idRuta].length > 0 ? (
                      <div className="h-[250px] sm:h-[350px] overflow-hidden shadow-lg border border-teal-300 relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                        <img 
                          src={rutasConFotos[rutasFiltradas[rutaActualSlider]?.idRuta][0]} 
                          alt={rutasFiltradas[rutaActualSlider]?.nombreRuta}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x600?text=Imagen+no+disponible';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-64 bg-teal-100 rounded-xl">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-teal-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-teal-600 font-medium">{t('sinFotos', 'No hay fotos disponibles')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Columna derecha - Información */}
                  <div className="flex flex-col space-y-4 sm:space-y-6 p-6">
                    <div className="bg-teal-800 py-3 px-4 rounded-lg shadow-md">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {rutasFiltradas[rutaActualSlider]?.nombreRuta}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md ${
                          rutasFiltradas[rutaActualSlider]?.dificultad === 'Facil' ? 'bg-green-600 text-white' : 
                          rutasFiltradas[rutaActualSlider]?.dificultad === 'Moderada' ? 'bg-yellow-600 text-white' : 
                          'bg-red-600 text-white'
                        }`}>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {rutasFiltradas[rutaActualSlider]?.dificultad}
                          </span>
                        </span>
                        <span className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md ${
                          rutasFiltradas[rutaActualSlider]?.estado === 'Activa' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {rutasFiltradas[rutaActualSlider]?.estado}
                          </span>
                        </span>
                        <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 bg-teal-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                            {rutasFiltradas[rutaActualSlider]?.tipo}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Descripción */}
                    <div className="bg-teal-50 p-4 sm:p-6 shadow-lg border border-teal-200 relative flex-grow">
                      <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6 bg-teal-800 text-white px-3 sm:px-6 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('descripcion', 'Descripción')}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mt-2 sm:mt-3 text-sm sm:text-base line-clamp-3">
                        {rutasFiltradas[rutaActualSlider]?.descripcion}
                      </p>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-teal-50 p-3 sm:p-4 shadow-md border border-teal-200">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <div className="bg-teal-800 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-teal-800">{t('duracion', 'Duración')}</h3>
                            <p className="text-base sm:text-xl font-bold text-teal-900">{rutasFiltradas[rutaActualSlider]?.duracion}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 p-3 sm:p-4 shadow-md border border-teal-200">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <div className="bg-teal-800 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-teal-800">{t('distancia', 'Distancia')}</h3>
                            <p className="text-base sm:text-xl font-bold text-teal-900">{rutasFiltradas[rutaActualSlider]?.distancia} km</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 p-3 sm:p-4 shadow-md border border-teal-200">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <div className="bg-teal-800 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-teal-800">{t('capacidadMaxima', 'Capacidad')}</h3>
                            <p className="text-base sm:text-xl font-bold text-teal-900">{rutasFiltradas[rutaActualSlider]?.capacidadMaxima}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botón para ver detalles */}
                    <div className="flex justify-center mt-2 sm:mt-6">
                      <button 
                        onClick={() => {
                          const idRuta = rutasFiltradas[rutaActualSlider]?.idRuta;
                          if (isClientView) {
                            window.location.href = `/VistaCliente/NuestrasRutas/${idRuta}`;
                          } else {
                            window.location.href = `/NuestrasRutas/${idRuta}`;
                          }
                        }}
                        className="bg-teal-800 hover:bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center text-sm sm:text-base"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('verDetalles', 'Ver Detalles')}
                      </button>
                    </div>
                    
                    {/* Indicadores del slider */}
                    <div className="flex justify-center space-x-2 mt-4">
                      {rutasFiltradas.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setRutaActualSlider(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === rutaActualSlider ? 'bg-teal-800 w-6' : 'bg-teal-300 hover:bg-teal-400'
                          }`}
                          aria-label={`Ver ruta ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          
        </>
      )}
      
     
      
      {error && <p className="text-red-500">{error}</p>}
      
      {rutaSeleccionada ? (
        // Vista detallada de una ruta específica
        <div className="fixed inset-0 bg-teal-800 overflow-auto z-50">
          {/* Barra superior con botón de volver y título */}
          <div className="bg-teal-900 py-2 px-4 flex flex-wrap items-center shadow-md">
            <button
              onClick={volverAtras}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-300 hover:scale-105 mr-3"
              aria-label="Volver a inicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg truncate max-w-[calc(100%-3rem)]">
              {rutaSeleccionada.nombreRuta}
            </h1>
          </div>
          
          {/* Barra de etiquetas */}
          <div className="bg-teal-800 py-3 px-4 flex flex-wrap items-center gap-2 sm:gap-3 shadow-md">
            <span className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md ${
              rutaSeleccionada.dificultad === 'Facil' ? 'bg-green-600 text-white' : 
              rutaSeleccionada.dificultad === 'Moderada' ? 'bg-yellow-600 text-white' : 
              'bg-red-600 text-white'
            }`}>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {rutaSeleccionada.dificultad}
              </span>
            </span>
            <span className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md ${
              rutaSeleccionada.estado === 'Activa' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
            }`}>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {rutaSeleccionada.estado}
              </span>
            </span>
            <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 bg-teal-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                {rutaSeleccionada.tipo}
              </span>
            </span>
          </div>
          
          {/* Contenido principal con efecto de desplazamiento */}
          <div className="min-h-screen">
            {/* Contenido principal - Dividido en dos columnas */}
            <div className="bg-white">
              <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  {/* Columna izquierda - Galería */}
                  <div className="bg-teal-50 p-3 sm:p-6 shadow-lg border border-teal-200 h-full">
                    <h2 className="text-xl sm:text-2xl font-bold text-teal-800 mb-3 sm:mb-6 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t('galeria', 'Galería de Imágenes')}
                    </h2>
                    
                    {cargandoFotos[rutaSeleccionada.idRuta] ? (
                      <div className="flex justify-center items-center h-64 bg-teal-100 rounded-xl">
                        <div className="animate-pulse flex space-x-3">
                          <div className="h-3 w-3 bg-teal-600 rounded-full animate-bounce"></div>
                          <div className="h-3 w-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-3 w-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    ) : rutasConFotos[rutaSeleccionada.idRuta] && rutasConFotos[rutaSeleccionada.idRuta].length > 0 ? (
                      <GaleriaInmersiva fotos={rutasConFotos[rutaSeleccionada.idRuta]} nombreRuta={rutaSeleccionada.nombreRuta} />
                    ) : (
                      <div className="flex justify-center items-center h-64 bg-teal-100 rounded-xl">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-teal-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-teal-600 font-medium">{t('sinFotos', 'No hay fotos disponibles')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Columna derecha - Información */}
                  <div className="flex flex-col space-y-4 sm:space-y-6 h-full">
                    {/* Descripción con estilo */}
                    <div className="bg-teal-50 p-4 sm:p-6 shadow-lg border border-teal-200 relative flex-grow">
                      <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6 bg-teal-800 text-white px-3 sm:px-6 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('descripcion', 'Descripción')}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mt-2 sm:mt-3 text-sm sm:text-base">{rutaSeleccionada.descripcion}</p>
                    </div>
                    
                    {/* Tarjetas de información */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-teal-50 p-3 sm:p-4 shadow-md border border-teal-200">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <div className="bg-teal-800 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-teal-800">{t('duracion', 'Duración')}</h3>
                            <p className="text-base sm:text-xl font-bold text-teal-900">{rutaSeleccionada.duracion}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 p-3 sm:p-4 shadow-md border border-teal-200">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <div className="bg-teal-800 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-teal-800">{t('distancia', 'Distancia')}</h3>
                            <p className="text-base sm:text-xl font-bold text-teal-900">{rutaSeleccionada.distancia} km</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 p-3 sm:p-4 shadow-md border border-teal-200">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <div className="bg-teal-800 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-teal-800">{t('capacidadMaxima', 'Capacidad Máxima')}</h3>
                            <p className="text-base sm:text-xl font-bold text-teal-900">{rutaSeleccionada.capacidadMaxima} personas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botón para reservar */}
                    <div className="flex justify-center mt-2 sm:mt-6">
                      <button 
                        className="bg-teal-800 hover:bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center text-sm sm:text-base"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('reservarRuta', 'Reservar esta ruta')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Vista de lista de rutas
        <div className="container mx-auto">
          {/* Aquí iría el contenido de la vista de lista de rutas si se necesita en el futuro */}
        </div>
      )}
    </div>
  );
};

// Componente para la galería vertical (imagen grande arriba, miniaturas debajo)
const GaleriaInmersiva = ({ fotos, nombreRuta }) => {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(0);
  
  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Imagen grande arriba */}
      <div className="h-[250px] sm:h-[350px] overflow-hidden shadow-lg border border-teal-300 relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <img 
          src={fotos[fotoSeleccionada]} 
          alt={`Vista principal de ${nombreRuta}`}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/800x600?text=Imagen+no+disponible';
          }}
        />
      </div>
      
      {/* Miniaturas abajo */}
      <div className="grid grid-cols-4 gap-2">
        {fotos.map((foto, index) => (
          <div 
            key={index} 
            className={`h-20 overflow-hidden shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 ${fotoSeleccionada === index ? 'border-teal-600 ring-2 ring-teal-400/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
            onClick={() => setFotoSeleccionada(index)}
          >
            <img 
              src={foto} 
              alt={`Miniatura ${index + 1} de ${nombreRuta}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NuestrasRutas;