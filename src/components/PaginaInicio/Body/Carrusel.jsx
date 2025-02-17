import React from "react";
import { useTranslation } from "react-i18next";
import { HooksCarrusel } from "../../../hooks/HookCarrusel";
import { SearchForm } from "./SearchForm";
import { BotonCarrusel } from "./BotonCarrusel";
import { Indicadores } from "./Indicadores";

export const Carrusel = () => {
  const { t } = useTranslation();
  const { images, currentImage, prevImage, nextImage } = HooksCarrusel();
  
  const handleSearch = (searchData) => {
    console.log('Datos de búsqueda:', searchData);
  };

  return (
    <section className="relative w-full h-[50vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
      <img
        src={images[currentImage]}
        alt={`Slide ${currentImage + 1}`}
        className="w-full h-full object-cover transition-all duration-500 filter brightness-110"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '-5%', gap: '40px'}}>
        <h1 className="text-6xl text-white font-bold mb-0 drop-shadow-lg" style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {t('title')}
        </h1>
        <h2 className="text-3xl text-white mb-2 drop-shadow-lg" style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {t('slogan')}
        </h2>
        
        <div className="w-full flex justify-center">
          <SearchForm onSearch={handleSearch} />
        </div>
      </div>

      <BotonCarrusel direction="left" onClick={prevImage} />
      <BotonCarrusel direction="right" onClick={nextImage} />
      <Indicadores images={images} currentImage={currentImage} />
    </section>
  );
};
