import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const NuestrasRutas = () => {
  const { t } = useTranslation();
  const { idRuta } = useParams();
  const [rutas, setRutas] = useState([]);
  const [rutaActual, setRutaActual] = useState(null);
  const [fotosRutaActual, setFotosRutaActual] = useState([]);
  const [indiceSliderFotos, setIndiceSliderFotos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/rutas');
        if (Array.isArray(response.data)) {
          setRutas(response.data);
          
          // Determinar la ruta inicial
          const rutaInicial = idRuta 
            ? response.data.find(r => r.idRuta === parseInt(idRuta))
            : response.data[0];
            
          if (rutaInicial) {
            setRutaActual(rutaInicial);
            await obtenerFotosRuta(rutaInicial.idRuta);
          }
        }
        setCargando(false);
      } catch (error) {
        setError(error.message);
        setCargando(false);
      }
    };
    fetchRutas();
  }, [idRuta]);

  const obtenerFotosRuta = async (id) => {
    try {
      const response = await axios.get(`http://localhost:10101/rutas/fotos-publicas/${id}`);
      if (response.data?.fotos?.[0]) {
        const fotos = response.data.fotos[0]
          .filter(item => item?.foto)
          .map(item => item.foto);
        setFotosRutaActual(fotos);
        setIndiceSliderFotos(0);
      }
    } catch (error) {
      console.error('Error al obtener fotos:', error);
    }
  };

  const cambiarRuta = async (direccion) => {
    const indiceActual = rutas.findIndex(r => r.idRuta === rutaActual.idRuta);
    const nuevoIndice = direccion === 'siguiente'
      ? (indiceActual + 1) % rutas.length
      : (indiceActual - 1 + rutas.length) % rutas.length;
    
    setRutaActual(rutas[nuevoIndice]);
    await obtenerFotosRuta(rutas[nuevoIndice].idRuta);
  };

  const cambiarFoto = (direccion) => {
    setIndiceSliderFotos(prevIndice => {
      const nuevoIndice = direccion === 'siguiente'
        ? (prevIndice + 1) % fotosRutaActual.length
        : (prevIndice - 1 + fotosRutaActual.length) % fotosRutaActual.length;
      return nuevoIndice;
    });
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {t('errorCargando', 'Error al cargar las rutas')}: {error}
      </div>
    );
  }

  if (!rutaActual) {
    return (
      <div className="text-center p-4">
        {t('noRutasDisponibles', 'No hay rutas disponibles')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botones de navegación entre rutas */}
      <div className="fixed left-4 right-4 top-[63%] -translate-y-1/2 flex justify-between z-10">
        <button
          onClick={() => cambiarRuta('anterior')}
          className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 transition-all duration-300 shadow-lg hover:scale-110 group"
          aria-label="Ruta anterior"
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
          onClick={() => cambiarRuta('siguiente')}
          className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 transition-all duration-300 shadow-lg hover:scale-110 group"
          aria-label="Siguiente ruta"
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
      <div className="relative mb-8 h-96">
        <div className="flex h-full overflow-hidden rounded-lg">
          {fotosRutaActual.slice(indiceSliderFotos, indiceSliderFotos + 2).map((foto, index) => (
            <div key={index} className="w-1/2 p-1">
              <img
                src={foto}
                alt={`Foto ${index + 1} de ${rutaActual.nombreRuta}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
        
        {/* Botones de navegación fotos */}
        <button
          onClick={() => cambiarFoto('anterior')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group"
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
          onClick={() => cambiarFoto('siguiente')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group"
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
        
        {/* Indicadores de fotos */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          {fotosRutaActual.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === indiceSliderFotos 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Información de la Ruta */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-teal-800 text-center mb-6">
          {rutaActual.nombreRuta}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-teal-700 mb-4">
              {t('descripcion', 'Descripción')}
            </h2>
            <p className="text-gray-600">
              {rutaActual.descripcion}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-teal-700 font-semibold w-24">{t('duracion', 'Duración')}:</span>
              <span>{rutaActual.duracion}</span>
            </div>

            <div className="flex items-center">
              <span className="text-teal-700 font-semibold w-24">{t('dificultad', 'Dificultad')}:</span>
              <span>{rutaActual.dificultad}</span>
            </div>

            <div className="flex items-center">
              <span className="text-teal-700 font-semibold w-24">{t('tipo', 'Tipo')}:</span>
              <span>{rutaActual.tipo}</span>
            </div>

            <div className="flex items-center">
              <span className="text-teal-700 font-semibold w-24">{t('distancia', 'Distancia')}:</span>
              <span>{rutaActual.distancia} km</span>
            </div>

            <div className="flex items-center">
              <span className="text-teal-700 font-semibold w-24">{t('precio', 'Precio')}:</span>
              <span>${rutaActual.precio}</span>
            </div>

            <div className="flex items-center">
              <span className="text-teal-700 font-semibold w-24">{t('estado', 'Estado')}:</span>
              <span className={`px-3 py-1 rounded-full ${
                rutaActual.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {rutaActual.estado}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuestrasRutas;