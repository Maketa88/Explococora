import React from "react";
import error from "../../../../assets/Images/paisaje.svg";

export const PaginaNoEncontrada = () => {
  return (
    <div className="flex justify-center items-center min-h-full ">
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

