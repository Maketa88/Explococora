import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { obtenerCoordenadasRuta } from '../../../services/rutasService';
import VistaMapaRuta from './VistaMapaRuta';

/**
 * Componente de integración para mostrar el mapa de una ruta específica
 * dentro del componente ResultadoRuta
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.rutaPrincipal - Datos de la ruta principal
 * @param {string} props.altura - Altura del componente
 * @returns {JSX.Element}
 */
const MapaRutaIntegracion = ({ rutaPrincipal, altura = '400px' }) => {
  const { t } = useTranslation();
  
  // Estados
  const [coordenadas, setCoordenadas] = useState({
    inicio: [-75.57, 6.25], // Medellín por defecto
    final: [-74.07, 4.71],  // Bogotá por defecto
    puntos: []
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para cargar coordenadas cuando cambia la ruta
  useEffect(() => {
    // Validar que exista una ruta principal con ID
    if (!rutaPrincipal || !rutaPrincipal.idRuta) return;

    const cargarCoordenadas = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Obtener coordenadas desde el servicio
        const coordenadasRuta = await obtenerCoordenadasRuta(rutaPrincipal.idRuta);
        
        // Actualizar estado con las coordenadas obtenidas
        setCoordenadas({
          inicio: coordenadasRuta.inicio,
          final: coordenadasRuta.fin,
          puntos: coordenadasRuta.puntosInteres || []
        });
      } catch (error) {
        console.error('Error al obtener coordenadas de la ruta:', error);
        setError(t('errorCoordenadas', 'Error al cargar las coordenadas de la ruta'));
      } finally {
        setCargando(false);
      }
    };

    cargarCoordenadas();
  }, [rutaPrincipal, t]);

  /**
   * Manejador para cuando se carga la información de la ruta
   * @param {Object} datosRuta - Datos obtenidos de la API de Azure Maps
   */
  const handleRutaCargada = (datosRuta) => {
    if (datosRuta) {
      console.log('Datos de la ruta cargados correctamente');
    }
  };

  // Si no hay ruta disponible, mostrar mensaje
  if (!rutaPrincipal) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <p className="text-gray-500">{t('rutaNoDisponible', 'Ruta no disponible')}</p>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-8 text-center">
        <p className="text-red-500">{error}</p>
        <p className="text-gray-600 mt-2 text-sm">
          {t('intentarNuevamente', 'Intenta nuevamente más tarde')}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50 p-6 rounded-3xl shadow-xl border border-teal-200 relative overflow-hidden">
        {/* Elementos decorativos del fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-teal-200/10 rounded-bl-full -mr-10 -mt-10 z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-teal-200/10 rounded-tr-full -ml-8 -mb-8 z-0"></div>

        

        {/* Contenedor del mapa */}
        <div className="relative z-10">
          {cargando ? (
            <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <VistaMapaRuta
              puntoInicio={coordenadas.inicio}
              puntoFinal={coordenadas.final}
              puntosIntermedio={coordenadas.puntos}
             
              
              altura={altura}
              onRutaCargada={handleRutaCargada}
            />
          )}
        </div>

        {/* Información sobre el mapa */}
        <div className="mt-4 text-sm text-gray-500 text-center relative z-10">
          <p>
            {t('mapaInfo', 'Mapa interactivo proporcionado por Azure Maps. Puedes hacer zoom y mover el mapa para explorar mejor la ruta.')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MapaRutaIntegracion; 