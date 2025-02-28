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
  User
} from 'lucide-react';
import axios from 'axios';
import SelectorEstado from '../pages/VistaGuia/CambioEstado/SelectorEstado';

const DashboardLayoutGuia = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [estado, setEstado] = useState("disponible");
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  
  // Estados para el perfil del guía
  const [guia, setGuia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
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
    if (location.pathname !== "/VistaGuia" || (location.pathname === "/VistaGuia" && !showProfile)) {
      setShowProfile(false);
    }
  }, [location.pathname]);


  // Añadir este efecto para cambiar estado a disponible al iniciar sesión-jhojan
  useEffect(() => {
    const cambiarEstadoAlIniciar = async () => {
      try {
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        // Si hay cédula y token, significa que el usuario ha iniciado sesión-jhojan
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
  }, []); // Solo se ejecuta al montar el componente-jhojan

  // Función para cargar los datos del guía cuando se muestra el perfil
  const loadGuiaData = () => {
    setLoading(true);
    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula) {
      setError("No se encontró la cédula del guia.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:10101/guia/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos del guia recibidos:", response.data);
        // Guardar los datos del guía
        setGuia(response.data);
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
      path: "/VistaGuia",
      section: "Dashboard"
    },
    {
      title: "VisualizarRutas",
      icon: <BarChart2 className="w-5 h-5" />,
      path: "/VistaGuia/VisualizarRutas",
      section: "Dashboard"
    },
    {
      title: "RutasAsignadas",
      icon: <FileText className="w-5 h-5" />,
      path: "/VistaGuia/RutasAsignadas",
      section: "Dashboard"
    },
    {
      title: "Customers",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaGuia/customers",
      section: "Customers"
    },
    {
      title: "New Customer",
      icon: <UserPlus className="w-5 h-5" />,
      path: "/VistaGuia/new-customer",
      section: "Customers"
    },
    {
      title: "Verified Customers",
      icon: <UserCheck className="w-5 h-5" />,
      path: "/VistaGuia/verified-customers",
      section: "Customers"
    },
    {
      title: "Products",
      icon: <Package className="w-5 h-5" />,
      path: "/VistaGuia/products",
      section: "Products"
    },
    {
      title: "New Product",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaGuia/new-product",
      section: "Products"
    },
    {
      title: "Inventory",
      icon: <PackageSearch className="w-5 h-5" />,
      path: "/VistaGuia/inventory",
      section: "Products"
    },
    {
      title: "CambiarContraseña",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaGuia/CambiarContraseña",
      section: "CambiarContra"
    },
    {
      title: "PerfilGuia",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaGuia/PerfilGuia",
      section: "Products"
    },
    {
      title: "ActualizarGuia",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaGuia/ActualizarGuia",
      section: "ActualizarGuia"
    }

    

  ];
  
  const sections = ["Dashboard", "Customers", "Products"];

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Modificar la función handleOptionClick para cambiar estado al cerrar sesión
  const handleOptionClick = (path, action) => {
    if (path === "/VistaGuia/PerfilGuia") {
      // Mostrar el perfil y cargar los datos
      setShowProfile(true);
      loadGuiaData();
      navigate("/VistaGuia/PerfilGuia"); // Navegar a la ruta principal
    } else if (path === "/") {
      // Lógica para cerrar sesión-jhojan
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
          // Aún así continuar con el cierre de sesión-jhojan
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
    setIsOpen(false);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setShowProfile(false); // Ocultar el perfil al hacer clic en un elemento del menú
  };

  const menuOptions = [
    { 
      label: "Ver perfil", 
      path: "/VistaGuia/PerfilGuia",
      action: () => {
        setShowProfile(true);
        loadGuiaData();
      }
    },
    { label: "Actualizar perfil", path: "/VistaCliente/ActualizarPerfil" },
    { label: "Cambiar contraseña", path: "/VistaGuia/CambiarContraseña" },
    { label: "Eliminar cuenta", path: "/VistaCliente/EliminarCuenta" },
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

  // Componente del perfil del guía con datos dinámicos
  const PerfilGuiaComponent = () => {
    if (loading) return (
      <div className={`${darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-6 shadow-lg text-center`}>
        Cargando perfil...
      </div>
    );
    
    if (error) return (
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg text-center text-red-500`}>
        {error}
      </div>
    );
    
    // Si no hay datos, mostrar un mensaje
    if (!guia) return (
      <div className={`${darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-6 shadow-lg text-center`}>
        No se encontraron datos del guía.
      </div>
    );
    
    // Verificamos si guia es un array o un objeto
    const guiaData = Array.isArray(guia) ? guia[0] : guia;
    
    // Extraer nombre
    const nombreCompleto = guiaData.nombre || guiaData.nombre_completo || guiaData.nombre_del_guia || "No disponible";
    const { nombres, apellidos } = separarNombre(nombreCompleto);
    
    return (
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Perfil del Guía</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen de perfil */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-500">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=0D8ABC&color=fff`}
                alt="Perfil del guía"
                className="h-full w-full object-cover"
              />
            </div>
            <button className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors duration-200`}>
              Cambiar foto
            </button>
          </div>
          
          {/* Información personal */}
          <div className="flex-1">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</h3>
                <p className="font-medium text-lg">{nombres}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Apellidos</h3>
                <p className="font-medium text-lg">{apellidos}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cédula</h3>
                <p className="font-medium text-lg">{guiaData.cedula || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correo electrónico</h3>
                <p className="font-medium text-lg">{guiaData.email || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teléfono</h3>
                <p className="font-medium text-lg">{guiaData.telefono || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Especialidad</h3>
                <p className="font-medium text-lg">{guiaData.especialidad || "No disponible"}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors duration-200`}>
                Editar información
              </button>
              <button 
                onClick={() => navigate("/VistaGuia/CambiarContraseña")}
                className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${darkMode ? 'text-white' : 'text-gray-800'} font-medium transition-colors duration-200`}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
        
        {/* Sección de estadísticas - Valores estáticos por ahora */}
        <div className="mt-8">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Estadísticas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Rutas completadas</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-700'}`}>127</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Valoración media</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>4.8/5.0</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Clientes atendidos</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-purple-700'}`}>350+</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mapa de términos de búsqueda y sus rutas correspondientes
  const searchMapping = [
    { terms: ['dashboard', 'inicio', 'principal', 'panel'], path: '/VistaGuia', title: 'Dashboard' },
    { terms: ['ruta', 'visualizar rutas', 'ver rutas'], path: '/VistaGuia/VisualizarRutas', title: 'Visualizar Rutas' },
    { terms: ['asignadas', 'rutas asignadas', 'mis rutas'], path: '/VistaGuia/RutasAsignadas', title: 'Rutas Asignadas' },
    { terms: ['cliente', 'clientes', 'usuarios'], path: '/VistaGuia/customers', title: 'Clientes' },
    { terms: ['nuevo cliente', 'agregar cliente'], path: '/VistaGuia/new-customer', title: 'Nuevo Cliente' },
    { terms: ['verificados', 'clientes verificados'], path: '/VistaGuia/verified-customers', title: 'Clientes Verificados' },
    { terms: ['producto', 'productos'], path: '/VistaGuia/products', title: 'Productos' },
    { terms: ['nuevo producto', 'agregar producto'], path: '/VistaGuia/new-product', title: 'Nuevo Producto' },
    { terms: ['inventario', 'stock'], path: '/VistaGuia/inventory', title: 'Inventario' },
    { terms: ['contraseña', 'cambiar contraseña', 'password'], path: '/VistaGuia/CambiarContraseña', title: 'Cambiar Contraseña' },
    { terms: ['perfil', 'mi perfil', 'datos personales'], path: '/VistaGuia/PerfilGuia', title: 'Perfil Guía' },
    { terms: ['actualizar', 'actualizar guia', 'editar perfil'], path: '/VistaGuia/ActualizarGuia', title: 'Actualizar Guía' }
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
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={` 
        ${collapsed ? 'w-20' : 'w-64'} 
        ${darkMode ? 'bg-[#0f172a]' : 'bg-white'} 
        p-4 transition-all duration-300 flex flex-col
        ${darkMode ? 'text-gray-400' : 'text-gray-600'}
        border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}
        h-screen sticky top-0
      `}>
        <div className="mb-8 flex flex-col items-start">
          <div className="flex items-center">
            {!collapsed && <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Explococora</h1>} 
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-blue-600 text-white ml-2"
            >
              
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          {!collapsed && <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'} mt-1 text-center w-40`}>Guia</h1>}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              {!collapsed && <h2 className="text-gray-400 text-sm mb-2">{section}</h2>}
              {menuItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => handleMenuItemClick(item.path)}
                    className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
                      location.pathname === item.path
                        ? "bg-blue-600 text-white"
                        : `text-gray-400 ${!darkMode && 'hover:bg-gray-100'}`
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

        <div className={`border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} pt-4 mt-4`}>
          <Link
            to="/VistaGuia/settings"
            onClick={() => setShowProfile(false)}
            className={`flex items-center gap-2 w-full p-2 mb-2 rounded-lg ${
              location.pathname === '/VistaGuia/settings'
                ? "bg-blue-600 text-white"
                : "text-gray-400"
            }`}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${darkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
        {/* Top Navigation */}
        <div className={`${darkMode ? 'bg-[#0f172a]' : 'bg-white'} sticky top-0 z-10`}>
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
                    darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                />
                <button 
                  type="submit"
                  className={`p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
              
              {/* Resultados de búsqueda */}
              {showResults && (
                <div 
                  className={`absolute top-full left-0 w-full mt-1 rounded-lg shadow-lg z-50 ${
                    darkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-gray-900'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleResultClick(result.path)}
                      className={`p-3 cursor-pointer flex items-center gap-2 ${
                        darkMode 
                          ? 'hover:bg-gray-700 border-b border-gray-700' 
                          : 'hover:bg-gray-100 border-b border-gray-200'
                      } ${index === searchResults.length - 1 ? 'border-b-0 rounded-b-lg' : ''}`}
                    >
                      {/* Icono basado en el título */}
                      {result.title === 'Dashboard' && <LayoutDashboard className="w-4 h-4" />}
                      {result.title === 'Visualizar Rutas' && <BarChart2 className="w-4 h-4" />}
                      {result.title === 'Rutas Asignadas' && <FileText className="w-4 h-4" />}
                      {result.title === 'Clientes' && <Users className="w-4 h-4" />}
                      {result.title === 'Nuevo Cliente' && <UserPlus className="w-4 h-4" />}
                      {result.title === 'Clientes Verificados' && <UserCheck className="w-4 h-4" />}
                      {result.title === 'Productos' && <Package className="w-4 h-4" />}
                      {result.title === 'Nuevo Producto' && <PackagePlus className="w-4 h-4" />}
                      {result.title === 'Inventario' && <PackageSearch className="w-4 h-4" />}
                      {result.title === 'Cambiar Contraseña' && <Settings className="w-4 h-4" />}
                      {result.title === 'Perfil Guía' && <User className="w-4 h-4" />}
                      {result.title === 'Actualizar Guía' && <UserPlus className="w-4 h-4" />}
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
                  esAdmin={false}
                  esPropio={true}
                />
              )}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Bell className="w-5 h-5" />
              </button>
              
              {/* Avatar con menú desplegable */}
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
                  onClick={toggleMenu}
                >
                  <img
                    src="https://ui-avatars.com/api/?name=User&background=random"
                    alt="Perfil de usuario"
                    className="h-full w-full object-cover transform transition hover:scale-110 active:scale-95"
                  />
                </div>
                
                {/* Menú desplegable reposicionado */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-teal-700 border-2 border-gray-900 rounded-xl shadow-xl py-2 z-50 transform transition-all duration-300 ease-in-out">
                    {menuOptions.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleOptionClick(option.path, option.action)}
                        role="menuitem"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleOptionClick(option.path, option.action);
                          }
                        }}
                        className={`group px-4 py-3 text-white ${
                          index === menuOptions.length - 1
                            ? "mt-1 text-red-400 hover:text-white hover:bg-red-600 active:bg-red-700 font-bold"
                            : "hover:bg-teal-600 active:bg-teal-500"
                        } flex items-center cursor-pointer transition-all duration-200 text-sm md:text-base relative overflow-hidden`}
                      >
                        <span className="relative z-10">{option.label}</span>
                        <span 
                          className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                            index === menuOptions.length - 1
                              ? "bg-red-400"
                              : "bg-teal-400"
                          } group-hover:w-full transition-all duration-300 ease-out`}
                        ></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content and Footer Container */}
        <div className={`flex-1 flex flex-col overflow-auto ${darkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
          {/* Page Content */}
          <div className="flex-1 p-4">
            {showProfile && location.pathname === "/VistaGuia" ? <PerfilGuiaComponent /> : children}
          </div>

          {/* Footer */}
          <div className={`p-4 ${darkMode ? 'bg-[#0f172a] text-gray-400' : 'bg-white text-gray-600'} sticky bottom-0`}>
            <div className="flex justify-between items-center text-sm">
              <span>© 2025 ExploCocora. Todos los derechos reservados.</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutGuia;