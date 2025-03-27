import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaCamera, FaUserEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import Avatar from "../../assets/Images/avatar.png";

const PerfilCliente = () => {
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

  return (
    <>
      <section className="relative py-16 px-4 overflow-hidden">
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

        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
          <div className="bg-teal-800/70 rounded-xl shadow-xl p-4 sm:p-5 md:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 ml-2 sm:ml-4">
              Perfil del Cliente
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Columna izquierda - Foto */}
              <div className="w-full md:w-1/4 flex flex-col items-center mb-6 md:mb-0">
                <div className="relative mb-3">
                  <img
                    src={fotoUrl}
                    alt="Foto de perfil"
                    className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full object-cover shadow-xl ring-4 ring-teal-500/30"
                    onClick={abrirModal}
                    onError={(e) => {
                      console.error("Error al cargar la imagen:", e);
                      e.target.onerror = null;
                      const storedFoto = localStorage.getItem(
                        "foto_perfil_cliente"
                      );
                      if (storedFoto && storedFoto !== fotoUrl) {
                        e.target.src = storedFoto;
                      } else {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          cliente.nombre_del_cliente || "Usuario"
                        )}&size=200&background=0D8ABC&color=fff`;
                      }
                    }}
                  />
                </div>

                <button
                  onClick={abrirModal}
                  className="mt-2 bg-teal-600 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 hover:bg-teal-500"
                  aria-label="Cambiar foto de perfil"
                >
                  <FaCamera className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Columna derecha - Información */}
              <div className="w-full md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-teal-700 p-3 sm:p-4 rounded-lg shadow-md">
                    <h3 className="text-xs sm:text-sm uppercase mb-1 text-teal-300">
                      NOMBRES
                    </h3>
                    <p className="text-base sm:text-lg text-white font-medium truncate">
                      {nombres || "No disponible"}
                    </p>
                  </div>

                  <div className="bg-teal-700 p-3 sm:p-4 rounded-lg shadow-md">
                    <h3 className="text-xs sm:text-sm uppercase mb-1 text-teal-300">
                      APELLIDOS
                    </h3>
                    <p className="text-base sm:text-lg text-white font-medium truncate">
                      {apellidos || "No disponible"}
                    </p>
                  </div>

                  <div className="bg-teal-700 p-3 sm:p-4 rounded-lg shadow-md">
                    <h3 className="text-xs sm:text-sm uppercase mb-1 text-teal-300">
                      EMAIL
                    </h3>
                    <p className="text-base sm:text-lg text-white font-medium truncate">
                      {cliente.email || "No disponible"}
                    </p>
                  </div>

                  <div className="bg-teal-700 p-3 sm:p-4 rounded-lg shadow-md">
                    <h3 className="text-xs sm:text-sm uppercase mb-1 text-teal-300">
                      CELULAR
                    </h3>
                    <p className="text-base sm:text-lg text-white font-medium truncate">
                      {cliente.numeroCelular || "No disponible"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center sm:justify-end mt-6">
                  <Link
                    to="/VistaCliente/ActualizarPerfil"
                    className="py-2 px-4 sm:px-6 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors duration-200 shadow-lg flex items-center"
                  >
                    <FaUserEdit className="mr-2" />
                    Editar Perfil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
