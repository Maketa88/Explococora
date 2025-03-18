import { useEffect, useRef, useState } from 'react';
import { AZURE_MAPS_CONFIG, getAzureMapsKey } from '../config/azureMapConfig';
import { CircularProgress } from '../utils/CircularProgress';

/**
 * Componente del mapa usando iframe para aislar totalmente el mapa y evitar
 * conflictos con el resto de la aplicación
 */
const MapaAzure = ({
  altura = '500px',
  centro = AZURE_MAPS_CONFIG.defaultOptions.center,
  zoom = AZURE_MAPS_CONFIG.defaultOptions.zoom,
  estilo = 'road',
  className = '',
  onMapaListo = () => {},
  onError = () => {}
}) => {
  // Estados
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [iframeId] = useState(`azure-map-iframe-${Math.random().toString(36).substr(2, 9)}`);
  const [apiKey, setApiKey] = useState(null);
  
  const iframeRef = useRef(null);
  
  // Efecto para obtener la clave API
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getAzureMapsKey();
        if (!key) {
          throw new Error('No se pudo obtener la clave API de Azure Maps');
        }
        setApiKey(key);
      } catch (err) {
        console.error('Error al obtener la clave API:', err);
        setError('No se pudo obtener la configuración del mapa');
      }
    };
    
    fetchApiKey();
  }, []);
  
  // Contenido HTML para el iframe
  const getIframeContent = () => {
    if (!apiKey) {
      return `data:text/html;charset=utf-8,${encodeURIComponent('<html><body>Cargando configuración...</body></html>')}`;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Azure Maps</title>
        <link rel="stylesheet" href="https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css" />
        <script src="https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js"></script>
        <style>
          html, body { 
            height: 100%; 
            margin: 0; 
            padding: 0; 
            overflow: hidden;
          }
          #mapContainer { 
            width: 100%; 
            height: 100%; 
            border-radius: 12px;
          }
        </style>
      </head>
      <body>
        <div id="mapContainer"></div>
        <script>
          function initMap() {
            try {
              var map = new atlas.Map('mapContainer', {
                center: [${centro[0]}, ${centro[1]}],
                zoom: ${zoom},
                style: '${estilo}',
                authOptions: {
                  authType: 'subscriptionKey',
                  subscriptionKey: '${apiKey}'
                },
                disableTelemetry: true
              });
              
              map.events.add('ready', function() {
                console.log('Mapa listo dentro del iframe');
                
                // Agregar controles básicos
                map.controls.add(new atlas.control.ZoomControl(), {
                  position: 'bottom-right'
                });
                
                // Notificar al padre que el mapa está listo
                window.parent.postMessage({
                  type: 'MAPA_LISTO',
                  id: '${iframeId}'
                }, '*');
                
                // Guardar referencia
                window.azureMap = map;
              });
              
              map.events.add('error', function(e) {
                console.error('Error en el mapa:', e.error);
                window.parent.postMessage({
                  type: 'MAPA_ERROR',
                  id: '${iframeId}',
                  error: e.error.message || 'Error desconocido del mapa'
                }, '*');
              });
            } catch (err) {
              console.error('Error al inicializar mapa:', err);
              window.parent.postMessage({
                type: 'MAPA_ERROR',
                id: '${iframeId}',
                error: err.message || 'Error desconocido'
              }, '*');
            }
          }
          
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initMap, 500);
          });
        </script>
      </body>
      </html>
    `;
    
    // Convertir el HTML a un Data URL que podamos usar como src del iframe
    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  };
  
  // Efecto para configurar el iframe y la comunicación
  useEffect(() => {
    // Crear manejadores de mensajes para comunicarse con el iframe
    const handleIframeMessage = (event) => {
      // Validar origen del mensaje por seguridad si es necesario
      
      const message = event.data;
      
      if (message && message.id === iframeId) {
        if (message.type === 'MAPA_LISTO') {
          console.log('Recibido mensaje de mapa listo');
          setCargando(false);
          
          // Notificar que el mapa está listo
          if (onMapaListo) {
            // Esperar un momento para asegurar que el mapa esté completamente inicializado
            setTimeout(() => {
              if (iframeRef.current) {
                onMapaListo(iframeRef.current);
              }
            }, 200);
          }
        } else if (message.type === 'MAPA_ERROR') {
          console.error('Error en mapa recibido del iframe:', message.error);
          setError(message.error);
          setCargando(false);
          
          // Notificar el error al componente padre
          if (onError) {
            onError(message.error);
          }
        }
      }
    };
    
    // Agregar listener para mensajes del iframe
    window.addEventListener('message', handleIframeMessage);
    
    // Verificar que el header esté siempre visible
    const asegurarHeaderVisible = () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.zIndex = '50';
        header.style.position = 'relative';
      }
    };
    
    // Aplicar inmediatamente y programar verificaciones
    asegurarHeaderVisible();
    const timer1 = setTimeout(asegurarHeaderVisible, 1000);
    const timer2 = setTimeout(asegurarHeaderVisible, 5000);
    
    // Limpieza
    return () => {
      window.removeEventListener('message', handleIframeMessage);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [iframeId, onMapaListo, onError]);
  
  return (
    <div className={`relative ${className}`}>
      {/* Iframe para el mapa - solo renderizar cuando tengamos la clave API */}
      {apiKey ? (
        <iframe 
          ref={iframeRef}
          id={iframeId}
          style={{
            width: '100%',
            height: altura,
            border: 'none',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          title="Azure Maps"
          sandbox="allow-scripts allow-same-origin"
          src={getIframeContent()}
          className="mapa-azure-container"
        />
      ) : null}
      
      {/* Indicador de carga */}
      {(cargando || !apiKey) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10 rounded-xl">
          <CircularProgress tamaño="lg" color="teal" />
        </div>
      )}
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50 z-10 rounded-xl">
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