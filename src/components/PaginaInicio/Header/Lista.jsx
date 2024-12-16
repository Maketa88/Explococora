import React from "react";

// Props: tipo (enlace, boton, imagen), contenido, enlace, onClick, estilos, imgSrc, alt
export const NavItem = ({
  tipo,
  contenido,
  enlace,
  onClick,
  estilos,
  imgSrc,
  alt,
}) => {
  if (tipo === "enlace") {
    return (
      <li>
        <a
          href={enlace}
          className={`text-gray-950 font-bold hover:underline hover:text-black text-lg font-nunito  ${estilos}`}
        >
          {contenido}
        </a>
      </li>
    );
  }

  if (tipo === "boton") {
    return (
      <li>
        <button onClick={onClick} className={`px-4 py-1 rounded ${estilos}`}>
          {contenido}
        </button>
      </li>
    );
  }

  if (tipo === "imagen") {
    return (
      <li className="flex justify-center gap-2">
        <img
          src={imgSrc}
          alt={alt}
          className={`h-8 w-8 rounded-md ${estilos}`}
        />
      </li>
    );
  }

  return null;
};
