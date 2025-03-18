import { useState } from 'react';
import { LINE_OPTIONS, MARKER_OPTIONS } from '../config/azureMapConfig';
import MapaAzure from './MapaAzure';

/**
 * Componente simplificado para mostrar solo el mapa con puntos y rutas
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element}
 */
const VistaRutaSimple = ({
  puntoInicio = [-75.57, 6.25], // Medellín por defecto
  puntoFinal = [-74.07, 4.71],  // Bogotá por defecto
  puntosIntermedio = [],
  altura = '400px',
  className = '',
  mostrarControles = true
}) => {
  // Estado para controlar cuando el mapa está listo
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

  // Configuración de la ruta
  const rutaInicial = {
    origen: puntoInicio,
    destino: puntoFinal,
    puntosIntermedios: puntosIntermedio.map(p => p.coordenadas),
    opciones: LINE_OPTIONS
  };

  // Manejador para cuando el mapa esté listo
  const handleMapaListo = (mapa) => {
    setMapaListo(true);
  };

  return (
    <div className={`overflow-hidden shadow-lg ${className}`}>
      <MapaAzure
        altura={altura}
        marcadores={marcadores}
        rutaInicial={rutaInicial}
        onMapaListo={handleMapaListo}
        mostrarControles={mostrarControles}
      />
    </div>
  );
};

export default VistaRutaSimple; 