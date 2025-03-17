import { useCallback, useEffect, useRef, useState } from 'react';
import * as azureMapsService from '../../../services/azureMapsService';
import { AZURE_MAPS_CONFIG, LINE_OPTIONS } from '../config/azureMapConfig';

/**
 * Hook personalizado para gestionar mapas de Azure
 * 
 * @param {Object} opciones - Opciones de configuración para el mapa
 * @returns {Object} - Estado y funciones para controlar el mapa
 */
export const useAzureMap = (opciones = {}) => {
  // Estados para el mapa y sus elementos
  const [mapa, setMapa] = useState(null);
  const [marcadores, setMarcadores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [centro, setCentro] = useState(opciones.center || AZURE_MAPS_CONFIG.defaultOptions.center);
  const [zoom, setZoom] = useState(opciones.zoom || AZURE_MAPS_CONFIG.defaultOptions.zoom);
  
  // Referencia al contenedor del mapa
  const contenedorMapaRef = useRef(null);
  
  // Controlar si el componente está montado para evitar actualizar estados después de desmontarse
  const isMounted = useRef(true);

  // Efecto para limpiar cuando el componente se desmonte
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Inicializar mapa cuando el SDK esté disponible
  useEffect(() => {
    // Si no existe el SDK de Azure Maps o el contenedor no está listo, salir
    if (!window.atlas) {
      console.log('SDK de Azure Maps no disponible aún');
      return;
    }
    
    if (!contenedorMapaRef.current) {
      console.log('Contenedor del mapa no disponible aún');
      return;
    }
    
    if (!isMounted.current) {
      console.log('Componente desmontado');
      return;
    }

    console.log('Contenedor del mapa:', contenedorMapaRef.current);
    
    // Opciones para la inicialización del mapa
    const opcionesMapa = {
      ...AZURE_MAPS_CONFIG.defaultOptions,
      ...opciones,
      center: centro,
      zoom: zoom,
      container: contenedorMapaRef.current
    };

    // Verificar explícitamente que el contenedor es válido
    if (!opcionesMapa.container || 
        (typeof opcionesMapa.container !== 'string' && 
         !(opcionesMapa.container instanceof HTMLElement))) {
      console.error('El contenedor del mapa no es válido:', opcionesMapa.container);
      if (isMounted.current) {
        setError(new Error('El contenedor del mapa no es válido'));
        setCargando(false);
      }
      return;
    }

    // Manejar errores durante la inicialización
    try {
      // Crear la instancia del mapa
      console.log('Inicializando mapa de Azure Maps');
      const nuevoMapa = new window.atlas.Map(opcionesMapa);

      // Eventos para cuando el mapa esté listo
      nuevoMapa.events.add('ready', () => {
        console.log('Mapa de Azure inicializado correctamente');
        if (isMounted.current) {
          setMapa(nuevoMapa);
          setCargando(false);
          
          // Inicializar fuentes de datos para usar en el mapa
          try {
            // Crear fuente de datos para marcadores
            const fuentePins = new window.atlas.source.DataSource();
            nuevoMapa.sources.add(fuentePins);
          } catch (err) {
            console.warn('Error al inicializar fuentes de datos:', err);
          }
        }
      });

      // Eventos para cambios en el mapa
      nuevoMapa.events.add('move', () => {
        if (isMounted.current) {
          setCentro(nuevoMapa.getCamera().center);
        }
      });

      nuevoMapa.events.add('zoomend', () => {
        if (isMounted.current) {
          setZoom(nuevoMapa.getCamera().zoom);
        }
      });

      // Evento para errores en el mapa
      nuevoMapa.events.add('error', (e) => {
        console.error('Error en el mapa de Azure:', e.error);
        if (isMounted.current) {
          setError(e.error);
          setCargando(false);
        }
      });

      // Limpiar al desmontar
      return () => {
        if (nuevoMapa) {
          try {
            nuevoMapa.dispose();
          } catch (e) {
            console.warn('Error al limpiar mapa de Azure:', e);
          }
        }
      };
    } catch (err) {
      console.error('Error al inicializar el mapa de Azure:', err);
      if (isMounted.current) {
        setError(err);
        setCargando(false);
      }
    }
  }, [centro, zoom, opciones]);

  /**
   * Agrega un marcador al mapa
   * @param {Array} coordenadas - Coordenadas [longitud, latitud]
   * @param {Object} opciones - Opciones adicionales para el marcador
   * @returns {Object} - El marcador creado
   */
  const agregarMarcador = useCallback((coordenadas, opciones = {}) => {
    if (!mapa || !window.atlas || !isMounted.current) return null;

    try {
      // Crear un pin (marcador) en el mapa
      const pin = new window.atlas.HtmlMarker({
        position: coordenadas,
        ...opciones
      });

      // Agregar el pin al mapa
      mapa.markers.add(pin);
      
      // Actualizar estado de marcadores
      setMarcadores((marcadoresActuales) => [...marcadoresActuales, pin]);

      return pin;
    } catch (err) {
      console.error('Error al agregar marcador:', err);
      setError(err);
      return null;
    }
  }, [mapa]);

  /**
   * Elimina un marcador del mapa
   * @param {Object} marcador - El marcador a eliminar
   */
  const eliminarMarcador = useCallback((marcador) => {
    if (!mapa || !marcador || !isMounted.current) return;

    try {
      // Remover el marcador del mapa
      mapa.markers.remove(marcador);
      
      // Actualizar estado de marcadores
      setMarcadores((marcadoresActuales) => 
        marcadoresActuales.filter((m) => m !== marcador)
      );
    } catch (err) {
      console.error('Error al eliminar marcador:', err);
      setError(err);
    }
  }, [mapa]);

  /**
   * Elimina todos los marcadores del mapa
   */
  const limpiarMarcadores = useCallback(() => {
    if (!mapa || !isMounted.current) return;

    try {
      // Remover todos los marcadores
      mapa.markers.clear();
      
      // Actualizar estado
      setMarcadores([]);
    } catch (err) {
      console.error('Error al limpiar marcadores:', err);
      setError(err);
    }
  }, [mapa]);

  /**
   * Dibuja una ruta entre dos puntos en el mapa
   * @param {Array} origen - Coordenadas de origen [longitud, latitud]
   * @param {Array} destino - Coordenadas de destino [longitud, latitud]
   * @param {Array} puntosIntermedio - Puntos intermedios [[long1, lat1], [long2, lat2], ...]
   * @param {Object} opciones - Opciones adicionales para la línea
   * @returns {Promise} - Promesa con la ruta creada
   */
  const dibujarRuta = useCallback(async (origen, destino, puntosIntermedio = [], opciones = {}) => {
    if (!mapa || !window.atlas || !isMounted.current) return null;

    try {
      setCargando(true);
      
      // Obtener datos de la ruta desde el servicio
      console.log('Obteniendo datos de ruta entre', origen, 'y', destino);
      const rutaData = await azureMapsService.obtenerRuta(origen, destino, puntosIntermedio);
      
      // Verificar que la respuesta contenga rutas
      if (!rutaData.routes || rutaData.routes.length === 0) {
        throw new Error('No se encontró una ruta entre los puntos especificados');
      }
      
      if (!isMounted.current) return null;
      
      // Obtener la primera ruta (normalmente la más óptima)
      const primeraRuta = rutaData.routes[0];
      
      // Crear la fuente de datos para la línea
      const fuenteDatos = new window.atlas.source.DataSource();
      mapa.sources.add(fuenteDatos);
      
      // Crear la línea a partir de la geometría de la ruta
      const linea = new window.atlas.data.LineString(primeraRuta.legs[0].points);
      fuenteDatos.add(new window.atlas.data.Feature(linea));
      
      // Opciones de estilo para la línea
      const estiloLinea = {
        ...LINE_OPTIONS,
        ...opciones
      };
      
      // Crear la capa de línea
      const capa = new window.atlas.layer.LineLayer(fuenteDatos, null, estiloLinea);
      mapa.layers.add(capa);
      
      // Añadir la ruta al estado
      const nuevaRuta = {
        fuente: fuenteDatos,
        capa: capa,
        datos: rutaData
      };
      
      setRutas((rutasActuales) => [...rutasActuales, nuevaRuta]);
      setCargando(false);
      
      return nuevaRuta;
    } catch (err) {
      console.error('Error al dibujar ruta:', err);
      if (isMounted.current) {
        setError(err);
        setCargando(false);
      }
      return null;
    }
  }, [mapa]);

  /**
   * Elimina una ruta del mapa
   * @param {Object} ruta - La ruta a eliminar
   */
  const eliminarRuta = useCallback((ruta) => {
    if (!mapa || !ruta || !isMounted.current) return;

    try {
      // Eliminar la capa y la fuente
      mapa.layers.remove(ruta.capa);
      mapa.sources.remove(ruta.fuente);
      
      // Actualizar estado
      setRutas((rutasActuales) => 
        rutasActuales.filter((r) => r !== ruta)
      );
    } catch (err) {
      console.error('Error al eliminar ruta:', err);
      setError(err);
    }
  }, [mapa]);

  /**
   * Elimina todas las rutas del mapa
   */
  const limpiarRutas = useCallback(() => {
    if (!mapa || !isMounted.current) return;

    try {
      // Eliminar todas las capas y fuentes de rutas
      rutas.forEach(ruta => {
        try {
          mapa.layers.remove(ruta.capa);
          mapa.sources.remove(ruta.fuente);
        } catch (e) {
          console.warn('Error al eliminar ruta individual:', e);
        }
      });
      
      // Actualizar estado
      setRutas([]);
    } catch (err) {
      console.error('Error al limpiar rutas:', err);
      setError(err);
    }
  }, [mapa, rutas]);

  /**
   * Ajusta la vista del mapa para mostrar todos los puntos
   * @param {Array} puntos - Array de coordenadas [[long1, lat1], [long2, lat2], ...]
   */
  const ajustarVistaPuntos = useCallback((puntos) => {
    if (!mapa || !puntos || puntos.length === 0 || !window.atlas || !isMounted.current) return;

    try {
      if (puntos.length === 1) {
        // Si solo hay un punto, centrar en él con un zoom apropiado
        mapa.setCamera({
          center: puntos[0],
          zoom: 12
        });
        return;
      }
      
      // Crear un objeto de límites para calcular el área a mostrar
      const bounds = new window.atlas.data.BoundingBox(
        puntos[0][0], // west
        puntos[0][1], // south
        puntos[0][0], // east
        puntos[0][1]  // north
      );
      
      // Expandir los límites para incluir todos los puntos
      puntos.forEach(punto => {
        bounds.west = Math.min(bounds.west, punto[0]);
        bounds.south = Math.min(bounds.south, punto[1]);
        bounds.east = Math.max(bounds.east, punto[0]);
        bounds.north = Math.max(bounds.north, punto[1]);
      });
      
      // Agregar un pequeño margen
      const padded = mapa.generateBoundingBox(bounds, 0.2);
      
      // Ajustar la cámara
      mapa.setCamera({
        bounds: padded,
        padding: 50
      });
    } catch (err) {
      console.error('Error al ajustar vista de puntos:', err);
      setError(err);
    }
  }, [mapa]);

  return {
    // Referencia al contenedor del mapa - IMPORTANTE: Debe asignarse a un div real en el DOM
    contenedorMapaRef,
    
    // Estado principal del mapa
    mapa,
    marcadores,
    rutas,
    cargando,
    error,
    centro,
    zoom,
    
    // Funciones para interactuar con el mapa
    agregarMarcador,
    eliminarMarcador,
    limpiarMarcadores,
    dibujarRuta,
    eliminarRuta,
    limpiarRutas,
    ajustarVistaPuntos
  };
}; 