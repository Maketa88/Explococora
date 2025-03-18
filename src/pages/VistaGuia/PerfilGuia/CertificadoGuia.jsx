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
      
      const response = await axios.get('http://localhost:10101/guia/mis-certificados', {
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
      
      await axios.post('http://localhost:10101/guia/subir-certificado', formData, {
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

  const handleDelete = async (idCertificado) => {
    if (window.confirm('¿Está seguro que desea eliminar este certificado?')) {
      try {
        const token = localStorage.getItem("token");
        
        await axios.delete(`http://localhost:10101/guia/certificado/${idCertificado}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success('Certificado eliminado exitosamente');
        fetchCertificados();
      } catch (error) {
        console.error('Error al eliminar certificado:', error);
        toast.error('Error al eliminar el certificado');
      }
    }
  };

  const handleDownload = async (urlArchivo, nombre) => {
    try {
      console.log("Iniciando descarga del certificado:", urlArchivo);
      
      // Si la URL es relativa, convertirla a absoluta
      const fullUrl = urlArchivo.startsWith('http') 
        ? urlArchivo 
        : `http://localhost:10101${urlArchivo.startsWith('/') ? '' : '/'}${urlArchivo}`;
      
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
            : `http://localhost:10101${urlArchivo.startsWith('/') ? '' : '/'}${urlArchivo}`;
          
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
      <div className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-teal-900' : 'bg-teal-50'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-teal-800'}`}>Mis Certificados</h2>
          <button 
            onClick={() => navigate('/VistaGuia/PerfilGuia')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg ${darkMode ? 'bg-teal-700 hover:bg-teal-600' : 'bg-teal-200 hover:bg-teal-300'} ${darkMode ? 'text-white' : 'text-teal-800'} transition-colors`}
          >
            <FaArrowLeft /> Volver al Perfil
          </button>
        </div>
        
        <div className={`mb-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-teal-800/70' : 'bg-white'}`}>
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-teal-200' : 'text-teal-700'}`}>Subir Nuevo Certificado</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className={`block mb-2 font-medium ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Nombre del Certificado*
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Certificado de Inglés"
                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-teal-700/50 border-teal-600 text-white placeholder-teal-400' : 'bg-teal-50 border-teal-200 text-teal-900 placeholder-teal-500'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-teal-500' : 'focus:ring-teal-400'}`}
                required
              />
            </div>
            
            <div>
              <label htmlFor="descripcion" className={`block mb-2 font-medium ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Nivel B2 de Cambridge"
                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-teal-700/50 border-teal-600 text-white placeholder-teal-400' : 'bg-teal-50 border-teal-200 text-teal-900 placeholder-teal-500'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-teal-500' : 'focus:ring-teal-400'} min-h-[100px]`}
              />
            </div>
            
            <div>
              <label htmlFor="certificado" className={`block mb-2 font-medium ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                Archivo PDF*
              </label>
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${darkMode ? 'bg-teal-700/50 border-teal-600' : 'bg-teal-50 border-teal-200'}`}>
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
                  className={`cursor-pointer py-2 px-4 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-teal-500 hover:bg-teal-400 text-white'} transition-colors flex items-center gap-2`}
                >
                  <FaPlus /> Seleccionar archivo
                </label>
                <span className={`ml-2 truncate ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                  {fileName || 'Ningún archivo seleccionado'}
                </span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`py-3 px-6 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-500 hover:bg-teal-400'} text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  <FaPlus /> Subir Certificado
                </>
              )}
            </button>
          </form>
        </div>
        
        <div>
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-teal-200' : 'text-teal-700'}`}>Certificados Actuales</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : !Array.isArray(certificados) || certificados.length === 0 ? (
            <div className={`p-8 rounded-lg ${darkMode ? 'bg-teal-800/50' : 'bg-teal-100'} text-center`}>
              <p className={`text-lg ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>No tienes certificados registrados</p>
              <p className={`mt-2 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Utiliza el formulario de arriba para subir tu primer certificado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificados.map((cert) => (
                <div 
                  key={cert.id} 
                  className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-teal-800/70 hover:bg-teal-800/90' : 'bg-white hover:bg-teal-50'} transition-colors`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-teal-800'}`}>{cert.nombre}</h4>
                    <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-teal-700 text-teal-200' : 'bg-teal-200 text-teal-800'}`}>
                      PDF
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-3 ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                    {cert.descripcion || "Sin descripción"}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <p className={`text-xs ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      Subido: {new Date(cert.fechaSubida || Date.now()).toLocaleDateString()}
                    </p>
                    
                    <div className="flex gap-2">
                      <button 
                        className={`p-2 rounded-full ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'} text-white transition-colors`}
                        onClick={() => handleDownload(cert.urlArchivo, cert.nombre)}
                        title="Descargar certificado"
                      >
                        <FaFileDownload />
                      </button>
                      <button 
                        className={`p-2 rounded-full ${darkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-400'} text-white transition-colors`}
                        onClick={() => handleDelete(cert.id)}
                        title="Eliminar certificado"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
