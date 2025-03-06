import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
 import { Edit, User } from "lucide-react";
import DashboardLayoutAdmin from "../../../layouts/DashboardLayoutAdmin";
import { AlertCircle, CheckCircle, X, ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";

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
      <div className="bg-teal-900 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white">Actualizar Información Personal</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Sección para foto de perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-teal-500">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=User&background=0D9488&color=fff';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-700 text-white">
                    <User size={64} />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleSelectFoto}
                className="absolute bottom-2 right-0 p-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
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
            
            <p className="text-sm mt-2 text-white">
              Haz clic en el icono para cambiar tu foto
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                Primer Nombre *
              </label>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-teal-800 border-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-teal-800 border-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                Primer Apellido *
              </label>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-teal-800 border-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-teal-800 border-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-teal-800 border-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-teal-800 border-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-white">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border bg-teal-800 border-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Escribe una breve descripción sobre ti, tu experiencia y habilidades como guía..."
              ></textarea>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="submit"
              disabled={updating}
              className={`py-2 px-6 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors duration-200 flex items-center gap-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
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
              className="py-2 px-6 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium transition-colors duration-200"
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

const ActualizarCorreoAdmin = () => {
  const [formData, setFormData] = useState({
    emailActual: '',
    nuevoEmail: '',
    confirmarEmail: '',
    contrasena: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [cambiosRealizados, setCambiosRealizados] = useState(false);
  const navigate = useNavigate();

  // Cargar email actual desde localStorage al iniciar
  useEffect(() => {
    const emailAdmin = localStorage.getItem("email");
    if (emailAdmin) {
      setFormData(prev => ({ ...prev, emailActual: emailAdmin }));
    } else {
      // Si no hay email en localStorage, intentar obtenerlo del API
      obtenerEmailAdmin();
    }
  }, []);

  const obtenerEmailAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró token de autenticación");
        return;
      }

      const response = await axios.get(
        "http://localhost:10101/admin/perfil",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.email) {
        setFormData(prev => ({ ...prev, emailActual: response.data.email }));
        localStorage.setItem("email", response.data.email);
      }
    } catch (error) {
      console.error("Error al obtener datos del administrador:", error);
      setError("Error al cargar datos del administrador");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const nuevoEstado = {
        ...prev,
        [name]: value
      };
      
      // Verificar si hay cambios en el email
      const nuevoEmailDiferente = 
        nuevoEstado.nuevoEmail !== "" && 
        nuevoEstado.nuevoEmail !== nuevoEstado.emailActual;
      
      const confirmacionCorrecta = 
        nuevoEstado.confirmarEmail !== "" && 
        nuevoEstado.nuevoEmail === nuevoEstado.confirmarEmail;
      
      const contrasenaIngresada = nuevoEstado.contrasena !== "";
      
      setCambiosRealizados(
        nuevoEmailDiferente && 
        confirmacionCorrecta && 
        contrasenaIngresada
      );
      
      return nuevoEstado;
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const validateEmail = (email) => {
    const re = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(email);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    
    if (type === 'success') {
      setTimeout(() => {
        closeAlert();
      }, 5000);
    }
  };

  const closeAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que el nuevo email sea diferente al actual
    if (formData.nuevoEmail === formData.emailActual) {
      showAlert("El nuevo correo electrónico debe ser diferente al actual", "error");
      return;
    }
    
    // Validar formato de email
    if (!validateEmail(formData.nuevoEmail)) {
      showAlert("El formato del correo electrónico no es válido", "error");
      return;
    }
    
    // Validar que los emails coincidan
    if (formData.nuevoEmail !== formData.confirmarEmail) {
      showAlert("Los correos electrónicos no coinciden", "error");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Primero verificar la contraseña actual
      const verificacionResponse = await axios.post(
        "http://localhost:10101/admin/verificar-contrasena",
        {
          email: formData.emailActual,
          contrasenia: formData.contrasena
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!verificacionResponse.data.valido) {
        showAlert("Contraseña incorrecta", "error");
        setSubmitting(false);
        return;
      }
      
      // Si la contraseña es correcta, proceder con la actualización del email
      const response = await axios.put(
        `http://localhost:10101/admin/actualizar-correo`,
        {
          emailActual: formData.emailActual,
          nuevoEmail: formData.nuevoEmail
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Actualizar el email en localStorage
      localStorage.setItem("email", formData.nuevoEmail);
      
      showAlert("Correo electrónico actualizado con éxito", "success");
      
      // Actualizar el email actual en el formulario
      setFormData(prev => ({
        ...prev,
        emailActual: formData.nuevoEmail,
        nuevoEmail: '',
        confirmarEmail: '',
        contrasena: ''
      }));
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/VistaAdmin/PerfilAdmin");
      }, 2000);
      
    } catch (error) {
      console.error("Error al actualizar correo:", error);
      
      let mensajeError = "Error al actualizar el correo electrónico";
      if (error.response) {
        mensajeError = error.response.data.message || mensajeError;
      }
      
      showAlert(mensajeError, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayoutAdmin>
      <div className={`min-h-screen ${darkMode ? 'bg-teal-950' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-teal-900 rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Mail className="mr-2" /> Actualizar Correo Electrónico
            </h2>
            
            {/* Alerta */}
            {alert.show && (
              <div className={`mb-6 p-4 rounded-lg flex items-start justify-between ${
                alert.type === 'error' 
                  ? 'bg-red-900 text-red-200' 
                  : 'bg-green-900 text-green-200'
              }`}>
                <div className="flex items-center">
                  {alert.type === 'error' ? (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  <span>{alert.message}</span>
                </div>
                <button 
                  onClick={closeAlert}
                  className="text-white hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Correo Electrónico Actual
                  </label>
                  <input
                    type="email"
                    name="emailActual"
                    value={formData.emailActual}
                    className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 opacity-70 cursor-not-allowed"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Nuevo Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="nuevoEmail"
                    value={formData.nuevoEmail}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  {formData.nuevoEmail && !validateEmail(formData.nuevoEmail) && (
                    <p className="text-red-400 text-sm mt-1">
                      Formato de correo electrónico inválido
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Confirmar Nuevo Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="confirmarEmail"
                    value={formData.confirmarEmail}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-teal-800 text-white border ${
                      formData.nuevoEmail && formData.confirmarEmail && 
                      formData.nuevoEmail !== formData.confirmarEmail 
                        ? 'border-red-500'
                        : 'border-teal-600'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    required
                  />
                  {formData.nuevoEmail && formData.confirmarEmail && 
                    formData.nuevoEmail !== formData.confirmarEmail && (
                    <p className="text-red-400 text-sm mt-1">
                      Los correos electrónicos no coinciden
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Contraseña Actual (para confirmar)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/VistaAdmin/PerfilAdmin")}
                  className="py-2 px-6 bg-teal-700 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver
                </button>
                
                <button
                  type="submit"
                  disabled={submitting || !cambiosRealizados}
                  className={`py-2 px-6 ${
                    cambiosRealizados 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-500'
                  } text-white rounded-lg flex items-center gap-2 ${
                    !cambiosRealizados || submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    "Actualizar Correo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayoutAdmin>
  );
};

export default ActualizarDatosGuia;