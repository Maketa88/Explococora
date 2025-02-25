import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Avatar from "../../assets/Images/avatar.png";

const ActualizarDatosCliente = () => {
  const [cliente, setCliente] = useState({
    cedula: "",
    nombre_del_cliente: "",
    email: ""
  });
  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [foto, setFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const cargarDatosCliente = useCallback(async () => {
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

        // Separar el nombre completo
        const { primerNombre, segundoNombre, primerApellido, segundoApellido } = separarNombre(clienteData.nombre_del_cliente);
        
        // Establecer los datos en el formulario
        setFormData({
          primerNombre: primerNombre,
          segundoNombre: segundoNombre,
          primerApellido: primerApellido,
          segundoApellido: segundoApellido,
          email: clienteData.email || ""
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosCliente();
  }, [cargarDatosCliente]);

  const separarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return { primerNombre: "", segundoNombre: "", primerApellido: "", segundoApellido: "" };

    const partes = nombreCompleto.split(" ");
    
    const primerNombre = partes[0] || "";
    const segundoNombre = partes[1] || "";
    const primerApellido = partes[2] || "";
    const segundoApellido = partes[3] || "";

    return { primerNombre, segundoNombre, primerApellido, segundoApellido };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFoto(selectedFile);
      
      // Crear URL de vista previa
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmitFoto = async (e) => {
    e.preventDefault();
    if (!foto) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró el token de autenticación.");
      return;
    }

    setSubiendoFoto(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("foto", foto);

    try {
      const response = await axios.post(
        "http://localhost:10101/cliente/subir-foto",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.path) {
        const fotoPath = response.data.path;
        
        // Actualizar el estado del cliente
        const clienteActualizado = {
          ...cliente,
          foto_perfil: fotoPath
        };
        
        // Actualizar estado y localStorage
        setCliente(clienteActualizado);
        localStorage.setItem("cliente", JSON.stringify(clienteActualizado));
        localStorage.setItem("foto_perfil", fotoPath);
        
        setMensaje("Foto actualizada correctamente");
        setFoto(null);
        setPreviewUrl(null);
        
        // Forzar una recarga de los datos del cliente
        await cargarDatosCliente();
      }
    } catch (error) {
      console.error("Error al subir foto:", error);
      setError(`Error al subir foto: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setMensaje("");

    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula || !token) {
      setError("Faltan credenciales para actualizar");
      setUpdating(false);
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:10101/cliente/${cedula}`,
        {
          primerNombre: formData.primerNombre,
          segundoNombre: formData.segundoNombre,
          primerApellido: formData.primerApellido,
          segundoApellido: formData.segundoApellido,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const nombreCompleto = `${formData.primerNombre} ${formData.segundoNombre} ${formData.primerApellido} ${formData.segundoApellido}`;
        setCliente({
          ...cliente,
          nombre_del_cliente: nombreCompleto,
          email: formData.email,
        });

        setMensaje("Datos actualizados correctamente");
        await cargarDatosCliente();
      } else {
        setMensaje("Actualización exitosa, pero no se recibieron datos.");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError(`Error al actualizar: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Cargando datos...</div>;
  }

  if (error && !cliente.cedula) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 mb-20 p-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 rounded-xl shadow-lg">
      <div className="bg-teal-800 -mx-6 -mt-6 p-6 rounded-t-xl text-white">
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Actualizar Perfil
        </h1>
      </div>
      
      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg shadow-sm">{error}</div>}
      {mensaje && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg shadow-sm">{mensaje}</div>}

      {/* Sección de foto de perfil */}
      <div className="flex justify-center mt-6 mb-8">
        <div className="relative">
          <div className="p-2 bg-white rounded-lg shadow-lg">
            <img 
              key={cliente.foto_perfil}
              src={previewUrl || (cliente.foto_perfil ? `http://localhost:10101/images/${cliente.foto_perfil}` : Avatar)}
              alt="Foto de perfil" 
              className="w-40 h-40 rounded-lg object-cover border-4 border-teal-100"
            />
            <label htmlFor="upload-photo" className="absolute -bottom-3 -right-3 bg-teal-500 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-teal-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </label>
            <input 
              type="file" 
              id="upload-photo" 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>
      </div>
      
      {foto && (
        <div className="flex justify-center mb-6">
          <button 
            onClick={handleSubmitFoto}
            className="px-6 py-2 bg-teal-700 text-white rounded-lg flex items-center hover:bg-teal-800 transition-colors shadow-md"
            disabled={subiendoFoto}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {subiendoFoto ? 'Subiendo...' : 'Guardar foto'}
          </button>
        </div>
      )}
      
      {/* Formulario de datos personales */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <span className="text-teal-800 text-sm font-medium block">Cédula</span>
            <input 
              type="text" 
              value={cliente.cedula || ""} 
              disabled 
              className="font-medium text-gray-800 w-full bg-transparent border-none p-0 focus:ring-0"
            />
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
            <span className="text-teal-800 text-sm font-medium block">Primer Nombre</span>
            <input 
              type="text" 
              name="primerNombre" 
              value={formData.primerNombre} 
              onChange={handleInputChange} 
              className="font-medium text-gray-800 w-full bg-transparent border-none p-0 focus:ring-0"
              required
            />
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
            <span className="text-teal-800 text-sm font-medium block">Segundo Nombre</span>
            <input 
              type="text" 
              name="segundoNombre" 
              value={formData.segundoNombre} 
              onChange={handleInputChange} 
              className="font-medium text-gray-800 w-full bg-transparent border-none p-0 focus:ring-0"
            />
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
            <span className="text-teal-800 text-sm font-medium block">Primer Apellido</span>
            <input 
              type="text" 
              name="primerApellido" 
              value={formData.primerApellido} 
              onChange={handleInputChange} 
              className="font-medium text-gray-800 w-full bg-transparent border-none p-0 focus:ring-0"
              required
            />
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
            <span className="text-teal-800 text-sm font-medium block">Segundo Apellido</span>
            <input 
              type="text" 
              name="segundoApellido" 
              value={formData.segundoApellido} 
              onChange={handleInputChange} 
              className="font-medium text-gray-800 w-full bg-transparent border-none p-0 focus:ring-0"
            />
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
            <span className="text-teal-800 text-sm font-medium block">Email</span>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              className="font-medium text-gray-800 w-full bg-transparent border-none p-0 focus:ring-0"
              required
            />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-950">
          <div className="flex justify-center">
            <button 
              type="submit" 
              className="px-6 py-3 bg-teal-700 text-white rounded-lg flex items-center hover:bg-teal-800 transition-colors shadow-md"
              disabled={updating}
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {updating ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ActualizarDatosCliente;