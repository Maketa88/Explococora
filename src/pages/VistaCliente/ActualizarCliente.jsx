import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCamera, FaEnvelope, FaSave, FaUser } from "react-icons/fa";
import Swal from "sweetalert2";
import Avatar from "../../assets/Images/avatar.png";

const ActualizarDatosCliente = () => {
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

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10">Cargando datos...</div>
    );
  }

  if (error && !cliente.cedula) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Fondo decorativo inspirado en el Valle del Cocora */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

        {/* Paisaje montañoso estilizado */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg
            viewBox="0 0 1200 600"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Montañas en el horizonte */}
            <path
              d="M0,600 L0,350 L100,300 L200,350 L300,280 L400,350 L500,250 L600,320 L700,280 L800,350 L900,300 L1000,350 L1100,280 L1200,320 L1200,600 Z"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />

            {/* Nubes estilizadas */}
            <path
              d="M100,200 C130,180 160,190 180,170 C200,150 230,160 250,180 C270,200 300,190 320,170"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />

            {/* Más nubes */}
            <path
              d="M500,150 C530,130 560,140 580,120 C600,100 630,110 650,130 C670,150 700,140 720,120"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />

            {/* Río serpenteante */}
            <path
              d="M0,450 C100,470 200,430 300,450 C400,470 500,430 600,450 C700,470 800,430 900,450 C1000,470 1100,430 1200,450"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
          </svg>
        </div>
      </div>
      <div className="min-h-screen py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-5xl w-full space-y-4 sm:space-y-6 bg-teal-800/70 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-teal-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <FaUser className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Actualizar Perfil
            </h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white">
              Mantén tu información personal actualizada
            </p>
          </div>

          {error && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-100 text-red-700 text-sm rounded-lg border border-red-400 shadow-sm">
              {error}
            </div>
          )}

          {fotoError && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-100 text-red-700 text-sm rounded-lg border border-red-400 shadow-sm">
              {fotoError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
          >
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
              <div className="relative">
                <div className="p-2 sm:p-3 bg-white rounded-full shadow-lg ring-2 sm:ring-4 ring-teal-100">
                  <img
                    src={
                      previewFoto ||
                      (cliente.foto_perfil ? cliente.foto_perfil : Avatar)
                    }
                    alt="Foto de perfil"
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover cursor-pointer hover:opacity-90 transition-all duration-300 transform hover:scale-105 border-2 sm:border-4 border-teal-50"
                    onError={(e) => {
                      console.error("Error al cargar la imagen");
                      e.target.src = Avatar;
                    }}
                  />
                  <label
                    htmlFor="upload-photo"
                    className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 bg-teal-600 text-white p-1.5 sm:p-2.5 rounded-full shadow-lg transform hover:rotate-12 hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    <FaCamera className="h-4 w-4 sm:h-5 sm:w-5" />
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

            <div className="bg-teal-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="relative group">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                    Primer Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" />
                    </div>
                    <input
                      type="text"
                      name="primerNombre"
                      value={formData.primerNombre}
                      onChange={handleInputChange}
                      className="pl-8 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-3 border border-teal-600 rounded-lg sm:rounded-xl text-white bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                    Segundo Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" />
                    </div>
                    <input
                      type="text"
                      name="segundoNombre"
                      value={formData.segundoNombre}
                      onChange={handleInputChange}
                      className="pl-8 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-3 border border-teal-600 rounded-lg sm:rounded-xl text-white bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                    Primer Apellido
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" />
                    </div>
                    <input
                      type="text"
                      name="primerApellido"
                      value={formData.primerApellido}
                      onChange={handleInputChange}
                      className="pl-8 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-3 border border-teal-600 rounded-lg sm:rounded-xl text-white bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                    Segundo Apellido
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" />
                    </div>
                    <input
                      type="text"
                      name="segundoApellido"
                      value={formData.segundoApellido}
                      onChange={handleInputChange}
                      className="pl-8 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-3 border border-teal-600 rounded-lg sm:rounded-xl text-white bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-8 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-3 border border-teal-600 rounded-lg sm:rounded-xl text-white bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1">
                    Celular
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="numeroCelular"
                      value={formData.numeroCelular || ""}
                      onChange={handleInputChange}
                      placeholder="Ej: 3001234567"
                      pattern="[0-9]{10}"
                      title="Ingresa un número de 10 dígitos sin espacios ni guiones"
                      className="pl-8 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-3 border border-teal-600 rounded-lg sm:rounded-xl text-white bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 flex justify-center">
              <button
                type="submit"
                className="py-2 sm:py-3 px-6 sm:px-8 border border-transparent text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-[1.02] transition-all duration-300 shadow-md sm:shadow-lg hover:shadow-xl"
                disabled={updating}
              >
                <span className="flex items-center">
                  {updating ? (
                    <svg
                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-white"
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
                  ) : (
                    <FaSave className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  )}
                  {updating ? "Actualizando..." : "Guardar Cambios"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ActualizarDatosCliente;
