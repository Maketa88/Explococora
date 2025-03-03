
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCamera, FaEnvelope, FaIdCard, FaUser, FaUserEdit } from 'react-icons/fa';
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
        
        // La foto de perfil ya debería ser una URL completa de Azure Blob Storage
        if (clienteData.foto_perfil) {
          // Guardar en localStorage
          localStorage.setItem("foto_perfil", clienteData.foto_perfil);
        } else {
          // Recuperar la foto del localStorage si existe
          const storedFoto = localStorage.getItem("foto_perfil");
          if (storedFoto) {
            clienteData.foto_perfil = storedFoto;
          }
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
      <div className="min-h-screen bg-gradient-to-b from-teal-800/10 to-white flex items-center justify-center">
        <div className="text-teal-800 text-xl font-semibold flex items-center">
          <svg className="animate-spin h-8 w-8 mr-3 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando perfil...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-800/10 to-white flex items-center justify-center">
        <div className="text-red-600 text-xl font-semibold bg-red-50 p-4 rounded-xl shadow-lg border border-red-200">
          {error}
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

  const { nombres, apellidos } = separarNombreCompleto(cliente.nombre_del_cliente);
  // Usar directamente la URL de Azure Blob Storage
  const fotoUrl = cliente.foto_perfil || Avatar;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-teal-800/10 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="text-center">
            <div className="relative mx-auto">
              <div className="mx-auto h-32 w-32 relative">
                <img
                  src={fotoUrl}
                  alt="Foto de perfil"
                  className="h-32 w-32 rounded-full object-cover shadow-xl ring-4 ring-teal-500/30"
                  onClick={abrirModal}
                />
                <button 
                  onClick={abrirModal}
                  className="absolute bottom-0 right-0 bg-teal-800 text-white p-2.5 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 hover:bg-teal-700"
                >
                  <FaCamera className="h-5 w-5" />
                </button>
              </div>
            </div>
            <h2 className="mt-8 text-3xl font-extrabold text-gray-900 tracking-tight">
              Perfil del Cliente
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Información personal de tu cuenta
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaIdCard className="h-5 w-5 text-teal-800" />
              </div>
              <div className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                <label className="block text-xs font-medium text-teal-800 mb-1">
                  Cédula
                </label>
                <p className="text-gray-900 font-medium">
                  {cliente.cedula || "No disponible"}
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-teal-800" />
              </div>
              <div className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                <label className="block text-xs font-medium text-teal-800 mb-1">
                  Nombres
                </label>
                <p className="text-gray-900 font-medium">
                  {nombres || "No disponible"}
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-teal-800" />
              </div>
              <div className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                <label className="block text-xs font-medium text-teal-800 mb-1">
                  Apellidos
                </label>
                <p className="text-gray-900 font-medium">
                  {apellidos || "No disponible"}
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-teal-800" />
              </div>
              <div className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                <label className="block text-xs font-medium text-teal-800 mb-1">
                  Email
                </label>
                <p className="text-gray-900 font-medium">
                  {cliente.email || "No disponible"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <a
              href="/VistaCliente/ActualizarPerfil"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-teal-800 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center">
                <FaUserEdit className="mr-2" />
                Editar Perfil
              </span>
            </a>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={cerrarModal}>
          <div className="relative max-w-4xl max-h-[90vh] p-2">
            <button
              className="absolute -top-12 right-0 text-white bg-teal-800 rounded-full p-2 hover:bg-teal-700 transition-colors duration-300 shadow-lg"
              onClick={cerrarModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={fotoUrl}
              alt="Foto de perfil ampliada"
              className="max-h-[85vh] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PerfilCliente;
