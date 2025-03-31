import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaCamera, FaUserEdit } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../assets/Images/avatar.png";

const PerfilCliente = () => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Función para cargar los datos del cliente
  const cargarDatosCliente = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener datos básicos del localStorage
      const cedula = localStorage.getItem("cedula");
      const token = localStorage.getItem("token");

      if (!cedula || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:10101/cliente/perfil-completo/${cedula}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Procesar datos recibidos del servidor
        if (response.data) {
          const clienteData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;

          // Formatear los datos del cliente para mostrar correctamente
          const clienteFormateado = {
            cedula: cedula,
            email: clienteData.email || localStorage.getItem("email"),
            // Construir nombre_del_cliente a partir de los componentes si están disponibles
            nombre_del_cliente:
              clienteData.nombre_completo ||
              `${clienteData.primerNombre || ""} ${
                clienteData.segundoNombre || ""
              } ${clienteData.primerApellido || ""} ${
                clienteData.segundoApellido || ""
              }`.trim(),
            // Extraer otros datos si están disponibles
            primerNombre: clienteData.primerNombre,
            segundoNombre: clienteData.segundoNombre,
            primerApellido: clienteData.primerApellido,
            segundoApellido: clienteData.segundoApellido,
            foto_perfil: clienteData.foto_perfil || clienteData.foto,
            // Agregar el número de celular
            numeroCelular:
              clienteData.numeroCelular ||
              (clienteData.telefono && typeof clienteData.telefono === "object"
                ? clienteData.telefono.numeroCelular
                : typeof clienteData.telefono === "string"
                ? clienteData.telefono
                : clienteData.telefonos && clienteData.telefonos.length > 0
                ? clienteData.telefonos[0].numeroCelular
                : ""),
          };

          setCliente(clienteFormateado);
          localStorage.setItem("cliente", JSON.stringify(clienteFormateado));

          // Procesar la foto de perfil
          if (clienteFormateado.foto_perfil) {
            procesarFotoPerfil(clienteFormateado);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del servidor:", error);
      }
    } catch (error) {
      console.error("Error general:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para procesar la foto de perfil
  const procesarFotoPerfil = (clienteData) => {
    if (clienteData.foto_perfil) {
      let fotoUrl = clienteData.foto_perfil;

      if (!fotoUrl.startsWith("http")) {
        if (fotoUrl.includes("/uploads/images/")) {
          fotoUrl = `http://localhost:10101${fotoUrl}`;
        } else {
          fotoUrl = `http://localhost:10101/uploads/images/${fotoUrl}`;
        }
      }

      localStorage.setItem("foto_perfil_cliente", fotoUrl);
    } else if (clienteData.foto) {
      let fotoUrl = clienteData.foto;

      if (!fotoUrl.startsWith("http")) {
        if (fotoUrl.includes("/uploads/images/")) {
          fotoUrl = `http://localhost:10101${fotoUrl}`;
        } else {
          fotoUrl = `http://localhost:10101/uploads/images/${fotoUrl}`;
        }
      }

      localStorage.setItem("foto_perfil_cliente", fotoUrl);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosCliente();
  }, [cargarDatosCliente]);

  const separarNombreCompleto = (nombreCompleto) => {
    if (!nombreCompleto) return { nombres: "", apellidos: "" };

    const partes = nombreCompleto.trim().split(/\s+/);

    if (partes.length === 4) {
      return {
        nombres: `${partes[0]} ${partes[1]}`,
        apellidos: `${partes[2]} ${partes[3]}`,
      };
    } else if (partes.length === 3) {
      return {
        nombres: partes[0],
        apellidos: `${partes[1]} ${partes[2]}`,
      };
    } else if (partes.length === 2) {
      return {
        nombres: partes[0],
        apellidos: partes[1],
      };
    } else {
      const mitad = Math.ceil(partes.length / 2);
      return {
        nombres: partes.slice(0, mitad).join(" "),
        apellidos: partes.slice(mitad).join(" "),
      };
    }
  };

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-800/10 to-white flex items-center justify-center">
        <div className="text-teal-800 text-xl font-semibold flex items-center">
          <svg
            className="animate-spin h-8 w-8 mr-3 text-teal-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando perfil...
        </div>
      </div>
    );

  if (!cliente)
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-800/10 to-white flex items-center justify-center">
        <div className="text-teal-800 text-xl font-semibold bg-teal-50 p-4 rounded-xl shadow-lg border border-teal-200">
          No se encontraron datos del cliente.
        </div>
      </div>
    );

  const { nombres, apellidos } = cliente.primerNombre
    ? {
        nombres: `${cliente.primerNombre || ""} ${
          cliente.segundoNombre || ""
        }`.trim(),
        apellidos: `${cliente.primerApellido || ""} ${
          cliente.segundoApellido || ""
        }`.trim(),
      }
    : separarNombreCompleto(cliente.nombre_del_cliente);

  // Usar la foto de la base de datos con prioridad sobre cualquier otra fuente
  const fotoUrl =
    cliente.foto_perfil ||
    localStorage.getItem("foto_perfil_cliente") ||
    Avatar;

  // Obtener iniciales para avatar
  const obtenerIniciales = () => {
    if (!nombres) return "C";
    return nombres.charAt(0).toUpperCase();
  };

  return (
    <>
      <section className="relative py-6 px-4 overflow-hidden">
        {/* Fondo decorativo inspirado en el Valle del Cocora */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

          {/* Siluetas de palmeras de cera */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg
              viewBox="0 0 1200 600"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <path
                d="M100,600 C100,400 150,300 200,100 C220,300 240,400 260,600"
                fill="none"
                stroke="#047857"
                strokeWidth="8"
              />
              <path
                d="M400,600 C400,350 450,250 500,50 C520,250 540,350 560,600"
                fill="none"
                stroke="#047857"
                strokeWidth="8"
              />
              <path
                d="M700,600 C700,400 750,300 800,100 C820,300 840,400 860,600"
                fill="none"
                stroke="#047857"
                strokeWidth="8"
              />
              <path
                d="M1000,600 C1000,350 1050,250 1100,50 C1120,250 1140,350 1160,600"
                fill="none"
                stroke="#047857"
                strokeWidth="8"
              />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="mt-6 bg-white rounded-xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
              {/* Columna izquierda - Información de perfil detallada */}
              <div className="w-full lg:w-1/3">
                {/* Tarjeta de perfil con efectos visuales */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6 transform hover:scale-[1.01] transition-all duration-300">
                  {/* Foto de perfil con efecto glowing */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative bg-white rounded-full overflow-hidden w-full h-full border-4 border-white">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt="Foto de perfil"
                            className="h-full w-full object-cover rounded-full"
                            onClick={abrirModal}
                            onError={(e) => {
                              console.error("Error al cargar la imagen:", e);
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                cliente.nombre_del_cliente || "Usuario"
                              )}&size=200&background=059669&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl sm:text-5xl font-bold rounded-full">
                            {obtenerIniciales()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Nombre y rol con espaciado mejorado */}
                    <div className="mt-3 sm:mt-4">
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        {nombres} {apellidos}
                      </h2>
                      <div className="flex items-center justify-center mt-1">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium">
                          Cliente
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Datos de contacto con iconos y mejores espaciados */}
                  <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-emerald-700 font-medium">Correo Electrónico</p>
                        <p className="text-gray-700 text-xs sm:text-sm truncate">{cliente.email || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Teléfono</p>
                        <p className="text-gray-700 text-xs sm:text-sm">{cliente.numeroCelular || "No disponible"}</p>
                      </div>
                    </div>
                    
                    {/* Cédula del cliente */}
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Cédula</p>
                        <p className="text-gray-700 text-xs sm:text-sm">{cliente.cedula || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones con diseño mejorado */}
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => navigate("/VistaCliente/ActualizarPerfil")}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-200/50 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Editar información
                    </button>
                    <button 
                      onClick={() => navigate("/VistaCliente/ActualizarContrasenia")}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-emerald-600 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-200/50 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                      Cambiar contraseña
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Columna derecha: Información detallada */}
              <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
                {/* Tarjeta de información personal */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                      Información Personal
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Nombre</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{nombres || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Apellidos</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{apellidos || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Cédula</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{cliente.cedula || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Teléfono</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{cliente.numeroCelular || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group sm:col-span-2">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Email</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{cliente.email || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tarjeta de estadísticas del cliente */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                      Estadísticas
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-xl shadow-md">
                      <h4 className="text-xs text-emerald-100 font-medium uppercase mb-1">Rutas realizadas</h4>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-xl shadow-md">
                      <h4 className="text-xs text-emerald-100 font-medium uppercase mb-1">Reservas completadas</h4>
                      <p className="text-2xl font-bold text-white">8</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-xl shadow-md">
                      <h4 className="text-xs text-emerald-100 font-medium uppercase mb-1">Valoraciones hechas</h4>
                      <p className="text-2xl font-bold text-white">7</p>
                    </div>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate("/VistaCliente/MisReservas")}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                    Mis Reservas
                  </button>
                  <button
                    onClick={() => navigate("/VistaCliente/NuestrasRutas")}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path></svg>
                    Explorar Rutas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal para ver la foto ampliada (manteniendo la funcionalidad existente) */}
      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm p-4"
          onClick={cerrarModal}
        >
          <div className="relative max-w-full sm:max-w-4xl max-h-[90vh] p-2">
            <button
              className="absolute -top-10 sm:-top-12 right-0 text-white bg-teal-800 rounded-full p-2 hover:bg-teal-700 transition-colors duration-300 shadow-lg"
              onClick={cerrarModal}
              aria-label="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={fotoUrl}
              alt="Foto de perfil ampliada"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error("Error al cargar la imagen en modal:", e);
                e.target.onerror = null;
                const storedFoto = localStorage.getItem("foto_perfil_cliente");
                if (storedFoto && storedFoto !== fotoUrl) {
                  e.target.src = storedFoto;
                } else {
                  e.target.src = Avatar;
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PerfilCliente;
