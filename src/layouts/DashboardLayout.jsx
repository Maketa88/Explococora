import React, { useState, useEffect } from 'react';
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
  LogOut
} from 'lucide-react';
import SelectorEstado from '../pages/VistaOperador/CambioEstadoOpe/Selector_Estado_Ope';
import axios from 'axios';
import AlertasEstado from '../components/Alertas/AlertasEstado';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem('fotoPerfilURL') || null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [operadorEstado, setOperadorEstado] = useState("disponible");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Escuchar el evento de actualización de perfil
  useEffect(() => {
    const handlePerfilActualizado = (event) => {
      if (event.detail.foto) {
        setFotoPerfil(event.detail.foto);
        localStorage.setItem('fotoPerfilURL', event.detail.foto);
      }
      if (event.detail.nombre) {
        setNombreUsuario(event.detail.nombre);
      }
    };
    
    // Añadir el listener
    window.addEventListener('perfilActualizado', handlePerfilActualizado);
    
    // Cargar datos iniciales
    const operadorData = localStorage.getItem('operadorData');
    if (operadorData) {
      try {
        const datos = JSON.parse(operadorData);
        if (datos.foto) {
          setFotoPerfil(datos.foto);
        }
        if (datos.primerNombre && datos.primerApellido) {
          setNombreUsuario(`${datos.primerNombre} ${datos.primerApellido}`);
        }
      } catch (e) {
        console.error("Error al parsear datos del operador:", e);
      }
    }
    
    // Limpiar el listener al desmontar
    return () => {
      window.removeEventListener('perfilActualizado', handlePerfilActualizado);
    };
  }, []);

  // Añadir o actualizar este useEffect para cargar la foto al iniciar sesión
  useEffect(() => {
    // Intentar obtener la foto del localStorage para mostrarla rápidamente
    const storedFoto = localStorage.getItem("fotoPerfilURL");
    if (storedFoto) {
      setFotoPerfil(storedFoto);
    }
    
    // Cargar los datos del perfil automáticamente al iniciar sesión
    const cargarFotoPerfil = async () => {
      try {
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        if (!cedula || !token) return;
        
        console.log("Cargando foto de perfil desde el servidor...");
        
        // Hacer la solicitud para obtener los datos del operador
        const response = await axios.get(`http://localhost:10101/operador-turistico/${cedula}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            _t: new Date().getTime() // Evitar caché
          }
        });
        
        if (response.data) {
          const operadorData = Array.isArray(response.data) ? response.data[0] : response.data;
          
          // Si hay una foto en los datos del operador, usarla
          if (operadorData.foto) {
            let fotoUrl;
            if (operadorData.foto.startsWith('http')) {
              fotoUrl = operadorData.foto;
            } else if (operadorData.foto.includes('/uploads/images/')) {
              fotoUrl = `http://localhost:10101${operadorData.foto}`;
            } else {
              fotoUrl = `http://localhost:10101/uploads/images/${operadorData.foto}`;
            }
            
            console.log("Foto cargada desde el servidor:", fotoUrl);
            
            // Actualizar el estado y localStorage
            setFotoPerfil(fotoUrl);
            localStorage.setItem("fotoPerfilURL", fotoUrl);
            
            // Notificar a otros componentes
            const event = new CustomEvent('perfilActualizado', { 
              detail: { 
                foto: fotoUrl,
                temporal: false
              } 
            });
            window.dispatchEvent(event);
          }
        }
      } catch (error) {
        console.error("Error al cargar foto de perfil:", error);
      }
    };
    
    // Ejecutar la función al montar el componente
    cargarFotoPerfil();
    
    // También escuchar eventos de actualización de perfil
    const handlePerfilActualizado = (event) => {
      if (event.detail && event.detail.foto) {
        console.log("Actualizando foto de perfil desde evento:", event.detail.foto);
        setFotoPerfil(event.detail.foto);
        
        // Si la foto no es temporal, guardarla en localStorage
        if (!event.detail.temporal) {
          localStorage.setItem("fotoPerfilURL", event.detail.foto);
        }
      }
    };
    
    window.addEventListener('perfilActualizado', handlePerfilActualizado);
    
    // Limpiar el listener al desmontar
    return () => {
      window.removeEventListener('perfilActualizado', handlePerfilActualizado);
    };
  }, []);

  // Añadir este useEffect para actualizar la foto cuando cambia la ruta
  useEffect(() => {
    // Verificar si estamos navegando al dashboard
    if (location.pathname === "/VistaOperador") {
      // Intentar obtener la foto más reciente del localStorage
      const storedFoto = localStorage.getItem("fotoPerfilURL");
      if (storedFoto) {
        setFotoPerfil(storedFoto);
      }
      
      // Si tenemos cédula y token, también podríamos obtener los datos más recientes
      const cedula = localStorage.getItem("cedula");
      const token = localStorage.getItem("token");
      
      if (cedula && token) {
        // Obtener la foto más reciente del servidor
        axios.get(`http://localhost:10101/operador-turistico/perfil-completo/${cedula}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            _t: new Date().getTime() // Evitar caché
          }
        })
        .then(response => {
          if (response.data) {
            const operadorData = Array.isArray(response.data) ? 
              (Array.isArray(response.data[0]) ? response.data[0][0] : response.data[0]) : 
              response.data;
            
            if (operadorData.foto) {
              let fotoUrl;
              if (operadorData.foto.startsWith('http')) {
                fotoUrl = operadorData.foto;
              } else if (operadorData.foto.includes('/uploads/images/')) {
                fotoUrl = `http://localhost:10101${operadorData.foto}`;
              } else {
                fotoUrl = `http://localhost:10101/uploads/images/${operadorData.foto}`;
              }
              
              setFotoPerfil(fotoUrl);
              localStorage.setItem("fotoPerfilURL", fotoUrl);
            }
          }
        })
        .catch(error => {
          console.error("Error al obtener datos actualizados:", error);
        });
      }
    }
  }, [location.pathname]);

  const handleCambioEstado = (nuevoEstado) => {
    setOperadorEstado(nuevoEstado);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/VistaOperador",
      section: "Dashboard"
    },
    {
      title: "Rutas",
      icon: <BarChart2 className="w-5 h-5" />,
      path: "/VistaOperador/Rutas",
      section: "Dashboard"
    },
    {
      title: "Reports",
      icon: <FileText className="w-5 h-5" />,
      path: "/VistaOperador/reports",
      section: "Dashboard"
    },
    {
      title: "Gestionar Guías",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaOperador/guias",
      section: "Guías"
    },
    {
      title: "Nuevo Guía",
      icon: <UserPlus className="w-5 h-5" />,
      path: "/VistaOperador/nuevo-guia",
      section: "Guías"
    },
    {
      title: "Products",
      icon: <Package className="w-5 h-5" />,
      path: "/VistaOperador/products",
      section: "Products"
    },
    {
      title: "New Product",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaOperador/new-product",
      section: "Products"
    },
    {
      title: "Inventory",
      icon: <PackageSearch className="w-5 h-5" />,
      path: "/VistaOperador/inventory",
      section: "Products"
    }
  ];

  const sections = ["Dashboard", "Guías", "Products"];

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Convertir a minúsculas para hacer la búsqueda insensible a mayúsculas/minúsculas
    const term = searchTerm.toLowerCase();
    
    // Mapeo de términos de búsqueda a rutas
    if (term.includes('ruta') || term.includes('camino')) {
      navigate('/VistaOperador/Rutas');
    } else if (term.includes('reporte') || term.includes('informe')) {
      navigate('/VistaOperador/Reports');
    } else if (term.includes('cliente') || term.includes('usuario')) {
      navigate('/VistaOperador/Customers');
    } else if (term.includes('producto') || term.includes('inventario')) {
      navigate('/VistaOperador/Products');
    } else if (term.includes('dashboard') || term.includes('inicio')) {
      navigate('/VistaOperador/Dashboard');
    } else {
      // Si no hay coincidencias, podemos mostrar un mensaje o simplemente no hacer nada
      alert('No se encontraron resultados para: ' + searchTerm);
    }
    
    // Limpiar el campo de búsqueda
    setSearchTerm('');
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const cedula = localStorage.getItem('cedula');
      
      // Cambiar estado a inactivo antes de cerrar sesión
      await axios.patch('http://localhost:10101/usuarios/cambiar-estado', 
        { 
          cedula: cedula,
          nuevoEstado: 'inactivo'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Eliminar el token y otros datos del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('cedula');
      // Redirigir a la página de inicio de sesión
      navigate('/Ingreso');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Continuar con el cierre de sesión incluso si falla el cambio de estado
      localStorage.removeItem('token');
      localStorage.removeItem('cedula');
      navigate('/Ingreso');
    }
  };

  // Función para manejar la actualización del estado en el header
  const actualizarEstadoHeader = (nuevoEstado) => {
    setOperadorEstado(nuevoEstado);
  };

  // Añadir este efecto para escuchar los cambios de estado
  useEffect(() => {
    // Escuchar eventos de cambio de estado
    const handleEstadoCambiado = (event) => {
      if (event.detail && event.detail.estado) {
        setOperadorEstado(event.detail.estado);
      }
    };
    
    // Cargar estado inicial desde localStorage
    const estadoGuardado = localStorage.getItem('ultimoEstadoOperador');
    if (estadoGuardado) {
      setOperadorEstado(estadoGuardado);
    }
    
    // Escuchar cambios de estado globales
    window.addEventListener('estadoOperadorCambiado', handleEstadoCambiado);
    
    return () => {
      window.removeEventListener('estadoOperadorCambiado', handleEstadoCambiado);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      try {
        const token = localStorage.getItem('token');
        const cedula = localStorage.getItem('cedula');
        
        if (!token || !cedula) return;

        // Usar sendBeacon para garantizar que la solicitud se complete
        const data = new FormData();
        data.append('cedula', cedula);
        data.append('nuevoEstado', 'inactivo');

        navigator.sendBeacon(
          'http://localhost:10101/usuarios/cambiar-estado',
          data
        );
      } catch (error) {
        console.error("Error al cambiar estado en cierre:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white ml-2"
    >
      {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </button>
  </div>
  {!collapsed && <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'} mt-1 text-center w-40`}>Operador</h1>}
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
            to="/VistaOperador/settings"
            className={`flex items-center gap-2 w-full p-2 mb-2 rounded-lg ${
              location.pathname === '/VistaOperador/settings'
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
            <div className="flex-1 max-w-xl">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>
            <div className="flex items-center gap-4">
              <div className="mr-4">
                <SelectorEstado 
                  estadoActual={operadorEstado}
                  onCambioEstado={actualizarEstadoHeader}
                  cedula={localStorage.getItem('cedula')}
                  esAdmin={false}
                  esPropio={true}
                />
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Bell className="w-5 h-5" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
                >
                  {fotoPerfil ? (
                    <img 
                      src={fotoPerfil} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {nombreUsuario ? nombreUsuario.charAt(0) : "U"}
                    </div>
                  )}
                </button>
                
                {/* Menú desplegable de perfil */}
                {profileMenuOpen && (
                  <div 
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                    ${darkMode ? 'bg-gray-800' : 'bg-white'} 
                    ring-1 ring-black ring-opacity-5 z-50`}
                  >
                    <Link 
                      to="/VistaOperador/perfil" 
                      className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2`}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Ver Perfil
                    </Link>
                    <Link 
                      to="/VistaOperador/perfil/actualizar" 
                      className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2`}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Edit className="w-4 h-4" />
                      Actualizar Información
                    </Link>
                    <Link 
                      to="/VistaOperador/perfil/cambiar-contrasena" 
                      className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2`}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Key className="w-4 h-4" />
                      Cambiar Contraseña
                    </Link>
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} flex items-center gap-2`}
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
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
            {children}
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

      {/* Componente de alertas de estado */}
      <AlertasEstado />
    </div>
  );
};

// Añadir este componente que monitorea y muestra el estado en todas las páginas
const EstadoIndicator = () => {
  const [estado, setEstado] = useState('');
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Obtener estado inicial
    const estadoGuardado = localStorage.getItem('ultimoEstadoOperador');
    if (estadoGuardado) {
      setEstado(estadoGuardado);
      setVisible(true);
    }
    
    // Escuchar cambios de estado
    const handleEstadoCambiado = (event) => {
      setEstado(event.detail.estado);
      setVisible(true);
    };
    
    window.addEventListener('estadoOperadorCambiado', handleEstadoCambiado);
    
    return () => {
      window.removeEventListener('estadoOperadorCambiado', handleEstadoCambiado);
    };
  }, []);
  
  if (!visible) return null;
  
  const getEstadoStyles = () => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ocupado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'inactivo':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full border ${getEstadoStyles()} shadow-lg`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 animate-pulse ${
          estado === 'disponible' ? 'bg-green-500' : 
          estado === 'ocupado' ? 'bg-yellow-500' : 
          'bg-red-500'
        }`}></div>
        <span className="font-medium capitalize">{estado}</span>
      </div>
    </div>
  );
};

export default DashboardLayout; 