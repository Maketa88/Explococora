import axios from "axios";
import { useEffect, useState } from "react";
import Avatar from "../../assets/Images/avatar.png";

const PerfilCliente = () => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Función para cargar los datos del cliente
  const cargarDatosCliente = async () => {
    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula || !token) {
      setError("No se encontraron credenciales necesarias.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:10101/cliente/${cedula}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const clienteData = response.data[0];
        // Recuperar la foto del localStorage si existe
        const storedFoto = localStorage.getItem("foto_perfil");
        if (storedFoto) {
          clienteData.foto_perfil = storedFoto;
        }
        setCliente(clienteData);
        localStorage.setItem("cliente", JSON.stringify(clienteData));
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosCliente();
  }, []);

  // Función mejorada para separar nombres y apellidos
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
      <div className="text-center text-gray-500 mt-10">Cargando perfil...</div>
    );
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  if (!cliente)
    return (
      <div className="text-center text-gray-500 mt-10">
        No se encontraron datos del cliente.
      </div>
    );

  const { nombres, apellidos } = separarNombreCompleto(
    cliente.nombre_del_cliente
  );

  const fotoUrl = cliente.foto_perfil
    ? `http://localhost:10101/images/${cliente.foto_perfil}`
    : Avatar;

  return (
    <>
      <div
        className="max-w-lg mx-auto mt-10 mb-20 p-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400
 rounded-xl shadow-lg "
      >
        <div className="bg-teal-700 -mx-6 -mt-6 p-6 rounded-t-xl text-white">
          <h1 className="text-2xl font-bold text-center flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#4ade80"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Datos del Cliente
          </h1>
        </div>

        <div className="flex justify-center mt-6 mb-8">
          <div className="relative">
            <div className="p-2 bg-white rounded-lg shadow-lg">
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                className="w-40 h-40 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity border-4 border-teal-100"
                onClick={abrirModal}
              />
              <div className="absolute -bottom-3 -right-3 bg-teal-500 text-white p-2 rounded-full shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
            <div className="mr-4 bg-green-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-teal-800 text-sm font-medium block">
                Cédula
              </span>
              <span className="font-medium text-gray-800">
                {cliente.cedula || "No disponible"}
              </span>
            </div>
            <div className="hidden sm:block text-green-500 opacity-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
            <div className="mr-4 bg-blue-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-teal-800 text-sm font-medium block">
                Nombres
              </span>
              <span className="font-medium text-gray-800">
                {nombres || "No disponible"}
              </span>
            </div>
            <div className="hidden sm:block text-blue-500 opacity-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
            <div className="mr-4 bg-purple-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-teal-800 text-sm font-medium block">
                Apellidos
              </span>
              <span className="font-medium text-gray-800">
                {apellidos || "No disponible"}
              </span>
            </div>
            <div className="hidden sm:block text-purple-500 opacity-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
            <div className="mr-4 bg-amber-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-teal-800 text-sm font-medium block">
                Email
              </span>
              <span className="font-medium text-gray-800">
                {cliente.email || "No disponible"}
              </span>
            </div>
            <div className="hidden sm:block text-amber-500 opacity-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-950">
          <div className="flex justify-center">
            <a
              href={`/VistaCliente/ActualizarPerfil`}
              className="px-6 py-3 bg-teal-700 text-white rounded-lg flex items-center hover:bg-teal-800 transition-colors shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </a>
          </div>
        </div>
      </div>

      {/* Modal para mostrar la imagen grande */}
      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={cerrarModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2">
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={cerrarModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              className="max-h-[85vh] rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PerfilCliente;
