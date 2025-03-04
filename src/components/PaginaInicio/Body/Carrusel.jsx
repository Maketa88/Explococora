import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HooksCarrusel } from "../../../hooks/HookCarrusel";
import { BotonCarrusel } from "./BotonCarrusel";
import { Indicadores } from "./Indicadores";
import { SearchForm } from "./Buscador/SearchForm";

export const Carrusel = () => {
  const { t } = useTranslation();
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
  
  const handleSearch = (searchData) => {
    console.log('Datos de búsqueda:', searchData);
  };

  return (
    <section className="relative w-full h-[50vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
      {/* Capa de imagen inferior (imagen anterior) */}
      <img
        src={images[previousImage]}
        alt={`Slide ${previousImage + 1}`}
        className="absolute inset-0 w-full h-full object-cover filter brightness-110"
      />
      
      {/* Capa de imagen superior (imagen actual) con transición de opacidad */}
      {isTransitioning && (
        <img
          src={images[currentImage]}
          alt={`Slide ${currentImage + 1}`}
          className="absolute inset-0 w-full h-full object-cover filter brightness-110"
          style={{
            opacity: opacity,
            transition: 'opacity 800ms ease-in-out'
          }}
        />
      )}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '-5%', gap: '40px'}}>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white font-bold mb-0 drop-shadow-lg" 
            style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {t('title')}
        </h1>
        <h2 className="text-xl sm:text-2xl lg:text-3xl text-white mb-2 drop-shadow-lg" 
            style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {t('slogan')}
        </h2>
        
        <div className="w-full flex justify-center">
          <SearchForm onSearch={handleSearch} />
        </div>
      </div>
      
      <BotonCarrusel direction="left" onClick={prevImage} />
      <BotonCarrusel direction="right" onClick={nextImage} />
      <Indicadores images={images} currentImage={currentImage} goToImage={goToImage} />
    </section>
  );
};