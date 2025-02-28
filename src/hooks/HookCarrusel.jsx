import { useState, useEffect, useCallback } from "react";
import Cocora from "../assets/Images/carrusel1.webp";
import Cocora1 from "../assets/Images/carrusel2.webp";
import Cocora3 from "../assets/Images/carrusel3.webp";

export const HooksCarrusel = (autoScrollInterval = 6000) => {
  const images = [Cocora, Cocora1, Cocora3];
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Función para ir a la imagen siguiente (usando useCallback para optimización)
  const nextImage = useCallback(() => {
    setCurrentImage((prevImage) =>
      prevImage === images.length - 1 ? 0 : prevImage + 1
    );
  }, [images.length]);

  // Función para ir a la imagen anterior (usando useCallback para optimización)
  const prevImage = useCallback(() => {
    setCurrentImage((prevImage) =>
      prevImage === 0 ? images.length - 1 : prevImage - 1
    );
  }, [images.length]);

  // Función para ir a una imagen específica
  const goToImage = useCallback((index) => {
    setCurrentImage(index);
  }, []);

  // Pausar el autodesplazamiento cuando el usuario interactúa con los controles
  const pauseAutoScroll = useCallback(() => {
    setIsAutoScrolling(false);
    // Reiniciar el autodesplazamiento después de 10 segundos de inactividad
    const timer = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para iniciar el autodesplazamiento
  useEffect(() => {
    let interval;
    
    if (isAutoScrolling) {
      interval = setInterval(() => {
        nextImage();
      }, autoScrollInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoScrolling, nextImage, autoScrollInterval]);

  // Versiones modificadas de prevImage y nextImage que pausan el autodesplazamiento
  const prevImageWithPause = useCallback(() => {
    pauseAutoScroll();
    prevImage();
  }, [pauseAutoScroll, prevImage]);

  const nextImageWithPause = useCallback(() => {
    pauseAutoScroll();
    nextImage();
  }, [pauseAutoScroll, nextImage]);

  return {
    images,
    currentImage,
    prevImage: prevImageWithPause,
    nextImage: nextImageWithPause,
    goToImage,
    isAutoScrolling,
    setIsAutoScrolling
  };
};