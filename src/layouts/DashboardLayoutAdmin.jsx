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
  
  // Add this constant near the top of the component function
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/5556/5556468.png";
  
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
          await axios.patch('https://servicio-explococora.onrender.com/usuarios/cambiar-estado', 
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
        axios.get(`https://servicio-explococora.onrender.com/admin/perfil-completo/${cedula}`, {
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
                fotoUrl = `https://servicio-explococora.onrender.com${adminData.foto_perfil}`;
              } else {
                fotoUrl = `https://servicio-explococora.onrender.com/uploads/images/${adminData.foto_perfil}`;
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

    axios.get(`https://servicio-explococora.onrender.com/admin/perfil-completo/${cedula}`, {
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
              fotoUrl = `https://servicio-explococora.onrender.com${adminData.foto_perfil}`;
            } else {
              fotoUrl = `https://servicio-explococora.onrender.com/uploads/images/${adminData.foto_perfil}`;
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
            fotoUrl = `https://servicio-explococora.onrender.com${adminData.foto}`;
          } else {
            fotoUrl = `https://servicio-explococora.onrender.com/uploads/images/${adminData.foto}`;
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
      title: "Estado de Guias",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaAdmin/EstadoGuia",
      section: "Usuarios"
    },
    {
      title: "Gestión de Operadores",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaAdmin/GestionOperadores",
      section: "Usuarios"
    },
    {
      title: "Estado de Operadores",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaAdmin/EstadoOperadores",
      section: "Usuarios"
    },

    {
      title: "Gestión de Rutas",
      icon: <BarChart2 className="w-5 h-5" />,
      path: "/VistaAdmin/GestionRutas",
      section: "Rutas"
    },
    {
      title: "Pago Rutas",
      icon: <Package className="w-5 h-5" />,
      path: "/VistaAdmin/PagoRuta",
      section: "Informes"
    },
    {
      title: "Pago Paquetes",
      icon: <Package className="w-5 h-5" />,
      path: "/VistaAdmin/PagoPaquete",
      section: "Informes"
    },
    {
      title: "Reservas",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaAdmin/Reserva",
      section: "Informes"
    },
    {
      title: "GestionPaquetes",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaAdmin/GestionPaquetes",
      section: "Rutas"
    },
    {
      title: "GestionCaballos",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaAdmin/GestionCaballos",
      section: "Caballos"
    },
    {
      title: "GestionPlantillas",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaAdmin/GestionPlantillas",
      section: "Plantillas"
    }
  ];
  
  const sections = ["Dashboard", "Usuarios", "Rutas",  "Informes", "Caballos","Plantillas" ];

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
            await axios.patch('https://servicio-explococora.onrender.com/usuarios/cambiar-estado', 
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
      <div className={`${darkMode ? 'bg-emerald-900 text-white' : 'bg-emerald-50'} rounded-lg p-6 shadow-lg text-center`}>
        Cargando perfil...
      </div>
    );
    
    if (error) return (
      <div className={`${darkMode ? 'bg-emerald-900' : 'bg-emerald-50'} rounded-lg p-6 shadow-lg text-center text-red-500`}>
        {error}
      </div>
    );
    
    // Si no hay datos, mostrar un mensaje
    if (!admin) return (
      <div className={`${darkMode ? 'bg-emerald-900 text-white' : 'bg-emerald-50'} rounded-lg p-6 shadow-lg text-center`}>
        No se encontraron datos del administrador.
      </div>
    );
    
    // Verificamos si admin es un array o un objeto
    const adminData = Array.isArray(admin) ? admin[0] : admin;
    
    // Extraer nombre
    const nombreCompleto = adminData.nombre || adminData.nombre_completo || adminData.nombre_del_admin || "No disponible";
    const { nombres, apellidos } = separarNombre(nombreCompleto);
    
    return (
      <div className={`${darkMode ? 'bg-emerald-900' : 'bg-emerald-50'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-emerald-800'}`}>Perfil del Administrador</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen de perfil */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-emerald-500">
              <img
                src={defaultAvatar}
                alt="Perfil por defecto"
                className="h-full w-full object-cover"
              />
            </div>
            <button className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-medium transition-colors duration-200`}>
              Cambiar foto
            </button>
          </div>
          
          {/* Información personal */}
          <div className="flex-1">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>Nombre</h3>
                <p className="font-medium text-lg">{nombres}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>Apellidos</h3>
                <p className="font-medium text-lg">{apellidos}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>Cédula</h3>
                <p className="font-medium text-lg">{adminData.cedula || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>Correo electrónico</h3>
                <p className="font-medium text-lg">{adminData.email || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>Teléfono</h3>
                <p className="font-medium text-lg">{adminData.telefono || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>Rol</h3>
                <p className="font-medium text-lg">{adminData.rol || "Administrador"}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => navigate("/VistaAdmin/ActualizarAdmin")}
                className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-medium transition-colors duration-200`}
              >
                Editar información
              </button>
              <button 
                onClick={() => navigate("/VistaAdmin/CambiarContraseña")}
                className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-300 hover:bg-emerald-400'} ${darkMode ? 'text-white' : 'text-emerald-800'} font-medium transition-colors duration-200`}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
        
        {/* Sección de estadísticas del sistema */}
        <div className="mt-8">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-emerald-800'}`}>Estadísticas del Sistema</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Usuarios totales</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-emerald-700'}`}>245</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Rutas activas</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-emerald-700'}`}>32</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Guías disponibles</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-emerald-700'}`}>18</p>
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

  // Where SelectorEstado was used, replace with a simple indicator
  const renderEstadoIndicator = () => {
    const estadoColors = {
      'disponible': 'bg-green-500',
      'ocupado': 'bg-yellow-500',
      'inactivo': 'bg-red-500'
    };

    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${estadoColors[estado] || 'bg-gray-500'}`}></div>
        <span className="capitalize text-sm">{estado}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f9f4]">
      {/* Sidebar */}
      <div className={` 
        ${collapsed ? 'w-20' : 'w-64'} 
        bg-white
        p-4 transition-all duration-300 flex flex-col
        text-gray-600
        border-r border-emerald-100
        h-screen sticky top-0
        shadow-sm
      `}>
        <div className="mb-8 flex flex-col items-start">
          <div className="flex items-center">
            {!collapsed && <h1 className="text-2xl font-bold text-emerald-800">Explococora</h1>} 
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white ml-2"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          {!collapsed && <h1 className="text-lg font-bold text-emerald-700 mt-1 text-center w-40">Administrador</h1>}
        </div>
        
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              {!collapsed && <h2 className="text-emerald-600 text-sm mb-2">{section}</h2>}
              {menuItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => handleMenuItemClick(item.path)}
                    className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
                      location.pathname === item.path
                        ? "bg-emerald-600 text-white"
                        : "text-gray-600 hover:bg-emerald-50"
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

        <div className="border-t border-emerald-100 pt-4 mt-4">
          <Link
            to="/VistaAdmin/settings"
            onClick={() => setShowProfile(false)}
            className={`flex items-center gap-2 w-full p-2 mb-2 rounded-lg ${
              location.pathname === '/VistaAdmin/settings'
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-emerald-50"
            }`}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span>Configuración</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f9f4]">
        {/* Top Navigation */}
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4">
            {/* Barra de búsqueda */}
            <div className="w-full sm:flex-1 sm:max-w-xl mb-3 sm:mb-0">
              {/* Resultados de búsqueda */}
              {showResults && (
                <div 
                  className="absolute top-full left-0 w-full mt-1 rounded-lg shadow-lg z-50 bg-white text-gray-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleResultClick(result.path)}
                      className={`p-3 cursor-pointer flex items-center gap-2 hover:bg-emerald-50 border-b border-emerald-100 ${index === searchResults.length - 1 ? 'border-b-0 rounded-b-lg' : ''}`}
                    >
                      {/* Mantener los iconos existentes */}
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
            
            {/* Controles de usuario */}
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex-1 sm:flex-none sm:mr-4">
                {/* Estado indicator */}
                {localStorage.getItem('cedula') && (
                  renderEstadoIndicator()
                )}
              </div>
              
              <button className="p-1.5 sm:p-2 rounded-lg text-emerald-600 hover:bg-emerald-50">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 overflow-hidden cursor-pointer"
                >
                  <img 
                    src={defaultAvatar}
                    alt="Perfil por defecto" 
                    className="w-full h-full object-cover"
                  />
                </button>
                
                {/* Menú desplegable de perfil */}
                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                    bg-white
                    ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div 
                      onClick={() => handleOptionClick("/VistaAdmin/PerfilAdmin")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Ver Perfil
                    </div>
                    <div 
                      onClick={() => handleOptionClick("/")}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
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
        <div className="flex-1 flex flex-col overflow-auto bg-[#f0f9f4]">
          {/* Page Content */}
          <div className="flex-1 p-4 pb-8">
            {showProfile && location.pathname === "/VistaAdmin" ? (
              <div className="bg-white rounded-lg p-6 shadow-lg">
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
          <div className="p-4 bg-white text-gray-600 sticky bottom-0 border-t border-emerald-100 z-30">
            <div className="flex justify-between items-center text-sm">
              <span>© 2025 ExploCocora. Todos los derechos reservados.</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-600">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutAdmin;