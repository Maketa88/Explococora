import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    cargarDatosCliente();
  }, []);

  const cargarDatosCliente = () => {
    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula) {
      setError("No se encontró la cédula del cliente.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:10101/cliente/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos del cliente recibidos:", response.data);
        if (response.data && response.data.length > 0) {
          const clienteData = response.data[0];
          setCliente(clienteData);
          
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
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error completo:", error);
        console.error("Status:", error.response?.status);
        console.error("Respuesta del servidor:", error.response?.data);
        setError(`Error: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      });
  };

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

      console.log("Respuesta de actualización:", response.data);

      if (response.data) {
        // Si la respuesta contiene los datos actualizados, actualizar el estado
        setCliente({
          ...cliente,
          nombre_del_cliente: `${formData.primerNombre} ${formData.segundoNombre} ${formData.primerApellido} ${formData.segundoApellido}`,
          email: formData.email,
        });

        setMensaje("Datos actualizados correctamente");

        // Recargar los datos del cliente para mostrar la información actualizada
        cargarDatosCliente();
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
