import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes } from "react-icons/fa";
import Colombia from "../../../assets/Images/colombia.png";
import Usa from "../../../assets/Images/usa.png";
import { useAlternarMenu } from "../../../hooks/MenuHamburguesa";
import { NavItem } from "./Lista";
import { Logo } from "./Logo";



export const Header = () => {
  const { menuAbierto, alternarMenu } = useAlternarMenu();
  const { t, i18n } = useTranslation();
  const [monedaSeleccionada, setMonedaSeleccionada] = useState(() => {
    // Recuperar del localStorage o usar valor predeterminado
    return localStorage.getItem("moneda_seleccionada") || "COP";
  });
  const [monedaDropdownOpen, setMonedaDropdownOpen] = useState(false);
  const monedaDropdownRef = useRef(null);

  // Guardar en localStorage cuando cambie la moneda
  useEffect(() => {
    localStorage.setItem("moneda_seleccionada", monedaSeleccionada);
  }, [monedaSeleccionada]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        monedaDropdownRef.current &&
        !monedaDropdownRef.current.contains(event.target)
      ) {
        setMonedaDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(nuevoIdioma);
  };

  return (
    <header className="bg-teal-800 shadow-lg z-50 sticky top-0 bg-opacity-50 backdrop-blur-sm">
      <nav className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center relative">
        {/* Logo */}
        <a href="/" onClick={() => window.location.reload()} className="mx-2 flex-shrink-0">
          <Logo />
        </a>

        {/* Enlaces del Menú */}
        <ul
          className={`xl:flex xl:items-center xl:space-x-6 ${
            menuAbierto ? "flex" : "hidden"
          } absolute xl:static flex-col xl:flex-row w-full xl:w-auto top-full left-0 xl:top-auto bg-teal-800 xl:bg-transparent 
          space-y-4 xl:space-y-0 text-center z-50 py-6 xl:py-0 px-4 xl:px-0 shadow-lg xl:shadow-none`}
        >
          <div className="flex flex-col xl:flex-row xl:items-center xl:space-x-5 space-y-4 xl:space-y-0">
            <NavItem tipo="enlace" contenido={t("inicio")} to="/" />
            <NavItem tipo="enlace" contenido={t("historia")} to="/Historia" />
            <NavItem
              tipo="enlace"
              contenido={t("nuestrasRutas")}
              to="/NuestrasRutas"
            />
            <NavItem
              tipo="enlace"
              contenido={t("paquetesTuristicos")}
              to="/PaquetesTuristicos"
            />
            <NavItem
              tipo="enlace"
              contenido={t("nuestrosGuias")}
              to="/NuestrosGuias"
            />
            <NavItem
              tipo="enlace"
              contenido={t("contactanos")}
              to="/ContactForm"
            />
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center xl:ml-4 gap-4 xl:gap-3 mt-4 xl:mt-0">
            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 xl:gap-2 w-full sm:w-auto">
              <NavItem
                tipo="boton"
                contenido={t("ingresar")}
                estilos="bg-teal-700 text-white font-bold hover:bg-teal-800 font-nunito w-full sm:w-auto text-sm xl:text-base"
                to="/Ingreso"
              />
              <NavItem
                tipo="boton"
                contenido={t("crearCuenta")}
                estilos="bg-teal-700 text-white font-bold hover:bg-teal-800 font-nunito w-full sm:w-auto text-sm xl:text-base"
                to="/Registro"
              />
            </div>

            {/* Selector de Moneda y Banderas */}
            <div className="flex flex-row items-center justify-center space-x-3 xl:space-x-4 mt-3 xl:mt-0">
              {/* Selector de Moneda */}
              <div className="relative w-[70px]" ref={monedaDropdownRef}>
                <button
                  onClick={() => setMonedaDropdownOpen(!monedaDropdownOpen)}
                  className="w-full bg-teal-800 text-white px-3 py-1.5 rounded-md border border-teal-600 flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {monedaSeleccionada}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                {monedaDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 rounded-md shadow-lg bg-teal-800 border border-teal-600 overflow-hidden">
                    <div
                      className={`px-3 py-2 cursor-pointer ${
                        monedaSeleccionada === "COP"
                          ? "bg-teal-700"
                          : "hover:bg-teal-600"
                      } text-white text-sm transition-colors duration-150`}
                      onClick={() => {
                        setMonedaSeleccionada("COP");
                        setMonedaDropdownOpen(false);
                      }}
                    >
                      COP
                    </div>
                    <div
                      className={`px-3 py-2 cursor-pointer ${
                        monedaSeleccionada === "USD"
                          ? "bg-teal-700"
                          : "hover:bg-teal-600"
                      } text-white text-sm transition-colors duration-150`}
                      onClick={() => {
                        setMonedaSeleccionada("USD");
                        setMonedaDropdownOpen(false);
                      }}
                    >
                      USD
                    </div>
                  </div>
                )}
              </div>

              {/* Banderas */}
              <div className="flex items-center space-x-2">
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
              </div>
            </div>
          </div>
        </ul>

        {/* Menú Hamburguesa */}
        <button
          className="xl:hidden flex items-center justify-center p-2 rounded-full border-2 border-transparent hover:border-white focus:outline-none bg-black bg-opacity-50 text-white hover:bg-opacity-80 transition-all duration-300"
          onClick={alternarMenu}
          aria-label="Menú"
        >
          {menuAbierto ? (
            <FaTimes className="w-6 h-6 text-white" />
          ) : (
            <FaBars className="w-6 h-6 text-white" />
          )}
        </button>
      </nav>
    </header>
  );
};
