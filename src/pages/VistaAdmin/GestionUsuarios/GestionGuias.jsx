import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { toast } from 'react-toastify';
import { Search, Filter, RefreshCw, UserPlus, CheckCircle, XCircle, Briefcase, Calendar, Mail, Phone, MapPin, Star, CreditCard } from 'lucide-react';

const GestionGuias = () => {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentGuia, setCurrentGuia] = useState(null);
  const [formData, setFormData] = useState({
    cedula: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    contrasenia: '',
    confirmacionContrasenia: '',
    foto: null,
    fotoPreview: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Replace the placeholder with a Base64 encoded image
  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiM2QjcyODAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjRkZGRkZGIj5ObyBGb3RvPC90ZXh0Pjwvc3ZnPg==";
  const logoExplococora = '/src/assets/Images/logo.webp'; // Ajusta esta ruta según sea necesario

  // Fetch all guides
  const fetchGuias = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make sure we're using the exact endpoint from your API
      const response = await axios.get('http://localhost:10101/guia/todos');
      console.log('API response:', response.data); // Debug response
      
      // Ensure guias is always an array
      if (Array.isArray(response.data)) {
        // Map API response fields to the expected structure
        const mappedGuias = response.data.map(guia => {
          // Process name fields
          let primerNombre = '';
          let segundoNombre = '';
          let primerApellido = '';
          let segundoApellido = '';
          
          // Handle case where we have separate name fields
          if (guia.primer_nombre) {
            primerNombre = guia.primer_nombre;
          }
          
          if (guia.segundo_nombre) {
            segundoNombre = guia.segundo_nombre;
          }
          
          if (guia.primer_apellido) {
            primerApellido = guia.primer_apellido;
          }
          
          if (guia.segundo_apellido) {
            segundoApellido = guia.segundo_apellido;
          }
          
          // Handle case where we have combined nombres field
          if (guia.nombres && !primerNombre) {
            const partesNombres = guia.nombres.split(' ');
            primerNombre = partesNombres[0] || '';
            segundoNombre = partesNombres.slice(1).join(' ') || '';
          }
          
          // Handle case where we have combined apellidos field
          if (guia.apellidos && !primerApellido) {
            const partesApellidos = guia.apellidos.split(' ');
            primerApellido = partesApellidos[0] || '';
            segundoApellido = partesApellidos.slice(1).join(' ') || '';
          }
          
          // If we have a full name but no separated parts
          if (guia.nombre_del_guia && !primerNombre && !primerApellido) {
            const partesNombre = guia.nombre_del_guia.split(' ');
            
            if (partesNombre.length === 4) {
              // Assume format: primer_nombre segundo_nombre primer_apellido segundo_apellido
              primerNombre = partesNombre[0];
              segundoNombre = partesNombre[1];
              primerApellido = partesNombre[2];
              segundoApellido = partesNombre[3];
            } else if (partesNombre.length === 3) {
              // Assume format: primer_nombre segundo_nombre primer_apellido
              primerNombre = partesNombre[0];
              segundoNombre = partesNombre[1];
              primerApellido = partesNombre[2];
            } else if (partesNombre.length === 2) {
              // Assume format: primer_nombre primer_apellido
              primerNombre = partesNombre[0];
              primerApellido = partesNombre[1];
            } else if (partesNombre.length === 1) {
              primerNombre = partesNombre[0];
            }
          }
          
          return {
            ...guia,
            primerNombre: primerNombre,
            segundoNombre: segundoNombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            // Keep combined fields for compatibility
            nombres: primerNombre + (segundoNombre ? ' ' + segundoNombre : ''),
            apellidos: primerApellido + (segundoApellido ? ' ' + segundoApellido : ''),
            telefono: guia.telefono || guia.celular || guia.phone || '',
            email: guia.email || '',
            cedula: guia.cedula || guia.id || '',
            direccion: guia.direccion || '',
            fechaNacimiento: guia.fechaNacimiento || guia.fecha_nacimiento || ''
          };
        });
        
        console.log('Mapped guides:', mappedGuias); // Debug the mapped data
        setGuias(mappedGuias);
      } else if (response.data && typeof response.data === 'object') {
        // Handle different response formats
        const guiasArray = response.data.guias || response.data.data || Object.values(response.data);
        if (Array.isArray(guiasArray)) {
          // Apply the same mapping logic
          const mappedGuias = guiasArray.map(guia => {
            // Process name fields
            let primerNombre = '';
            let segundoNombre = '';
            let primerApellido = '';
            let segundoApellido = '';
            
            // Handle case where we have separate name fields
            if (guia.primer_nombre) {
              primerNombre = guia.primer_nombre;
            }
            
            if (guia.segundo_nombre) {
              segundoNombre = guia.segundo_nombre;
            }
            
            if (guia.primer_apellido) {
              primerApellido = guia.primer_apellido;
            }
            
            if (guia.segundo_apellido) {
              segundoApellido = guia.segundo_apellido;
            }
            
            // Handle case where we have combined nombres field
            if (guia.nombres && !primerNombre) {
              const partesNombres = guia.nombres.split(' ');
              primerNombre = partesNombres[0] || '';
              segundoNombre = partesNombres.slice(1).join(' ') || '';
            }
            
            // Handle case where we have combined apellidos field
            if (guia.apellidos && !primerApellido) {
              const partesApellidos = guia.apellidos.split(' ');
              primerApellido = partesApellidos[0] || '';
              segundoApellido = partesApellidos.slice(1).join(' ') || '';
            }
            
            // If we have a full name but no separated parts
            if (guia.nombre_del_guia && !primerNombre && !primerApellido) {
              const partesNombre = guia.nombre_del_guia.split(' ');
              
              if (partesNombre.length === 4) {
                // Assume format: primer_nombre segundo_nombre primer_apellido segundo_apellido
                primerNombre = partesNombre[0];
                segundoNombre = partesNombre[1];
                primerApellido = partesNombre[2];
                segundoApellido = partesNombre[3];
              } else if (partesNombre.length === 3) {
                // Assume format: primer_nombre segundo_nombre primer_apellido
                primerNombre = partesNombre[0];
                segundoNombre = partesNombre[1];
                primerApellido = partesNombre[2];
              } else if (partesNombre.length === 2) {
                // Assume format: primer_nombre primer_apellido
                primerNombre = partesNombre[0];
                primerApellido = partesNombre[1];
              } else if (partesNombre.length === 1) {
                primerNombre = partesNombre[0];
              }
            }
            
            return {
              ...guia,
              primerNombre: primerNombre,
              segundoNombre: segundoNombre,
              primerApellido: primerApellido,
              segundoApellido: segundoApellido,
              // Keep combined fields for compatibility
              nombres: primerNombre + (segundoNombre ? ' ' + segundoNombre : ''),
              apellidos: primerApellido + (segundoApellido ? ' ' + segundoApellido : ''),
              telefono: guia.telefono || guia.celular || guia.phone || '',
              email: guia.email || '',
              cedula: guia.cedula || guia.id || '',
              direccion: guia.direccion || '',
              fechaNacimiento: guia.fechaNacimiento || guia.fecha_nacimiento || ''
            };
          });
          
          setGuias(mappedGuias);
        } else {
          setGuias([]);
          console.error('Unexpected API response format:', response.data);
        }
      } else {
        setGuias([]);
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
      setError(error.response?.data?.message || "Error al cargar los guías");
      setGuias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuias();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input for photo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        foto: file,
        fotoPreview: URL.createObjectURL(file)
      });
    }
  };

  // Open modal for creating a new guide
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      cedula: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      email: '',
      telefono: '',
      fechaNacimiento: '',
      direccion: '',
      contrasenia: '',
      confirmacionContrasenia: '',
      foto: null,
      fotoPreview: '',
    });
    setShowModal(true);
  };

  // Open modal for editing guide
  const handleEdit = (guia) => {
    setIsEditing(true);
    setCurrentGuia(guia);
    setFormData({
      cedula: guia.cedula,
      primerNombre: guia.primerNombre || '',
      segundoNombre: guia.segundoNombre || '',
      primerApellido: guia.primerApellido || '',
      segundoApellido: guia.segundoApellido || '',
      email: guia.email || '',
      telefono: guia.telefono || '',
      fechaNacimiento: guia.fechaNacimiento ? guia.fechaNacimiento.split('T')[0] : '',
      direccion: guia.direccion || '',
      contrasenia: '',
      confirmacionContrasenia: '',
      foto: null,
      fotoPreview: guia.foto || '',
    });
    setShowModal(true);
  };

  // Open view modal for guide details
  const handleView = async (cedula) => {
    try {
      setShowViewModal(true);
      
      // Instead of using the profile-specific endpoint that might be restricted,
      // let's use the data we already have for basic viewing
      const guiaFound = guias.find(g => g.cedula === cedula);
      
      if (guiaFound) {
        setCurrentGuia(guiaFound);
      } else {
        // Try a more generic endpoint first
        try {
          const response = await axios.get(`http://localhost:10101/guia/${cedula}`);
          setCurrentGuia(response.data);
        } catch (detailError) {
          console.error('Error fetching specific guide details:', detailError);
          
          // If that fails, try the original endpoint as fallback
          try {
            const response = await axios.get(`http://localhost:10101/guia/perfil-completo/${cedula}`);
            setCurrentGuia(response.data);
          } catch (fallbackError) {
            console.error('Error with fallback endpoint:', fallbackError);
            toast.error('No se pudo cargar información detallada del guía');
          }
        }
      }
    } catch (error) {
      console.error('Error in view handler:', error);
      toast.error('Error al cargar los detalles del guía');
    }
  };

  // Open delete confirmation modal
  const handleDeleteConfirm = (guia) => {
    setCurrentGuia(guia);
    setShowDeleteModal(true);
  };

  // Submit form for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData object to handle file uploads
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('cedula', formData.cedula);
      formDataToSend.append('primerNombre', formData.primerNombre);
      formDataToSend.append('segundoNombre', formData.segundoNombre);
      formDataToSend.append('primerApellido', formData.primerApellido);
      formDataToSend.append('segundoApellido', formData.segundoApellido);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('fechaNacimiento', formData.fechaNacimiento);
      formDataToSend.append('direccion', formData.direccion);
      
      // Add combined name fields for compatibility
      formDataToSend.append('nombres', formData.primerNombre + (formData.segundoNombre ? ' ' + formData.segundoNombre : ''));
      formDataToSend.append('apellidos', formData.primerApellido + (formData.segundoApellido ? ' ' + formData.segundoApellido : ''));
      
      // Only append password if provided (for new users or password changes)
      if (formData.contrasenia) {
        formDataToSend.append('contrasenia', formData.contrasenia);
      }
      
      // Only append the photo if a new one was selected
      if (formData.foto) {
        formDataToSend.append('foto', formData.foto);
      }
      
      if (isEditing) {
        // Update existing guide
        await axios.patch(`http://localhost:10101/guia/actualizar/${formData.cedula}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Guía actualizado correctamente');
      } else {
        // Create new guide
        await axios.post('http://localhost:10101/guia/crear', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Guía creado correctamente');
      }
      
      setShowModal(false);
      fetchGuias(); // Refresh the list
    } catch (error) {
      console.error('Error saving guide:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el guía');
    }
  };

  // Delete guide
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:10101/guia/eliminar/${currentGuia.cedula}`);
      toast.success('Guía eliminado correctamente');
      setShowDeleteModal(false);
      fetchGuias(); // Refresh the list
    } catch (error) {
      console.error('Error deleting guide:', error);
      toast.error('Error al eliminar el guía');
    }
  };

  // Función auxiliar para construir nombre completo
  const construirNombreCompleto = (guia) => {
    if (!guia) return "Guía";
    
    const primerNombre = guia.primerNombre || "";
    const segundoNombre = guia.segundoNombre || "";
    const primerApellido = guia.primerApellido || "";
    const segundoApellido = guia.segundoApellido || "";
    
    return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
  };

  // Implementación del buscador y filtros
  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda se aplica instantáneamente
  };

  // Función para manejar el cambio de estado de un guía
  const handleCambioEstado = async (cedula, nuevoEstado) => {
    try {
      console.log(`Intentando cambiar estado: ${cedula} a ${nuevoEstado}`);
      
      // Get the authentication token from local storage if it exists
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Use the complete and correct path to update state
      await axios.patch(`http://localhost:10101/estado/cambiar-estado/cedula/${cedula}`, 
        { 
          estado: nuevoEstado 
        },
        { headers }
      );
      
      // Actualiza el estado en la UI
      setGuias(prevGuias => 
        prevGuias.map(guia => 
          guia.cedula === cedula ? { ...guia, estado: nuevoEstado } : guia
        )
      );
      
      // Update current guide if viewing details
      if (currentGuia && currentGuia.cedula === cedula) {
        setCurrentGuia({...currentGuia, estado: nuevoEstado});
      }
      
      toast.success(`Estado actualizado a: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      console.log('Detalles del error:', error.response?.data || error.message);
      toast.error(`Error al actualizar el estado: ${error.response?.data?.message || error.message}`);
    }
  };

  // Filtrar guías según los criterios
  const guiasFiltrados = () => {
    let resultado = [...guias];
    
    // Aplicar filtro por estado del operador
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(guia => guia.estado === filtroEstado);
    }
    
    // Aplicar búsqueda por término
    if (searchTerm.trim() !== '') {
      const termino = searchTerm.toLowerCase();
      resultado = resultado.filter(guia => {
        // Crear nombre completo para búsqueda
        const nombreCompleto = construirNombreCompleto(guia).toLowerCase();
        
        return nombreCompleto.includes(termino) || 
               (guia.cedula && guia.cedula.toLowerCase().includes(termino)) ||
               (guia.email && guia.email.toLowerCase().includes(termino)) ||
               (guia.direccion && guia.direccion.toLowerCase().includes(termino));
      });
    }
    
    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      if (ordenarPor === 'nombre') {
        const nombreA = construirNombreCompleto(a).toLowerCase();
        const nombreB = construirNombreCompleto(b).toLowerCase();
        return nombreA.localeCompare(nombreB);
      } else if (ordenarPor === 'fecha') {
        const fechaA = new Date(a.fechaNacimiento || a.fecha_registro || 0);
        const fechaB = new Date(b.fechaNacimiento || b.fecha_registro || 0);
        return fechaB - fechaA; // Más reciente primero
      }
      return 0;
    });
    
    return resultado;
  };

  return (
    <DashboardLayoutAdmin>
      <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {/* Cabecera con título y botones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Gestión de Guías</h1>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex">
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-2 rounded-l-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'} min-w-[400px]`}
              />
              <button 
                onClick={handleSearch}
                className={`px-3 py-2 rounded-r-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
            >
              <Filter className="w-5 h-5 mr-1.5" />
              Filtros
            </button>
            
            <button
              onClick={handleAddNew}
              className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              <UserPlus className="w-5 h-5 mr-1.5" />
              Nuevo guía
            </button>
            
            <button
              onClick={() => fetchGuias()}
              className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
            >
              <RefreshCw className="w-5 h-5 mr-1.5" />
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Estado</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'todos' 
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado('disponible')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'disponible' 
                        ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => setFiltroEstado('ocupado')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'ocupado' 
                        ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Ocupado
                  </button>
                  <button
                    onClick={() => setFiltroEstado('inactivo')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'inactivo' 
                        ? (darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Inactivo
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Ordenar por</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrdenarPor('nombre')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'nombre' 
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Nombre
                  </button>
                  <button
                    onClick={() => setOrdenarPor('fecha')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'fecha' 
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Más recientes
                  </button>
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFiltroEstado('todos');
                    setOrdenarPor('nombre');
                  }}
                  className={`px-3 py-1 text-sm rounded-md ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  }`}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Total de Guías</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-700'}`}>
                {guias.length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
              <UserPlus className={`w-6 h-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Guías Disponibles</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>
                {guias.filter(g => g.estado === 'disponible').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
              <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>Guías Ocupados</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-yellow-700'}`}>
                {guias.filter(g => g.estado === 'ocupado').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-800' : 'bg-yellow-100'}`}>
              <Briefcase className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900' : 'bg-red-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Guías Inactivos</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-700'}`}>
                {guias.filter(g => g.estado === 'inactivo').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
              <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Lista de guías */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
            <p className="text-lg font-medium mb-2">Error al cargar guías</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => fetchGuias()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guiasFiltrados().length > 0 ? (
              guiasFiltrados().map(guia => (
                <div 
                  key={guia.id || guia.cedula} 
                  className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} relative`}
                >
                  {/* Cabecera con imagen */}
                  <div 
                    className="h-36 relative bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${logoExplococora})`,
                      backgroundSize: '200px',
                      backgroundPosition: 'center',
                      backgroundColor: darkMode ? '#1e3a8a' : '#3b82f6',
                      backgroundBlendMode: 'soft-light',
                      opacity: '0.9'
                    }}
                  >
                    <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                      <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-blue-200 shadow-lg">
                        {guia.foto ? (
                          <img 
                            src={guia.foto.startsWith('http') ? guia.foto : `http://localhost:10101/uploads/images/${guia.foto}`} 
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
                    
                    {/* Estado del guía en la esquina */}
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        guia.estado === 'disponible' ? 'bg-green-500 text-white' :
                        guia.estado === 'ocupado' ? 'bg-yellow-500 text-white' :
                        guia.estado === 'inactivo' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {guia.estado || 'Pendiente'}
                      </div>
                    </div>
                    
                    {/* Acciones rápidas */}
                    <div className="absolute top-2 left-2 flex space-x-1">
                      <button 
                        onClick={() => handleEdit(guia)}
                        className="p-1.5 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                        title="Editar guía"
                      >
                        <FaEdit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteConfirm(guia)}
                        className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Eliminar guía"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Información del guía */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold flex items-center justify-center">
                        {construirNombreCompleto(guia)}
                        {guia.calificacion && (
                          <div className="ml-2 flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm ml-1">{guia.calificacion}</span>
                          </div>
                        )}
                      </h3>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {guia.especialidad || 'Guía Turístico'}
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm truncate">{guia.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-3 text-green-500" />
                        <span className="text-sm">{guia.telefono || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-3 text-red-500" />
                        <span className="text-sm">{guia.direccion || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm">Desde {new Date(guia.fechaNacimiento || guia.fecha_registro || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-3 text-purple-500" />
                        <span className="text-sm">{guia.cedula || 'No disponible'}</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleView(guia.cedula)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
                      >
                        <FaEye className="w-4 h-4" /> Ver detalles
                      </button>
                      
                      {/* Menú desplegable para cambiar estado */}
                      <div className="relative group">
                        <button 
                          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5
                            ${guia.estado === 'disponible' ? 'bg-green-600 hover:bg-green-700' : 
                              guia.estado === 'ocupado' ? 'bg-yellow-600 hover:bg-yellow-700' : 
                              guia.estado === 'inactivo' ? 'bg-red-600 hover:bg-red-700' : 
                              'bg-blue-600 hover:bg-blue-700'} text-white`}
                        >
                          Estado
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                        <div className="absolute right-0 bottom-12 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                          <div className="py-1">
                            <button 
                              onClick={() => handleCambioEstado(guia.cedula, 'disponible')}
                              className="flex items-center px-4 py-2 text-sm text-white hover:bg-green-700 w-full text-left"
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Disponible
                            </button>
                            <button 
                              onClick={() => handleCambioEstado(guia.cedula, 'ocupado')}
                              className="flex items-center px-4 py-2 text-sm text-white hover:bg-yellow-700 w-full text-left"
                            >
                              <Briefcase className="w-4 h-4 mr-2 text-yellow-500" />
                              Ocupado
                            </button>
                            <button 
                              onClick={() => handleCambioEstado(guia.cedula, 'inactivo')}
                              className="flex items-center px-4 py-2 text-sm text-white hover:bg-red-700 w-full text-left"
                            >
                              <XCircle className="w-4 h-4 mr-2 text-red-500" />
                              Inactivo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`col-span-3 text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex flex-col items-center">
                  <XCircle className="w-16 h-16 mb-4 opacity-30" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron guías</h3>
                  <p className="mb-6">No hay guías que coincidan con los criterios de búsqueda.</p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setFiltroEstado('todos');
                      }}
                      className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    >
                      Limpiar filtros
                    </button>
                    <button 
                      onClick={handleAddNew}
                      className={`px-4 py-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Añadir nuevo guía
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
              {isEditing ? 'Editar Guía' : 'Crear Nuevo Guía'}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo upload */}
              <div className="form-group col-span-2 flex flex-col items-center mb-4">
                <label className="block text-gray-300 mb-2 text-sm font-medium">Foto</label>
                <div className="relative">
                  <img 
                    src={formData.fotoPreview || placeholderImage} 
                    alt="Vista previa" 
                    className="h-32 w-32 rounded-full object-cover border border-gray-600 mb-2"
                  />
                  <input
                    type="file"
                    name="foto"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-upload"
                    accept="image/*"
                  />
                  <label 
                    htmlFor="foto-upload" 
                    className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer text-white"
                    title="Cambiar foto"
                  >
                    <FaEdit size={14} />
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isEditing}
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Primer Nombre</label>
                <input
                  type="text"
                  name="primerNombre"
                  value={formData.primerNombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Segundo Nombre</label>
                <input
                  type="text"
                  name="segundoNombre"
                  value={formData.segundoNombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Primer Apellido</label>
                <input
                  type="text"
                  name="primerApellido"
                  value={formData.primerApellido}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Segundo Apellido</label>
                <input
                  type="text"
                  name="segundoApellido"
                  value={formData.segundoApellido}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Contraseña {isEditing && '(opcional)'}</label>
                <input
                  type="password"
                  name="contrasenia"
                  value={formData.contrasenia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Confirmar Contraseña {isEditing && '(opcional)'}</label>
                <input
                  type="password"
                  name="confirmacionContrasenia"
                  value={formData.confirmacionContrasenia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isEditing}
                />
              </div>
              
              <div className="col-span-2 flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del guía */}
      {showViewModal && currentGuia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Detalles del Guía</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Contenido principal */}
              <div className="space-y-6">
                {/* Perfil básico */}
                <div className="bg-gray-700 rounded-lg p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={currentGuia.foto || placeholderImage} 
                        alt={`${currentGuia.primerNombre} ${currentGuia.primerApellido}`} 
                        className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 border-4 border-blue-500"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-white mb-4">
                        {currentGuia.primerNombre} {currentGuia.segundoNombre} {currentGuia.primerApellido} {currentGuia.segundoApellido}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-blue-500 mr-1" />
                            <p className="text-white">{currentGuia.email || 'No disponible'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Teléfono</p>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-green-500 mr-1" />
                            <p className="text-white">{currentGuia.telefono || 'No disponible'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Dirección</p>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-red-500 mr-1" />
                            <p className="text-white">{currentGuia.direccion || 'No especificada'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Fecha de Nacimiento</p>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-purple-500 mr-1" />
                            <p className="text-white">{currentGuia.fechaNacimiento ? new Date(currentGuia.fechaNacimiento).toLocaleDateString() : 'No disponible'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Cédula</p>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 text-yellow-500 mr-1" />
                            <p className="text-white">{currentGuia.cedula || 'No disponible'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Estado</p>
                          <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentGuia.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                            currentGuia.estado === 'ocupado' ? 'bg-yellow-100 text-yellow-800' :
                            currentGuia.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {currentGuia.estado || 'Pendiente'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-end">
                <div className="flex gap-3">
                  <div className="relative group">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md flex items-center">
                      Cambiar Estado
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <div className="absolute right-0 bottom-12 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            handleCambioEstado(currentGuia.cedula, 'disponible');
                            setCurrentGuia({...currentGuia, estado: 'disponible'});
                          }}
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-green-700 w-full text-left"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Disponible
                        </button>
                        <button 
                          onClick={() => {
                            handleCambioEstado(currentGuia.cedula, 'ocupado');
                            setCurrentGuia({...currentGuia, estado: 'ocupado'});
                          }}
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-yellow-700 w-full text-left"
                        >
                          <Briefcase className="w-4 h-4 mr-2 text-yellow-500" />
                          Ocupado
                        </button>
                        <button 
                          onClick={() => {
                            handleCambioEstado(currentGuia.cedula, 'inactivo');
                            setCurrentGuia({...currentGuia, estado: 'inactivo'});
                          }}
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-red-700 w-full text-left"
                        >
                          <XCircle className="w-4 h-4 mr-2 text-red-500" />
                          Inactivo
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(currentGuia)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                  >
                    <FaEdit className="mr-2" /> Editar
                  </button>
                  
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación */}
      {showDeleteModal && currentGuia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Eliminación</h2>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={currentGuia.foto || placeholderImage} 
                alt={`${currentGuia.primerNombre} ${currentGuia.primerApellido}`} 
                className="w-16 h-16 rounded-full object-cover border border-gray-600"
              />
              <div>
                <p className="text-white font-bold">{currentGuia.primerNombre} {currentGuia.primerApellido}</p>
                <p className="text-gray-400 text-sm">Cédula: {currentGuia.cedula}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              ¿Está seguro que desea eliminar este guía? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutAdmin>
  );
};

export default GestionGuias; 