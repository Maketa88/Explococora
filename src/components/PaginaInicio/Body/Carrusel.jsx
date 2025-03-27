import { useEffect, useState } from "react";
import { HooksCarrusel } from "../../../hooks/HookCarrusel";
import { BotonCarrusel } from "./BotonCarrusel";
import { Indicadores } from "./Indicadores";

export const Carrusel = () => {
  // Usar el hook actualizado con autodesplazamiento cada 10 segundos
  const { images, currentImage, prevImage, nextImage, goToImage } = HooksCarrusel(8000);
  
  // Estado para controlar la imagen anterior durante la transición
  const [previousImage, setPreviousImage] = useState(currentImage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [opacity, setOpacity] = useState(0);
  
  // Efecto para manejar la transición suave cuando cambia la imagen actual
  useEffect(() => {
    if (currentImage !== previousImage) {
      setIsTransitioning(true);
      setOpacity(0);
      
      // Iniciamos la animación de fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpacity(1);
        });
      });
      
      // Después de que se complete la transición, actualizamos la imagen anterior
      const timer = setTimeout(() => {
        setPreviousImage(currentImage);
        setIsTransitioning(false);
      }, 800); // Duración de la transición completa
      
      return () => clearTimeout(timer);
    }
  }, [currentImage, previousImage]);

  return (
    <section className="relative w-full h-[50vh] sm:h-[70vh] lg:h-[105vh] overflow-hidden -mt-16 sm:-mt-24 md:-mt-32 -mb-20">
      {/* Capa de imagen inferior (imagen anterior) con filtros mejorados */}
      <img
        src={images[previousImage]}
        alt={`Slide ${previousImage + 1}`}
        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-[1.1] saturate-[1.2]"
      />
      
      {/* Overlay con degradado para mejorar visibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/50 z-[1]"></div>
      
      {/* Capa de efecto de color teal superpuesta */}
      <div className="absolute inset-0 bg-teal-900/20 mix-blend-soft-light z-[1]"></div>
      
      {/* Vignette effect para enfocar el centro */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-[1]"></div>
      
      {/* Capa de imagen superior (imagen actual) con transición de opacidad y filtros mejorados */}
      {isTransitioning && (
        <>
          <img
            src={images[currentImage]}
            alt={`Slide ${currentImage + 1}`}
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-[1.1] saturate-[1.2]"
            style={{
              opacity: opacity,
              transition: 'opacity 800ms ease-in-out'
            }}
          />
          
          {/* Overlay con degradado para la imagen en transición */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/50 z-[1]"
            style={{
              opacity: opacity,
              transition: 'opacity 800ms ease-in-out'
            }}
          ></div>
          
          {/* Capa de efecto de color teal para la imagen en transición */}
          <div 
            className="absolute inset-0 bg-teal-900/20 mix-blend-soft-light z-[1]"
            style={{
              opacity: opacity,
              transition: 'opacity 800ms ease-in-out'
            }}
          ></div>
          
          {/* Vignette effect para la imagen en transición */}
          <div 
            className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.1)] z-[1]"
            style={{
              opacity: opacity,
              transition: 'opacity 800ms ease-in-out'
            }}
          ></div>
        </>
      )}
      
      <BotonCarrusel direction="left" onClick={prevImage} />
      <BotonCarrusel direction="right" onClick={nextImage} />
      <Indicadores images={images} currentImage={currentImage} goToImage={goToImage} />
    </section>
  );
};