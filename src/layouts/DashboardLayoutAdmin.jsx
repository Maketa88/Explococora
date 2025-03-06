import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart2, 
  FileText, 
  Users, 
  UserPlus,
  UserCheck,
  Package,
  PackagePlus,
  PackageSearch,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  Moon,
  Sun,
  Search,
  User,
  Edit,
  Key,
  LogOut,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import SelectorEstado from '../pages/VistaGuia/CambioEstado/SelectorEstado';

const DashboardLayoutAdmin = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [estado, setEstado] = useState("disponible");
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  
  // Estados para el perfil del administrador
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const [previewFoto, setPreviewFoto] = useState(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Cerrar el menú desplegable cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Ocultar el perfil cuando la ruta cambia
  useEffect(() => {
    // Solo ocultamos el perfil si la ruta cambia y no es la ruta principal
    if (location.pathname !== "/VistaAdmin" || (location.pathname === "/VistaAdmin" && !showProfile)) {
      setShowProfile(false);
    }
  }, [location.pathname]);

  // Añadir este efecto para cambiar estado a disponible al iniciar sesión
  useEffect(() => {
    const cambiarEstadoAlIniciar = async () => {
      try {
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        // Si hay cédula y token, significa que el usuario ha iniciado sesión
        if (cedula && token) {
          
          // Llamar a la API para cambiar estado
          await axios.patch('http://localhost:10101/usuarios/cambiar-estado', 
            { nuevoEstado: "disponible", cedula }, 
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          // Actualizar estado local y localStorage
          setEstado("disponible");
          localStorage.setItem("ultimoEstado", "disponible");
        }
      } catch (error) {
        console.error("Error al cambiar estado al iniciar sesión:", error);
      }
    };
    
    cambiarEstadoAlIniciar();
  }, []); // Solo se ejecuta al montar el componente

  // Modificar el useEffect para cargar inmediatamente los datos del perfil
  useEffect(() => {
    // Intentar obtener la foto del localStorage para mostrarla rápidamente
    const storedFoto = localStorage.getItem("foto_perfil");
    if (storedFoto) {
      setPreviewFoto(storedFoto);
    }
    
    // Si estamos en la ruta principal o en la ruta de perfil, cargar los datos
    if (location.pathname === "/VistaAdmin" || location.pathname === "/VistaAdmin/PerfilAdmin") {
      loadAdminData(); // Cargar los datos del perfil automáticamente
    }
    
    // Add event listener for profile photo updates
    const handleFotoUpdate = (event) => {
      if (event.detail && event.detail.fotoUrl) {
        setPreviewFoto(event.detail.fotoUrl);
      } else {
        const updatedFoto = localStorage.getItem("foto_perfil");
        if (updatedFoto) {
          setPreviewFoto(updatedFoto);
        }
      }
    };
    
    window.addEventListener('fotoPerfilActualizada', handleFotoUpdate);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('fotoPerfilActualizada', handleFotoUpdate);
    };
  }, [location.pathname]);

  // Add or update this useEffect to refresh the photo when the route changes
  useEffect(() => {
    // Check if we're navigating to the dashboard
    if (location.pathname === "/VistaAdmin") {
      // Try to get the latest photo from localStorage
      const storedFoto = localStorage.getItem("foto_perfil");
      if (storedFoto) {
        setPreviewFoto(storedFoto);
      }
      
      // If we have a cedula and token, we could also fetch the latest data
      const cedula = localStorage.getItem("cedula");
      const token = localStorage.getItem("token");
      
      if (cedula && token) {
        // Optional: fetch the latest photo data from the server
        axios.get(`http://localhost:10101/admin/perfil-completo/${cedula}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(response => {
          if (response.data) {
            const adminData = Array.isArray(response.data) ? response.data[0] : response.data;
            
            if (adminData.foto_perfil) {
              let fotoUrl;
              if (adminData.foto_perfil.startsWith('http')) {
                fotoUrl = adminData.foto_perfil;
              } else if (adminData.foto_perfil.includes('/uploads/images/')) {
                fotoUrl = `http://localhost:10101${adminData.foto_perfil}`;
              } else {
                fotoUrl = `http://localhost:10101/uploads/images/${adminData.foto_perfil}`;
              }
              
              setPreviewFoto(fotoUrl);
              localStorage.setItem("foto_perfil", fotoUrl);
            }
          }
        })
        .catch(error => {
          console.error("Error fetching profile photo:", error);
        });
      }
    }
  }, [location.pathname]); // This effect runs whenever the route changes

  // Función para cargar los datos del administrador cuando se muestra el perfil
  const loadAdminData = () => {
    setLoading(true);
    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula) {
      setError("No se encontró la cédula del administrador.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:10101/admin/perfil-completo/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos del administrador recibidos:", response.data);
        // Guardar los datos del administrador
        setAdmin(response.data);
        
        // Verificar si hay una foto en la respuesta del servidor
        const adminData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (adminData.foto_perfil) {
          // Si la foto comienza con http, es una URL completa
          if (adminData.foto_perfil.startsWith('http')) {
            setPreviewFoto(adminData.foto_perfil);
            localStorage.setItem("foto_perfil", adminData.foto_perfil);
          } 
          // Si la foto no comienza con http, construir la URL completa
          else {
            let fotoUrl;
            if (adminData.foto_perfil.includes('/uploads/images/')) {
              fotoUrl = `http://localhost:10101${adminData.foto_perfil}`;
            } else {
              fotoUrl = `http://localhost:10101/uploads/images/${adminData.foto_perfil}`;
            }
            
            setPreviewFoto(fotoUrl);
            localStorage.setItem("foto_perfil", fotoUrl);
          }
        } 
        // Verificar si hay foto en otros campos posibles
        else if (adminData.foto) {
          let fotoUrl;
          if (adminData.foto.startsWith('http')) {
            fotoUrl = adminData.foto;
          } else if (adminData.foto.includes('/uploads/images/')) {
            fotoUrl = `http://localhost:10101${adminData.foto}`;
          } else {
            fotoUrl = `http://localhost:10101/uploads/images/${adminData.foto}`;
          }
          
          setPreviewFoto(fotoUrl);
          localStorage.setItem("foto_perfil", fotoUrl);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error completo:", error);
        console.error("Status:", error.response?.status);
        console.error("Respuesta del servidor:", error.response?.data);
        setError(`Error: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      });
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/VistaAdmin/Dashboard",
      section: "Dashboard"
    },
    {
      title: "Gestión de Guias",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaAdmin/GestionGuias",
      section: "Usuarios"
    },
    {
      title: "Gestión de Operadores",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaAdmin/GestionOperadores",
      section: "Usuarios"
    },
    {
      title: "Gestión de Rutas",
      icon: <BarChart2 className="w-5 h-5" />,
      path: "/VistaAdmin/GestionRutas",
      section: "Rutas"
    },
    {
      title: "Crear Ruta",
      icon: <FileText className="w-5 h-5" />,
      path: "/VistaAdmin/CrearRuta",
      section: "Rutas"
    },
    {
      title: "Reportes",
      icon: <Package className="w-5 h-5" />,
      path: "/VistaAdmin/Reportes",
      section: "Informes"
    },
    {
      title: "Estadísticas",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaAdmin/Estadisticas",
      section: "Informes"
    },
    {
      title: "Configuración",
      icon: <Settings className="w-5 h-5" />,
      path: "/VistaAdmin/Configuracion",
      section: "Sistema"
    },
    {
      title: "Cambiar Contraseña",
      icon: <Key className="w-5 h-5" />,
      path: "/VistaAdmin/CambiarContraseña",
      section: "Sistema"
    },
    {
      title: "Perfil Admin",
      icon: <User className="w-5 h-5" />,
      path: "/VistaAdmin/PerfilAdmin",
      section: "Sistema"
    },
    {
      title: "Actualizar Datos",
      icon: <Edit className="w-5 h-5" />,
      path: "/VistaAdmin/ActualizarAdmin",
      section: "Sistema"
    },
    {
      title: "Eliminar Cuenta",
      icon: <Trash2 className="w-5 h-5" />,
      path: "/VistaAdmin/EliminarUsuario",
      section: "Sistema"
    }
  ];
  
  const sections = ["Dashboard", "Usuarios", "Rutas", "Guías", "Informes", "Sistema"];

  const toggleMenu = (e) => {
    e.stopPropagation();
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Modificar la función handleOptionClick para cambiar estado al cerrar sesión
  const handleOptionClick = (path, action) => {
    if (path === "/VistaAdmin/PerfilAdmin") {
      // Mostrar el perfil y cargar los datos
      setShowProfile(true);
      loadAdminData();
      navigate("/VistaAdmin/PerfilAdmin"); // Navegar a la ruta principal
    } else if (path === "/") {
      // Lógica para cerrar sesión
      const cambiarEstadoAlCerrarSesion = async () => {
        try {
          const cedula = localStorage.getItem("cedula");
          const token = localStorage.getItem("token");
          
          if (cedula && token) {
            
            // Llamar a la API para cambiar estado antes de cerrar sesión
            await axios.patch('http://localhost:10101/usuarios/cambiar-estado', 
              { nuevoEstado: "inactivo", cedula }, 
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            // Actualizar localStorage por si acaso
            localStorage.setItem("ultimoEstado", "inactivo");
          }
          
          // Continuar con el cierre de sesión
          setShowProfile(false);
          // Borrar datos de sesión
          localStorage.removeItem("token");
          localStorage.removeItem("cedula");
          localStorage.removeItem("rol");
          navigate("/");
        } catch (error) {
          console.error("Error al cambiar estado al cerrar sesión:", error);
          // Aún así continuar con el cierre de sesión
          setShowProfile(false);
          localStorage.removeItem("token");
          localStorage.removeItem("cedula");
          localStorage.removeItem("rol");
          navigate("/");
        }
      };
      
      cambiarEstadoAlCerrarSesion();
    } else if (path) {
      navigate(path);
      setShowProfile(false); // Ocultar el perfil al navegar a otra ruta
    } else if (path === null) {
      // Otra lógica si es necesaria
      setShowProfile(false);
    }
    setProfileMenuOpen(false);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setShowProfile(false); // Ocultar el perfil al hacer clic en un elemento del menú
  };

  const menuOptions = [
    { 
      label: "Ver perfil", 
      path: "/VistaAdmin/PerfilAdmin",
      action: () => {
        setShowProfile(true);
        loadAdminData();
      }
    },
    { label: "Actualizar perfil", path: "/VistaAdmin/ActualizarAdmin" },
    { label: "Cambiar contraseña", path: "/VistaAdmin/CambiarContraseña" },
    { label: "Eliminar cuenta", path: "/VistaAdmin/EliminarCuentaAdmin" },
    { label: "Cerrar sesión", path: "/" },
  ];

  // Función para separar nombre si existe
  const separarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return { nombres: "No disponible", apellidos: "No disponible" };
    
    const partes = nombreCompleto.split(" ");
    const nombres = partes.slice(0, 2).join(" ");
    const apellidos = partes.slice(2).join(" ");
    return { nombres, apellidos };
  };

  // Componente del perfil del administrador con datos dinámicos
  const PerfilAdminComponent = () => {
    if (loading) return (
      <div className={`${darkMode ? 'bg-teal-900 text-white' : 'bg-teal-50'} rounded-lg p-6 shadow-lg text-center`}>
        Cargando perfil...
      </div>
    );
    
    if (error) return (
      <div className={`${darkMode ? 'bg-teal-900' : 'bg-teal-50'} rounded-lg p-6 shadow-lg text-center text-red-500`}>
        {error}
      </div>
    );
    
    // Si no hay datos, mostrar un mensaje
    if (!admin) return (
      <div className={`${darkMode ? 'bg-teal-900 text-white' : 'bg-teal-50'} rounded-lg p-6 shadow-lg text-center`}>
        No se encontraron datos del administrador.
      </div>
    );
    
    // Verificamos si admin es un array o un objeto
    const adminData = Array.isArray(admin) ? admin[0] : admin;
    
    // Extraer nombre
    const nombreCompleto = adminData.nombre || adminData.nombre_completo || adminData.nombre_del_admin || "No disponible";
    const { nombres, apellidos } = separarNombre(nombreCompleto);
    
    return (
      <div className={`${darkMode ? 'bg-teal-900' : 'bg-teal-50'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-teal-800'}`}>Perfil del Administrador</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen de perfil */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-teal-500">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Perfil del administrador"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=0D9488&color=fff`;
                  }}
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=0D9488&color=fff`}
                  alt="Perfil del administrador"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <button className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white font-medium transition-colors duration-200`}>
              Cambiar foto
            </button>
          </div>
          
          {/* Información personal */}
          <div className="flex-1">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`}>Nombre</h3>
                <p className="font-medium text-lg">{nombres}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`}>Apellidos</h3>
                <p className="font-medium text-lg">{apellidos}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`}>Cédula</h3>
                <p className="font-medium text-lg">{adminData.cedula || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`}>Correo electrónico</h3>
                <p className="font-medium text-lg">{adminData.email || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`}>Teléfono</h3>
                <p className="font-medium text-lg">{adminData.telefono || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`}>Rol</h3>
                <p className="font-medium text-lg">{adminData.rol || "Administrador"}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => navigate("/VistaAdmin/ActualizarAdmin")}
                className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white font-medium transition-colors duration-200`}
              >
                Editar información
              </button>
              <button 
                onClick={() => navigate("/VistaAdmin/CambiarContraseña")}
                className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-teal-700 hover:bg-teal-600' : 'bg-teal-300 hover:bg-teal-400'} ${darkMode ? 'text-white' : 'text-teal-800'} font-medium transition-colors duration-200`}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
        
        {/* Sección de estadísticas del sistema */}
        <div className="mt-8">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-teal-800'}`}>Estadísticas del Sistema</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-300' : 'text-teal-600'}`}>Usuarios totales</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-teal-700'}`}>245</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-300' : 'text-teal-600'}`}>Rutas activas</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-teal-700'}`}>32</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-teal-300' : 'text-teal-600'}`}>Guías disponibles</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-teal-700'}`}>18</p>
            </div>
          </div>
        </div>

        {/* Botón para ir al Dashboard */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => navigate("/VistaAdmin/Dashboard")}
            className={`py-2 px-6 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${darkMode ? 'text-white' : 'text-gray-800'} font-medium transition-colors duration-200 flex items-center gap-2`}
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

  // Mapa de términos de búsqueda y sus rutas correspondientes
  const searchMapping = [
    { terms: ['dashboard', 'inicio', 'principal', 'panel'], path: '/VistaAdmin', title: 'Dashboard' },
    { terms: ['usuarios', 'gestión de usuarios', 'administrar usuarios'], path: '/VistaAdmin/GestionUsuarios', title: 'Gestión de Usuarios' },
    { terms: ['añadir usuario', 'nuevo usuario', 'crear usuario'], path: '/VistaAdmin/AñadirUsuario', title: 'Añadir Usuario' },
    { terms: ['rutas', 'gestión de rutas', 'administrar rutas'], path: '/VistaAdmin/GestionRutas', title: 'Gestión de Rutas' },
    { terms: ['crear ruta', 'nueva ruta', 'añadir ruta'], path: '/VistaAdmin/CrearRuta', title: 'Crear Ruta' },
    { terms: ['asignar guías', 'asignación', 'guías'], path: '/VistaAdmin/AsignarGuias', title: 'Asignar Guías' },
    { terms: ['reportes', 'informes', 'datos'], path: '/VistaAdmin/Reportes', title: 'Reportes' },
    { terms: ['estadísticas', 'métricas', 'análisis'], path: '/VistaAdmin/Estadisticas', title: 'Estadísticas' },
    { terms: ['configuración', 'ajustes', 'settings'], path: '/VistaAdmin/Configuracion', title: 'Configuración' },
    { terms: ['contraseña', 'cambiar contraseña', 'password'], path: '/VistaAdmin/CambiarContraseña', title: 'Cambiar Contraseña' },
    { terms: ['perfil', 'mi perfil', 'datos personales'], path: '/VistaAdmin/PerfilAdmin', title: 'Perfil Admin' },
    { terms: ['actualizar', 'actualizar datos', 'editar perfil'], path: '/VistaAdmin/ActualizarAdmin', title: 'Actualizar Datos' }
  ];

  // Función para buscar coincidencias mientras el usuario escribe
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.length < 2) {
      setShowResults(false);
      return;
    }
    
    // Filtrar resultados basados en el término de búsqueda
    const results = searchMapping
      .filter(item => {
        return item.terms.some(t => t.includes(term)) || 
               item.title.toLowerCase().includes(term);
      })
      .slice(0, 5); // Limitar a 5 resultados
    
    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  // Función para navegar al resultado seleccionado
  const handleResultClick = (path) => {
    navigate(path);
    setSearchTerm('');
    setShowResults(false);
    setShowProfile(false); // Ocultar el perfil al navegar
  };

  // Función para manejar el envío del formulario
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchTerm.length < 2) return;
    
    // Buscar la mejor coincidencia
    for (const item of searchMapping) {
      if (item.terms.some(t => t.includes(searchTerm.toLowerCase())) || 
          item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        navigate(item.path);
        setSearchTerm('');
        setShowResults(false);
        setShowProfile(false); // Ocultar el perfil al navegar
        return;
      }
    }
    
    // Si no hay coincidencias
    alert('No se encontraron resultados para: ' + searchTerm);
    setSearchTerm('');
    setShowResults(false);
  };

  // Función para cerrar los resultados si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-teal-950' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={` 
        ${collapsed ? 'w-20' : 'w-64'} 
        ${darkMode ? 'bg-teal-900' : 'bg-teal-50'} 
        p-4 transition-all duration-300 flex flex-col
        ${darkMode ? 'text-teal-300' : 'text-teal-700'}
        border-r ${darkMode ? 'border-teal-800' : 'border-teal-200'}
        h-screen sticky top-0
      `}>
        <div className="mb-8 flex flex-col items-start">
          <div className="flex items-center">
            {!collapsed && <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-teal-800'}`}>Explococora</h1>} 
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-teal-600 text-white ml-2 hover:bg-teal-700"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          {!collapsed && <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-teal-800'} mt-1 text-center w-40`}>Administrador</h1>}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-700 scrollbar-track-transparent">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              {!collapsed && <h2 className={`${darkMode ? 'text-teal-400' : 'text-teal-600'} text-sm mb-2`}>{section}</h2>}
              {menuItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => handleMenuItemClick(item.path)}
                    className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
                      location.pathname === item.path
                        ? "bg-teal-700 text-white"
                        : `${darkMode ? 'text-teal-300 hover:bg-teal-800' : 'text-teal-700 hover:bg-teal-100'}`
                    }`}
                    title={collapsed ? item.title : ""}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                ))}
            </div>
          ))} 
        </nav>

        <div className={`border-t ${darkMode ? 'border-teal-800' : 'border-teal-200'} pt-4 mt-4`}>
          <Link
            to="/VistaAdmin/settings"
            onClick={() => setShowProfile(false)}
            className={`flex items-center gap-2 w-full p-2 mb-2 rounded-lg ${
              location.pathname === '/VistaAdmin/settings'
                ? "bg-teal-700 text-white"
                : `${darkMode ? 'text-teal-300 hover:bg-teal-800' : 'text-teal-700 hover:bg-teal-100'}`
            }`}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${darkMode ? 'bg-teal-950' : 'bg-white'}`}>
        {/* Top Navigation */}
        <div className={`${darkMode ? 'bg-teal-900' : 'bg-teal-50'} sticky top-0 z-10`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 max-w-xl relative search-container">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (searchResults.length > 0) setShowResults(true);
                  }}
                  className={`w-full px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-teal-800 text-white placeholder-teal-300' : 'bg-white text-teal-900 placeholder-teal-500'
                  } border ${darkMode ? 'border-teal-700' : 'border-teal-300'}`}
                />
                <button 
                  type="submit"
                  className={`p-2 rounded-lg ${darkMode ? 'text-teal-300 hover:text-white' : 'text-teal-700 hover:text-teal-900'}`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
              
              {/* Resultados de búsqueda */}
              {showResults && (
                <div 
                  className={`absolute top-full left-0 w-full mt-1 rounded-lg shadow-lg z-50 ${
                    darkMode ? 'bg-teal-800 text-white' : 'bg-white text-teal-900'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleResultClick(result.path)}
                      className={`p-3 cursor-pointer flex items-center gap-2 ${
                        darkMode 
                          ? 'hover:bg-teal-700 border-b border-teal-700' 
                          : 'hover:bg-teal-50 border-b border-teal-100'
                      } ${index === searchResults.length - 1 ? 'border-b-0 rounded-b-lg' : ''}`}
                    >
                      {/* Icono basado en el título */}
                      {result.title === 'Dashboard' && <LayoutDashboard className="w-4 h-4" />}
                      {result.title === 'Gestión de Usuarios' && <Users className="w-4 h-4" />}
                      {result.title === 'Añadir Usuario' && <UserPlus className="w-4 h-4" />}
                      {result.title === 'Gestión de Rutas' && <BarChart2 className="w-4 h-4" />}
                      {result.title === 'Crear Ruta' && <FileText className="w-4 h-4" />}
                      {result.title === 'Asignar Guías' && <UserCheck className="w-4 h-4" />}
                      {result.title === 'Reportes' && <Package className="w-4 h-4" />}
                      {result.title === 'Estadísticas' && <PackagePlus className="w-4 h-4" />}
                      {result.title === 'Configuración' && <Settings className="w-4 h-4" />}
                      {result.title === 'Cambiar Contraseña' && <Key className="w-4 h-4" />}
                      {result.title === 'Perfil Admin' && <User className="w-4 h-4" />}
                      {result.title === 'Actualizar Datos' && <Edit className="w-4 h-4" />}
                      <span>{result.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {localStorage.getItem('cedula') && (
                <SelectorEstado 
                  estadoActual={estado}
                  onCambioEstado={setEstado}
                  cedula={localStorage.getItem('cedula')}
                  esAdmin={true}
                  esPropio={true}
                />
              )}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'text-teal-300 hover:text-white' : 'text-teal-700 hover:text-teal-900'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'text-teal-300 hover:text-white' : 'text-teal-700 hover:text-teal-900'}`}>
                <Bell className="w-5 h-5" />
              </button>
              
              {/* Avatar con menú desplegable */}
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="w-10 h-10 rounded-full bg-teal-200 overflow-hidden cursor-pointer"
                  onClick={toggleMenu}
                >
                  {previewFoto ? (
                    <img
                      src={previewFoto}
                      alt="Perfil de usuario"
                      className="h-full w-full object-cover transform transition hover:scale-110 active:scale-95"
                      onError={(e) => {
                        e.target.onerror = null;
                        // Intentar obtener el nombre para el avatar de respaldo
                        const nombreAdmin = admin ? (Array.isArray(admin) ? admin[0].nombre : admin.nombre) : "Admin";
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreAdmin || "Admin")}&background=0D9488&color=fff`;
                      }}
                    />
                  ) : (
                    <img
                      src="https://ui-avatars.com/api/?name=Admin&background=0D9488&color=fff"
                      alt="Perfil de usuario"
                      className="h-full w-full object-cover transform transition hover:scale-110 active:scale-95"
                    />
                  )}
                </div>
                
                {/* Menú desplegable */}
                {profileMenuOpen && (
                  <div 
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                    ${darkMode ? 'bg-teal-800' : 'bg-white'} 
                    ring-1 ring-black ring-opacity-5 z-50`}
                  >
                    <div 
                      onClick={() => handleOptionClick("/VistaAdmin/PerfilAdmin")}
                      className={`block px-4 py-2 text-sm ${darkMode ? 'text-teal-200 hover:bg-teal-700' : 'text-teal-700 hover:bg-teal-50'} flex items-center gap-2 cursor-pointer`}
                    >
                      <User className="w-4 h-4" />
                      Ver Perfil
                    </div>
                    <div 
                      onClick={() => handleOptionClick("/VistaAdmin/ActualizarAdmin")}
                      className={`block px-4 py-2 text-sm ${darkMode ? 'text-teal-200 hover:bg-teal-700' : 'text-teal-700 hover:bg-teal-50'} flex items-center gap-2 cursor-pointer`}
                    >
                      <Edit className="w-4 h-4" />
                      Actualizar Información
                    </div>
                    <div 
                      onClick={() => handleOptionClick("/VistaAdmin/CambiarContraseña")}
                      className={`block px-4 py-2 text-sm ${darkMode ? 'text-teal-200 hover:bg-teal-700' : 'text-teal-700 hover:bg-teal-50'} flex items-center gap-2 cursor-pointer`}
                    >
                      <Key className="w-4 h-4" />
                      Cambiar Contraseña
                    </div>
                    <div 
                      onClick={() => handleOptionClick("/VistaAdmin/EliminarCuentaAdmin")}
                      className={`block px-4 py-2 text-sm ${darkMode ? 'text-teal-200 hover:bg-teal-700' : 'text-teal-700 hover:bg-teal-50'} flex items-center gap-2 cursor-pointer`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Cuenta
                    </div>
                    <div 
                      onClick={() => handleOptionClick("/")}
                      className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-red-400 hover:bg-teal-700' : 'text-red-600 hover:bg-teal-50'} flex items-center gap-2 cursor-pointer`}
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content and Footer Container */}
        <div className={`flex-1 flex flex-col overflow-auto ${darkMode ? 'bg-teal-950' : 'bg-white'}`}>
          {/* Page Content */}
          <div className="flex-1 p-4">
            {showProfile && location.pathname === "/VistaAdmin" ? (
              <div className={`${darkMode ? 'bg-teal-900 text-white' : 'bg-teal-50 text-teal-800'} rounded-lg p-6 shadow-lg`}>
                {loading ? (
                  <div className="text-center">Cargando perfil...</div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : !admin ? (
                  <div className="text-center">No se encontraron datos del administrador.</div>
                ) : (
                  <PerfilAdminComponent />
                )}
              </div>
            ) : children}
          </div>

          {/* Footer */}
          <div className={`p-4 ${darkMode ? 'bg-teal-900 text-teal-300' : 'bg-teal-50 text-teal-700'} sticky bottom-0`}>
            <div className="flex justify-between items-center text-sm">
              <span>© 2025 ExploCocora. Todos los derechos reservados.</span>
              <div className="flex gap-6">
                <a href="#" className={`${darkMode ? 'hover:text-white' : 'hover:text-teal-800'}`}>Política de Privacidad</a>
                <a href="#" className={`${darkMode ? 'hover:text-white' : 'hover:text-teal-800'}`}>Términos de Servicio</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutAdmin;