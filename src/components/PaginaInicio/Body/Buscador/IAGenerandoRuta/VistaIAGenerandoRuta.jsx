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
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-teal-600">
          IA Generando Tu Ruta Perfecta
        </h2>
      </div>
      
      <VideoIA />
      <PanelProcesamiento />
    </div>
  );
}; 