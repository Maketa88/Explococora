import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaTrash, FaFileDownload, FaPlus, FaArrowLeft } from 'react-icons/fa';
import DashboardLayoutGuia from "../../../layouts/DashboardLayoutGuia";
import { useNavigate } from 'react-router-dom';

const CertificadoGuia = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [fileName, setFileName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [certificadoToDelete, setCertificadoToDelete] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar el modo actual del dashboard
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('light')) {
      setDarkMode(false);
    }
    
    fetchCertificados();
  }, []);

  const fetchCertificados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get('https://servicio-explococora.onrender.com/guia/mis-certificados', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Respuesta de certificados:", response.data);
      
      const certificadosData = Array.isArray(response.data) ? response.data : 
                              (response.data && Array.isArray(response.data.certificados)) ? response.data.certificados : [];
      
      setCertificados(certificadosData);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener certificados:', error);
      toast.error('Error al cargar los certificados');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Por favor seleccione un archivo');
      return;
    }

    if (!nombre.trim()) {
      toast.error('El nombre del certificado es requerido');
      return;
    }

    const formData = new FormData();
    formData.append('certificado', file);
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      
      await axios.post('https://servicio-explococora.onrender.com/guia/subir-certificado', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Certificado subido exitosamente');
      setFile(null);
      setFileName('');
      setNombre('');
      setDescripcion('');
      fetchCertificados();
      setUploading(false);
    } catch (error) {
      console.error('Error al subir certificado:', error);
      toast.error('Error al subir el certificado');
      setUploading(false);
    }
  };

  const handleDeleteConfirmation = (idCertificado) => {
    setCertificadoToDelete(idCertificado);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(`https://servicio-explococora.onrender.com/guia/certificado/${certificadoToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Certificado eliminado exitosamente');
      fetchCertificados();
      setModalVisible(false);
    } catch (error) {
      console.error('Error al eliminar certificado:', error);
      toast.error('Error al eliminar el certificado');
    }
  };

  const handleDownload = async (urlArchivo, nombre) => {
    try {
      console.log("Iniciando descarga del certificado:", urlArchivo);
      
      // Si la URL es relativa, convertirla a absoluta
      const fullUrl = urlArchivo.startsWith('http') 
        ? urlArchivo 
        : `https://servicio-explococora.onrender.com${urlArchivo.startsWith('/') ? '' : '/'}${urlArchivo}`;
      
      console.log("URL completa para descarga:", fullUrl);
      
      // Verificar si es una URL de Azure Blob Storage
      const isAzureBlob = fullUrl.includes('blob.core.windows.net');
      
      // Obtener el token para la autorización
      const token = localStorage.getItem("token");
      
      if (isAzureBlob) {
        // Para Azure Blob Storage, usamos una aproximación diferente
        // Primero intentamos abrir en una nueva pestaña
        window.open(fullUrl, '_blank');
        toast.success('Certificado abierto en una nueva pestaña');
        return;
      }
      
      // Para otros casos, usamos el enfoque de blob
      const response = await axios.get(fullUrl, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/pdf',
          'Cache-Control': 'no-cache'
        },
        // No usar withCredentials para evitar problemas CORS
        withCredentials: false
      });
      
      // Crear un objeto URL para el blob
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      }));
      
      // Crear un elemento de enlace temporal
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${nombre}.pdf`);
      
      // Añadir el enlace al documento, hacer clic y luego eliminarlo
      document.body.appendChild(link);
      link.click();
      
      // Limpiar después de la descarga
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 100);
      
      toast.success('Certificado descargado exitosamente');
    } catch (error) {
      console.error('Error al descargar el certificado:', error);
      
      // Si es un error CORS, intentamos abrir directamente
      if (error.message === 'Network Error') {
        try {
          const fullUrl = urlArchivo.startsWith('http') 
            ? urlArchivo 
            : `https://servicio-explococora.onrender.com${urlArchivo.startsWith('/') ? '' : '/'}${urlArchivo}`;
          
          window.open(fullUrl, '_blank');
          toast.info('Abriendo certificado en una nueva pestaña');
          return;
        } catch (e) {
          console.error('Error al abrir en nueva pestaña:', e);
        }
      }
      
      toast.error('Error al descargar el certificado. Intente más tarde.');
    }
  };

  const renderContent = () => {
    return (
      <div className="p-3 sm:p-6">
        {/* Modal de confirmación de eliminación */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Confirmar eliminación</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  ¿Está seguro que desea eliminar este certificado? Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setModalVisible(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all shadow-lg hover:shadow-red-200/50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
            
            {/* Título y botón de volver */}
            <div className="relative flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Mis Certificados</h1>
              <button 
                onClick={() => navigate('/VistaGuia/PerfilGuia')}
                className="flex items-center gap-2 py-2 px-3 sm:px-4 bg-emerald-700/60 hover:bg-emerald-700/80 rounded-lg text-white text-sm transition-colors shadow-lg"
              >
                <FaArrowLeft className="w-3.5 h-3.5" /> Volver al Perfil
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4 sm:p-6">
            {/* Sección de carga de certificados */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-6 sm:mb-8">
              <div className="flex items-center mb-4 sm:mb-5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 15v4a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                  Subir Nuevo Certificado
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="nombre" className="block mb-1.5 text-sm font-medium text-emerald-700">
                      Nombre del Certificado*
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Certificado de Inglés"
                      className="w-full p-2.5 sm:p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-900 placeholder-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="descripcion" className="block mb-1.5 text-sm font-medium text-emerald-700">
                      Descripción
                    </label>
                    <textarea
                      id="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Ej: Nivel B2 de Cambridge"
                      className="w-full p-2.5 sm:p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-900 placeholder-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[85px]"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="certificado" className="block mb-1.5 text-sm font-medium text-emerald-700">
                    Archivo PDF*
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50/70">
                    <input
                      type="file"
                      id="certificado"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label 
                      htmlFor="certificado" 
                      className="cursor-pointer py-2 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                    >
                      <FaPlus className="w-3.5 h-3.5" /> Seleccionar archivo
                    </label>
                    <span className="ml-2 truncate text-sm text-emerald-700 flex-1">
                      {fileName || 'Ningún archivo seleccionado'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-emerald-200/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-600 disabled:hover:to-emerald-500"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <FaPlus className="w-3.5 h-3.5" /> Subir Certificado
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Sección de certificados actuales */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4 sm:mb-5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                  Certificados Actuales
                </h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : !Array.isArray(certificados) || certificados.length === 0 ? (
                <div className="bg-emerald-50 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                  </div>
                  <h4 className="text-lg font-semibold text-emerald-700 mb-2">No tienes certificados registrados</h4>
                  <p className="text-emerald-600 mb-4">Utiliza el formulario de arriba para subir tu primer certificado</p>
                  <div className="w-16 h-1 bg-emerald-200 mx-auto rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificados.map((cert) => (
                    <div 
                      key={cert.id} 
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-200/50 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-emerald-800 text-lg line-clamp-1">{cert.nombre}</h4>
                        <div className="text-xs px-2 py-1 rounded-full bg-emerald-200 text-emerald-800 font-medium">
                          PDF
                        </div>
                      </div>
                      
                      <p className="text-sm text-emerald-700 mb-3 line-clamp-2 min-h-[40px]">
                        {cert.descripcion || "Sin descripción"}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-emerald-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                          {new Date(cert.fechaSubida || Date.now()).toLocaleDateString()}
                        </p>
                        
                        <div className="flex gap-2">
                          <button 
                            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md hover:shadow-lg"
                            onClick={() => handleDownload(cert.urlArchivo, cert.nombre)}
                            title="Descargar certificado"
                          >
                            <FaFileDownload className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md hover:shadow-lg"
                            onClick={() => handleDeleteConfirmation(cert.id)}
                            title="Eliminar certificado"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayoutGuia>
      {renderContent()}
    </DashboardLayoutGuia>
  );
};

export default CertificadoGuia;
