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
        <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-emerald-100">
          <div className="animate-pulse">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 h-32 w-32 mb-4"></div>
            </div>
            <div className="h-4 bg-emerald-100 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-emerald-100 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-emerald-100 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-emerald-100">
          <p className="text-xl font-semibold mb-2 text-red-500">Error al cargar el perfil</p>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    // Si no hay datos, mostrar un mensaje
    if (!guia) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-emerald-100">
          <p className="text-gray-700">No se encontraron datos del guía.</p>
        </div>
      );
    }
    
    // Verificamos si guia es un array o un objeto
    const guiaData = Array.isArray(guia) ? guia[0] : guia;
    
    // Extraer nombre
    const nombreCompleto = guiaData.nombre || guiaData.nombre_completo || guiaData.nombre_del_guia || "No disponible";
    const { nombres, apellidos } = separarNombre(nombreCompleto);
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg border border-emerald-100">
        <h2 className="text-2xl font-bold mb-6 text-emerald-800">Perfil del Guía</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen de perfil */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-emerald-500">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error("Error al cargar la imagen:", e);
                    e.target.onerror = null;
                    // Intentar cargar desde localStorage como respaldo
                    const storedFoto = localStorage.getItem("foto_perfil");
                    if (storedFoto && storedFoto !== previewFoto) {
                      e.target.src = storedFoto;
                    } else {
                      // Fallback a avatar generado
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=059669&color=fff`;
                    }
                  }}
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=059669&color=fff`}
                  alt="Perfil del guía"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <button 
              onClick={() => navigate("/VistaGuia/ActualizarGuia")}
              className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200">
              Cambiar foto
            </button>
          </div>
          
          {/* Información personal */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="bg-white p-3 rounded-lg shadow-md border border-emerald-100">
                <h3 className="text-sm uppercase mb-1 font-weight.bold text-emerald-400">Nombre</h3>
                <p className="text-lg font-medium text-gray-700">{nombres}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-md border border-emerald-100">
                <h3 className="text-sm uppercase mb-1 font-weight.bold text-emerald-400">Apellidos</h3>
                <p className="text-lg font-medium text-gray-700">{apellidos}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-md border border-emerald-100">
                <h3 className="text-sm uppercase mb-1 text-emerald-400">Cédula</h3>
                <p className="text-lg font-medium text-gray-700">{guiaData.cedula || "No disponible"}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-md border border-emerald-100">
                <h3 className="text-sm bold uppercase mb-1 text-emerald-400">Correo electrónico</h3>
                <p className="text-lg font-medium text-gray-700">{guiaData.email || "No disponible"}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-md border border-emerald-100">
                <h3 className="text-sm uppercase mb-1 text-emerald-400">Teléfono</h3>
                <p className="text-lg font-medium text-gray-700">{guiaData.telefono || "No disponible"}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-md border border-emerald-100">
                <h3 className="text-sm uppercase mb-1 text-emerald-400">Descripción</h3>
                <p className="text-lg font-medium text-gray-700">{guiaData.descripcion || "No hay descripción disponible."}</p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={() => navigate("/VistaGuia/ActualizarGuia")}
                className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200">
                Actualizar información
              </button>
              <button 
                onClick={() => navigate("/VistaGuia/CambiarContraseña")}
                className="py-2 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-colors duration-200"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4 text-emerald-800">Estadísticas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg shadow-md bg-emerald-100">
              <h4 className="text-sm uppercase mb-1 text-emerald-300">Rutas completadas</h4>
              <p className="text-2xl font-bold text-emerald-700">127</p>
            </div>
            
            <div className="p-4 rounded-lg shadow-md bg-emerald-100">
              <h4 className="text-sm uppercase mb-1 text-emerald-300">Valoración media</h4>
              <p className="text-2xl font-bold text-emerald-700">4.8/5.0</p>
            </div>
            
            <div className="p-4 rounded-lg shadow-md bg-emerald-100">
              <h4 className="text-sm uppercase mb-1 text-emerald-300">Clientes atendidos</h4>
              <p className="text-2xl font-bold text-emerald-700">350+</p>
            </div>
          </div>
        </div>
        
        {/* Sección de certificados */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-teal-800'}`}>Mis Certificados</h3>
            <button 
              onClick={() => {
                console.log("Botón 'Gestionar Certificados' clickeado");
                navigate("/VistaGuia/CertificadoGuia"); // Ruta ajustada
              }}
              className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white font-medium transition-colors duration-200 flex items-center gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Gestionar Certificados
            </button>
          </div>
          
          {loadingCertificados ? (
            <div className="animate-pulse flex space-x-4 overflow-x-auto py-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="min-w-[250px] h-32 bg-teal-800/50 rounded-lg"></div>
              ))}
            </div>
          ) : !Array.isArray(certificados) || certificados.length === 0 ? (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-teal-800/50' : 'bg-teal-100'} text-center`}>
              <p className={darkMode ? 'text-teal-200' : 'text-teal-700'}>No tienes certificados registrados</p>
              <button 
                onClick={() => {
                  console.log("Botón 'Añadir certificado' clickeado");
                  navigate("/VistaGuia/CertificadoGuia"); // Ruta ajustada
                }}
                className={`mt-2 py-1 px-3 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white text-sm transition-colors duration-200`}
              >
                Añadir certificado
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-4">
                {Array.isArray(certificados) && certificados.slice(0, 3).map((cert) => (
                  <div key={cert.id} className={`min-w-[250px] p-4 rounded-lg shadow-md ${darkMode ? 'bg-teal-800/70' : 'bg-teal-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-teal-800'}`}>{cert.nombre}</h4>
                      <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-teal-700 text-teal-200' : 'bg-teal-200 text-teal-800'}`}>
                        PDF
                      </div>
                    </div>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                      {cert.descripcion || "Sin descripción"}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      Subido: {new Date(cert.fechaSubida || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                
                {Array.isArray(certificados) && certificados.length > 3 && (
                  <div 
                    className={`min-w-[100px] flex items-center justify-center p-4 rounded-lg cursor-pointer ${darkMode ? 'bg-teal-800/30 hover:bg-teal-800/50' : 'bg-teal-50 hover:bg-teal-100'}`}
                    onClick={irAGestionCertificados}
                  >
                    <div className="text-center">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-teal-800'}`}>
                        +{certificados.length - 3}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-teal-300' : 'text-teal-600'}`}>Ver todos</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Botón para ir al Dashboard en lugar de "Volver" */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => navigate("/VistaGuia/Dashboard")}
            className="py-2 px-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Ir al Dashboard
          </button>
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