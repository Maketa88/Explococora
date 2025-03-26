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
    <section className="relative w-full h-[50vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
      {/* Capa de imagen inferior (imagen anterior) */}
      <img
        src={images[previousImage]}
        alt={`Slide ${previousImage + 1}`}
        className="absolute inset-0 w-full h-full object-cover filter brightness-75"
      />
      
      {/* Capa oscura para mejorar contraste con texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]"></div>
      
      {/* Capa de imagen superior (imagen actual) con transición de opacidad */}
      {isTransitioning && (
        <img
          src={images[currentImage]}
          alt={`Slide ${currentImage + 1}`}
          className="absolute inset-0 w-full h-full object-cover filter brightness-75"
          style={{
            opacity: opacity,
            transition: 'opacity 800ms ease-in-out'
          }}
        />
      )}
      
      <BotonCarrusel direction="left" onClick={prevImage} />
      <BotonCarrusel direction="right" onClick={nextImage} />
      <Indicadores images={images} currentImage={currentImage} goToImage={goToImage} />
    </section>
  );
};