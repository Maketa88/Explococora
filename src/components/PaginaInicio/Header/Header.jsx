import React from "react";
import { MenuIcon, XIcon } from "@heroicons/react/outline"; // Importamos los iconos
import { useAlternarMenu } from "../../../hooks/MenuHamburguesa";
import Colombia from "../../../assets/Images/Colombia.png";
import Estados from "../../../assets/Images/estados-unidos.png";
import { NavItem } from "./Lista";
import { Logo } from "./Logo";

export const Header = () => {
  const { menuAbierto, alternarMenu } = useAlternarMenu();

  return (
    <header className="bg-green-400 shadow-lg z-50">
      <nav className="container mx-auto px-1 py-8 flex justify-between items-center relative">
        {/* Logo */}
        <Logo />

        {/* Enlaces del Menú */}
        <ul
          className={`lg:flex lg:space-x-6 ${
            menuAbierto ? "block" : "hidden"
          } absolute lg:relative bg-green-400 lg:bg-transparent w-full lg:w-auto top-20 left-0 lg:top-0 lg:flex-row space-y-4 lg:space-y-0 text-center z-50`}
        >
          <NavItem tipo="enlace" contenido="Inicio" to="/" />
          <NavItem tipo="enlace" contenido="Historia" to="/Historia" />
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
          className="lg:hidden flex items-center justify-center p-3 rounded-full border-2 border-transparent hover:border-white focus:outline-none bg-black bg-opacity-50 text-white hover:bg-opacity-80 transition-all duration-300"
          onClick={alternarMenu}
        >
          {menuAbierto ? (
            <XIcon className="w-8 h-8 text-white border-2 border-transparent hover:border-gray-500 transition-all duration-300" />
          ) : (
            <MenuIcon className="w-8 h-8 text-white" />
          )}
        </button>
      </nav>
    </header>
  );
};
