import axios from 'axios';
import {
  Clock, DollarSign,
  Map,
  Package
  
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BotonPagoPaquete } from '../PagoPaquetes';

// Componente auxiliar para detener la propagación de eventos
const ButtonWrapper = ({ children }) => {
  const handleClick = (e) => {
    e.stopPropagation();
  };

  return <div onClick={handleClick}>{children}</div>;
};

const PaquetesTarjeta = ({ onPaqueteSeleccionado, paqueteActualId }) => {
  // Estados para la gestión de paquetes
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las imágenes
  const [paquetesConFotos, setPaquetesConFotos] = useState({});
  const [cargandoFotos, setCargandoFotos] = useState({});
  
  // Referencia para evitar recargas innecesarias
  const inicializadoRef = useRef(false);

  // Función para obtener la lista de paquetes
  const fetchPaquetes = async () => {
    // Si ya está cargando, no hacer nada
    if (!loading) setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:10101/paquete/lista-paquetes');
      
      // Verificar la estructura de la respuesta
      const paquetesData = response.data.result || [];
      
      // Filtrar paquetes duplicados por idPaquete
      const paquetesUnicos = Array.isArray(paquetesData) 
        ? paquetesData.filter((paquete, index, self) => 
            index === self.findIndex(p => p.idPaquete === paquete.idPaquete)
          )
        : [];
      
      // Para cada paquete, obtener sus rutas asociadas
      const paquetesConRutas = await Promise.all(
        paquetesUnicos.map(async (paquete) => {
          if (paquete.idPaquete) {
            const rutasAsociadas = await obtenerRutasAsociadas(paquete.idPaquete);
            return {
              ...paquete,
              rutasAsociadas: rutasAsociadas
            };
          }
          return paquete;
        })
      );
      
      setPaquetes(paquetesConRutas);
      
      // Obtener fotos para cada paquete
      if (Array.isArray(paquetesConRutas)) {
        paquetesConRutas.forEach(paquete => {
          if (paquete.idPaquete) {
            obtenerFotosPaquete(paquete.idPaquete);
          }
        });
      }
      
      setLoading(false);
      inicializadoRef.current = true;
    } catch (err) {
      console.error('Error al cargar paquetes:', err);
      setError('No se pudieron cargar los paquetes. Por favor, intente de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Optimizar la función de obtención de fotos
  const obtenerFotosPaquete = async (idPaquete) => {
    // Evitar cargar las mismas fotos múltiples veces
    if (paquetesConFotos[idPaquete] || cargandoFotos[idPaquete]) {
      return;
    }
    
    try {
      setCargandoFotos(prev => ({ ...prev, [idPaquete]: true }));
      
      const response = await axios.get(`http://localhost:10101/paquete/fotos-publicas/${idPaquete}`);
      
      // Extraer los datos de las fotos según la estructura de la respuesta
      let fotosArray = response.data;
      
      // Si la respuesta tiene una propiedad 'fotos', usar esa
      if (response.data && response.data.fotos && Array.isArray(response.data.fotos)) {
        fotosArray = response.data.fotos;
      }
      
      if (Array.isArray(fotosArray)) {
        // Formatear las imágenes para mostrarlas
        const fotosFormateadas = fotosArray.map(foto => {
          // Construir URL correctamente, verificando las posibles propiedades
          let imageUrl;
          
          // Verificar todas las posibles propiedades donde podría estar la URL
          if (foto.urlFoto) {
            imageUrl = foto.urlFoto;
          } else if (foto.fotoUrl) {
            imageUrl = foto.fotoUrl;
          } else if (foto.urlImagen) {
            imageUrl = foto.urlImagen;
          } else if (foto.url) {
            imageUrl = foto.url;
          } else if (foto.ruta) {
            imageUrl = `http://localhost:10101${foto.ruta}`;
          } else {
            // URL de fallback si no hay ninguna ruta válida
            imageUrl = '';
          }
          
          return {
            id: foto.id || foto.idFoto,
            url: imageUrl
          };
        });
        
        // Actualizar el estado con las fotos formateadas
        setPaquetesConFotos(prev => ({
          ...prev,
          [idPaquete]: fotosFormateadas
        }));
      } else {
        setPaquetesConFotos(prev => ({
          ...prev,
          [idPaquete]: []
        }));
      }
    } catch (err) {
      console.error('Error al obtener fotos del paquete:', err);
      setPaquetesConFotos(prev => ({
        ...prev,
        [idPaquete]: []
      }));
    } finally {
      setCargandoFotos(prev => ({ ...prev, [idPaquete]: false }));
    }
  };

  // Función para obtener información de las rutas asociadas
  const obtenerRutasAsociadas = async (idPaquete) => {
    try {
      
      
      // Intentar obtener el paquete directamente por ID
      const response = await axios.get(`http://localhost:10101/paquete/obtener-paquete/${idPaquete}`);
      
      
      // Verificar si la respuesta es un array
      if (response.data && Array.isArray(response.data)) {
        // La respuesta es un array, extraer todas las rutas
        const rutasInfo = [];
        
        // Recorrer cada elemento del array para extraer información de rutas
        response.data.forEach(item => {
          // Agregar cada ruta del array sin filtrar por ID
          rutasInfo.push({
            idRuta: item.idRuta,
            nombreRuta: item.nombreRuta || `Ruta ${item.idRuta}`,
            tiempoEstimado: item.duracion || item.tiempoEstimado || null
          });
        });
        
       
        return rutasInfo;
      } else if (response.data && typeof response.data === 'object') {
        // Si la respuesta es un objeto único, buscar rutas en él
        const rutasInfo = [];
        
        // Verificar si el objeto tiene propiedades de ruta
        if (response.data.idRuta || response.data.nombreRuta) {
          rutasInfo.push({
            idRuta: response.data.idRuta,
            nombreRuta: response.data.nombreRuta || `Ruta ${response.data.idRuta}`,
            tiempoEstimado: response.data.duracion || response.data.tiempoEstimado || null
          });
        }
        
        // Verificar si hay un array de rutas en alguna propiedad
        if (response.data.rutas && Array.isArray(response.data.rutas)) {
          response.data.rutas.forEach(ruta => {
            if (!rutasInfo.some(r => r.idRuta === ruta.idRuta)) {
              rutasInfo.push({
                idRuta: ruta.idRuta,
                nombreRuta: ruta.nombreRuta || `Ruta ${ruta.idRuta}`,
                tiempoEstimado: ruta.duracion || ruta.tiempoEstimado || null
              });
            }
          });
        }
        
        // Si encontramos rutas, retornar el array
        if (rutasInfo.length > 0) {
         
          return rutasInfo;
        } else {
          // Si no hay rutas en la respuesta, mostrar mensaje
          
          return [];
        }
      } else {
        
        return [];
      }
    } catch (err) {
      console.error('Error al obtener rutas asociadas:', err);
      return [];
    }
  };

  // Cargar paquetes solo una vez al montar el componente
  useEffect(() => {
    if (!inicializadoRef.current) {
      fetchPaquetes();
    }
  }, []);

  // Función para manejar el clic en un paquete
  const handlePaqueteClick = (paquete) => {
    if (onPaqueteSeleccionado) {
      onPaqueteSeleccionado(paquete);
    }
  };

  // Función para mostrar precio formateado
  const mostrarPrecio = (precio) => {
    if (!precio) return '$0';
    return `$${parseInt(precio).toLocaleString('es-CO')}`;
  };

  // Función para obtener un ícono según el tipo de paquete
  const getPackageIcon = () => {
    return <Package className="w-16 h-16 text-emerald-600" />;
  };

  // Función para calcular la duración total de las rutas de un paquete
  const calcularDuracionTotalPaquete = (paquete) => {
    if (!paquete.rutasAsociadas || !paquete.rutasAsociadas.length) return paquete.duracion || 'No especificada';
    
    let horasTotales = 0;
    let minutosTotales = 0;
    
    paquete.rutasAsociadas.forEach(ruta => {
      if (ruta.tiempoEstimado) {
        const tiempo = ruta.tiempoEstimado.toLowerCase();
        
        // Extraer horas
        const horasMatch = tiempo.match(/(\d+)\s*(?:h|hora|horas)/);
        if (horasMatch) horasTotales += parseInt(horasMatch[1]);
        
        // Extraer minutos
        const minutosMatch = tiempo.match(/(\d+)\s*(?:m|min|minuto|minutos)/);
        if (minutosMatch) minutosTotales += parseInt(minutosMatch[1]);
      }
    });
    
    // Convertir minutos excedentes a horas
    if (minutosTotales >= 60) {
      horasTotales += Math.floor(minutosTotales / 60);
      minutosTotales = minutosTotales % 60;
    }
    
    // Formar el string de duración total
    let duracionTotal = '';
    if (horasTotales > 0) duracionTotal += `${horasTotales} hora${horasTotales !== 1 ? 's' : ''}`;
    if (minutosTotales > 0) {
      if (duracionTotal) duracionTotal += ' ';
      duracionTotal += `${minutosTotales} minuto${minutosTotales !== 1 ? 's' : ''}`;
    }
    
    return duracionTotal || paquete.duracion || 'No especificada';
  };

  return (
    <section className="relative px-4 overflow-hidden mb-5">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        
      </div>
      <div className="container mx-auto px-4">
        <div className="relative py-8 mb-10">
          {/* Bolitas decorativas a los lados */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Bolitas lado izquierdo */}
            <div className="absolute top-1/4 left-4 w-5 h-5 bg-emerald-600 rounded-full opacity-20 animate-pulse"></div>
            <div
              className="absolute top-1/2 left-12 w-3 h-3 bg-emerald-700 rounded-full opacity-30 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-1/4 left-8 w-4 h-4 bg-emerald-500 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>

            {/* Bolitas lado derecho */}
            <div
              className="absolute top-1/3 right-10 w-4 h-4 bg-emerald-600 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "0.7s" }}
            ></div>
            <div
              className="absolute top-2/3 right-6 w-5 h-5 bg-emerald-700 rounded-full opacity-15 animate-pulse"
              style={{ animationDelay: "1.2s" }}
            ></div>
            <div
              className="absolute bottom-1/3 right-16 w-3 h-3 bg-emerald-500 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
          
          {/* Líneas decorativas */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"></div>

          {/* Título principal con efectos */}
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-black tracking-tight relative inline-block">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 drop-shadow-sm">
                Paquetes Turísticos
              </span>
            </h1>

            {/* Subtítulo o decoración */}
            <div className="mt-2 text-xs font-medium uppercase tracking-widest text-emerald-600 opacity-80">
              <span className="inline-block mx-2">✦</span>
              <span>Descubre nuestras experiencias más completas</span>
              <span className="inline-block mx-2">✦</span>
            </div>
            
            {/* Líneas decorativas bajo el título */}
            
          </div>
        </div>
              
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-lg shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-500 mr-2"
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
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
              
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse flex space-x-1">
              <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        ) : paquetes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 justify-items-center mx-auto p-4">
            {paquetes.map((paquete, index) => (
              <div
                key={`paquete-${paquete.idPaquete || paquete.id || index}`}
                className={`group bg-white rounded-lg shadow-sm overflow-hidden border border-emerald-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full w-full max-w-[200px] cursor-pointer ${
                  paqueteActualId === paquete.idPaquete ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-200/50 z-10' : ''
                }`}
                onClick={() => handlePaqueteClick(paquete)}
              >
                {/* Cinta decorativa en la esquina */}
                <div className="absolute -right-6 -top-1 w-20 h-6 bg-teal-600 text-white text-[10px] font-bold px-0 py-1 shadow-md transform rotate-45 z-10 flex items-center justify-center">
                  <span className="text-white tracking-wider uppercase">
                    Paquete
                  </span>
                </div>
        
                {/* Encabezado de la carta */}
                <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-1.5 relative overflow-hidden h-12 flex flex-col justify-center">
                  <h2 className="text-sm font-bold relative z-10 line-clamp-1">
                    {paquete.nombrePaquete}
                  </h2>
                  <div className="flex items-center space-x-1 relative z-10">
                    <span className="inline-block px-1 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200 text-emerald-800">
                      {paquete.rutasAsociadas?.length || 0} rutas
                    </span>
                    {paquete.descuento > 0 && (
                      <span className="inline-block px-1 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-800">
                        {paquete.descuento}% desc
                      </span>
                    )}
                  </div>
                </div>
      
                {/* Imagen */}
                <div className="relative h-24 overflow-hidden">
                  {cargandoFotos[paquete.idPaquete] ? (
                    <div className="flex justify-center items-center h-full bg-gray-100">
                      <div className="animate-pulse flex space-x-1">
                        <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                        <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  ) : paquetesConFotos[paquete.idPaquete] && paquetesConFotos[paquete.idPaquete].length > 0 ? (
                    <div className="h-full relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                      {/* Estrellas de calificación */}
                      <div className="absolute bottom-1 right-1 z-20 bg-white/40 rounded-full px-1.5 py-0.5 flex items-center"><div className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                         
                        </div>
                      </div>
                      <img
                        src={paquetesConFotos[paquete.idPaquete][0].url}
                        alt={`Foto de ${paquete.nombrePaquete}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x200?text=Imagen+no+disponible";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 relative">
                      {/* Estrellas de calificación para tarjetas sin imágenes */}
                      <div className="absolute bottom-1 right-1 z-20 bg-teal-100/80 rounded-full px-1.5 py-0.5 flex items-center">
                        <div className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                      <Package size={24} className="text-emerald-600" />
                    </div>
                  )}
                </div>
                  
                {/* Contenido de la carta */}
                <div className="p-1.5 relative flex-grow flex flex-col">
                  {/* Información destacada */}
                  <div className="grid grid-cols-2 gap-1 mb-2 relative z-10">
                    <div className="flex flex-col items-center p-1 bg-emerald-50 rounded-md shadow-sm">
                      <Clock className="h-3 w-3 text-emerald-700 mb-0.5" />
                      <span className="text-emerald-800 text-[9px]  font-medium truncate w-full text-center">
                        Duración
                      </span>
                      <span className="text-emerald-900 text-[8px] font-bold truncate w-full text-center">
                        {calcularDuracionTotalPaquete(paquete)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 bg-emerald-50 rounded-md shadow-sm">
                      <DollarSign className="h-3 w-3 text-emerald-700 mb-0.5" />
                      <span className="text-emerald-800 text-[9px]  font-medium truncate w-full text-center">
                        Precio
                      </span>
                      <span className="text-emerald-900 text-[8px] font-bold truncate w-full text-center">
                        {mostrarPrecio(paquete.precio)}
                      </span>
                    </div>
                  </div>
                      
                  {/* Descripción */}
                  <div className="mb-2 relative z-10">
                    <h3 className="text-emerald-800 text-[10px] font-semibold mb-0.5 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2.5 w-2.5 mr-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Descripción
                    </h3>
                    <div className="bg-white bg-opacity-70 p-1 rounded-md shadow-inner">
                      <p className="text-gray-700 text-[9px] line-clamp-2 italic">
                        {paquete.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Detalles adicionales condensados */}
                  <div className="flex flex-col space-y-1 mb-2 relative z-10">
                    <div className="flex items-center bg-white p-1 rounded-md">
                      <Map className="h-2.5 w-2.5 text-emerald-700 mr-1" />
                      <span className="text-gray-700 text-[9px]">
                        <span className="font-medium">Rutas:</span>{" "}
                        {paquete.rutasAsociadas?.length || 0}
                      </span>
                    </div>
                    {paquete.descuento > 0 && (
                      <div className="flex items-center bg-white p-1 rounded-md">
                        <DollarSign className="h-2.5 w-2.5 text-emerald-700 mr-1" />
                        <span className="text-gray-700 text-[9px]">
                          <span className="font-medium">Final:</span>{" "}
                          ${(paquete.precio * (1 - paquete.descuento / 100)).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                      
                  {/* Botón para reservar - Envuelto en ButtonWrapper para detener propagación */}
                  <ButtonWrapper>
                    <BotonPagoPaquete
                      paquete={paquete}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-1.5 px-2 rounded-md transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center mt-auto"
                    />
                  </ButtonWrapper>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 text-center p-6 rounded-lg border border-emerald-100">
            <div className="flex justify-center mb-3">
              {getPackageIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay paquetes disponibles</h3>
            <p className="text-emerald-700 text-sm">No se encontraron paquetes turísticos.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaquetesTarjeta;

