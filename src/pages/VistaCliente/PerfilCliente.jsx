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
      const response = await axios.get(`http://localhost:10101/cliente/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        apellidos: `${partes[2]} ${partes[3]}`
      };
    } 
    else if (partes.length === 3) {
      return {
        nombres: partes[0],
        apellidos: `${partes[1]} ${partes[2]}`
      };
    }
    else if (partes.length === 2) {
      return {
        nombres: partes[0],
        apellidos: partes[1]
      };
    }
    else {
      const mitad = Math.ceil(partes.length / 2);
      return {
        nombres: partes.slice(0, mitad).join(" "),
        apellidos: partes.slice(mitad).join(" ")
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
    return <div className="text-center text-gray-500 mt-10">No se encontraron datos del cliente.</div>;

  const { nombres, apellidos } = separarNombreCompleto(cliente.nombre_del_cliente);
  
  const fotoUrl = cliente.foto_perfil 
    ? `http://localhost:10101/images/${cliente.foto_perfil}` 
    : Avatar;

  return (
    <>
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <img 
              src={fotoUrl} 
              alt="Foto de perfil" 
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={abrirModal}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Datos del Cliente</h1>
        
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Cédula</span>
            <span className="font-medium">{cliente.cedula || "No disponible"}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Nombres</span>
            <span className="font-medium">{nombres || "No disponible"}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Apellidos</span>
            <span className="font-medium">{apellidos || "No disponible"}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Email</span>
            <span className="font-medium">{cliente.email || "No disponible"}</span>
          </div>
        </div>
      </div>

      {/* Modal para mostrar la imagen grande */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cerrarModal}>
          <div className="relative max-w-4xl max-h-[90vh] p-2">
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={cerrarModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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