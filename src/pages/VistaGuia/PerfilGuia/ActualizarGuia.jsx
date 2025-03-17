import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DashboardLayoutGuia from "../../../layouts/DashboardLayoutGuia";
import { Edit, User } from "lucide-react";

const ActualizarDatosGuia = () => {
  const [cliente, setGuia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    telefono: "",
    descripcion: ""
  });

  // Función para separar nombre completo
  const separarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return { primerNombre: "", segundoNombre: "", primerApellido: "", segundoApellido: "" };
    
    const partes = nombreCompleto.split(" ");
    let primerNombre = "";
    let segundoNombre = "";
    let primerApellido = "";
    let segundoApellido = "";

    if (partes.length >= 1) primerNombre = partes[0];
    if (partes.length >= 2) segundoNombre = partes[1];
    if (partes.length >= 3) primerApellido = partes[2];
    if (partes.length >= 4) segundoApellido = partes[3];

    return { primerNombre, segundoNombre, primerApellido, segundoApellido };
  };

  const cargarDatosGuia = useCallback(async () => {
    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");
  
    if (!cedula || !token) {
      setError("No se encontraron credenciales necesarias.");
      setLoading(false);
      return;
    }
  
    try {
      console.log("Solicitando datos actualizados del guía...");
      
      // Primero, obtenemos los datos básicos del guía
      const response = await axios.get(
        `http://localhost:10101/guia/perfil-completo/${cedula}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            _t: new Date().getTime()
          }
        }
      );
  
      if (response.data) {
        const guiaData = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log("DATOS COMPLETOS DEL GUÍA:", JSON.stringify(guiaData, null, 2));
        
        // Ahora, hacemos una solicitud específica para obtener el teléfono más reciente
        try {
          console.log("Solicitando datos de teléfono actualizados...");
          const telefonoResponse = await axios.get(
            `http://localhost:10101/guia/telefono/${cedula}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                _t: new Date().getTime()
              }
            }
          );
          
          console.log("RESPUESTA DE TELÉFONO:", JSON.stringify(telefonoResponse.data, null, 2));
          
          // Si recibimos datos de teléfono, los utilizamos
          if (telefonoResponse.data && telefonoResponse.data.numeroCelular) {
            console.log("TELÉFONO ENCONTRADO EN TABLA TELEFONO:", telefonoResponse.data.numeroCelular);
            // Actualizar el objeto guiaData con el teléfono más reciente
            guiaData.numeroCelular = telefonoResponse.data.numeroCelular;
          }
        } catch (telefonoError) {
          console.error("Error al obtener teléfono específico:", telefonoError);
          // Continuamos con los datos del guía que ya tenemos, sin interrumpir el flujo
        }
        
        // Verificar todos los campos posibles donde podría estar el teléfono
        const posiblesCamposTelefono = [
          'telefono', 'numeroCelular', 'numero_celular', 'celular'
        ];
        
        console.log("ANÁLISIS DE CAMPOS DE TELÉFONO:");
        posiblesCamposTelefono.forEach(campo => {
          console.log(`Campo ${campo}: ${guiaData[campo] || 'No encontrado'}`);
        });
        
        const telefonoEncontrado = guiaData.numeroCelular || guiaData.telefono || "";
        console.log("TELÉFONO FINAL A UTILIZAR:", telefonoEncontrado);
        
        // Verificar si hay una foto en la respuesta del servidor
        if (guiaData.foto_perfil) {
          // Si la foto comienza con http, es una URL completa
          if (guiaData.foto_perfil.startsWith('http')) {
            setPreviewFoto(guiaData.foto_perfil);
          } 
          // Si la foto no comienza con http, construir la URL completa
          else {
            // Verificar si la ruta ya incluye /uploads/images
            if (guiaData.foto_perfil.includes('/uploads/images/')) {
              setPreviewFoto(`http://localhost:10101${guiaData.foto_perfil}`);
            } else {
              setPreviewFoto(`http://localhost:10101/uploads/images/${guiaData.foto_perfil}`);
            }
          }
        } 
        // Si no hay foto en la respuesta, intentar recuperarla del localStorage
        else {
          const storedFoto = localStorage.getItem("foto_perfil");
          if (storedFoto) {
            setPreviewFoto(storedFoto);
          }
        }
        
        setGuia(guiaData);
        localStorage.setItem("guia", JSON.stringify(guiaData));
  
        // Separar el nombre completo
        const nombreDelGuia = guiaData.nombre || guiaData.nombre_completo || guiaData.nombre_del_guia;
        const { primerNombre, segundoNombre, primerApellido, segundoApellido } = separarNombre(nombreDelGuia);
        
        // Establecer los datos en el formulario con el teléfono actualizado
        setFormData({
          primerNombre: primerNombre,
          segundoNombre: segundoNombre || "",
          primerApellido: primerApellido || "",
          segundoApellido: segundoApellido || "",
          email: guiaData.email || "",
          telefono: telefonoEncontrado,
          descripcion: guiaData.descripcion || ""
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
    // Detectar el modo actual del dashboard
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('light')) {
      setDarkMode(false);
    }

    cargarDatosGuia();
  }, [cargarDatosGuia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      
      // Crear una URL para previsualizar la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFoto = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula || !token) {
      setError("Faltan credenciales para actualizar");
      setUpdating(false);
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
            `http://localhost:10101/guia/subir-Foto`,
            formDataFoto,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              },
            }
          );
          
          // Si la foto se subió correctamente, guardar también en localStorage para vista previa
          if (fotoResponse.data && fotoResponse.data.path) {
            localStorage.setItem("foto_perfil", previewFoto);
            fotoActualizada = true;
            console.log("Foto actualizada exitosamente:", fotoResponse.data);
            
            // Dispatch custom event to notify other components that the photo was updated
            const event = new CustomEvent('fotoPerfilActualizada', { detail: { fotoUrl: previewFoto } });
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
      
      // Preparar datos para actualizar
      const datosActualizar = {
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        email: formData.email,
        numeroCelular: formData.telefono,
        telefono: formData.telefono, // Enviar en ambos campos para asegurarnos
        descripcion: formData.descripcion
      };
      
      console.log("DATOS QUE SE ENVIARÁN PARA ACTUALIZAR:", JSON.stringify(datosActualizar, null, 2));
      
      const response = await axios.patch(
        `http://localhost:10101/guia/actualizar/${cedula}`,
        datosActualizar,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("RESPUESTA COMPLETA DEL SERVIDOR:", JSON.stringify(response.data, null, 2));

      if (response.data) {
        const nombreCompleto = `${formData.primerNombre} ${formData.segundoNombre} ${formData.primerApellido} ${formData.segundoApellido}`;
        setGuia({
          ...cliente,
          nombre_del_guia: nombreCompleto,
          email: formData.email,
          telefono: formData.telefono,
          descripcion: formData.descripcion,
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
          icon: "success",
          title: "¡Datos actualizados!",
          text: mensajeExito,
          confirmButtonColor: "#3085d6"
        });

        // Forzar una recarga completa con un pequeño retraso para dar tiempo a que la DB se actualice
        localStorage.removeItem("guia"); // Eliminar datos antiguos almacenados
        
        setTimeout(async () => {
          await cargarDatosGuia(); // Recargar datos frescos
          console.log("Datos recargados después de la actualización");
        }, 1000);
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError(`Error al actualizar: ${error.response?.data?.message || error.message}`);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo actualizar la información: ${error.response?.data?.message || error.message}`,
        confirmButtonColor: "#3085d6"
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div className={`${darkMode ? 'bg-teal-900 text-white' : 'bg-teal-50 text-teal-800'} rounded-lg p-6 shadow-lg text-center`}>
          <div className="animate-pulse">
            <div className="h-4 bg-teal-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-teal-700 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-teal-700 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-4">Cargando información...</p>
        </div>
      );
    }
    
    if (error && !formData.primerNombre) {
      return (
        <div className={`${darkMode ? 'bg-teal-900' : 'bg-teal-50'} rounded-lg p-6 shadow-lg text-center text-red-500`}>
          <p className="text-xl font-semibold mb-2">Error al cargar los datos</p>
          <p>{error}</p>
          <button 
            onClick={() => cargarDatosGuia()} 
            className="mt-4 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    // Construir nombre completo para la foto de perfil
    const nombreCompleto = `${formData.primerNombre} ${formData.segundoNombre} ${formData.primerApellido} ${formData.segundoApellido}`.trim();

    return (
      <div className="bg-white rounded-lg p-6 shadow-lg border border-emerald-100">
        <h2 className="text-2xl font-bold mb-6 text-emerald-800">Actualizar Información Personal</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Sección para foto de perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-emerald-500">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=User&background=059669&color=fff';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white">
                    <User size={64} />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleSelectFoto}
                className="absolute bottom-2 right-0 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
              >
                <Edit size={20} />
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFotoChange}
              accept="image/*"
              className="hidden"
            />
            
            <p className="text-sm mt-2 text-gray-600">
              Haz clic en el icono para cambiar tu foto
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Primer Nombre *
              </label>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Primer Apellido *
              </label>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Escribe una breve descripción sobre ti, tu experiencia y habilidades como guía..."
              ></textarea>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="submit"
              disabled={updating}
              className={`py-2 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200 flex items-center gap-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                "Guardar Cambios"
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate("/VistaGuia/PerfilGuia")}
              className="py-2 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <DashboardLayoutGuia>
      {renderContenido()}
    </DashboardLayoutGuia>
  );
};

export default ActualizarDatosGuia;