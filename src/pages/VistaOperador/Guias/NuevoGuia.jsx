import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../../layouts/DashboardLayout';

const NuevoGuia = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    especialidad: '',
    idiomas: '',
    experiencia: '',
    foto: null
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        foto: file
      });
      
      // Crear URL para previsualización
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar archivos
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
      
      // Enviar datos al servidor
      await axios.post('http://localhost:10101/guias/registrar', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      
      // Redireccionar después de 2 segundos
      setTimeout(() => {
        navigate('/VistaOperador/guias');
      }, 2000);
      
    } catch (err) {
      console.error("Error al registrar guía:", err);
      setError(err.response?.data?.message || "Error al registrar el guía. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Registrar Nuevo Guía
        </h2>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">¡Éxito! </strong>
            <span className="block sm:inline">El guía ha sido registrado correctamente.</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cédula *
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Especialidad
              </label>
              <input
                type="text"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Idiomas (separados por coma)
              </label>
              <input
                type="text"
                name="idiomas"
                value={formData.idiomas}
                onChange={handleChange}
                placeholder="Español, Inglés, Francés..."
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Años de experiencia
              </label>
              <input
                type="number"
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Foto de perfil
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                />
                {previewUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/VistaOperador/guias')}
              className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registrando...' : 'Registrar Guía'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NuevoGuia; 