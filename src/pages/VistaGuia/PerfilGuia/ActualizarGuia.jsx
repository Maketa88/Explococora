import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DashboardLayoutGuia from "../../../layouts/DashboardLayoutGuia";

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
    especialidad: "",
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
      const response = await axios.get(`http://localhost:10101/guia/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data) {
        const guiaData = Array.isArray(response.data) ? response.data[0] : response.data;
        
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
        
        // Establecer los datos en el formulario
        setFormData({
          primerNombre: primerNombre,
          segundoNombre: segundoNombre || "",
          primerApellido: primerApellido || "",
          segundoApellido: segundoApellido || "",
          email: guiaData.email || "",
          telefono: guiaData.telefono || "",
          especialidad: guiaData.especialidad || "",
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
        `http://localhost:10101/guia/actualizar/${cedula}`,
        {
          primerNombre: formData.primerNombre,
          segundoNombre: formData.segundoNombre,
          primerApellido: formData.primerApellido,
          segundoApellido: formData.segundoApellido,
          email: formData.email,
          numeroCelular: formData.telefono,
          especialidad: formData.especialidad,
          descripcion: formData.descripcion
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const nombreCompleto = `${formData.primerNombre} ${formData.segundoNombre} ${formData.primerApellido} ${formData.segundoApellido}`;
        setGuia({
          ...cliente,
          nombre_del_guia: nombreCompleto,
          email: formData.email,
          telefono: formData.telefono,
          especialidad: formData.especialidad,
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

        await cargarDatosGuia();
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
        <div className={`${darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-6 shadow-lg text-center`}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-4">Cargando información...</p>
        </div>
      );
    }
    
    if (error && !formData.primerNombre) {
      return (
        <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg text-center text-red-500`}>
          <p className="text-xl font-semibold mb-2">Error al cargar los datos</p>
          <p>{error}</p>
          <button 
            onClick={() => cargarDatosGuia()} 
            className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    // Construir nombre completo para la foto de perfil
    const nombreCompleto = `${formData.primerNombre} ${formData.segundoNombre} ${formData.primerApellido} ${formData.segundoApellido}`.trim();

    return (
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Actualizar Información Personal</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Sección para foto de perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-500">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto || "Usuario")}&size=200&background=0D8ABC&color=fff`}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              
              <button
                type="button"
                onClick={handleSelectFoto}
                className={`absolute bottom-2 right-0 p-2 rounded-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFotoChange}
              accept="image/*"
              className="hidden"
            />
            
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Haz clic en el icono para cambiar tu foto
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Primer Nombre *
              </label>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div>
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div>
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Primer Apellido *
              </label>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div>
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div>
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div>
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div>
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Especialidad
              </label>
              <input
                type="text"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Escribe una breve descripción sobre ti, tu experiencia y habilidades como guía..."
              ></textarea>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="submit"
              disabled={updating}
              className={`py-2 px-6 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors duration-200 flex items-center gap-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
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
              onClick={() => navigate("/VistaGuia/Perfil")}
              className={`py-2 px-6 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${darkMode ? 'text-white' : 'text-gray-800'} font-medium transition-colors duration-200`}
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