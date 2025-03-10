import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const NuestrasRutas = () => {
  const { t } = useTranslation();
  const { idRuta } = useParams(); // Obtener el parámetro de la URL
  const navigate = useNavigate();
  const location = useLocation();
  const [rutas, setRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargandoFotos, setCargandoFotos] = useState({});
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  
  // Determinar si estamos en la vista de cliente
  const isClientView = location.pathname.includes('/VistaCliente');
  
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    dificultad: '',
    duracion: '',
    estado: '',
    tipo: ''
  });

  // Función para volver a la vista anterior
  const volverAtras = () => {
    if (isClientView) {
      navigate('/VistaCliente/NuestrasRutas');
    } else {
      navigate('/NuestrasRutas');
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
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            {mostrarFiltros ? t('ocultarFiltros', 'Ocultar Filtros') : t('mostrarFiltros', 'Mostrar Filtros')}
          </button>
        </div>
      )}
      
      {!rutaSeleccionada && mostrarFiltros && (
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
      
      {rutaSeleccionada ? (
        // Vista detallada de una ruta específica
        <div className="fixed inset-0 bg-teal-800 overflow-auto z-50">
          {/* Barra superior con botón de volver y título */}
          <div className="bg-teal-900 py-2 px-4 flex items-center shadow-md">
            <button
              onClick={() => navigate('/')}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-300 hover:scale-105 mr-3"
              aria-label="Volver a inicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
              {rutaSeleccionada.nombreRuta}
            </h1>
          </div>
          
          {/* Barra de etiquetas */}
          <div className="bg-teal-800 py-3 px-4 flex flex-wrap items-center gap-3 shadow-md">
            <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold shadow-md ${
              rutaSeleccionada.dificultad === 'Facil' ? 'bg-green-600 text-white' : 
              rutaSeleccionada.dificultad === 'Moderada' ? 'bg-yellow-600 text-white' : 
              'bg-red-600 text-white'
            }`}>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {rutaSeleccionada.dificultad}
              </span>
            </span>
            <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold shadow-md ${
              rutaSeleccionada.estado === 'Activa' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
            }`}>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {rutaSeleccionada.estado}
              </span>
            </span>
            <span className="inline-block px-3 py-1.5 bg-teal-600 text-white rounded-full text-sm font-semibold shadow-md">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Columna izquierda - Galería */}
                  <div className="bg-teal-50 p-6 rounded-xl shadow-lg border border-teal-200 h-full">
                    <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      <GaleriaVertical fotos={rutasConFotos[rutaSeleccionada.idRuta]} nombreRuta={rutaSeleccionada.nombreRuta} />
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
                  <div className="flex flex-col space-y-6 h-full">
                    {/* Descripción con estilo */}
                    <div className="bg-teal-50 p-6 rounded-xl shadow-lg border border-teal-200 relative flex-grow">
                      <div className="absolute -top-4 left-6 bg-teal-800 text-white px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('descripcion', 'Descripción')}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mt-3">{rutaSeleccionada.descripcion}</p>
                    </div>
                    
                    {/* Tarjetas de información */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-teal-50 p-4 rounded-xl shadow-md border border-teal-200">
                        <div className="flex items-center mb-2">
                          <div className="bg-teal-800 p-2 rounded-lg mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-teal-800">{t('duracion', 'Duración')}</h3>
                            <p className="text-xl font-bold text-teal-900">{rutaSeleccionada.duracion}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 p-4 rounded-xl shadow-md border border-teal-200">
                        <div className="flex items-center mb-2">
                          <div className="bg-teal-800 p-2 rounded-lg mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-teal-800">{t('distancia', 'Distancia')}</h3>
                            <p className="text-xl font-bold text-teal-900">{rutaSeleccionada.distancia} km</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 p-4 rounded-xl shadow-md border border-teal-200">
                        <div className="flex items-center mb-2">
                          <div className="bg-teal-800 p-2 rounded-lg mr-3 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-teal-800">{t('capacidadMaxima', 'Capacidad Máxima')}</h3>
                            <p className="text-xl font-bold text-teal-900">{rutaSeleccionada.capacidadMaxima} personas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botón para reservar */}
                    <div className="flex justify-center mt-6">
                      <button 
                        className="bg-teal-800 hover:bg-teal-700 text-white py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        Array.isArray(rutasFiltradas) && rutasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rutasFiltradas.map((ruta) => (
              <div key={`${ruta.idRuta}-${ruta.nombreRuta}`} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-green-500">{ruta.nombreRuta}</h2>
                
                {/* Galería de imágenes */}
                {cargandoFotos[ruta.idRuta] ? (
                  <div className="mb-4 flex justify-center items-center h-40 bg-gray-100 rounded">
                    <p className="text-gray-500">{t('cargandoFotos', 'Cargando fotos...')}</p>
                  </div>
                ) : rutasConFotos[ruta.idRuta] && rutasConFotos[ruta.idRuta].length > 0 ? (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {rutasConFotos[ruta.idRuta].map((foto, index) => (
                        <div key={index} className="h-40 overflow-hidden rounded">
                          <img 
                            src={foto} 
                            alt={`Foto ${index + 1} de ${ruta.nombreRuta}`} 
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-gray-500 italic">{t('sinFotos', 'No hay fotos disponibles')}</p>
                  </div>
                )}
                
                <p className="text-gray-600 mb-2"><span className="font-medium">{t('duracion', 'Duración')}:</span> {ruta.duracion}</p>
                <p className="text-gray-600 mb-2"><span className="font-medium">{t('descripcion', 'Descripción')}:</span> {ruta.descripcion}</p>
                <p className="text-gray-600 mb-2"><span className="font-medium">{t('dificultad', 'Dificultad')}:</span> {ruta.dificultad}</p>
                <p className="text-gray-600 mb-2"><span className="font-medium">{t('capacidadMaxima', 'Capacidad Máxima')}:</span> {ruta.capacidadMaxima}</p>
                <p className="text-gray-600 mb-2"><span className="font-medium">{t('distancia', 'Distancia')}:</span> {ruta.distancia} km</p>
                <p className="text-gray-600 mb-2"><span className="font-medium">{t('tipo', 'Tipo')}:</span> {ruta.tipo}</p>
                <p className="text-gray-600 mb-2"><span className="font-medium">{t('estado', 'Estado')}:</span> {ruta.estado}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">{t('noRutasDisponibles', 'No hay rutas disponibles')}</p>
        )
      )}
    </div>
  );
};

// Componente para la galería vertical (imagen grande arriba, miniaturas abajo)
const GaleriaVertical = ({ fotos, nombreRuta }) => {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(0);
  
  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Imagen grande arriba */}
      <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-teal-300 relative group">
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
            className={`h-24 rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 ${fotoSeleccionada === index ? 'border-teal-600 ring-2 ring-teal-400/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
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