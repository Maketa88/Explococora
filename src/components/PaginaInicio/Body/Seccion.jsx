import React from "react";
import { BotonNav } from "./BotonCarrusel";
import { Indicadores } from "./Indicadores";
import { HooksCarrusel } from "../../../hooks/HookCarrusel";


export const Carrusel = () => {
  const { images, currentImage, prevImage, nextImage } =HooksCarrusel ();

  return (
    <section className="relative w-full h-[50vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
      <img
        src={images[currentImage]}
        alt={`Slide ${currentImage + 1}`}
        className="w-full h-full object-cover transition-all duration-500"
      />
      <BotonNav direction="left" onClick={prevImage} />
      <BotonNav direction="right" onClick={nextImage} />
      <Indicadores images={images} currentImage={currentImage} />
    </section>
  );
};
