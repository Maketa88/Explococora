import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCamera, FaEnvelope, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Avatar from "../../assets/Images/avatar.png";

const ActualizarDatosCliente = () => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({
    cedula: "",
    nombre_del_cliente: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    numeroCelular: "",
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
      const clienteData = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      // Obtener el número de teléfono de la respuesta
      let numeroCelular = "";
      if (clienteData.numeroCelular !== undefined) {
        numeroCelular = clienteData.numeroCelular;
      } else if (clienteData.telefono) {
        // Si telefono es un objeto con propiedad numeroCelular
        if (
          typeof clienteData.telefono === "object" &&
          clienteData.telefono.numeroCelular !== undefined
        ) {
          numeroCelular = clienteData.telefono.numeroCelular;
        }
        // Si telefono es directamente un string (como en la respuesta actual)
        else if (typeof clienteData.telefono === "string") {
          numeroCelular = clienteData.telefono;
        }
      } else if (clienteData.telefonos && clienteData.telefonos.length > 0) {
        numeroCelular = clienteData.telefonos[0].numeroCelular || "";
      }

      // Guardar los datos básicos del cliente
      setCliente({
        cedula: clienteData.cedula || cedula,
        nombre_del_cliente:
          clienteData.nombre_completo ||
          `${clienteData.primerNombre || ""} ${
            clienteData.segundoNombre || ""
          } ${clienteData.primerApellido || ""} ${
            clienteData.segundoApellido || ""
          }`.trim(),
        email: clienteData.email || "",
      });

      // Establecer los datos del formulario
      setFormData({
        primerNombre: clienteData.primerNombre || "",
        segundoNombre: clienteData.segundoNombre || "",
        primerApellido: clienteData.primerApellido || "",
        segundoApellido: clienteData.segundoApellido || "",
        email: clienteData.email || "",
        numeroCelular: numeroCelular,
      });

      // Procesar la foto de perfil
      if (clienteData.foto_perfil) {
        console.log("Foto perfil encontrada:", clienteData.foto_perfil);

        // Si la foto comienza con http, es una URL completa
        if (clienteData.foto_perfil.startsWith("http")) {
          setPreviewFoto(clienteData.foto_perfil);
          localStorage.setItem("foto_perfil_cliente", clienteData.foto_perfil);
        }
        // Si la foto no comienza con http, construir la URL completa
        else {
          // Verificar si la ruta ya incluye /uploads/images
          let fotoUrl;
          if (clienteData.foto_perfil.includes("/uploads/images/")) {
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
        if (clienteData.foto.startsWith("http")) {
          fotoUrl = clienteData.foto;
        } else if (clienteData.foto.includes("/uploads/images/")) {
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
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      const filetypes = /jpeg|jpg|png|webp/;
      const mimetype = filetypes.test(selectedFile.type);
      const extname = filetypes.test(
        selectedFile.name.toLowerCase().split(".").pop()
      );

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
    const ocultarFooterEvent = new CustomEvent("ocultarFooter", {
      detail: { ocultar: true },
    });
    window.dispatchEvent(ocultarFooterEvent);

    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula || !token) {
      setError("Faltan credenciales para actualizar");
      setUpdating(false);
      // Restaurar footer
      const mostrarFooterEvent = new CustomEvent("ocultarFooter", {
        detail: { ocultar: false },
      });
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
          formDataFoto.append("foto", foto);

          // Llamar al endpoint para subir la foto
          const fotoResponse = await axios.post(
            `http://localhost:10101/cliente/subir-foto`,
            formDataFoto,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Si la foto se subió correctamente, guardar también en localStorage para vista previa
          if (fotoResponse.data && fotoResponse.data.url) {
            localStorage.setItem("foto_perfil_cliente", previewFoto);
            fotoActualizada = true;
            console.log("Foto actualizada exitosamente:", fotoResponse.data);

            // Dispatch custom event to notify other components that the photo was updated
            const event = new CustomEvent("fotoPerfilClienteActualizada", {
              detail: { fotoUrl: previewFoto },
            });
            window.dispatchEvent(event);
          }
        } catch (fotoError) {
          console.error("Error al subir la foto:", fotoError);
          // Mostrar error específico de la foto pero continuar con la actualización de los demás datos
          Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: `No se pudo actualizar la foto: ${
              fotoError.response?.data?.message || fotoError.message
            }. Se continuará con la actualización de los demás datos.`,
            confirmButtonColor: "#3085d6",
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
          numeroCelular: formData.numeroCelular,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Después de una actualización exitosa, actualizar el estado local con los datos enviados
        // en lugar de recargar inmediatamente desde el servidor

        // Actualizar el estado del cliente con los datos enviados
        const nombreCompleto =
          `${formData.primerNombre} ${formData.segundoNombre} ${formData.primerApellido} ${formData.segundoApellido}`.trim();
        setCliente((prevCliente) => ({
          ...prevCliente,
          nombre_del_cliente: nombreCompleto,
          email: formData.email,
        }));

        // Mensaje personalizado según si se actualizó la foto o no
        let mensajeExito = "Tu información ha sido actualizada correctamente.";
        if (foto && !fotoActualizada) {
          mensajeExito +=
            " Sin embargo, hubo un problema al actualizar la foto.";
        } else if (foto && fotoActualizada) {
          mensajeExito +=
            " La foto de perfil también se actualizó correctamente.";
        }

        // Mostrar mensaje de éxito
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
            popup: "swal2-popup-custom",
            container: "swal2-container-custom",
          },
          didOpen: () => {
            document
              .getElementById("cerrarAlerta")
              .addEventListener("click", () => {
                Swal.close();
                // Restaurar footer cuando se cierra la alerta
                const mostrarFooterEvent = new CustomEvent("ocultarFooter", {
                  detail: { ocultar: false },
                });
                window.dispatchEvent(mostrarFooterEvent);
              });
          },
          willClose: () => {
            // Asegurarse de que el footer se restaure cuando se cierre la alerta
            const mostrarFooterEvent = new CustomEvent("ocultarFooter", {
              detail: { ocultar: false },
            });
            window.dispatchEvent(mostrarFooterEvent);
          },
        });

        // Resetear el estado de la foto después de la actualización
        setFoto(null);

        // No es necesario recargar los datos inmediatamente, ya que ya actualizamos el estado local
        // Si hay alguna inconsistencia, el usuario puede recargar la página manualmente
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError(
        `Error al actualizar: ${error.response?.data?.message || error.message}`
      );
      // Restaurar footer en caso de error
      const mostrarFooterEvent = new CustomEvent("ocultarFooter", {
        detail: { ocultar: false },
      });
      window.dispatchEvent(mostrarFooterEvent);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
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

      <div className="container mx-auto max-w-4xl">
        {/* Título de la página con estilo mejorado */}
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-6 text-center">
          Actualizar Información de Perfil
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full opacity-70 blur-sm group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-full overflow-hidden border-4 border-white">
                    <img
                      src={previewFoto || cliente.foto_perfil || Avatar}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Avatar;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaCamera className="text-white text-xl" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-white text-xl font-semibold">
                    {cliente.nombre_del_cliente}
                  </h2>
                  <p className="text-emerald-100 flex items-center gap-1">
                    <FaEnvelope className="text-xs" /> {cliente.email}
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Formulario con estilos mejorados */}
            <form onSubmit={handleSubmit} className="p-6">
              {fotoError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {fotoError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label 
                    htmlFor="primerNombre"
                    className="block text-sm font-medium text-emerald-700 mb-1"
                  >
                    Primer Nombre *
                  </label>
                  <input
                    id="primerNombre"
                    name="primerNombre"
                    type="text"
                    required
                    value={formData.primerNombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-emerald-100/70 border border-emerald-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="segundoNombre"
                    className="block text-sm font-medium text-emerald-700 mb-1"
                  >
                    Segundo Nombre
                  </label>
                  <input
                    id="segundoNombre"
                    name="segundoNombre"
                    type="text"
                    value={formData.segundoNombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-emerald-100/70 border border-emerald-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="primerApellido"
                    className="block text-sm font-medium text-emerald-700 mb-1"
                  >
                    Primer Apellido *
                  </label>
                  <input
                    id="primerApellido"
                    name="primerApellido"
                    type="text"
                    required
                    value={formData.primerApellido}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-emerald-100/70 border border-emerald-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="segundoApellido"
                    className="block text-sm font-medium text-emerald-700 mb-1"
                  >
                    Segundo Apellido
                  </label>
                  <input
                    id="segundoApellido"
                    name="segundoApellido"
                    type="text"
                    value={formData.segundoApellido}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-emerald-100/70 border border-emerald-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="email"
                    className="block text-sm font-medium text-emerald-700 mb-1"
                  >
                    Correo Electrónico *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-emerald-100/70 border border-emerald-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="numeroCelular"
                    className="block text-sm font-medium text-emerald-700 mb-1"
                  >
                    Número de Celular *
                  </label>
                  <input
                    id="numeroCelular"
                    name="numeroCelular"
                    type="tel"
                    required
                    value={formData.numeroCelular}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-emerald-100/70 border border-emerald-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/VistaCliente/PerfilCliente")}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={updating}
                  className={`px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg flex items-center gap-2 ${
                    updating 
                      ? "opacity-70 cursor-not-allowed" 
                      : "hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-emerald-200/50"
                  } transition-all duration-300`}
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActualizarDatosCliente;
