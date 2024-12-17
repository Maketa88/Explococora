// src/components/Seccion/Seccion.jsx
import React, { useState } from "react";
import { BotonNav } from "./BotonCarrusel";
import { Indicadores } from "./Indicadores";
import Cocora from "../../../assets/Images/carrusel1.webp";
import Cocora1 from "../../../assets/Images/carrusel2.webp";
import Cocora3 from "../../../assets/Images/carrusel3.webp";

export const Carrusel = () => {
  // Array de imágenes
  const images = [
    Cocora,
    Cocora1,
    Cocora3, // Puedes agregar diferentes imágenes aquí si es necesario
  ];

  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () => {
    setCurrentImage((prevImage) =>
      prevImage === 0 ? images.length - 1 : prevImage - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prevImage) =>
      prevImage === images.length - 1 ? 0 : prevImage + 1
    );
  };

  return (
    <div>
      <section className="relative w-full h-[50vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
        <img
          src={images[currentImage]}
          alt={`Slide ${currentImage + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
        />
        {/* Botón Izquierdo */}
        <BotonNav direction="left" onClick={prevImage} />
        {/* Botón Derecho */}
        <BotonNav direction="right" onClick={nextImage} />
        {/* Indicadores */}
        <Indicadores images={images} currentImage={currentImage} />
      </section>
    </div>
  );
};