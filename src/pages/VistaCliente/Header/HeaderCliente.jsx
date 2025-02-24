import { useTranslation } from "react-i18next";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAlternarMenu } from "../../../hooks/MenuHamburguesa";
import Colombia from "../../../assets/Images/Colombia.png";
import Usa from "../../../assets/Images/Usa.png";
import Avatar from "../../../assets/Images/avatar.png";


import React from "react";
import { NavItem } from "../../../components/PaginaInicio/Header/Lista";
import { Logo } from "../../../components/PaginaInicio/Header/Logo";
import ProfileDropdown from "../Cliente";

export const HeaderCliente = () => {
  const { menuAbierto, alternarMenu } = useAlternarMenu();
  const { t, i18n } = useTranslation();

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(nuevoIdioma);
  };

  return (
    <header className="bg-teal-800 shadow-lg z-50">
      <nav className="container mx-auto px-4 py-8 flex justify-around items-center relative">
        {/* Logo */}
        <a href="/" onClick={() => window.location.reload()} className="mx-2">
          <Logo />
        </a>

        {/* Enlaces del Menú */}
        <ul
          className={`lg:flex lg:space-x-6 ${
            menuAbierto ? "block" : "hidden"
          } absolute lg:relative bg-teal-800 lg:bg-transparent w-full lg:w-auto top-24 left-0 lg:top-0 lg:flex-row space-y-4 lg:space-y-0 text-center z-50 items-center`}
        >
          <NavItem tipo="enlace" contenido={t("inicio")} to="/VistaCliente" />
          <NavItem
            tipo="enlace"
            contenido={t("historia")}
            to="/VistaCliente/Historia"
          />
          <NavItem
            tipo="enlace"
            contenido={t("nuestrasRutas")}
            enlace="#routes"
          />
          <NavItem
            tipo="enlace"
            contenido={t("nuestrosGuias")}
            to="/NuestrosGuias"
          />
          <NavItem
            tipo="enlace"
            contenido={t("contactanos")}
            to="/VistaCliente/Contacto"
          />

          {/* Botones */}

          {/* Banderas */}
          <div className="flex items-center space-x-4 ">
            <button
              onClick={cambiarIdioma}
              className={`transition-opacity ${
                i18n.language === "es" ? "opacity-100" : "opacity-50"
              }`}
            >
              <NavItem
                tipo="imagen"
                imgSrc={Colombia}
                alt="Bandera de Colombia"
              />
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={cambiarIdioma}
              className={`transition-opacity ${
                i18n.language === "en" ? "opacity-100" : "opacity-50"
              }`}
            >
              <NavItem tipo="imagen" imgSrc={Usa} alt="USA Flag" />
            </button>
            <div className="flex items-center">
              <ProfileDropdown
                imgSrc={Avatar}
                alt="Perfil de Usuario"
                cerrarSesion={() => {
                  // Aquí coloca tu función para cerrar sesión
                  console.log("Cerrando sesión...");
                }}
              />
            </div>
          </div>
        </ul>

        {/* Menú Hamburguesa */}
        <button
          className="lg:hidden flex items-center justify-center p-3 rounded-full border-2 border-transparent hover:border-white focus:outline-none bg-black bg-opacity-50 text-white hover:bg-opacity-80 transition-all duration-300"
          onClick={alternarMenu}
        >
          {menuAbierto ? (
            <FaTimes className="w-8 h-8 text-white border-2 border-transparent hover:border-gray-500 transition-all duration-300" />
          ) : (
            <FaBars className="w-8 h-8 text-white" />
          )}
        </button>
      </nav>
    </header>
  );
};
