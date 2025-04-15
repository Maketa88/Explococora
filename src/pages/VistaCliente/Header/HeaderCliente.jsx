import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import Colombia from "../../../assets/Images/Colombia.png";
import Usa from "../../../assets/Images/Usa.png";
import Avatar from "../../../assets/Images/avatar.png";
import { NavItem } from "../../../components/PaginaInicio/Header/Lista";
import { Logo } from "../../../components/PaginaInicio/Header/Logo";
import { useAlternarMenu } from "../../../hooks/MenuHamburguesa";
import ProfileDropdown from "../Cliente";

export const HeaderCliente = () => {
  const { menuAbierto, alternarMenu } = useAlternarMenu();
  const { t, i18n } = useTranslation();
  const [fotoPerfil, setFotoPerfil] = useState(null); // Inicialmente null para evitar mostrar cualquier foto
  const [cargandoFoto, setCargandoFoto] = useState(true);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState("COP"); // Estado para moneda seleccionada

  useEffect(() => {
    // PRIORIDAD: Obtener la foto actualizada del servidor primero
    const obtenerFotoActualizada = async () => {
      try {
        setCargandoFoto(true);
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        if (!cedula || !token) {
          // Si no hay credenciales, usar la foto de localStorage o Avatar como fallback
          const fotoGuardada = localStorage.getItem("foto_perfil_cliente");
          setFotoPerfil(fotoGuardada || Avatar);
          setCargandoFoto(false);
          return;
        }
        
        const response = await axios.get(
          `http://localhost:10101/cliente/perfil-completo/${cedula}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const clienteData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        // Procesar la foto recibida del servidor
        if (clienteData.foto_perfil || clienteData.foto) {
          let fotoUrl = clienteData.foto_perfil || clienteData.foto;
          
          if (!fotoUrl.startsWith("http")) {
            if (fotoUrl.includes("/uploads/images/")) {
              fotoUrl = `http://localhost:10101${fotoUrl}`;
            } else {
              fotoUrl = `http://localhost:10101/uploads/images/${fotoUrl}`;
            }
          }
          
          console.log("HeaderCliente: Foto obtenida del servidor:", fotoUrl);
          
          // Actualizar estado y localStorage
          setFotoPerfil(fotoUrl);
          localStorage.setItem("foto_perfil_cliente", fotoUrl);
        } else {
          // Si el servidor no devuelve foto, usar la del localStorage o la imagen por defecto
          const fotoGuardada = localStorage.getItem("foto_perfil_cliente");
          setFotoPerfil(fotoGuardada || Avatar);
        }
      } catch (error) {
        console.error("Error al obtener foto actualizada:", error);
        // En caso de error, usar la foto del localStorage o la imagen por defecto
        const fotoGuardada = localStorage.getItem("foto_perfil_cliente");
        setFotoPerfil(fotoGuardada || Avatar);
      } finally {
        setCargandoFoto(false);
      }
    };
    
    // Ejecutar al montar el componente - prioridad alta
    obtenerFotoActualizada();

    // Escuchar el evento de actualización de foto
    const manejarActualizacionFoto = (event) => {
      const nuevaFoto = event.detail.fotoUrl;
      console.log("HeaderCliente: Foto actualizada recibida:", nuevaFoto);
      setFotoPerfil(nuevaFoto);
    };

    // Registrar el evento
    window.addEventListener("fotoPerfilClienteActualizada", manejarActualizacionFoto);

    // Limpiar el evento al desmontar
    return () => {
      window.removeEventListener("fotoPerfilClienteActualizada", manejarActualizacionFoto);
    };
  }, []);

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(nuevoIdioma);
  };

  return (
    <header className="bg-teal-800 shadow-lg z-50 sticky top-0 bg-opacity-50 backdrop-blur-sm transition-all duration-300">
      <nav className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-4 md:py-6 lg:py-8 flex justify-between items-center relative transition-all duration-300">
        {/* Logo - Smaller on mobile */}
        <Link to="/VistaCliente" className="mx-1 sm:mx-2 scale-75 sm:scale-90 md:scale-100 origin-left transition-transform duration-300">
          <Logo />
        </Link>

        {/* Enlaces del Menú */}
        <ul
          className={`lg:flex lg:space-x-2 xl:space-x-6 ${
            menuAbierto ? "block" : "hidden"
          } absolute lg:relative bg-teal-800 lg:bg-transparent w-full lg:w-auto top-16 sm:top-20 md:top-24 left-0 lg:top-0 lg:flex-row space-y-4 lg:space-y-0 text-center z-50 items-center py-4 lg:py-0 px-4 lg:px-0 transition-all duration-300`}
        >
          <NavItem tipo="enlace" contenido={t("inicio")} to="/VistaCliente" className="text-sm sm:text-base" />
          <NavItem
            tipo="enlace"
            contenido={t("historia")}
            to="/VistaCliente/Historia"
            className="text-sm sm:text-base"
          />
          <NavItem
            tipo="enlace"
            contenido={t("Rutas")}
            to="/VistaCliente/NuestrasRutas"
            className="text-sm sm:text-base"
          />
          <NavItem
            tipo="enlace"
            contenido={t("paquetesTuristicos")}
            to="/VistaCliente/PaquetesTuristicos"
            className="text-sm sm:text-base"
          />
          <NavItem
            tipo="enlace"
            contenido={t("nuestrosGuias")}
            to="/VistaCliente/NuestrosGuias"
            className="text-sm sm:text-base"
          />
          <NavItem
            tipo="enlace"
            contenido={t("contactanos")}
            to="/VistaCliente/Contacto"
            className="text-sm sm:text-base"
          />

          {/* Banderas y Perfil - Responsive */}
          <div className="flex flex-col lg:flex-row items-center space-y-3 lg:space-y-0 lg:space-x-3 xl:space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={cambiarIdioma}
                className={`transition-opacity ${
                  i18n.language === "es" ? "opacity-100" : "opacity-50"
                } scale-90 sm:scale-100`}
              >
                <NavItem
                  tipo="imagen"
                  imgSrc={Colombia}
                  alt="Bandera de Colombia"
                  className="w-8 h-8 sm:w-auto sm:h-auto"
                />
              </button>
              <span className="text-gray-500">|</span>
              <button
                onClick={cambiarIdioma}
                className={`transition-opacity ${
                  i18n.language === "en" ? "opacity-100" : "opacity-50"
                } scale-90 sm:scale-100`}
              >
                <NavItem tipo="imagen" imgSrc={Usa} alt="USA Flag" className="w-8 h-8 sm:w-auto sm:h-auto" />
              </button>
            </div>

            {/* Selector de Moneda */}
            <div className="flex items-center">
              <select
                value={monedaSeleccionada}
                onChange={(e) => setMonedaSeleccionada(e.target.value)}
                className="bg-teal-800 bg-opacity-70 text-white text-sm rounded-md border border-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-none px-2 py-1 cursor-pointer transition-all duration-300 hover:bg-teal-600"
              >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="flex items-center">
              {cargandoFoto ? (
                <div className="h-11 w-11 rounded-full bg-teal-700 animate-pulse flex items-center justify-center">
                  <div className="h-9 w-9 rounded-full bg-teal-600"></div>
                </div>
              ) : (
                <ProfileDropdown
                  imgSrc={fotoPerfil || Avatar}
                  alt="Perfil de Usuario"
                  className="scale-90 sm:scale-100"
                />
              )}
            </div>
          </div>
        </ul>

        {/* Menú Hamburguesa - Smaller on mobile */}
        <button
          className="lg:hidden flex items-center justify-center p-2 sm:p-3 rounded-full border-2 border-transparent hover:border-white focus:outline-none bg-black bg-opacity-50 text-white hover:bg-opacity-80 transition-all duration-300"
          onClick={alternarMenu}
        >
          {menuAbierto ? (
            <FaTimes className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white border-2 border-transparent hover:border-gray-500 transition-all duration-300" />
          ) : (
            <FaBars className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          )}
        </button>
      </nav>
    </header>
  );
};
