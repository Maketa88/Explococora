import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({ imgSrc, alt, cerrarSesion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Manejar clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (path) => {
    if (path) {
      navigate(path);
    } else {
      cerrarSesion();
    }
    setIsOpen(false);
  };

  const menuOptions = [
    { label: "Ver perfil", path: "/VistaCliente/PerfilCliente" },
    { label: "Actualizar perfil", path: "/VistaCliente/ActualizarPerfil" },
    { label: "Cambiar contraseña", path: "/VistaCliente/CambiarContrasena" },
    { label: "Eliminar cuenta", path: "/VistaCliente/EliminarCuenta" },
    { label: "Cerrar sesión", path: null },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
    <div
      className="flex items-center cursor-pointer"
      onClick={toggleMenu}
      role="button"
      aria-expanded={isOpen}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleMenu(e);
        }
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        className="h-11 w-11 rounded-full object-cover border-2 border-white transform transition hover:scale-110 active:scale-95"
      />
  
      {isOpen && (
        <div className="absolute left-0 md:right-0 md:left-auto top-12 w-56 max-w-[calc(100vw-20px)] bg-teal-700 border-2 border-gray-900 rounded-xl shadow-xl py-2 z-50 transform transition-all duration-300 ease-in-out">



          {menuOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option.path)}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleOptionClick(option.path);
                }
              }}
              className={`group px-4 py-3 text-white ${
                index === menuOptions.length - 1
                  ? "mt-1 text-red-400 hover:text-white hover:bg-red-600 active:bg-red-700 font-bold"
                  : "hover:bg-teal-600 active:bg-teal-500"
              } flex items-center cursor-pointer transition-all duration-200 text-sm md:text-base relative overflow-hidden`}
            >
              <span className="relative z-10">{option.label}</span>
              <span 
                className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                  index === menuOptions.length - 1
                    ? "bg-red-400"
                    : "bg-teal-400"
                } group-hover:w-full transition-all duration-300 ease-out`}
              ></span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
};

export default ProfileDropdown;
