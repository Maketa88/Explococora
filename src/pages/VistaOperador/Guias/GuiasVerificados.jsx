import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { Mail, Phone, MapPin, Calendar, CheckCircle, User, Settings, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuiasVerificados = () => {
  const navigate = useNavigate();
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  // Función para construir nombre completo
  const construirNombreCompleto = (guiaData) => {
    if (!guiaData) return "Guía";
    
    const primerNombre = guiaData.primerNombre || "";
    const segundoNombre = guiaData.segundoNombre || "";
    const primerApellido = guiaData.primerApellido || "";
    const segundoApellido = guiaData.segundoApellido || "";
    
    return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
  };

  // Función para redirigir a la página de nuevo guía
  const handleAddGuia = () => {
    navigate('/VistaOperador/nuevo-guia');
  };

  useEffect(() => {
    const fetchGuiasVerificados = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
          setLoading(false);
          return;
        }
        
        // Intentar obtener guías verificados
        const response = await axios.get('https://servicio-explococora.onrender.com/guia/todos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          let guiasData = Array.isArray(response.data) ? response.data : [];
          
          // Filtrar solo guías verificados
          const guiasVerificados = guiasData.filter(guia => guia.verificado === true);
          setGuias(guiasVerificados);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener guías verificados:", error);
        setError("Error al cargar los guías verificados. Por favor, intente de nuevo más tarde.");
        setLoading(false);
      }
    };

    fetchGuiasVerificados();
  }, []);

  return (
    <DashboardLayout>
      <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Guías Verificados</h1>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/VistaOperador/perfil')}
              className={`px-3 py-1.5 rounded-md flex items-center ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              <User className="w-4 h-4 mr-1.5" />
              Ver mi perfil
            </button>
            
            <button
              onClick={() => navigate('/VistaOperador/perfil/actualizar')}
              className={`px-3 py-1.5 rounded-md flex items-center ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
            >
              <Settings className="w-4 h-4 mr-1.5" />
              Actualizar perfil
            </button>
            
            <button
              onClick={handleAddGuia}
              className={`px-3 py-1.5 rounded-md flex items-center ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Nuevo guía
            </button>
          </div>
        </div>

        {/* Lista de guías verificados */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
            <p className="text-lg font-medium mb-2">Error al cargar guías verificados</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guias.length > 0 ? (
              guias.map(guia => (
                <div 
                  key={guia.id || guia.cedula} 
                  className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} relative`}
                >
                  {/* Cabecera con imagen */}
                  <div className="h-36 bg-gradient-to-r from-green-500 to-blue-500 relative">
                    <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                      <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-blue-200">
                        {guia.foto ? (
                          <img 
                            src={guia.foto.startsWith('http') ? guia.foto : `https://servicio-explococora.onrender.com/uploads/images/${guia.foto}`} 
                            alt={construirNombreCompleto(guia)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${guia.primerNombre}+${guia.primerApellido}&background=0D8ABC&color=fff&size=128`;
                            }}
                          />
                        ) : (
                          <img 
                            src={`https://ui-avatars.com/api/?name=${guia.primerNombre}+${guia.primerApellido}&background=0D8ABC&color=fff&size=128`} 
                            alt={construirNombreCompleto(guia)}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </div>
                  </div>
                  
                  {/* Información del guía */}
                  <div className="pt-14 p-4">
                    <h3 className="text-xl font-bold flex items-center">
                      {construirNombreCompleto(guia)}
                    </h3>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {guia.especialidad || 'Guía Turístico General'}
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm truncate">{guia.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm">{guia.telefono || guia.numeroCelular || guia.numero_celular || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-sm">{guia.ubicacion || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm">Desde {new Date(guia.fecha_registro || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex justify-between mt-4">
                      <button 
                        onClick={() => navigate(`/VistaOperador/guias/${guia.cedula}`)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                      >
                        Ver detalles
                      </button>
                      <button 
                        onClick={() => navigate(`/VistaOperador/rutas/asignar/${guia.cedula}`)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                      >
                        Asignar ruta
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`col-span-3 text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 mb-4 opacity-30" />
                  <h3 className="text-xl font-semibold mb-2">No hay guías verificados</h3>
                  <p className="mb-6">Aún no se han verificado guías en el sistema.</p>
                  <button 
                    onClick={() => navigate('/VistaOperador/guias')}
                    className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    Ver todos los guías
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GuiasVerificados; 