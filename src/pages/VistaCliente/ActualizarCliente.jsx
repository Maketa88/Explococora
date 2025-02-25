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
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Actualizar Perfil</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {mensaje && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{mensaje}</div>}

      {/* Sección de foto de perfil */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <img 
            key={cliente.foto_perfil}
            src={previewUrl || (cliente.foto_perfil ? `http://localhost:10101/images/${cliente.foto_perfil}` : Avatar)}
            alt="Foto de perfil" 
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
          />
          <label htmlFor="upload-photo" className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
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
        {foto && (
          <button 
            onClick={handleSubmitFoto}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={subiendoFoto}
          >
            {subiendoFoto ? 'Subiendo...' : 'Guardar foto'}
          </button>
        )}
      </div>
      
      {/* Formulario de datos personales */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Cédula</label>
          <input 
            type="text" 
            value={cliente.cedula || ""} 
            disabled 
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Primer Nombre</label>
          <input 
            type="text" 
            name="primerNombre" 
            value={formData.primerNombre} 
            onChange={handleInputChange} 
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Segundo Nombre</label>
          <input 
            type="text" 
            name="segundoNombre" 
            value={formData.segundoNombre} 
            onChange={handleInputChange} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Primer Apellido</label>
          <input 
            type="text" 
            name="primerApellido" 
            value={formData.primerApellido} 
            onChange={handleInputChange} 
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Segundo Apellido</label>
          <input 
            type="text" 
            name="segundoApellido" 
            value={formData.segundoApellido} 
            onChange={handleInputChange} 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          disabled={updating}
        >
          {updating ? "Actualizando..." : "Actualizar Perfil"}
        </button>
      </form>
    </div>
  );
};

export default ActualizarDatosCliente;