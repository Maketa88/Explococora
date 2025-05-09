import axios from 'axios';
import {
  Clock, DollarSign,
  Map,
  Package,
  ShoppingBag
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonPagoPaquete } from '../PagoPaquetes';

const GestionPaquetes = () => {
  // Estados para la gestión de paquetes
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las imágenes
  const [paquetesConFotos, setPaquetesConFotos] = useState({});
  const [cargandoFotos, setCargandoFotos] = useState({});
  
  const navigate = useNavigate();

  // Función para obtener la lista de paquetes
  const fetchPaquetes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://servicio-explococora.onrender.com/paquete/lista-paquetes');
      
      
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
      
      const response = await axios.get(`https://servicio-explococora.onrender.com/paquete/fotos-publicas/${idPaquete}`);
      
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
            imageUrl = `https://servicio-explococora.onrender.com${foto.ruta}`;
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
      const response = await axios.get(`https://servicio-explococora.onrender.com/paquete/obtener-paquete/${idPaquete}`);
      
      
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

  // Cargar paquetes al montar el componente
  useEffect(() => {
    fetchPaquetes();
  }, []);

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

  // Función para determinar si estamos en la vista de cliente
  const esVistaCliente = () => {
    const currentPath = window.location.pathname;
    return currentPath.includes("/VistaCliente");
  };

  // Función para ver los detalles de un paquete
  const verDetallesPaquete = (idPaquete) => {
    // Asegurarse de que el ID sea un número si es posible
    const paqueteId = !isNaN(parseInt(idPaquete)) ? parseInt(idPaquete) : idPaquete;
    
    // Verificar si estamos en la vista de cliente
    const isClientView = esVistaCliente();
    
    
    
    if (isClientView) {
      // Si estamos en la vista de cliente, mantener el contexto de cliente
      navigate(`/VistaCliente/PaquetesTuristicos/${paqueteId}`);
    } else {
      // Si no, usar la ruta normal
      navigate(`/PaquetesTuristicos/${paqueteId}`);
    }
  };

  // Función para obtener los tres primeros paquetes
  const obtenerTresPrimerosPaquetes = () => {
    return paquetes.slice(0, 3);
  };

  // Función para navegar a la página completa de paquetes
  const navegarAPaginaCompleta = () => {
    // Verificar si estamos en la vista de cliente
    const isClientView = esVistaCliente();
    
    if (isClientView) {
      navigate('/VistaCliente/PaquetesTuristicos');
    } else {
      navigate('/PaquetesTuristicos');
    }
  };

    return (
    <section className="relative py-2 px-4 overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

        {/* Siluetas decorativas */}
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

            {/* Decoraciones adicionales */}
            <g opacity="0.6">
              <circle cx="150" cy="500" r="15" fill="#047857" />
              <circle cx="170" cy="485" r="15" fill="#047857" />
              <circle cx="190" cy="500" r="15" fill="#047857" />
              <circle cx="170" cy="515" r="15" fill="#047857" />
              <circle cx="170" cy="500" r="10" fill="#047857" />
            </g>

            <g opacity="0.6">
              <circle cx="450" cy="520" r="15" fill="#047857" />
              <circle cx="470" cy="505" r="15" fill="#047857" />
              <circle cx="490" cy="520" r="15" fill="#047857" />
              <circle cx="470" cy="535" r="15" fill="#047857" />
              <circle cx="470" cy="520" r="10" fill="#047857" />
            </g>

            <g opacity="0.6">
              <circle cx="750" cy="500" r="15" fill="#047857" />
              <circle cx="770" cy="485" r="15" fill="#047857" />
              <circle cx="790" cy="500" r="15" fill="#047857" />
              <circle cx="770" cy="515" r="15" fill="#047857" />
              <circle cx="770" cy="500" r="10" fill="#047857" />
            </g>
          </svg>
                      </div>
                    </div>
      <div className="container mx-auto px-4 py-8">
        <div className="relative py-8 mb-10">
          {/* Bolitas decorativas a los lados */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Bolitas lado izquierdo */}
            <div className="absolute top-1/4 left-4 w-6 h-6 bg-emerald-600 rounded-full opacity-20 animate-pulse"></div>
            <div
              className="absolute top-1/2 left-12 w-4 h-4 bg-emerald-700 rounded-full opacity-30 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-1/4 left-8 w-5 h-5 bg-emerald-500 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>

            {/* Bolitas lado derecho */}
            <div
              className="absolute top-1/3 right-10 w-5 h-5 bg-emerald-600 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "0.7s" }}
            ></div>
            <div
              className="absolute top-2/3 right-6 w-7 h-7 bg-emerald-700 rounded-full opacity-15 animate-pulse"
              style={{ animationDelay: "1.2s" }}
            ></div>
            <div
              className="absolute bottom-1/3 right-16 w-4 h-4 bg-emerald-500 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
                    </div>
                    
          {/* Líneas decorativas */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"></div>

          {/* Título principal con efectos */}
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-black tracking-tight relative inline-block">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 drop-shadow-sm">
                <ShoppingBag className="inline-block h-10 w-10 mr-2 mb-1" /> Paquetes Turísticos
                            </span>
            </h1>

            {/* Subtítulo o decoración */}
            <div className="mt-2 text-xs font-medium uppercase tracking-widest text-emerald-600 opacity-80">
              <span className="inline-block mx-2">✦</span>
              <span>Descubre nuestras experiencias más completas</span>
              <span className="inline-block mx-2">✦</span>
                    </div>
                    
            {/* Líneas decorativas bajo el título */}
            <div className="mt-3 flex justify-center space-x-1">
              <div className="w-12 h-1 bg-gradient-to-r from-transparent to-emerald-600 rounded-full"></div>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full"></div>
              <div className="w-12 h-1 bg-gradient-to-r from-emerald-700 to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>
              
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500 mr-2"
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
              <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse flex space-x-1">
              <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        ) : paquetes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center mx-auto max-w-6xl">
              {obtenerTresPrimerosPaquetes().map((paquete, index) => (
                <div
                  key={`paquete-${paquete.idPaquete || paquete.id || index}`}
                  className="group bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md overflow-hidden transform transition-all duration-500 hover:shadow-[0_10px_20px_rgba(8,145,178,0.3)] hover:-translate-y-1 border border-emerald-100 relative flex flex-col h-full w-full max-w-xs"
                >
                  {/* Cinta decorativa en la esquina */}
                  <div className="absolute -right-8 -top-2 w-28 h-8 bg-teal-600 text-white text-xs font-bold px-0 py-1 shadow-md transform rotate-45 z-10 flex items-center justify-center">
                    <span className="text-white text-xs tracking-wider uppercase">
                      Paquete
                    </span>
        </div>
        
                  {/* Encabezado de la carta */}
                  <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-2 relative overflow-hidden h-16 flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-5 rounded-full -mt-6 -mr-6"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 bg-white opacity-5 rounded-full -mb-5 -ml-5"></div>

                    <h2 className="text-base font-bold mb-1 relative z-10 group-hover:text-emerald-200 transition-colors duration-300 line-clamp-1">
                      {paquete.nombrePaquete}
                    </h2>
                    <div className="flex items-center space-x-1 relative z-10">
                      <span className="inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold transform transition-transform duration-300 group-hover:scale-105 bg-gradient-to-r from-emerald-200 to-emerald-300 text-emerald-800">
                        {paquete.rutasAsociadas?.length || 0} rutas
                      </span>
                      {paquete.descuento > 0 && (
                        <span className="inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold transform transition-transform duration-300 group-hover:scale-105 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800">
                          {paquete.descuento}% desc
                        </span>
                      )}
        </div>
      </div>
      
                  {/* Galería de imágenes */}
                  <div className="relative h-32 overflow-hidden">
                    {cargandoFotos[paquete.idPaquete] ? (
                      <div className="flex justify-center items-center h-full bg-gray-100">
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                          <div
                            className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    ) : paquetesConFotos[paquete.idPaquete] && paquetesConFotos[paquete.idPaquete].length > 0 ? (
                      <div className="h-full relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
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
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <Package size={32} className="text-emerald-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Contenido de la carta */}
                  <div className="p-2 relative flex-grow flex flex-col">
                    {/* Elementos decorativos */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mt-10 -mr-10 opacity-30"></div>

                    {/* Información destacada */}
                    <div className="grid grid-cols-2 gap-1 mb-3 relative z-10">
                      <div className="flex flex-col items-center p-1.5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-sm">
                        <Clock className="h-3 w-3 text-emerald-700 mb-0.5" />
                        <span className="text-emerald-800 text-xs font-medium ">
                          Duración
                        </span>
                        <span className="text-emerald-900 text-xs font-bold">
                          {calcularDuracionTotalPaquete(paquete)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-1.5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-sm">
                        <DollarSign className="h-3 w-3 text-emerald-700 mb-0.5" />
                        <span className="text-emerald-800 text-xs font-medium ">
                          Precio
                        </span>
                        <span className="text-emerald-900 text-xs font-bold">
                          {mostrarPrecio(paquete.precio)}
                        </span>
                      </div>
                      </div>
                      
                   
                    
                    {/* Descripción */}
                    <div className="mb-3 relative z-10 h-16">
                      <h3 className="text-emerald-800 text-xs font-semibold mb-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-0.5"
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
                      <div className="bg-white bg-opacity-70 p-1.5 rounded-lg shadow-inner h-full">
                        <p className="text-gray-700 text-xs line-clamp-2 italic">
                          {paquete.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Detalles adicionales en línea */}
                    <div className="flex flex-col space-y-2 mb-3 relative z-10">
                      <div className="flex items-center bg-white bg-opacity-70 p-1.5 rounded-lg transform transition-transform duration-300 group-hover:translate-x-1">
                        <Map className="h-3 w-3 text-emerald-700 mr-1" />
                        <span className="text-gray-700 text-xs">
                          <span className="font-medium">Rutas:</span>{" "}
                          {paquete.rutasAsociadas?.length || 0} incluidas
                        </span>
                      </div>
                       {/* Estrellas de calificación centradas */}
                    <div className="flex justify-center mt-2 mb-1 relative z-10">
                      <div className="rounded-full px-2 py-1 flex items-center">
                        <div className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                        {paquete.descuento > 0 && (
                        <div className="flex items-center bg-white bg-opacity-70 p-1.5 rounded-lg transform transition-transform duration-300 group-hover:translate-x-1">
                          <DollarSign className="h-3 w-3 text-emerald-700 mr-1" />
                          <span className="text-gray-700 text-xs">
                            <span className="font-medium">Precio final:</span>{" "}
                            ${(paquete.precio * (1 - paquete.descuento / 100)).toFixed(0)}
                          </span>
                        </div>
                        )}
                      </div>
                      
                    {/* Botones de acción */}
                    <div className="relative z-10 mt-auto flex flex-col space-y-2">
                      {/* Botón para reservar */}
                      <BotonPagoPaquete 
                        paquete={paquete} 
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-2 px-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                      />

                      {/* Botón para ver detalles */}
                      <button
                        onClick={() => verDetallesPaquete(paquete.idPaquete)}
                        className="w-full bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 py-2 px-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="text-xs font-medium tracking-wide">
                          Ver Detalles
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón "Ver más" */}
            {paquetes.length > 3 && (
              <div className="flex justify-center mt-8 mb-4">
                <button
                  onClick={navegarAPaginaCompleta}
                  className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-sm font-medium tracking-wide flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    Ver Todos los Paquetes
                  </span>
                </button>
              </div>
            )}
          </>
          ) : (
            <div className="bg-emerald-50 text-center p-8 rounded-lg border border-emerald-100">
              <div className="flex justify-center mb-4">
                {getPackageIcon()}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay paquetes disponibles</h3>
              <p className="text-emerald-700">No se encontraron paquetes turísticos.</p>
            </div>
          )}
        </div>
    </section>
  );
};

export default GestionPaquetes;

