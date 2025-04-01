import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ProfileDropdown = ({ imgSrc, alt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(imgSrc);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Cargar la imagen de perfil del localStorage
  useEffect(() => {
    const fotoPerfil = localStorage.getItem("foto_perfil_cliente");
    if (fotoPerfil) {
      setProfileImage(fotoPerfil);
    }

    // Función para escuchar cambios en localStorage
    const handleStorageChange = () => {
      const nuevaFotoPerfil = localStorage.getItem("foto_perfil_cliente");
      if (nuevaFotoPerfil && nuevaFotoPerfil !== profileImage) {
        setProfileImage(nuevaFotoPerfil);
      }
    };

    // Función para escuchar el evento personalizado de actualización de foto
    const handleFotoPerfilActualizada = (event) => {
      if (event.detail && event.detail.fotoUrl) {
        setProfileImage(event.detail.fotoUrl);
      } else {
        // Si no hay URL en el evento, intentar obtenerla del localStorage
        const nuevaFotoPerfil = localStorage.getItem("foto_perfil_cliente");
        if (nuevaFotoPerfil) {
          setProfileImage(nuevaFotoPerfil);
        }
      }
    };

    // Agregar event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fotoPerfilClienteActualizada', handleFotoPerfilActualizada);

    // Limpiar event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fotoPerfilClienteActualizada', handleFotoPerfilActualizada);
    };
  }, [profileImage]);

  const cerrarSesion = () => {
    Swal.fire({
      html: `
        <div style="
          display: flex; 
          flex-direction: column; 
          align-items: center;
          border: 4px solid #004d40;
          border-radius: 12px;
          padding: clamp(10px, 3vw, 20px);
          background-color: #ffffff;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          margin: auto;
        ">
          <div style="
            display: flex; 
            flex-direction: column; 
            align-items: center;
            border-radius: 8px;
            padding: clamp(5px, 2vw, 10px);
            width: 100%;
          ">
            <img src="https://i.pinimg.com/originals/bf/fc/c2/bffcc2de14a013a2e7a795668846cae5.gif" 
                alt="Caballo corriendo" 
                style="
                  width: clamp(100px, 30vw, 150px);
                  margin-bottom: clamp(5px, 2vw, 10px);
                  border-radius: 8px;
                ">
            <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                alt="Logo ExploCocora" 
                style="
                  width: clamp(80px, 25vw, 120px);
                  border-radius: 8px;
                ">
          </div>
          <h2 style="
            font-size: clamp(20px, 5vw, 28px);
            font-weight: bold; 
            font-family: Arial, Helvetica, sans-serif; 
            color: #004d40; 
            margin-top: clamp(10px, 3vw, 15px);
            text-align: center;
            white-space: normal;
            width: 100%;
            padding: 0 10px;
          ">
            ¿Deseas cerrar sesión?
          </h2>
          <p style="
            font-size: clamp(14px, 4vw, 18px);
            font-family: Arial, Helvetica, sans-serif; 
            color: #004d40; 
            text-align: center; 
            margin-top: clamp(5px, 2vw, 10px);
            padding: 0 10px;
            width: 100%;
          ">
            Gracias por visitarnos, ¡te esperamos pronto!
          </p>
          <div style="
            display: flex;
            gap: clamp(8px, 2vw, 10px);
            margin-top: clamp(10px, 3vw, 15px);
            flex-wrap: wrap;
            justify-content: center;
          ">
            <button id="confirmarCierre" style="
              padding: clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px);
              background-color: #38a169;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: clamp(14px, 3vw, 16px);
              font-weight: bold;
              cursor: pointer;
              transition: background-color 0.3s ease;
              min-width: 100px;
            ">
              Confirmar
            </button>
            <button id="cancelarCierre" style="
              padding: clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px);
              background-color: #e53e3e;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: clamp(14px, 3vw, 16px);
              font-weight: bold;
              cursor: pointer;
              transition: background-color 0.3s ease;
              min-width: 100px;
            ">
              Cancelar
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        popup: 'swal2-popup-custom',
        container: 'swal2-container-custom'
      },
      didOpen: () => {
        document.getElementById("confirmarCierre").addEventListener("click", () => {
          // Guardar la foto del perfil antes de limpiar el localStorage
          const fotoPerfil = localStorage.getItem('foto_perfil');
          
          // Eliminar datos de autenticación del localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('cedula');
          localStorage.removeItem('cliente');
          
          // Restaurar la foto del perfil
          if (fotoPerfil) {
            localStorage.setItem('foto_perfil', fotoPerfil);
          }
          
          // Redirigir al usuario a la página de inicio
          navigate('/Ingreso');
          
          // Recargar la página para limpiar el estado
          window.location.reload();
        });

        document.getElementById("cancelarCierre").addEventListener("click", () => {
          Swal.close();
        });
      }
    });
  };

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
        src={profileImage}
        alt={alt}
        className="h-11 w-11 rounded-full object-cover transform transition hover:scale-110 active:scale-95"
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

ProfileDropdown.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export default ProfileDropdown;
