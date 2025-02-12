import React, { useState } from 'react';
import carrusel1 from '../../../assets/Images/carrusel1.webp';
import carrusel2 from '../../../assets/Images/carrusel2.webp';
import carrusel3 from '../../../assets/Images/carrusel3.webp';
import historia1 from '../../../assets/Images/historia1.webp';
import historia3 from '../../../assets/Images/historia3.webp';
import historia4 from '../../../assets/Images/historia4.webp';
import historia5 from '../../../assets/Images/historia5.webp';

export const Carrusel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: carrusel1, alt: "Valle del Cocora 1" },
    { image: carrusel2, alt: "Valle del Cocora 2" },
    { image: carrusel3, alt: "Valle del Cocora 3" },
    { image: historia1, alt: "Historia del Valle 1" },
    { image: historia3, alt: "Historia del Valle 3" },
    { image: historia4, alt: "Historia del Valle 4" },
    { image: historia5, alt: "Historia del Valle 5" }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-screen">
      {/* Imágenes */}
      <div className="relative h-full overflow-hidden">
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide.image}
            alt={slide.alt}
            className={`absolute w-full h-full object-cover transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}; 