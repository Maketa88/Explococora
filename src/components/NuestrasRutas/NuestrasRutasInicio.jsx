import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const NuestrasRutasInicio = () => {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargandoFotos, setCargandoFotos] = useState({});
  const navigate = useNavigate();
  
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    dificultad: '',
    duracion: '',
    estado: '',
    tipo: ''
  });

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/rutas');

        if (Array.isArray(response.data)) {
          setRutas(response.data);
          setRutasFiltradas(response.data);
          
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
  }, []);

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
        const fotosFiltradas = fotosArray.slice(0, 1);
        
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

  const aplicarFiltros = () => {
    let resultado = [...rutas];
    
    if (filtros.dificultad) {
      resultado = resultado.filter(ruta => ruta.dificultad === filtros.dificultad);
    }
    
    if (filtros.estado) {
      resultado = resultado.filter(ruta => ruta.estado === filtros.estado);
    }
    
    if (filtros.tipo) {
      resultado = resultado.filter(ruta => ruta.tipo === filtros.tipo);
    }
    
    if (filtros.duracion) {
      switch(filtros.duracion) {
        case 'corta':
          resultado = resultado.filter(ruta => 
            ruta.duracion.includes('minuto') || 
            (parseInt(ruta.duracion) < 1 && ruta.duracion.includes('hora'))
          );
          break;
        case 'media':
          resultado = resultado.filter(ruta => {
            const horas = parseInt(ruta.duracion);
            return horas >= 1 && horas <= 3 && ruta.duracion.includes('hora');
          });
          break;
        case 'larga':
          resultado = resultado.filter(ruta => {
            const horas = parseInt(ruta.duracion);
            return horas > 3 && ruta.duracion.includes('hora');
          });
          break;
        default:
          break;
      }
    }
    
    setRutasFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({
      dificultad: '',
      duracion: '',
      estado: '',
      tipo: ''
    });
    setRutasFiltradas(rutas);
  };

  const verDetallesRuta = (idRuta) => {
    // Asegurarse de que el ID sea un número si es posible
    const rutaId = !isNaN(parseInt(idRuta)) ? parseInt(idRuta) : idRuta;
    
    // Verificar si estamos en la vista de cliente
    const currentPath = window.location.pathname;
    const isClientView = currentPath.includes('/VistaCliente');
    
    console.log(`Navegando a la ruta con ID: ${rutaId}, desde vista cliente: ${isClientView}`);
    
    if (isClientView) {
      // Si estamos en la vista de cliente, mantener el contexto de cliente
      navigate(`/VistaCliente/NuestrasRutas/${rutaId}`);
    } else {
      // Si no, usar la ruta normal
      navigate(`/NuestrasRutas/${rutaId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-600">
        {t('tituloRutas', 'Nuestras Rutas')}
      </h1>
      
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          {mostrarFiltros ? t('ocultarFiltros', 'Ocultar Filtros') : t('mostrarFiltros', 'Mostrar Filtros')}
        </button>
      </div>
      
      {mostrarFiltros && (
        <div className="bg-green-100 p-4 rounded-lg mb-8 shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-3">{t('filtrarRutas', 'Filtrar Rutas')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-green-700 mb-1">{t('dificultad', 'Dificultad')}</label>
              <select
                value={filtros.dificultad}
                onChange={(e) => setFiltros({...filtros, dificultad: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todas', 'Todas')}</option>
                <option value="Facil">{t('facil', 'Fácil')}</option>
                <option value="Moderada">{t('moderada', 'Moderada')}</option>
                <option value="Desafiante">{t('desafiante', 'Desafiante')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-green-700 mb-1">{t('duracion', 'Duración')}</label>
              <select
                value={filtros.duracion}
                onChange={(e) => setFiltros({...filtros, duracion: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todas', 'Todas')}</option>
                <option value="corta">{t('corta', 'Corta')}</option>
                <option value="media">{t('media', 'Media')}</option>
                <option value="larga">{t('larga', 'Larga')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-green-700 mb-1">{t('estado', 'Estado')}</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todos', 'Todos')}</option>
                <option value="Activa">{t('activa', 'Activa')}</option>
                <option value="Inactiva">{t('inactiva', 'Inactiva')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-green-700 mb-1">{t('tipo', 'Tipo')}</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todos', 'Todos')}</option>
                <option value="Cabalgata">{t('cabalgata', 'Cabalgata')}</option>
                <option value="Caminata">{t('caminata', 'Caminata')}</option>
                <option value="Cabalgata y Caminata">{t('cabalgataYCaminata', 'Cabalgata y Caminata')}</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={limpiarFiltros}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              {t('limpiar', 'Limpiar')}
            </button>
            <button
              onClick={aplicarFiltros}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {t('aplicarFiltros', 'Aplicar Filtros')}
            </button>
          </div>
        </div>
      )}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {Array.isArray(rutasFiltradas) && rutasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center mx-auto max-w-6xl">
          {rutasFiltradas.map((ruta) => (
            <div key={`${ruta.idRuta}-${ruta.nombreRuta}`} 
              className="group bg-gradient-to-br from-white to-teal-50 rounded-lg shadow-md overflow-hidden transform transition-all duration-500 hover:shadow-[0_10px_20px_rgba(8,145,178,0.3)] hover:-translate-y-1 border border-teal-100 relative flex flex-col h-full w-full max-w-xs"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%230d9488\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              }}
            >
              {/* Cinta decorativa en la esquina */}
              <div className="absolute -right-8 -top-2 w-28 h-8 bg-teal-600 text-white text-xs font-bold px-0 py-1 shadow-md transform rotate-45 z-10 flex items-center justify-center">
                <span className="text-white text-xs tracking-wider uppercase">{ruta.tipo}</span>
              </div>
              
              {/* Encabezado de la carta */}
              <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-2 relative overflow-hidden h-16 flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-5 rounded-full -mt-6 -mr-6"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 bg-white opacity-5 rounded-full -mb-5 -ml-5"></div>
                
                <h2 className="text-base font-bold mb-1 relative z-10 group-hover:text-teal-200 transition-colors duration-300 line-clamp-1">{ruta.nombreRuta}</h2>
                <div className="flex items-center space-x-1 relative z-10">
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold transform transition-transform duration-300 group-hover:scale-105 ${
                    ruta.dificultad === 'Facil' ? 'bg-gradient-to-r from-green-200 to-green-300 text-green-800' : 
                    ruta.dificultad === 'Moderada' ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800' : 
                    'bg-gradient-to-r from-red-200 to-red-300 text-red-800'
                  }`}>
                    {ruta.dificultad}
                  </span>
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold transform transition-transform duration-300 group-hover:scale-105 ${
                    ruta.estado === 'Activa' ? 'bg-gradient-to-r from-green-200 to-green-300 text-green-800' : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800'
                  }`}>
                    {ruta.estado}
                  </span>
                </div>
              </div>
              
              {/* Galería de imágenes */}
              <div className="relative h-32 overflow-hidden">
                {cargandoFotos[ruta.idRuta] ? (
                  <div className="flex justify-center items-center h-full bg-gray-100">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-1.5 w-1.5 bg-teal-600 rounded-full animate-bounce"></div>
                      <div className="h-1.5 w-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-1.5 w-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                ) : rutasConFotos[ruta.idRuta] && rutasConFotos[ruta.idRuta].length > 0 ? (
                  <div className="h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                    {rutasConFotos[ruta.idRuta].map((foto, index) => (
                      <img 
                        key={index} 
                        src={foto} 
                        alt={`Foto de ${ruta.nombreRuta}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full bg-gray-100">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-teal-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-500 italic">{t('sinFotos', 'No hay fotos disponibles')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contenido de la carta */}
              <div className="p-2 relative flex-grow flex flex-col">
                {/* Elementos decorativos */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-full -mt-10 -mr-10 opacity-30"></div>
                
                {/* Información destacada */}
                <div className="grid grid-cols-2 gap-1 mb-3 relative z-10">
                  <div className="flex flex-col items-center p-1.5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-700 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-teal-800 text-xs font-medium uppercase tracking-wider">{t('duracion', 'Duración')}</span>
                    <span className="text-teal-900 text-xs font-bold">{ruta.duracion}</span>
                  </div>
                  <div className="flex flex-col items-center p-1.5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-700 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-teal-800 text-xs font-medium uppercase tracking-wider">{t('distancia', 'Distancia')}</span>
                    <span className="text-teal-900 text-xs font-bold">{ruta.distancia} km</span>
                  </div>
                </div>
                
                {/* Descripción */}
                <div className="mb-3 relative z-10 h-16">
                  <h3 className="text-teal-800 text-xs font-semibold mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('descripcion', 'Descripción')}
                  </h3>
                  <div className="bg-white bg-opacity-70 p-1.5 rounded-lg shadow-inner h-full">
                    <p className="text-gray-700 text-xs line-clamp-2 italic">{ruta.descripcion}</p>
                  </div>
                </div>
                
                {/* Detalles adicionales en línea */}
                <div className="flex flex-col space-y-2 mb-3 relative z-10">
                  <div className="flex items-center bg-white bg-opacity-70 p-1.5 rounded-lg transform transition-transform duration-300 group-hover:translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-700 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-700 text-xs"><span className="font-medium">{t('capacidadMaxima', 'Cap')}:</span> {ruta.capacidadMaxima}</span>
                  </div>
                  <div className="flex items-center bg-white bg-opacity-70 p-1.5 rounded-lg transform transition-transform duration-300 group-hover:translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-700 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-gray-700 text-xs"><span className="font-medium">{t('tipo', 'Tipo')}:</span> {ruta.tipo}</span>
                  </div>
                </div>
                
                {/* Botón de acción */}
                <div className="relative z-10 mt-auto">
                  <button 
                    onClick={() => verDetallesRuta(ruta.idRuta)}
                    className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white py-2 px-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-xs font-medium tracking-wide">{t('verDetalles', 'Ver Detalles')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">{t('noRutasDisponibles', 'No hay rutas disponibles')}</p>
      )}
    </div>
  );
};

export default NuestrasRutasInicio;
