import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { obtenerRuta } from '../../../services/azureMapsService';
import { LINE_OPTIONS, MARKER_OPTIONS } from '../config/azureMapConfig';
import InfoRuta from './InfoRuta';
import MapaAzure from './MapaAzure';

/**
 * Componente para mostrar una vista completa de mapa con información de ruta
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element}
 */
const VistaMapaRuta = ({
  puntoInicio = [-75.57, 6.25], // Coordenadas por defecto (Medellín)
  puntoFinal = [-74.07, 4.71],  // Coordenadas por defecto (Bogotá)
  puntosIntermedio = [],
  nombreRuta = '',
  descripcion = '',
  altura = '500px',
  mostrarInfo = true,
  onRutaCargada = () => {},
  className = ''
}) => {
  // Estados
  const [datosRuta, setDatosRuta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mapaListo, setMapaListo] = useState(false);
  
  // Preparar los marcadores para el mapa
  const marcadores = [
    {
      coordenadas: puntoInicio,
      opciones: {
        color: MARKER_OPTIONS.color,
        text: 'A',
        popup: {
          content: '<div class="p-2"><b>Punto de inicio</b></div>',
          pixelOffset: [0, -30]
        }
      },
      tipo: 'inicio'
    },
    {
      coordenadas: puntoFinal,
      opciones: {
        color: MARKER_OPTIONS.secondaryColor,
        text: 'B',
        popup: {
          content: '<div class="p-2"><b>Punto final</b></div>',
          pixelOffset: [0, -30]
        }
      },
      tipo: 'final'
    },
    ...puntosIntermedio.map((punto, index) => ({
      coordenadas: punto.coordenadas,
      opciones: {
        color: MARKER_OPTIONS.color,
        text: `${index + 1}`,
        popup: {
          content: `<div class="p-2"><b>${punto.nombre || 'Punto intermedio'}</b></div>`,
          pixelOffset: [0, -30]
        }
      },
      tipo: 'intermedio',
      nombre: punto.nombre
    }))
  ];

  // Configuración inicial de la ruta
  const rutaInicial = {
    origen: puntoInicio,
    destino: puntoFinal,
    puntosIntermedios: puntosIntermedio.map(p => p.coordenadas),
    opciones: LINE_OPTIONS
  };

  // Cargar la ruta al iniciar el componente
  useEffect(() => {
    const cargarRuta = async () => {
      if (!mapaListo) return;
      
      try {
        setCargando(true);
        setError(null);
        
        // Validar coordenadas antes de hacer la solicitud
        if (!Array.isArray(puntoInicio) || puntoInicio.length < 2 || 
            !Array.isArray(puntoFinal) || puntoFinal.length < 2) {
          setError('Coordenadas de inicio o fin inválidas');
          setCargando(false);
          return;
        }
        
        // Obtener los datos de la ruta
        const rutaData = await obtenerRuta(puntoInicio, puntoFinal, puntosIntermedio.map(p => p.coordenadas));
        
        if (rutaData && rutaData.routes && rutaData.routes.length > 0) {
          setDatosRuta(rutaData);
          onRutaCargada(rutaData);
        } else {
          console.warn('No se pudo obtener información de ruta:', rutaData);
          setDatosRuta({
            routes: [
              {
                summary: {
                  lengthInMeters: 0,
                  travelTimeInSeconds: 0,
                  trafficDelayInSeconds: 0,
                  departureTime: new Date().toISOString(),
                  arrivalTime: new Date().toISOString()
                },
                legs: []
              }
            ]
          });
        }
        
        setCargando(false);
      } catch (err) {
        console.error('Error al cargar la ruta:', err);
        setError('No se pudo calcular la ruta. Por favor, intenta con otros puntos o más tarde.');
        setCargando(false);
      }
    };

    cargarRuta();
  }, [puntoInicio, puntoFinal, puntosIntermedio, mapaListo, onRutaCargada]);

  // Manejador para cuando el mapa esté listo
  const handleMapaListo = () => {
    setMapaListo(true);
  };

  // Manejador para el clic en un marcador
  const handleMarcadorClick = (marcador) => {
    console.log('Marcador clickeado:', marcador);
  };

  return (
    <div className={`bg-white  shadow-lg overflow-hidden ${className}`}>
      {/* Encabezado con información de la ruta */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-2 border-b border-gray-200"
      >
        <h2 className="text-2xl font-bold text-teal-700">{nombreRuta}</h2>
        {descripcion && (
          <p className="text-gray-600 mt-1">{descripcion}</p>
        )}
      </motion.div>

      {/* Contenedor del mapa */}
      <div className="relative p-4">
        <MapaAzure
          altura={altura}
          marcadores={marcadores}
          rutaInicial={rutaInicial}
          onMapaListo={handleMapaListo}
          onMarcadorClick={handleMarcadorClick}
          className="border-b border-gray-200"
        />
        
        {/* Indicador de carga */}
        {cargando && !error && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        )}
        
        {/* Indicador de error */}
        {error && (
          <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center z-20">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <h3 className="text-red-600 font-bold mb-2">Error</h3>
              <p className="text-gray-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Información detallada de la ruta */}
      {mostrarInfo && datosRuta && datosRuta.routes && datosRuta.routes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InfoRuta datosRuta={datosRuta} className="border-t border-gray-200" />
        </motion.div>
      )}
    </div>
  );
};

export default VistaMapaRuta; 