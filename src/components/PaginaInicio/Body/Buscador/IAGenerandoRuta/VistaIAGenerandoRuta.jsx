import { useEffect } from 'react';
import { PanelProcesamiento } from './PanelProcesamiento';
import { VideoIA } from './VideoIA';
import './animaciones.css';

export const VistaIAGenerandoRuta = () => {
  // Efecto para simular que después de un tiempo se redirige a la página de resultados
  useEffect(() => {
    // Simulación de redirección a página de resultados después de un tiempo
    // const timer = setTimeout(() => {
    //   // Redirección a página de resultados
    // }, 10000);
    // return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      
      
      <VideoIA />
      <PanelProcesamiento />
    </div>
  );
}; 