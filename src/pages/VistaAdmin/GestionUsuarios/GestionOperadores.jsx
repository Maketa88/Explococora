import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { toast } from 'react-toastify';
import { Search, Filter, RefreshCw, UserPlus, CheckCircle, XCircle, Briefcase, Calendar, Mail, Phone, MapPin, Star, CreditCard } from 'lucide-react';

const GestionOperadores = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentOperador, setCurrentOperador] = useState(null);
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

  // Fetch all operators
  const fetchOperadores = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el token de autenticación del almacenamiento local
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("No hay sesión activa. Inicie sesión nuevamente.");
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:10101/operador-turistico', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API response:', response.data);
      
      // Mejorar el manejo de diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        const mappedOperadores = mapOperadoresData(response.data);
        console.log('Mapped operators:', mappedOperadores);
        setOperadores(mappedOperadores);
      } else if (response.data && typeof response.data === 'object') {
        // Si la respuesta es un objeto que contiene el array de operadores
        const operadoresArray = response.data.operadores || response.data.data || Object.values(response.data);
        if (Array.isArray(operadoresArray)) {
          const mappedOperadores = mapOperadoresData(operadoresArray);
          console.log('Mapped operators from object:', mappedOperadores);
          setOperadores(mappedOperadores);
        } else {
          console.error('No se pudo encontrar un array de operadores en la respuesta:', response.data);
          setOperadores([]);
        }
      } else {
        setOperadores([]);
        console.error('Formato de respuesta API inesperado:', response.data);
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
      setError(error.response?.data?.message || "Error al cargar los operadores");
      setOperadores([]);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para mapear los datos de operadores
  const mapOperadoresData = (operadoresData) => {
    return operadoresData.map(operador => {
      // Process name fields
      let primerNombre = '';
      let segundoNombre = '';
      let primerApellido = '';
      let segundoApellido = '';
      
      // Priorizar campos específicos si existen
      if (operador.primer_nombre) {
        primerNombre = operador.primer_nombre;
      }
      
      if (operador.segundo_nombre) {
        segundoNombre = operador.segundo_nombre;
      }
      
      if (operador.primer_apellido) {
        primerApellido = operador.primer_apellido;
      }
      
      if (operador.segundo_apellido) {
        segundoApellido = operador.segundo_apellido;
      }
      
      // Procesar campo "nombres" combinado
      if (operador.nombres && !primerNombre) {
        const partesNombres = operador.nombres.split(' ');
        primerNombre = partesNombres[0] || '';
        segundoNombre = partesNombres.slice(1).join(' ') || '';
      }
      
      // Procesar campo "apellidos" combinado
      if (operador.apellidos && !primerApellido) {
        const partesApellidos = operador.apellidos.split(' ');
        primerApellido = partesApellidos[0] || '';
        segundoApellido = partesApellidos.slice(1).join(' ') || '';
      }
      
      // Procesar nombre completo si no hay nombres ni apellidos separados
      if ((operador.nombre_completo || operador.nombreCompleto) && !primerNombre && !primerApellido) {
        const nombreCompleto = operador.nombre_completo || operador.nombreCompleto;
        const partesNombre = nombreCompleto.split(' ');
        
        if (partesNombre.length === 4) {
          primerNombre = partesNombre[0];
          segundoNombre = partesNombre[1];
          primerApellido = partesNombre[2];
          segundoApellido = partesNombre[3];
        } else if (partesNombre.length === 3) {
          primerNombre = partesNombre[0];
          segundoNombre = partesNombre[1];
          primerApellido = partesNombre[2];
        } else if (partesNombre.length === 2) {
          primerNombre = partesNombre[0];
          primerApellido = partesNombre[1];
        } else if (partesNombre.length === 1) {
          primerNombre = partesNombre[0];
        }
      }
      
      // Asegurarse de que al menos tenemos un nombre y apellido
      if (!primerNombre && operador.name) {
        primerNombre = operador.name;
      }
      
      if (!primerApellido && operador.lastname) {
        primerApellido = operador.lastname;
      }
      
      // Crear objeto con todos los campos procesados
      return {
        ...operador,
        primerNombre: primerNombre,
        segundoNombre: segundoNombre,
        primerApellido: primerApellido,
        segundoApellido: segundoApellido,
        nombres: primerNombre + (segundoNombre ? ' ' + segundoNombre : ''),
        apellidos: primerApellido + (segundoApellido ? ' ' + segundoApellido : ''),
        telefono: operador.telefono || operador.celular || operador.phone || '',
        email: operador.email || operador.correo || '',
        cedula: operador.cedula || operador.id || operador.identificacion || '',
        direccion: operador.direccion || operador.address || '',
        fechaNacimiento: operador.fechaNacimiento || operador.fecha_nacimiento || operador.birth_date || '',
        estado: operador.estado || 'disponible',
      };
    });
  };

  // Función para construir el nombre completo
  const construirNombreCompleto = (operador) => {
    return [
      operador.primerNombre || '', 
      operador.segundoNombre || '', 
      operador.primerApellido || '', 
      operador.segundoApellido || ''
    ].filter(Boolean).join(' ');
  };

  // Filtrar operadores según los criterios
  const operadoresFiltrados = () => {
    let resultado = [...operadores];
    
    // Aplicar filtro por estado del operador
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(operador => operador.estado === filtroEstado);
    }
    
    // Aplicar búsqueda por término
    if (searchTerm.trim() !== '') {
      const termino = searchTerm.toLowerCase();
      resultado = resultado.filter(operador => {
        // Crear nombre completo para búsqueda
        const nombreCompleto = construirNombreCompleto(operador).toLowerCase();
        
        return nombreCompleto.includes(termino) || 
               (operador.cedula && operador.cedula.toLowerCase().includes(termino)) ||
               (operador.email && operador.email.toLowerCase().includes(termino)) ||
               (operador.direccion && operador.direccion.toLowerCase().includes(termino));
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

  // Función para buscar
  const handleSearch = () => {
    // La búsqueda se aplicará automáticamente a través de operadoresFiltrados()
    console.log("Buscando:", searchTerm);
  };

  // Función para cambiar el estado de un operador
  const handleCambioEstado = async (cedula, nuevoEstado) => {
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("No hay sesión activa. Inicie sesión nuevamente.");
        return;
      }

      // Usar la ruta correcta para cambiar el estado según el backend
      await axios.patch(`http://localhost:10101/usuarios/cambiar-estado/cedula/${cedula}`, 
        { estado: nuevoEstado },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      toast.success(`Estado actualizado a: ${nuevoEstado}`);
      
      // Actualizar el estado en el array local
      setOperadores(prevOperadores => 
        prevOperadores.map(op => 
          op.cedula === cedula ? {...op, estado: nuevoEstado} : op
        )
      );
    } catch (error) {
      console.error('Error changing operator status:', error);
      toast.error('Error al cambiar el estado del operador');
    }
  };

  useEffect(() => {
    fetchOperadores();
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

  // Open modal for creating a new operator
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

  // Open modal for editing operator
  const handleEdit = (operador) => {
    setIsEditing(true);
    setCurrentOperador(operador);
    setFormData({
      cedula: operador.cedula,
      primerNombre: operador.primerNombre || '',
      segundoNombre: operador.segundoNombre || '',
      primerApellido: operador.primerApellido || '',
      segundoApellido: operador.segundoApellido || '',
      email: operador.email || '',
      telefono: operador.telefono || '',
      fechaNacimiento: operador.fechaNacimiento ? operador.fechaNacimiento.split('T')[0] : '',
      direccion: operador.direccion || '',
      contrasenia: '',
      confirmacionContrasenia: '',
      foto: null,
      fotoPreview: operador.foto || '',
    });
    setShowModal(true);
  };

  // Open view modal for operator details
  const handleView = async (cedula) => {
    try {
      setShowViewModal(true);
      
      // Instead of using the profile-specific endpoint that might be restricted,
      // let's use the data we already have for basic viewing
      const operadorFound = operadores.find(op => op.cedula === cedula);
      
      if (operadorFound) {
        setCurrentOperador(operadorFound);
      } else {
        // Get the authentication token
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error("No hay sesión activa. Inicie sesión nuevamente.");
          return;
        }
        
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Try a more generic endpoint first
        try {
          const response = await axios.get(`http://localhost:10101/operador/${cedula}`, { headers });
          setCurrentOperador(response.data);
        } catch (detailError) {
          console.error('Error fetching specific operator details:', detailError);
          
          // If that fails, try the original endpoint as fallback
          try {
            const response = await axios.get(`http://localhost:10101/operador/perfil-completo/${cedula}`, { headers });
            setCurrentOperador(response.data);
          } catch (fallbackError) {
            console.error('Error with fallback endpoint:', fallbackError);
            toast.error('No se pudo cargar información detallada del operador');
          }
        }
      }
    } catch (error) {
      console.error('Error in view handler:', error);
      toast.error('Error al cargar los detalles del operador');
    }
  };

  // Open delete confirmation modal
  const handleDeleteConfirm = (operador) => {
    setCurrentOperador(operador);
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
      
      // Only append password if provided
      if (formData.contrasenia) {
        formDataToSend.append('contrasenia', formData.contrasenia);
      }
      
      // Only append the photo if a new one was selected
      if (formData.foto) {
        formDataToSend.append('foto', formData.foto);
      }
      
      if (isEditing) {
        // Update existing operator
        const response = await axios.patch(`http://localhost:10101/operador/actualizar/${formData.cedula}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Operador actualizado correctamente');
      } else {
        // Create new operator - this endpoint would need to be created in the backend
        const response = await axios.post('http://localhost:10101/operador/registro', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Operador creado correctamente');
      }
      
      setShowModal(false);
      fetchOperadores(); // Refresh the list
    } catch (error) {
      console.error('Error saving operator:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el operador');
    }
  };

  // Delete operator
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:10101/operador/${currentOperador.cedula}`);
      toast.success('Operador eliminado con éxito');
      setShowDeleteModal(false);
      fetchOperadores(); // Refresh the list
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error('Error al eliminar el operador');
    }
  };

  return (
    <DashboardLayoutAdmin>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Gestión de Operadores</h1>
          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors duration-300"
          >
            <FaPlus /> Nuevo Operador
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <input 
              type="text" 
              placeholder="Buscar operador por nombre, cédula o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full py-2 pl-10 pr-4 text-gray-300 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-3 py-2 rounded-md flex items-center bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Filter className="w-5 h-5 mr-1.5" />
              Filtros
            </button>
            
            <button
              onClick={handleAddNew}
              className="px-3 py-2 rounded-md flex items-center bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="w-5 h-5 mr-1.5" />
              Nuevo operador
            </button>
            
            <button
              onClick={() => fetchOperadores()}
              className="px-3 py-2 rounded-md flex items-center bg-gray-600 hover:bg-gray-700 text-white"
            >
              <RefreshCw className="w-5 h-5 mr-1.5" />
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 rounded-lg bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Estado</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'todos' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado('disponible')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'disponible' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => setFiltroEstado('ocupado')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'ocupado' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Ocupado
                  </button>
                  <button
                    onClick={() => setFiltroEstado('inactivo')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'inactivo' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
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
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Nombre
                  </button>
                  <button
                    onClick={() => setOrdenarPor('fecha')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'fecha' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Fecha
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Apariencia</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Oscuro
                  </button>
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      !darkMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Claro
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-blue-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">Total de Operadores</p>
              <p className="text-2xl font-bold text-white">
                {operadores.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-800">
              <UserPlus className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300">Operadores Disponibles</p>
              <p className="text-2xl font-bold text-white">
                {operadores.filter(g => g.estado === 'disponible').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-800">
              <CheckCircle className="w-6 h-6 text-green-300" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-300">Operadores Ocupados</p>
              <p className="text-2xl font-bold text-white">
                {operadores.filter(g => g.estado === 'ocupado').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-800">
              <Briefcase className="w-6 h-6 text-yellow-300" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-300">Operadores Inactivos</p>
              <p className="text-2xl font-bold text-white">
                {operadores.filter(g => g.estado === 'inactivo').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-800">
              <XCircle className="w-6 h-6 text-red-300" />
            </div>
          </div>
        </div>

        {/* Grid de operadores */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-900 text-white mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operadoresFiltrados().length > 0 ? (
              operadoresFiltrados().map((operador) => (
                <div 
                  key={operador.cedula} 
                  className="rounded-lg overflow-hidden shadow-lg bg-gray-800"
                >
                  <div className="h-32 relative bg-gradient-to-r from-blue-900 to-purple-900">
                    {/* Banner con estado del operador */}
                    <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                      operador.estado === 'disponible' ? 'bg-green-500 text-white' :
                      operador.estado === 'ocupado' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {operador.estado === 'disponible' ? 'Disponible' :
                       operador.estado === 'ocupado' ? 'Ocupado' : 'Inactivo'}
                    </div>
                  </div>
                  
                  <div className="relative px-6 pb-6">
                    {/* Foto de perfil */}
                    <div className="absolute -top-16 left-6">
                      <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-gray-800">
                        <img 
                          src={operador.foto || placeholderImage} 
                          alt={`${operador.primerNombre} ${operador.primerApellido}`} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Información del operador */}
                    <div className="pt-20">
                      <h3 className="text-xl font-bold text-white">
                        {construirNombreCompleto(operador)}
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-3 text-blue-500" />
                          <span className="text-sm text-gray-300 truncate">{operador.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-3 text-green-500" />
                          <span className="text-sm text-gray-300">{operador.telefono || 'No disponible'}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-3 text-red-500" />
                          <span className="text-sm text-gray-300">{operador.direccion || 'No especificada'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                          <span className="text-sm text-gray-300">Desde {new Date(operador.fechaNacimiento || operador.fecha_registro || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-3 text-purple-500" />
                          <span className="text-sm text-gray-300">{operador.cedula || 'No disponible'}</span>
                        </div>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleView(operador.cedula)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
                        >
                          <FaEye className="w-4 h-4" /> Ver detalles
                        </button>
                        
                        {/* Menú desplegable para cambiar estado */}
                        <div className="relative group">
                          <button 
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${
                              operador.estado === 'disponible' ? 'bg-green-600 hover:bg-green-700 text-white' :
                              operador.estado === 'ocupado' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                              'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {operador.estado === 'disponible' ? 
                              <CheckCircle className="w-4 h-4" /> :
                             operador.estado === 'ocupado' ? 
                              <Briefcase className="w-4 h-4" /> :
                              <XCircle className="w-4 h-4" />
                            }
                            Estado
                          </button>
                          
                          <div className="absolute right-0 bottom-12 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <div className="py-1">
                              <button 
                                onClick={() => handleCambioEstado(operador.cedula, 'disponible')}
                                className="flex items-center px-4 py-2 text-sm text-white hover:bg-green-700 w-full text-left"
                              >
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                Disponible
                              </button>
                              <button 
                                onClick={() => handleCambioEstado(operador.cedula, 'ocupado')}
                                className="flex items-center px-4 py-2 text-sm text-white hover:bg-yellow-700 w-full text-left"
                              >
                                <Briefcase className="w-4 h-4 mr-2 text-yellow-500" />
                                Ocupado
                              </button>
                              <button 
                                onClick={() => handleCambioEstado(operador.cedula, 'inactivo')}
                                className="flex items-center px-4 py-2 text-sm text-white hover:bg-red-700 w-full text-left"
                              >
                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                Inactivo
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleDeleteConfirm(operador)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-lg mb-4">No se encontraron operadores</p>
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium inline-flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" /> Agregar nuevo operador
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                {isEditing ? 'Editar Operador' : 'Crear Nuevo Operador'}
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

        {/* View Details Modal */}
        {showViewModal && currentOperador && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-3xl max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                Detalles del Operador
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Photo section */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="bg-gray-700 rounded-lg overflow-hidden shadow-md w-full aspect-square mb-2">
                    <img 
                      src={currentOperador.foto || placeholderImage} 
                      alt={`${currentOperador.primerNombre} ${currentOperador.primerApellido}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white text-lg font-medium text-center">
                    {currentOperador.primerNombre} {currentOperador.primerApellido}
                  </h3>
                  <p className="text-gray-400 text-sm text-center">{currentOperador.email}</p>
                </div>
                
                {/* Details section */}
                <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-medium">Cédula</h3>
                    <p className="text-white">{currentOperador.cedula}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-medium">Teléfono</h3>
                    <p className="text-white">{currentOperador.telefono || 'No especificado'}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-medium">Fecha de Nacimiento</h3>
                    <p className="text-white">
                      {currentOperador.fechaNacimiento ? new Date(currentOperador.fechaNacimiento).toLocaleDateString() : 'No especificada'}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-medium">Dirección</h3>
                    <p className="text-white">{currentOperador.direccion || 'No especificada'}</p>
                  </div>
                  
                  {/* Estado del operador */}
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-medium">Estado</h3>
                    <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentOperador.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                      currentOperador.estado === 'ocupado' ? 'bg-yellow-100 text-yellow-800' :
                      currentOperador.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {currentOperador.estado || 'Pendiente'}
                    </div>
                  </div>
                  
                  {/* Show any additional fields that might be in the response */}
                  {Object.entries(currentOperador).map(([key, value]) => {
                    // Skip fields we've already shown or that shouldn't be displayed
                    const skipFields = ['cedula', 'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido', 'email', 'telefono', 
                                       'fechaNacimiento', 'direccion', 'foto', 'contrasenia', '_id', '__v', 'estado'];
                    
                    if (!skipFields.includes(key) && value && typeof value !== 'object') {
                      return (
                        <div key={key} className="bg-gray-700 p-3 rounded-lg">
                          <h3 className="text-gray-400 text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                          <p className="text-white">{value.toString()}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
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
                            handleCambioEstado(currentOperador.cedula, 'disponible');
                            setCurrentOperador({...currentOperador, estado: 'disponible'});
                          }}
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-green-700 w-full text-left"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Disponible
                        </button>
                        <button 
                          onClick={() => {
                            handleCambioEstado(currentOperador.cedula, 'ocupado');
                            setCurrentOperador({...currentOperador, estado: 'ocupado'});
                          }}
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-yellow-700 w-full text-left"
                        >
                          <Briefcase className="w-4 h-4 mr-2 text-yellow-500" />
                          Ocupado
                        </button>
                        <button 
                          onClick={() => {
                            handleCambioEstado(currentOperador.cedula, 'inactivo');
                            setCurrentOperador({...currentOperador, estado: 'inactivo'});
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
                    onClick={() => handleEdit(currentOperador)}
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
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && currentOperador && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Confirmar Eliminación</h2>
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={currentOperador.foto || placeholderImage} 
                  alt={`${currentOperador.primerNombre} ${currentOperador.primerApellido}`} 
                  className="w-16 h-16 rounded-full object-cover border border-gray-600"
                />
                <div>
                  <p className="text-white font-bold">{currentOperador.primerNombre} {currentOperador.primerApellido}</p>
                  <p className="text-gray-400 text-sm">Cédula: {currentOperador.cedula}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                ¿Está seguro que desea eliminar este operador? Esta acción no se puede deshacer.
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
      </div>
    </DashboardLayoutAdmin>
  );
};

export default GestionOperadores; 