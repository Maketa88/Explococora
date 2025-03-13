import { useEffect, useState } from 'react';
import { iaBuscadorService } from '../../../../../services/IABuscadorService';
import './animaciones.css';
import { PanelProcesamiento } from './PanelProcesamiento';
import { ResultadoRuta } from './ResultadoRuta';
import { VideoIA } from './VideoIA';

export const VistaIAGenerandoRuta = ({ consulta = '' }) => {
  const [tiempoRestante, setTiempoRestante] = useState(10);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultadoIA, setResultadoIA] = useState(null);

  // Efecto para procesar la consulta con el servicio de IA
  useEffect(() => {
    // Procesar la consulta con el servicio de IA
    const resultado = iaBuscadorService.procesarConsulta(consulta);
    setResultadoIA(resultado);
    
    // Simulación de mostrar resultados después de un tiempo
    const timer = setTimeout(() => {
      // Mostrar resultados
      setMostrarResultado(true);
    }, 10000);

    // Actualizar contador cada segundo
    const intervalo = setInterval(() => {
      setTiempoRestante(prevTiempo => {
        if (prevTiempo <= 1) {
          clearInterval(intervalo);
          return 0;
        }
        return prevTiempo - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(intervalo);
    };
  }, [consulta]);

  return (
    <div className="w-full flex flex-col items-center">
      {!mostrarResultado ? (
        <>
          <VideoIA />
          <PanelProcesamiento tiempoRestante={tiempoRestante} />
        </>
      ) : (
        <ResultadoRuta resultadoIA={resultadoIA} consulta={consulta} />
      )}
    </div>
  );
}; 