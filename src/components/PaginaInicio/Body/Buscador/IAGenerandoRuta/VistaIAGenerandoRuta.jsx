import { useEffect, useState } from 'react';
import { PanelProcesamiento } from './PanelProcesamiento';
import { ResultadoRuta } from './ResultadoRuta';
import { VideoIA } from './VideoIA';
import './animaciones.css';

export const VistaIAGenerandoRuta = () => {
  const [tiempoRestante, setTiempoRestante] = useState(10);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // Efecto para simular que después de un tiempo se muestran los resultados
  useEffect(() => {
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
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {!mostrarResultado ? (
        <>
          <VideoIA />
          <PanelProcesamiento tiempoRestante={tiempoRestante} />
        </>
      ) : (
        <ResultadoRuta />
      )}
    </div>
  );
}; 