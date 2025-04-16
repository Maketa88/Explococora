import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserPlus,
  UserCheck,
  PackageSearch,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Edit,
  Key,
  LogOut,
  Map,
  CreditCard,
  Package,
  CalendarDays,
  ChevronDown
} from 'lucide-react';
import SelectorEstado from '../pages/VistaOperador/CambioEstadoOpe/Selector_Estado_Ope';
import axios from 'axios';
import AlertasEstado from '../components/Alertas/AlertasEstado';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem('fotoPerfilURL') || null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [operadorEstado, setOperadorEstado] = useState("disponible");
  
  // Crear un estado para manejar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    Dashboard: true,
    Rutas: true,
    Guías: true,
    Informes: true
  });
  
  // Función para alternar el estado de expansión de una sección
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    // Emitir evento para otros componentes
    const event = new CustomEvent('estadoOperadorCambiado', { 
      detail: { estado: nuevoEstado } 
    });
    window.dispatchEvent(event);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/VistaOperador",
      section: "Dashboard"
    },
    {
      title: "Reports",
      icon: <FileText className="w-5 h-5" />,
      path: "/VistaOperador/reports",
      section: "Dashboard"
    },
    {
      title: "Rutas",
      icon: <Map className="w-5 h-5" />,
      path: "/VistaOperador/Rutas",
      section: "Rutas"
    },
    {
      title: "Gestión de paquetes",
      icon: <PackageSearch className="w-5 h-5" />,
      path: "/VistaOperador/gestion-paquetes",
      section: "Rutas"
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
      title: "Estado de Guías",
      icon: <UserCheck className="w-5 h-5" />,
      path: "/VistaOperador/products",
      section: "Guías"
    },
    {
      title: "Pago Rutas",
      icon: <CreditCard className="w-5 h-5" />,
      path: "/VistaOperador/pago-rutas",
      section: "Informes"
    },
    {
      title: "Pago Paquetes",
      icon: <Package className="w-5 h-5" />,
      path: "/VistaOperador/pago-paquetes",
      section: "Informes"
    },
    {
      title: "Reservas",
      icon: <CalendarDays className="w-5 h-5" />,
      path: "/VistaOperador/reservas",
      section: "Informes"
    },
    {
      title: "GestionCaballos",
      icon: <CalendarDays className="w-5 h-5" />,
      path: "/VistaOperador/gestion-caballos",
      section: "Caballos"
    },
    {
      title: "Plantilla",
      icon: <CalendarDays className="w-5 h-5" />,
      path: "/VistaOperador/plantilla",
      section: "Gestión Plantillas"
    }
  ];

  const sections = ["Dashboard", "Rutas", "Guías", "Informes","Caballos","Gestión Plantillas"];

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
    const handleBeforeUnload = async () => {
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
          {!collapsed && <h1 className="text-lg font-bold text-emerald-700 mt-1 text-center w-40">Operador</h1>}
        </div>
        
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
          {sections.map((section) => {
            // Estado para controlar si esta sección está expandida
            const [isExpanded, setIsExpanded] = useState(true);
            
            return (
              <div key={section} className="mb-4">
                {!collapsed && (
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-emerald-600 text-sm">{section}</h2>
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1 rounded-full hover:bg-emerald-50 text-emerald-600"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                )}
                
                {/* Solo mostrar los elementos si la sección está expandida o si el menú está colapsado */}
                {(isExpanded || collapsed) && menuItems
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
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
            );
          })}
        </nav>

        <div className="border-t border-emerald-100 pt-4 mt-4">
          <Link
            to="/VistaOperador/settings"
            className={`flex items-center gap-2 w-full p-2 mb-2 rounded-lg ${
              location.pathname === '/VistaOperador/settings'
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
        {/* Top Navigation - Mejorado para responsividad */}
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-end p-3 sm:p-4">
            {/* Controles de usuario - alineados a la derecha */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="sm:mr-4">
                <SelectorEstado 
                  estadoActual={operadorEstado}
                  onCambioEstado={actualizarEstadoHeader}
                  cedula={localStorage.getItem('cedula')}
                  esAdmin={false}
                  esPropio={true}
                />
              </div>
              
              <button className="p-1.5 sm:p-2 rounded-lg text-emerald-600 hover:bg-emerald-50">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 overflow-hidden cursor-pointer"
                >
                  {fotoPerfil ? (
                    <img 
                      src={fotoPerfil} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      {nombreUsuario ? nombreUsuario.charAt(0) : "U"}
                    </div>
                  )}
                </button>
                
                {/* Menú desplegable de perfil - adaptado para móvil */}
                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                    bg-white
                    ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <Link 
                      to="/VistaOperador/perfil" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Ver Perfil
                    </Link>
                    <Link 
                      to="/VistaOperador/perfil/actualizar" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Edit className="w-4 h-4" />
                      Actualizar Información
                    </Link>
                    <Link 
                      to="/VistaOperador/perfil/cambiar-contrasena" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
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
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
        <div className="flex-1 flex flex-col overflow-auto bg-[#f0f9f4]">
          {/* Page Content */}
          <div className="flex-1 p-4 pb-8">
            {children}
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