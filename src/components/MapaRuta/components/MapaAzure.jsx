import { useEffect, useState } from 'react';
import { AZURE_MAPS_CONFIG } from '../config/azureMapConfig';
import { CircularProgress } from '../utils/CircularProgress';

// Generar un ID único para el mapa, consistente durante la sesión
const MAPA_ID = `mapa-azure-${Date.now()}`;

// Código JavaScript puro para inicializar el mapa
// Este script se inyectará en el documento
const getMapScript = (id, center, zoom, style, key) => `
(function() {
  // Esperar a que el DOM esté completamente cargado
  function inicializarMapa() {
    try {
      console.log('Inicializando mapa con ID:', '${id}');
      var mapContainer = document.getElementById('${id}');
      
      if (!mapContainer) {
        console.error('No se encontró el contenedor del mapa');
        return;
      }
      
      var map = new atlas.Map('${id}', {
        center: [${center[0]}, ${center[1]}],
        zoom: ${zoom},
        style: '${style}',
        authOptions: {
          authType: 'subscriptionKey',
          subscriptionKey: '${key}'
        }
      });
      
      map.events.add('ready', function() {
        console.log('El mapa se ha inicializado correctamente');
        
        // Agregar controles básicos
        map.controls.add(new atlas.control.ZoomControl(), {
          position: 'bottom-right'
        });
        
        // Notificar que el mapa está listo (enviando evento personalizado)
        var evento = new CustomEvent('mapaListo', { detail: { mapaId: '${id}' } });
        document.dispatchEvent(evento);
      });
      
      map.events.add('error', function(e) {
        console.error('Error en el mapa:', e.error);
        var evento = new CustomEvent('mapaError', { 
          detail: { 
            error: e.error.message || 'Error desconocido del mapa', 
            mapaId: '${id}' 
          } 
        });
        document.dispatchEvent(evento);
      });
      
      // Guardar la referencia global
      window.azureMapa = map;
    } catch (err) {
      console.error('Error al inicializar mapa:', err);
      var evento = new CustomEvent('mapaError', { 
        detail: { 
          error: err.message || 'Error desconocido', 
          mapaId: '${id}' 
        } 
      });
      document.dispatchEvent(evento);
    }
  }
  
  // Ejecutar cuando el SDK esté cargado
  if (window.atlas) {
    inicializarMapa();
  } else {
    console.log('Esperando a que el SDK esté disponible...');
    var checkInterval = setInterval(function() {
      if (window.atlas) {
        clearInterval(checkInterval);
        inicializarMapa();
      }
    }, 100);
    
    // Establecer un tiempo límite de 10 segundos
    setTimeout(function() {
      clearInterval(checkInterval);
      if (!window.atlas) {
        console.error('Tiempo de espera agotado esperando al SDK de Azure Maps');
        var evento = new CustomEvent('mapaError', { 
          detail: { 
            error: 'Tiempo de espera agotado esperando al SDK de Azure Maps', 
            mapaId: '${id}' 
          } 
        });
        document.dispatchEvent(evento);
      }
    }, 10000);
  }
})();
`;

/**
 * Componente del mapa con enfoque alternativo para evitar problemas de React
 */
const MapaAzure = ({
  altura = '500px',
  centro = AZURE_MAPS_CONFIG.defaultOptions.center,
  zoom = AZURE_MAPS_CONFIG.defaultOptions.zoom,
  estilo = 'road',
  className = '',
  onMapaListo = () => {}
}) => {
  // Estados
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Efecto para cargar el SDK y configurar el mapa
  useEffect(() => {
    // Paso 1: Cargar el CSS si no está cargado
    if (!document.querySelector('link[href*="atlas.min.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css';
      document.head.appendChild(link);
    }
    
    // Paso 2: Cargar el script de Azure Maps si no está cargado
    const cargarScript = () => {
      return new Promise((resolve, reject) => {
        if (window.atlas) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js';
        script.async = true;
        
        script.onload = () => {
          console.log('SDK de Azure Maps cargado correctamente');
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error('No se pudo cargar el SDK de Azure Maps'));
        };
        
        document.body.appendChild(script);
      });
    };
    
    // Paso 3: Configurar escuchadores de eventos para la comunicación
    const escuchadorListo = (e) => {
      if (e.detail.mapaId === MAPA_ID) {
        console.log('Mapa listo recibido:', e.detail);
        setCargando(false);
        if (onMapaListo && window.azureMapa) {
          onMapaListo(window.azureMapa);
        }
      }
    };
    
    const escuchadorError = (e) => {
      if (e.detail.mapaId === MAPA_ID) {
        console.error('Error en el mapa recibido:', e.detail);
        setError(e.detail.error);
        setCargando(false);
      }
    };
    
    document.addEventListener('mapaListo', escuchadorListo);
    document.addEventListener('mapaError', escuchadorError);
    
    // Paso 4: Cargar el SDK y luego inicializar el mapa con el script inyectado
    cargarScript()
      .then(() => {
        // Generar script de inicialización personalizado
        const scriptMapa = document.createElement('script');
        scriptMapa.textContent = getMapScript(
          MAPA_ID, 
          centro, 
          zoom, 
          estilo, 
          AZURE_MAPS_CONFIG.subscriptionKey
        );
        
        // Añadir al documento para que se ejecute
        document.body.appendChild(scriptMapa);
        
        // Limpiar script después de ejecutarse
        setTimeout(() => {
          if (document.body.contains(scriptMapa)) {
            document.body.removeChild(scriptMapa);
          }
        }, 1000);
      })
      .catch(err => {
        console.error('Error al cargar recursos:', err);
        setError(err.message || 'Error al cargar los recursos del mapa');
        setCargando(false);
      });
    
    // Limpieza al desmontar
    return () => {
      document.removeEventListener('mapaListo', escuchadorListo);
      document.removeEventListener('mapaError', escuchadorError);
      
      // Limpiar el mapa si existe
      if (window.azureMapa) {
        try {
          window.azureMapa.dispose();
          window.azureMapa = null;
        } catch (e) {
          console.warn('Error al limpiar el mapa:', e);
        }
      }
    };
  }, [centro, zoom, estilo, onMapaListo]);
  
  return (
    <div className={`relative ${className}`}>
      {/* Contenedor del mapa con ID */}
      <div 
        id={MAPA_ID}
        style={{
          width: '100%',
          height: altura,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        className="mapa-azure-container"
      />
      
      {/* Indicador de carga */}
      {cargando && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
          <CircularProgress tamaño="lg" color="teal" />
        </div>
      )}
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50 z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md text-center">
            <h3 className="text-red-600 font-bold text-lg mb-2">Error al cargar el mapa</h3>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaAzure; 