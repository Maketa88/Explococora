import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCamera, FaEnvelope, FaIdCard, FaSave, FaUser } from 'react-icons/fa';
import Swal from "sweetalert2";
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
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [fotoError, setFotoError] = useState(null);
  const fileInputRef = useRef(null);

  const cargarDatosCliente = useCallback(async () => {
    setLoading(true);
    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula || !token) {
      setError("No se encontraron credenciales necesarias.");
      setLoading(false);
      return;
    }

    try {
      // Hacemos la petición al endpoint correcto de clientes
      const response = await axios.get(
        `http://localhost:10101/cliente/perfil-completo/${cedula}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Datos del cliente recibidos:", response.data);
      
      // Procesamos los datos según el formato de respuesta (array u objeto)
      const clienteData = Array.isArray(response.data) ? response.data[0] : response.data;
      
      // Guardar los datos básicos del cliente
      setCliente({
        cedula: clienteData.cedula || cedula,
        nombre_del_cliente: clienteData.nombre_completo || 
          `${clienteData.primerNombre || ""} ${clienteData.segundoNombre || ""} ${clienteData.primerApellido || ""} ${clienteData.segundoApellido || ""}`.trim(),
        email: clienteData.email || ""
      });
      
      // Establecer los datos del formulario
      setFormData({
        primerNombre: clienteData.primerNombre || "",
        segundoNombre: clienteData.segundoNombre || "",
        primerApellido: clienteData.primerApellido || "",
        segundoApellido: clienteData.segundoApellido || "",
        email: clienteData.email || ""
      });
      
      // Procesar la foto de perfil
      if (clienteData.foto_perfil) {
        console.log("Foto perfil encontrada:", clienteData.foto_perfil);
        
        // Si la foto comienza con http, es una URL completa
        if (clienteData.foto_perfil.startsWith('http')) {
          setPreviewFoto(clienteData.foto_perfil);
          localStorage.setItem("foto_perfil_cliente", clienteData.foto_perfil);
        } 
        // Si la foto no comienza con http, construir la URL completa
        else {
          // Verificar si la ruta ya incluye /uploads/images
          let fotoUrl;
          if (clienteData.foto_perfil.includes('/uploads/images/')) {
            fotoUrl = `http://localhost:10101${clienteData.foto_perfil}`;
          } else {
            fotoUrl = `http://localhost:10101/uploads/images/${clienteData.foto_perfil}`;
          }
          
          console.log("URL de foto construida:", fotoUrl);
          setPreviewFoto(fotoUrl);
          localStorage.setItem("foto_perfil_cliente", fotoUrl);
        }
      } 
      // Verificar si hay foto en otros campos posibles
      else if (clienteData.foto) {
        console.log("Foto encontrada en campo 'foto':", clienteData.foto);
        
        let fotoUrl;
        if (clienteData.foto.startsWith('http')) {
          fotoUrl = clienteData.foto;
        } else if (clienteData.foto.includes('/uploads/images/')) {
          fotoUrl = `http://localhost:10101${clienteData.foto}`;
        } else {
          fotoUrl = `http://localhost:10101/uploads/images/${clienteData.foto}`;
        }
        
        console.log("URL de foto construida:", fotoUrl);
        setPreviewFoto(fotoUrl);
        localStorage.setItem("foto_perfil_cliente", fotoUrl);
      }
      // Si no hay foto en la respuesta, intentar recuperarla del localStorage
      else {
        const storedFoto = localStorage.getItem("foto_perfil_cliente");
        if (storedFoto) {
          console.log("Usando foto desde localStorage");
          setPreviewFoto(storedFoto);
        }
      }
      
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Status:", error.response?.status);
      console.error("Respuesta del servidor:", error.response?.data);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosCliente();
  }, [cargarDatosCliente]);

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
      // Validar tipo de archivo
      const filetypes = /jpeg|jpg|png|webp/;
      const mimetype = filetypes.test(selectedFile.type);
      const extname = filetypes.test(selectedFile.name.toLowerCase().split('.').pop());
      
      if (!mimetype || !extname) {
        setFotoError("Solo se permiten imágenes (jpeg, jpg, png, webp)");
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFotoError("La imagen no debe superar los 5MB");
        return;
      }
      
      setFotoError(null);
      setFoto(selectedFile);
      
      // Crear URL de vista previa
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewFoto(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    // Emitir evento para ocultar el footer
    const ocultarFooterEvent = new CustomEvent('ocultarFooter', { detail: { ocultar: true } });
    window.dispatchEvent(ocultarFooterEvent);

    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula || !token) {
      setError("Faltan credenciales para actualizar");
      setUpdating(false);
      // Restaurar footer
      const mostrarFooterEvent = new CustomEvent('ocultarFooter', { detail: { ocultar: false } });
      window.dispatchEvent(mostrarFooterEvent);
      return;
    }

    try {
      let fotoActualizada = false;
      
      // Si hay una foto nueva, procesarla primero
      if (foto) {
        try {
          // Crear un FormData para enviar la foto
          const formDataFoto = new FormData();
          formDataFoto.append('foto', foto);
          
          // Llamar al endpoint para subir la foto
          const fotoResponse = await axios.post(
            `http://localhost:10101/cliente/subir-foto`,
            formDataFoto,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              },
            }
          );
          
          // Si la foto se subió correctamente, guardar también en localStorage para vista previa
          if (fotoResponse.data && fotoResponse.data.url) {
            localStorage.setItem("foto_perfil_cliente", previewFoto);
            fotoActualizada = true;
            console.log("Foto actualizada exitosamente:", fotoResponse.data);
            
            // Dispatch custom event to notify other components that the photo was updated
            const event = new CustomEvent('fotoPerfilClienteActualizada', { detail: { fotoUrl: previewFoto } });
            window.dispatchEvent(event);
          }
        } catch (fotoError) {
          console.error("Error al subir la foto:", fotoError);
          // Mostrar error específico de la foto pero continuar con la actualización de los demás datos
          Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: `No se pudo actualizar la foto: ${fotoError.response?.data?.message || fotoError.message}. Se continuará con la actualización de los demás datos.`,
            confirmButtonColor: "#3085d6"
          });
        }
      }

      // Continuar con la actualización de los demás datos
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
          foto_perfil: previewFoto
        });

        // Mensaje personalizado según si se actualizó la foto o no
        let mensajeExito = "Tu información ha sido actualizada correctamente.";
        if (foto && !fotoActualizada) {
          mensajeExito += " Sin embargo, hubo un problema al actualizar la foto.";
        } else if (foto && fotoActualizada) {
          mensajeExito += " La foto de perfil también se actualizó correctamente.";
        }

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
                <img src="https://i.gifer.com/7efs.gif" 
                    alt="Actualización exitosa" 
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
                ¡Actualización Exitosa!
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
                ${mensajeExito}
              </p>
              <button id="cerrarAlerta" style="
                margin-top: clamp(10px, 3vw, 15px);
                padding: clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px);
                background-color: #38a169;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: clamp(14px, 3vw, 16px);
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.3s ease;
                width: auto;
                min-width: 100px;
              ">
                OK
              </button>
            </div>
          `,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-popup-custom',
            container: 'swal2-container-custom'
          },
          didOpen: () => {
            document.getElementById("cerrarAlerta").addEventListener("click", () => {
              Swal.close();
              // Restaurar footer cuando se cierra la alerta
              const mostrarFooterEvent = new CustomEvent('ocultarFooter', { detail: { ocultar: false } });
              window.dispatchEvent(mostrarFooterEvent);
            });
          },
          willClose: () => {
            // Asegurarse de que el footer se restaure cuando se cierre la alerta
            const mostrarFooterEvent = new CustomEvent('ocultarFooter', { detail: { ocultar: false } });
            window.dispatchEvent(mostrarFooterEvent);
          }
        });

        // Resetear el estado de la foto después de la actualización
        setFoto(null);
        
        // Forzar una recarga de los datos del cliente
        await cargarDatosCliente();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError(`Error al actualizar: ${error.response?.data?.message || error.message}`);
      // Restaurar footer en caso de error
      const mostrarFooterEvent = new CustomEvent('ocultarFooter', { detail: { ocultar: false } });
      window.dispatchEvent(mostrarFooterEvent);
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
    <div className="min-h-screen bg-gradient-to-b from-teal-800/10 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-teal-800 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FaUser className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Actualizar Perfil
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Mantén tu información personal actualizada
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {fotoError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
            {fotoError}
          </div>
        )}

        {/* Formulario de datos personales */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Sección de foto de perfil */}
          <div className="flex justify-center mt-8">
            <div className="relative">
              <div className="p-3 bg-white rounded-full shadow-lg ring-4 ring-teal-100">
                <img
                  src={
                    previewFoto || (cliente.foto_perfil ? cliente.foto_perfil : Avatar)
                  }
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover cursor-pointer hover:opacity-90 transition-all duration-300 transform hover:scale-105 border-4 border-teal-50"
                  onError={(e) => {
                    console.error("Error al cargar la imagen");
                    e.target.src = Avatar;
                  }}
                />
                <label
                  htmlFor="upload-photo"
                  className="absolute -bottom-3 -right-3 bg-teal-600 text-white p-2.5 rounded-full shadow-lg transform hover:rotate-12 hover:scale-110 transition-transform duration-300 cursor-pointer"
                >
                  <FaCamera className="h-5 w-5" />
                </label>
                <input
                  type="file"
                  id="upload-photo"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaIdCard className="h-5 w-5 text-teal-800" />
              </div>
              <input
                type="text"
                value={cliente.cedula || ""}
                disabled
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50"
              />
              <label className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Cédula
              </label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-teal-800" />
              </div>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleInputChange}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                required
              />
              <label className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Primer Nombre
              </label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-teal-800" />
              </div>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleInputChange}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
              />
              <label className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Segundo Nombre
              </label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-teal-800" />
              </div>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleInputChange}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                required
              />
              <label className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Primer Apellido
              </label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-teal-800" />
              </div>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleInputChange}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
              />
              <label className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Segundo Apellido
              </label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-teal-800" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                required
              />
              <label className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Email
              </label>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-teal-800 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={updating}
            >
              <span className="flex items-center">
                {updating ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FaSave className="h-5 w-5 mr-2" />
                )}
                {updating ? "Actualizando..." : "Guardar Cambios"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActualizarDatosCliente;