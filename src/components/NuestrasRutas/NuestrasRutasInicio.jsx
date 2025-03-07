import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const NuestrasRutasInicio = () => {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargandoFotos, setCargandoFotos] = useState({});
  
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
      )}
    </div>
  );
};

export default NuestrasRutasInicio;
