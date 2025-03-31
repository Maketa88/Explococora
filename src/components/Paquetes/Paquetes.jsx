import axios from 'axios';
import {
  Clock, DollarSign,
  Map,
  Package,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const GestionPaquetes = () => {
  // Estados para la gestión de paquetes
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  // Estados para las imágenes y carousel
  const [paquetesConFotos, setPaquetesConFotos] = useState({});
  const [cargandoFotos, setCargandoFotos] = useState({});
  const [paqueteActual, setPaqueteActual] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [desplazando, setDesplazando] = useState(false);
  const carouselRef = useRef(null);

  // Función para obtener la lista de paquetes
  const fetchPaquetes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:10101/paquete/lista-paquetes');
      console.log('Paquetes cargados:', response.data);
      
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
      
      // Establecer el paquete actual al primero de la lista
      if (paquetesConRutas.length > 0) {
        setPaqueteActual(paquetesConRutas[0]);
      }
      
      // Obtener fotos para cada paquete
      if (Array.isArray(paquetesConRutas)) {
        paquetesConRutas.forEach(paquete => {
          if (paquete.idPaquete) {
            obtenerFotosPaquete(paquete.idPaquete);
          }
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar paquetes:', err);
      setError('No se pudieron cargar los paquetes. Por favor, intente de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Función para obtener las fotos de un paquete
  const obtenerFotosPaquete = async (idPaquete) => {
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
        
        // Resetear la posición del scroll cuando cambian las fotos
        if (carouselRef.current) {
          carouselRef.current.scrollLeft = 0;
        }
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
      console.log('Obteniendo rutas para el paquete:', idPaquete);
      
      // Intentar obtener el paquete directamente por ID
      const response = await axios.get(`http://localhost:10101/paquete/obtener-paquete/${idPaquete}`);
      console.log('Respuesta de obtener-paquete:', response.data);
      
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
        
        console.log('Rutas encontradas:', rutasInfo);
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
          console.log('Rutas encontradas:', rutasInfo);
          return rutasInfo;
        } else {
          // Si no hay rutas en la respuesta, mostrar mensaje
          console.log('No se encontraron rutas en la respuesta');
          return [];
        }
      } else {
        console.log('Formato de respuesta no reconocido');
        return [];
      }
    } catch (err) {
      console.error('Error al obtener rutas asociadas:', err);
      return [];
    }
  };

  // Función para cambiar entre paquetes
  const cambiarPaquete = async (direccion) => {
    const indiceActual = paquetes.findIndex(p => p.idPaquete === paqueteActual.idPaquete);
    const nuevoIndice = direccion === 'siguiente'
      ? (indiceActual + 1) % paquetes.length
      : (indiceActual - 1 + paquetes.length) % paquetes.length;
    
    setPaqueteActual(paquetes[nuevoIndice]);
    
    // Si no tenemos fotos de este paquete, las obtenemos
    if (!paquetesConFotos[paquetes[nuevoIndice].idPaquete]) {
      obtenerFotosPaquete(paquetes[nuevoIndice].idPaquete);
    }
  };

  // Función para desplazar el carousel
  const desplazarCarousel = (direccion) => {
    if (desplazando || !carouselRef.current) return;
    
    setDesplazando(true);
    
    const carousel = carouselRef.current;
    const scrollAmount = carousel.clientWidth * 0.5;
    const newScrollLeft = direccion === 'derecha' 
      ? carousel.scrollLeft + scrollAmount 
      : carousel.scrollLeft - scrollAmount;
    
    carousel.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
    
    setTimeout(() => setDesplazando(false), 500);
  };

  // Cargar paquetes al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPaquetes();
  }, []);

  // Función para manejar búsqueda
  const handleSearchChange = (e) => {
    setTerminoBusqueda(e.target.value);
    
    if (e.target.value.trim() === '') {
      // Si la búsqueda está vacía, restaurar todos los paquetes
      if (paquetes.length > 0) {
        setPaqueteActual(paquetes[0]);
      }
    } else {
      const termino = e.target.value.toLowerCase().trim();
      const resultados = paquetes.filter(paquete => 
        paquete.nombrePaquete?.toLowerCase().includes(termino) ||
        paquete.descripcion?.toLowerCase().includes(termino)
      );
      
      // Si hay resultados, actualizar el paquete actual al primer resultado
      if (resultados.length > 0) {
        setPaqueteActual(resultados[0]);
      }
    }
  };

  // Función para mostrar precio formateado
  const mostrarPrecio = (precio) => {
    if (!precio) return '$0';
    return `$${parseInt(precio).toLocaleString('es-CO')}`;
  };
  
  // Función para calcular la duración total de las rutas de un paquete
  const calcularDuracionTotalPaquete = (paquete) => {
    if (!paquete?.rutasAsociadas || !paquete.rutasAsociadas.length) return paquete?.duracion || 'No especificada';
    
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

  // Función para abrir el lightbox
  const handleLightbox = (imagenes, index) => {
    setImagenesPreview(imagenes);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Función para navegar entre imágenes en el lightbox
  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < imagenesPreview.length) {
      setLightboxIndex(newIndex);
    }
  };
  
  // Renderizado del slider
  const renderSlider = () => {
    const fotos = paqueteActual && paquetesConFotos[paqueteActual.idPaquete] 
      ? paquetesConFotos[paqueteActual.idPaquete] 
      : [];
    
    if (cargandoFotos[paqueteActual?.idPaquete]) {
      return (
        <div className="max-w-[1360px] mx-auto relative mb-8 h-96 bg-emerald-50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      );
    }
    
    if (fotos.length === 0) {
      return (
        <div className="max-w-[1360px] mx-auto relative mb-8 h-96 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Package size={64} className="text-emerald-600/70" />
          <p className="mt-4 text-emerald-700 font-medium">No hay imágenes disponibles</p>
        </div>
      );
    }
    
    return (
      <div className="max-w-[1360px] mx-auto relative mb-8">
        {/* Áreas clickeables para navegar */}
        <div 
          className="absolute left-0 top-0 w-16 h-full z-10 cursor-pointer hover:bg-gradient-to-r from-black/20 to-transparent transition-all duration-300"
          onClick={() => desplazarCarousel('izquierda')}
        ></div>
        <div 
          className="absolute right-0 top-0 w-16 h-full z-10 cursor-pointer hover:bg-gradient-to-l from-black/20 to-transparent transition-all duration-300"
          onClick={() => desplazarCarousel('derecha')}
        ></div>
        
        {/* Contenedor del carousel */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto h-96 rounded-lg shadow-lg scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {fotos.map((foto, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-1/2 p-1 relative"
            >
              <div 
                className="w-full h-full relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handleLightbox(fotos.map(img => img.url), index)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <img
                  src={foto.url}
                  alt={`Foto ${index + 1} de ${paqueteActual?.nombrePaquete}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentNode.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-emerald-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="6" width="20" height="12" rx="2"/>
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                      </div>
                    `;
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 text-white p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
                  <p className="text-sm font-medium">{paqueteActual?.nombrePaquete} • Foto {index + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Botones de navegación fotos */}
        <button
          onClick={() => desplazarCarousel('izquierda')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group z-20"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => desplazarCarousel('derecha')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group z-20"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  // Renderizado principal
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        Error al cargar los paquetes: {error}
      </div>
    );
  }

  if (!paqueteActual) {
    return (
      <div className="text-center p-4">
        No hay paquetes disponibles
      </div>
    );
  }

  return (
    <>
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Fondo decorativo inspirado en el Valle del Cocora */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

          {/* Siluetas de palmeras y elementos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg
              viewBox="0 0 1200 600"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Silueta de montaña con árboles */}
              <path
                d="M0,600 L300,200 L400,300 L500,150 L600,250 L800,100 L1000,300 L1200,200 L1200,600 Z"
                fill="#047857"
                opacity="0.3"
              />
              
              {/* Arroyo serpenteante */}
              <path
                d="M0,450 C100,430 150,470 250,440 C350,410 400,450 500,430 C600,410 650,450 750,430 C850,410 900,450 1000,430 C1100,410 1150,450 1200,430 L1200,500 C1100,520 1050,480 950,500 C850,520 800,480 700,500 C600,520 550,480 450,500 C350,520 300,480 200,500 C100,520 50,480 0,500 Z"
                fill="#047857"
                opacity="0.4"
              />
              
              {/* Siluetas de árboles y elementos decorativos */}
              <path
                d="M200,600 L200,400 L150,400 L200,350 L170,350 L220,300 L190,300 L240,250 L210,250 L250,200 L230,200 L270,150 L250,150 L280,100 L310,150 L290,150 L330,200 L310,200 L350,250 L320,250 L370,300 L340,300 L390,350 L360,350 L410,400 L360,400 L360,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Más elementos decorativos del paisaje */}
              <path
                d="M600,600 L600,350 C600,350 550,300 570,250 C590,200 630,220 650,180 C670,140 700,160 720,130 C740,100 780,120 800,150 C820,180 850,160 870,200 C890,240 930,220 950,270 C970,320 920,350 920,350 L920,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              <path
                d="M1000,600 L1000,400 C1000,400 950,380 960,340 C970,300 1000,320 1010,280 C1020,240 1050,260 1060,220 C1070,180 1100,200 1110,240 C1120,280 1150,260 1160,300 C1170,340 1200,320 1200,360 C1200,400 1150,400 1150,400 L1150,600 Z"
                fill="#047857"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
        
        {/* Encabezado con estilo mejorado */}
        <div className="relative py-6 mb-4">
          {/* Líneas decorativas */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"></div>
          
          {/* Título principal con efectos */}
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-black tracking-tight relative inline-block">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 drop-shadow-sm">
                Paquetes Turísticos
              </span>
            </h1>
            
            {/* Subtítulo o decoración */}
            <div className="mt-2 text-xs font-medium uppercase tracking-widest text-emerald-600 group relative">
              <span className="inline-block mx-2">✦</span>
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700 font-semibold text-2xl">
                  {paqueteActual?.nombrePaquete}
                </span>
              </span>
              <span className="inline-block mx-2">✦</span>
            </div>
          </div>
        </div>
        
        {/* Búsqueda y filtros con diseño mejorado */}
        <div className="max-w-[1360px] mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-emerald-100">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Buscar paquetes..."
                  value={terminoBusqueda}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2.5 pl-10 bg-emerald-50 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-emerald-700/70 border border-emerald-100"
                />
                <Search className="absolute left-3 top-2.5 text-emerald-700 w-5 h-5" />
              </div>
              
              <button
                onClick={fetchPaquetes}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-md group"
                title="Recargar paquetes"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Botones de navegación entre paquetes */}
        <div className="fixed left-4 right-4 top-[63%] -translate-y-1/2 flex justify-between z-10">
          <button
            onClick={() => cambiarPaquete('anterior')}
            className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:scale-110 group"
            aria-label="Paquete anterior"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => cambiarPaquete('siguiente')}
            className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:scale-110 group"
            aria-label="Siguiente paquete"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Slider de Fotos */}
        {renderSlider()}
        
        {/* Información del Paquete */}
        <div className="max-w-[1360px] mx-auto mb-10">
          <div className="relative">
            {/* Textura sutil de fondo */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20"></div>
            
            {/* Contenido principal */}
            <div>
              {/* Descripción estilo notas de explorador */}
              <div className="mb-10 mx-4">
                <div className="relative pl-4 py-2">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
                  <p className="text-gray-900 text-lg font-medium">{paqueteActual.descripcion}</p>
                  <p className="mt-2 text-gray-700 text-base font-normal">
                    &ldquo;Este paquete ofrece una experiencia completa que te permitirá disfrutar 
                    de las mejores atracciones del Valle del Cocora, combinando aventura y 
                    naturaleza durante tu visita.&rdquo;
                  </p>
                </div>
              </div>
              
              {/* Detalles del paquete */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna izquierda */}
                <div>
                  {/* Panel con estilo premium */}
                  <div className="bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/70 p-6 rounded-2xl border border-emerald-100 h-full flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                    {/* Patrones decorativos */}
                    <div className="absolute -top-12 -right-12 w-56 h-56 opacity-[0.03] rotate-12">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" stroke="#0d9488" strokeWidth="0.6" />
                        <circle cx="50" cy="50" r="30" stroke="#0d9488" strokeWidth="0.6" />
                        <circle cx="50" cy="50" r="20" stroke="#0d9488" strokeWidth="0.6" />
                        <path d="M50 10V90M10 50H90M26 26L74 74M26 74L74 26" stroke="#0d9488" strokeWidth="0.4" />
                      </svg>
                    </div>
                    
                    {/* Título con estilo exquisito */}
                    <div className="relative mb-4">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
                      <h2 className="pl-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-900 text-xl font-medium tracking-wide">
                        Detalles del Paquete
                      </h2>
                    </div>
                    
                    {/* Tarjetas de información */}
                    <div className="flex-grow grid grid-cols-1 gap-3">
                      {/* Duración */}
                      <div className="bg-gradient-to-br from-white to-emerald-50/50 p-3 rounded-xl border border-emerald-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-emerald-200">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-emerald-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative bg-gradient-to-br from-emerald-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-emerald-700" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <span className="text-emerald-600 text-xs font-medium block leading-tight">Duración</span>
                              <span className="text-gray-800 text-base tracking-wide block group-hover:text-emerald-800 transition-colors duration-500">
                                {calcularDuracionTotalPaquete(paqueteActual)}
                              </span>
                            </div>
                          </div>
                          <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 group-hover:w-2/3 transition-all duration-700"></div>
                      </div>
                      
                      {/* Precio */}
                      <div className="bg-gradient-to-br from-white to-emerald-50/50 p-3 rounded-xl border border-emerald-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-emerald-200">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-emerald-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative bg-gradient-to-br from-emerald-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-700" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <span className="text-emerald-600 text-xs font-medium block leading-tight">Precio</span>
                              <span className="text-gray-800 text-base tracking-wide block group-hover:text-emerald-800 transition-colors duration-500">
                                {mostrarPrecio(paqueteActual.precio)}
                              </span>
                            </div>
                          </div>
                          <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 group-hover:w-2/3 transition-all duration-700"></div>
                      </div>
                      
                      {/* Rutas incluidas */}
                      <div className="bg-gradient-to-br from-white to-emerald-50/50 p-3 rounded-xl border border-emerald-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-emerald-200">
                        <div className="flex items-center justify-between relative z-10 mb-2">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-emerald-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative bg-gradient-to-br from-emerald-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                                <Map className="w-5 h-5 text-emerald-700" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <span className="text-emerald-600 text-xs font-medium block leading-tight">Rutas Incluidas</span>
                              <span className="text-gray-800 text-base tracking-wide block group-hover:text-emerald-800 transition-colors duration-500">
                                {paqueteActual.rutasAsociadas?.length || 0} rutas
                              </span>
                            </div>
                          </div>
                          <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Lista detallada de rutas incluidas */}
                        <div className="mt-3 max-h-44 overflow-y-auto pr-1 space-y-2">
                          {paqueteActual.rutasAsociadas && paqueteActual.rutasAsociadas.length > 0 ? (
                            paqueteActual.rutasAsociadas.map((ruta, index) => (
                              <div key={index} className="flex items-start bg-white/70 p-2 rounded-lg">
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mr-2 bg-emerald-100/50 rounded-lg">
                                  <Map className="text-emerald-700 w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-emerald-800 text-sm font-medium">{ruta.nombreRuta}</p>
                                  {ruta.tiempoEstimado && (
                                    <div className="flex items-center text-gray-700 text-xs mt-0.5">
                                      <Clock className="w-3 h-3 mr-1 text-emerald-600" />
                                      <span>{ruta.tiempoEstimado}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center p-3 text-emerald-700 text-sm">
                              <p>No hay rutas asociadas a este paquete</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 group-hover:w-2/3 transition-all duration-700"></div>
                      </div>
                    </div>
                    
                    {/* Separador elegante */}
                    <div className="my-4 w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent opacity-70"></div>
                    
                    {/* Botones */}
                    <div className="flex flex-col gap-4">
                      {/* Botón de reserva */}
                      <button 
                        className="w-full py-3 rounded-xl text-white relative overflow-hidden group shadow-md transition-all duration-500 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600"
                      >
                        <div className="absolute inset-0 w-full h-full">
                          <div className="absolute -inset-[100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-[shimmer_2s_infinite] transition-all"></div>
                        </div>
                        <span className="relative z-10 font-medium">Reservar Paquete</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Columna derecha - Información del Valle del Cocora */}
                <div>
                  <div className="bg-emerald-50/90 p-6 rounded-lg border border-emerald-200 shadow-md h-full">
                    <div className="relative mb-6">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
                      <h2 className="pl-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-900 text-xl font-medium tracking-wide">
                        Valle del Cocora
                      </h2>
                    </div>
                    
                    <div className="space-y-6 max-h-[440px] overflow-y-auto pr-2">
                      {/* Palmas de Cera */}
                      <div className="flex items-start bg-white/70 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center mr-3 bg-emerald-100/60 rounded-lg">
                          <span className="text-2xl">🌴</span>
                        </div>
                        <div>
                          <p className="text-emerald-800 text-base font-medium">Palmas de Cera</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Hogar del árbol nacional de Colombia, la majestuosa Palma de Cera puede alcanzar hasta 
                            60 metros de altura. Estas imponentes palmas crean un paisaje surrealista durante los recorridos.
                          </p>
                        </div>
                      </div>
                      
                      {/* Caminatas */}
                      <div className="flex items-start bg-white/70 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center mr-3 bg-emerald-100/60 rounded-lg">
                          <span className="text-2xl">🥾</span>
                        </div>
                        <div>
                          <p className="text-emerald-800 text-base font-medium">Caminatas</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Recorre senderos ecológicos de diferentes niveles de dificultad. El circuito principal 5 km 
                            cruza ríos con puentes colgantes y te lleva a miradores con vistas panorámicas espectaculares.
                          </p>
                        </div>
                      </div>
                      
                      {/* Cabalgatas */}
                      <div className="flex items-start bg-white/70 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center mr-3 bg-emerald-100/60 rounded-lg">
                          <span className="text-2xl">🐎</span>
                        </div>
                        <div>
                          <p className="text-emerald-800 text-base font-medium">Cabalgatas</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Explora el valle a lomos de caballos criollos dóciles y entrenados. Las cabalgatas duran entre 1 y 3 horas 
                            y permiten acceder a zonas que serían difíciles a pie mientras disfrutas del paisaje.
                          </p>
                        </div>
                      </div>
                      
                      {/* Consejos Prácticos */}
                      <div className="flex items-start bg-white/70 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center mr-3 bg-emerald-100/60 rounded-lg">
                          <span className="text-2xl">🧭</span>
                        </div>
                        <div>
                          <p className="text-emerald-800 text-base font-medium">Consejos Prácticos</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Programa tu visita temprano (antes de las 9 a.m.) para evitar la neblina y lluvias de la tarde. 
                            Lleva calzado impermeable, ropa abrigada, y repelente.
                          </p>
                        </div>
                      </div>
                      
                      {/* Avistamiento de Aves */}
                      <div className="flex items-start bg-white/70 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center mr-3 bg-emerald-100/60 rounded-lg">
                          <span className="text-2xl">🦜</span>
                        </div>
                        <div>
                          <p className="text-emerald-800 text-base font-medium">Avistamiento de Aves</p>
                          <p className="text-gray-700 text-sm mt-1">
                            El Valle del Cocora es un paraíso para los amantes de las aves. Con más de 200 especies registradas, 
                            podrás observar colibríes, tucanes esmeralda y el majestuoso cóndor andino en su hábitat natural. 
                            Lleva binoculares y disfruta de la biodiversidad única de la región.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pie de página */}
          <div className="bg-emerald-800 text-white p-4 rounded-lg shadow-md relative overflow-hidden mt-8">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="h-full w-full">
                <path d="M0,0 L200,0 L200,100 L0,100 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M0,50 Q50,30 100,50 T200,50" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,60 Q50,40 100,60 T200,60" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,70 Q50,50 100,70 T200,70" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,80 Q50,60 100,80 T200,80" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,90 Q50,70 100,90 T200,90" stroke="white" fill="none" strokeWidth="1"/>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="font-serif text-white text-lg">
                  &ldquo;Descubre la belleza natural del Valle del Cocora con nuestros paquetes turísticos&rdquo;
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <span className="font-serif italic mr-3">Explococora</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lightbox para imágenes */}
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={imagenesPreview[lightboxIndex]} 
                alt="Vista ampliada"
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            </div>
            
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={() => navigateLightbox(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <button
              onClick={() => navigateLightbox(1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {lightboxIndex + 1} de {imagenesPreview.length}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default GestionPaquetes;

