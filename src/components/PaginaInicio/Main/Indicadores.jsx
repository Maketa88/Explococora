// src/components/Seccion/Indicadores.jsx
import React from "react";

export const Indicadores = ({ images, currentImage }) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      {images.map((_, index) => (
        <span
          key={index}
          className={`block w-3 h-3 rounded-full ${
            index === currentImage ? "bg-green-400" : "bg-white bg-opacity-50"
          }`}
        ></span>
      ))}
    </div>
  );
};
