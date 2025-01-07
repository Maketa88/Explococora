import React from "react";
import error from "../../../../assets/Images/paisaje.svg";

export const PaginaNoEncontrada = () => {
  return (
    <div className="flex justify-center items-center min-h-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100">
      <div className=" max-w-3xl">
        <img
          src={error} // Reemplaza con tu imagen
          alt="Página no encontrada"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

