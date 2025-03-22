import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayoutGuia from "../../../layouts/DashboardLayoutGuia"; // Importando el componente de layout

const PerfilGuia = () => {
  const [guia, setGuia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // Por defecto modo oscuro como en el dashboard
  const [previewFoto, setPreviewFoto] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [loadingCertificados, setLoadingCertificados] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    // Detectar el modo actual del dashboard
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('light')) {
      setDarkMode(false);
    }

    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula || !token) {
      setError("No se encontró la información necesaria para cargar el perfil.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:10101/guia/perfil-completo/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos del guia recibidos:", response.data);
        // Guardar los datos del guía
        setGuia(response.data);
        
        // Verificar si hay una foto en la respuesta del servidor
        const guiaData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (guiaData.foto_perfil) {
          console.log("Foto perfil encontrada:", guiaData.foto_perfil);
          
          // Si la foto comienza con http, es una URL completa
          if (guiaData.foto_perfil.startsWith('http')) {
            setPreviewFoto(guiaData.foto_perfil);
            localStorage.setItem("foto_perfil", guiaData.foto_perfil);
            
            // Emitir evento con la URL completa
            const event = new CustomEvent('fotoPerfilActualizada', { 
              detail: { fotoUrl: guiaData.foto_perfil } 
            });
            window.dispatchEvent(event);
          } 
          // Si la foto no comienza con http, construir la URL completa
          else {
            // Verificar si la ruta ya incluye /uploads/images
            let fotoUrl;
            if (guiaData.foto_perfil.includes('/uploads/images/')) {
              fotoUrl = `http://localhost:10101${guiaData.foto_perfil}`;
            } else {
              fotoUrl = `http://localhost:10101/uploads/images/${guiaData.foto_perfil}`;
            }
            
            console.log("URL de foto construida:", fotoUrl);
            setPreviewFoto(fotoUrl);
            localStorage.setItem("foto_perfil", fotoUrl);
            
            // Notificar a otros componentes que la foto se ha actualizado
            const event = new CustomEvent('fotoPerfilActualizada', { detail: { fotoUrl } });
            window.dispatchEvent(event);
          }
        } 
        // Verificar si hay foto en otros campos posibles
        else if (guiaData.foto) {
          console.log("Foto encontrada en campo 'foto':", guiaData.foto);
          
          let fotoUrl;
          if (guiaData.foto.startsWith('http')) {
            fotoUrl = guiaData.foto;
          } else if (guiaData.foto.includes('/uploads/images/')) {
            fotoUrl = `http://localhost:10101${guiaData.foto}`;
          } else {
            fotoUrl = `http://localhost:10101/uploads/images/${guiaData.foto}`;
          }
          
          console.log("URL de foto construida:", fotoUrl);
          setPreviewFoto(fotoUrl);
          localStorage.setItem("foto_perfil", fotoUrl);
          
          // Notificar a otros componentes que la foto se ha actualizado
          const event = new CustomEvent('fotoPerfilActualizada', { detail: { fotoUrl } });
          window.dispatchEvent(event);
        }
        // Si no hay foto en la respuesta, intentar recuperarla del localStorage
        else {
          const storedFoto = localStorage.getItem("foto_perfil");
          if (storedFoto) {
            console.log("Usando foto desde localStorage");
            setPreviewFoto(storedFoto);
            
            // También notificamos para mantener consistencia
            const event = new CustomEvent('fotoPerfilActualizada', { detail: { fotoUrl: storedFoto } });
            window.dispatchEvent(event);
          }
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar perfil:", error);
        setError(`Error: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      });
      
    // Cargar certificados del guía
    axios.get(`http://localhost:10101/guia/mis-certificados`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Certificados recibidos:", response.data);
      // Asegurarse de que certificados sea un array
      const certificadosData = Array.isArray(response.data) ? response.data : 
                              (response.data && Array.isArray(response.data.certificados)) ? response.data.certificados : [];
      setCertificados(certificadosData);
      setLoadingCertificados(false);
    })
    .catch((error) => {
      console.error("Error al cargar certificados:", error);
      console.error("Detalles del error:", error.response?.data || error.message);
      setLoadingCertificados(false);
    });
  }, []);

  // Función para separar nombre si existe
  const separarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return { nombres: "No disponible", apellidos: "No disponible" };
    
    const partes = nombreCompleto.split(" ");
    const nombres = partes.slice(0, 2).join(" ");
    const apellidos = partes.slice(2).join(" ");
    return { nombres, apellidos };
  };

  // Función para ir a la página de gestión de certificados
  const irAGestionCertificados = () => {
    console.log("Navegando a la página de gestión de certificados...");
    // Prueba con diferentes variantes de la ruta
    navigate("/VistaGuia/CertificadoGuia"); // Sin el segmento "PerfilGuia"
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-emerald-500 to-emerald-700 animate-pulse relative">
              <div className="absolute -bottom-10 sm:-bottom-12 left-5 sm:left-10 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-emerald-300 animate-pulse"></div>
            </div>
            <div className="p-6 sm:p-10 pt-12 sm:pt-16">
              <div className="ml-20 sm:ml-28 h-5 sm:h-6 bg-emerald-100 rounded-full w-32 sm:w-48 mb-2 sm:mb-4 animate-pulse"></div>
              <div className="ml-20 sm:ml-28 h-3 sm:h-4 bg-emerald-50 rounded-full w-24 sm:w-32 mb-8 sm:mb-10 animate-pulse"></div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full">
                <div className="h-40 sm:h-52 bg-emerald-50 rounded-2xl animate-pulse"></div>
                <div className="h-40 sm:h-52 bg-emerald-50 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 text-center max-w-2xl">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-full h-full bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-2xl sm:text-4xl">!</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">Error al cargar el perfil</h2>
            <p className="text-red-500 mb-6 sm:mb-8 px-4 sm:px-6 text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    // Si no hay datos, mostrar un mensaje
    if (!guia) {
      return (
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 text-center max-w-2xl">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-emerald-300 sm:w-12 sm:h-12" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Información no disponible</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">No se encontraron datos del guía.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    
    // Verificamos si guia es un array o un objeto
    const guiaData = Array.isArray(guia) ? guia[0] : guia;
    
    // Extraer nombre
    const nombreCompleto = guiaData.nombre || guiaData.nombre_completo || guiaData.nombre_del_guia || "No disponible";
    const { nombres, apellidos } = separarNombre(nombreCompleto);
    
    // Obtener iniciales para avatar
    const obtenerIniciales = () => {
      if (!nombres) return "G";
      return nombres.charAt(0).toUpperCase();
    };
    
    return (
      <div className="p-3 sm:p-4 md:p-6">
        {/* Card principal con diseño innovador */}
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          {/* Header con estilo moderno */}
          <div className="bg-emerald-600 p-4 sm:p-6 text-white relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 right-20 sm:right-40 w-20 sm:w-40 h-20 sm:h-40 rounded-full bg-emerald-500 opacity-20 blur-xl"></div>
              <div className="absolute bottom-0 right-10 sm:right-20 w-30 sm:w-60 h-30 sm:h-60 rounded-full bg-emerald-400 opacity-10 blur-2xl"></div>
              <div className="absolute top-5 left-1/2 w-10 sm:w-20 h-10 sm:h-20 rounded-full bg-emerald-300 opacity-20 blur-md"></div>
            </div>
            
            {/* Título con estilo */}
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Mi Perfil</h1>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
              {/* Columna izquierda: Foto y datos básicos */}
              <div className="w-full lg:w-1/3">
                {/* Tarjeta de perfil con efectos visuales */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6 transform hover:scale-[1.01] transition-all duration-300">
                  {/* Foto de perfil con efecto glowing */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative bg-white rounded-full overflow-hidden w-full h-full border-4 border-white">
                        {previewFoto ? (
                          <img
                            src={previewFoto}
                            alt="Foto de perfil"
                            className="h-full w-full object-cover rounded-full"
                            onError={(e) => {
                              console.error("Error al cargar la imagen:", e);
                              e.target.onerror = null;
                              // Fallback a avatar generado
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=059669&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl sm:text-5xl font-bold rounded-full">
                            {obtenerIniciales()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Nombre y cargo con espaciado mejorado */}
                    <div className="mt-3 sm:mt-4">
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        {nombres} {apellidos}
                      </h2>
                      <div className="flex items-center justify-center mt-1">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium">
                          Guía Turístico
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Datos de contacto con iconos y mejores espaciados */}
                  <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-emerald-700 font-medium">Correo Electrónico</p>
                        <p className="text-gray-700 text-xs sm:text-sm truncate">{guiaData.email || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Teléfono</p>
                        <p className="text-gray-700 text-xs sm:text-sm">{guiaData.telefono || "No disponible"}</p>
                      </div>
                    </div>
                    
                    {/* Cédula del guía */}
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Cédula</p>
                        <p className="text-gray-700 text-xs sm:text-sm">{guiaData.cedula || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones con diseño mejorado */}
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => navigate("/VistaGuia/ActualizarGuia")}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-200/50 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Editar información
                    </button>
                    <button 
                      onClick={() => navigate("/VistaGuia/CambiarContraseña")}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-emerald-600 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-200/50 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                      Cambiar contraseña
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Columna derecha: Información detallada */}
              <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
                {/* Tarjeta de información personal */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                      Información Personal
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Nombre</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{nombres || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Apellidos</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{apellidos || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Cédula</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{guiaData.cedula || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Teléfono</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{guiaData.telefono || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group sm:col-span-2">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Descripción</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{guiaData.descripcion || "No hay descripción disponible."}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tarjeta de estadísticas */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                      Estadísticas
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-xl shadow-md">
                      <h4 className="text-xs text-emerald-100 font-medium uppercase mb-1">Rutas completadas</h4>
                      <p className="text-2xl font-bold text-white">127</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-xl shadow-md">
                      <h4 className="text-xs text-emerald-100 font-medium uppercase mb-1">Valoración media</h4>
                      <p className="text-2xl font-bold text-white">4.8/5.0</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-xl shadow-md">
                      <h4 className="text-xs text-emerald-100 font-medium uppercase mb-1">Clientes atendidos</h4>
                      <p className="text-2xl font-bold text-white">350+</p>
                    </div>
                  </div>
                </div>
                
                {/* Tarjeta de certificados */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between mb-3 sm:mb-5 gap-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 15v4a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                        Mis Certificados
                      </h3>
                    </div>
                    <button 
                      onClick={() => {
                        console.log("Botón 'Gestionar Certificados' clickeado");
                        navigate("/VistaGuia/CertificadoGuia");
                      }}
                      className="py-1.5 sm:py-2 px-3 sm:px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Gestionar Certificados
                    </button>
                  </div>
                  
                  {loadingCertificados ? (
                    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-emerald-50 rounded-xl h-24 sm:h-28"></div>
                      ))}
                    </div>
                  ) : !certificados || certificados.length === 0 ? (
                    <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                      </div>
                      <h4 className="text-sm sm:text-base font-medium text-emerald-800 mb-1">No tienes certificados registrados</h4>
                      <p className="text-xs sm:text-sm text-emerald-600 mb-3">Añade tus certificados profesionales para destacar tus habilidades</p>
                      <button 
                        onClick={() => navigate("/VistaGuia/CertificadoGuia")}
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                        Añadir certificado
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {certificados.slice(0, 3).map((cert) => (
                        <div key={cert.id} className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-emerald-800 text-sm flex-1 truncate">{cert.nombre}</h4>
                            <div className="text-xs px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                              PDF
                            </div>
                          </div>
                          <p className="text-xs text-emerald-700 line-clamp-2 mb-2">
                            {cert.descripcion || "Sin descripción"}
                          </p>
                          <p className="text-xs text-emerald-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                            {new Date(cert.fechaSubida || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      
                      {certificados.length > 3 && (
                        <div 
                          className="bg-emerald-50 hover:bg-emerald-100 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={() => navigate("/VistaGuia/CertificadoGuia")}
                        >
                          <div className="text-center">
                            <p className="font-semibold text-emerald-700 text-lg">
                              +{certificados.length - 3}
                            </p>
                            <p className="text-xs text-emerald-500">Ver todos</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Botón para ir al Dashboard */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button 
                onClick={() => navigate("/VistaGuia/Dashboard")}
                className="py-2 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-gray-200 to-gray-100 hover:from-gray-300 hover:to-gray-200 rounded-xl text-gray-700 font-medium flex items-center gap-2 transition-all duration-300 shadow-lg shadow-gray-200/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Envolver todo el componente con DashboardLayoutGuia
  return (
    <DashboardLayoutGuia>
      {renderContenido()}
    </DashboardLayoutGuia>
  );
};

export default PerfilGuia;