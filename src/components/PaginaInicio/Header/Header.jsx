import React from "react";
import { useAlternarMenu } from "../../../hooks/MenuHamburguesa";
import Colombia from "../../../assets/Images/Colombia.png";
import Estados from "../../../assets/Images/estados-unidos.png";
import { NavItem } from "./Lista";
import { Logo } from "./Logo";

export const Header = () => {
  const { menuAbierto, alternarMenu } = useAlternarMenu();

  return (
    <header className="bg-green-400 shadow-lg">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Logo />

        {/* Enlaces del Menú */}
        <ul
          className={`lg:flex lg:space-x-6 ${
            menuAbierto ? "block" : "hidden"
          } absolute lg:relative bg-green-400 lg:bg-transparent w-full lg:w-auto top-14 left-0 lg:top-0 lg:flex-row space-y-4 lg:space-y-0 text-center`}
        >
          <NavItem tipo="enlace" contenido="Explococora" enlace="#home" />
          <NavItem tipo="enlace" contenido="Historia" enlace="#history" />
          <NavItem tipo="enlace" contenido="Nuestras Rutas" enlace="#routes" />
          <NavItem tipo="enlace" contenido="Contáctanos" enlace="#contact" />

          {/* Botones */}
          <NavItem
            tipo="boton"
            contenido="Ingresar"
            estilos="bg-blue-600 text-white hover:bg-blue-800 font-nunito"
          />
          <NavItem
            tipo="boton"
            contenido="Crear Cuenta"
            estilos="bg-blue-600 text-white hover:bg-blue-800 font-nunito"
          />

          {/* Banderas */}
          <NavItem tipo="imagen" imgSrc={Colombia} alt="Bandera de USA" />
          <NavItem tipo="imagen" imgSrc={Estados} alt="Bandera de Colombia" />
        </ul>

        {/* Menú Hamburguesa */}
        <button
          className="lg:hidden flex items-center text-black focus:outline-none"
          onClick={alternarMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuAbierto ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            )}
          </svg>
        </button>
      </nav>
    </header>
  );
};
