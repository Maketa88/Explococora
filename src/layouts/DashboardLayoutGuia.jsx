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
import estadoServiceGuia from '../services/estadoServiceGuia';

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
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const [previewFoto, setPreviewFoto] = useState(null);
  
  // Nuevo estado para notificaciones
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const notificacionesRef = useRef(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Cerrar el menú desplegable cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setProfileMenuOpen(false); // Cerrar también el menú de perfil al hacer clic fuera
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

  // NUEVO: Obtener notificaciones de rutas asignadas
  const obtenerNotificacionesRutas = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) return;
      
      const response = await axios.get('http://localhost:10101/guia/mi-historial-rutas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Procesar las rutas para crear notificaciones
      let rutasData = [];
      if (Array.isArray(response.data)) {
        rutasData = response.data;
      } else if (response.data && Array.isArray(response.data.rutas)) {
        rutasData = response.data.rutas;
      } else if (response.data && typeof response.data === 'object') {
        rutasData = [response.data];
      }
      
      // Filtrar solo rutas recientes (últimos 7 días) y pendientes
      const hoy = new Date();
      const sieteD = new Date(hoy);
      sieteD.setDate(hoy.getDate() - 7);
      
      const notificacionesNuevas = rutasData
        .filter(ruta => {
          // Filtrar por fecha reciente
          const fechaAsignacion = new Date(ruta.fechaAsignacion || ruta.fechaCreacion || ruta.fecha);
          const esReciente = fechaAsignacion >= sieteD;
          
          // Filtrar por estado (solo rutas pendientes o en progreso)
          const estado = ruta.estado ? ruta.estado.toLowerCase() : '';
          const esPendiente = estado.includes('pend') || estado.includes('asign') || estado.includes('progr');
          
          return esReciente && esPendiente;
        })
        .map(ruta => ({
          id: ruta.id,
          titulo: `Ruta asignada: ${ruta.nombre || 'Nueva ruta'}`,
          descripcion: `${ruta.descripcion ? ruta.descripcion.substring(0, 60) + '...' : 'Se te ha asignado una nueva ruta.'}`,
          fecha: ruta.fechaAsignacion || ruta.fechaCreacion || ruta.fecha,
          leida: false
        }));
      
      setNotificaciones(notificacionesNuevas);
    } catch (error) {
      console.error("Error al obtener notificaciones de rutas:", error);
    }
  };
  
  // NUEVO: Cargar notificaciones cuando se monta el componente
  useEffect(() => {
    obtenerNotificacionesRutas();
    
    // Actualizar notificaciones cada 5 minutos
    const intervalo = setInterval(() => {
      obtenerNotificacionesRutas();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalo);
  }, []);
  
  // NUEVO: Cerrar dropdown de notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificacionesRef.current && !notificacionesRef.current.contains(event.target)) {
        setMostrarNotificaciones(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // NUEVO: Función para alternar la visualización de notificaciones
  const toggleNotificaciones = () => {
    setMostrarNotificaciones(!mostrarNotificaciones);
  };
  
  // NUEVO: Función para manejar clic en una notificación
  const handleNotificacionClick = (id) => {
    // Marcar notificación como leída
    setNotificaciones(prev => 
      prev.map(notif => 
        notif.id === id ? {...notif, leida: true} : notif
      )
    );
    
    // Navegar a la página de rutas asignadas
    navigate("/VistaGuia/RutasAsignadas");
    setMostrarNotificaciones(false);
  };
  
  // NUEVO: Formatear fecha para notificaciones
  const formatearFechaNotificacion = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    
    // Si es hoy
    if (fecha.toDateString() === hoy.toDateString()) {
      return `Hoy, ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Si es ayer
    if (fecha.toDateString() === ayer.toDateString()) {
      return `Ayer, ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Otro día
    return `${fecha.getDate()}/${fecha.getMonth() + 1}, ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')}`;
  };

  // Modificar este efecto para obtener el estado guardado en lugar de cambiarlo a disponible
  useEffect(() => {
    const inicializarEstado = async () => {
      try {
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        // Si hay cédula y token, significa que el usuario ha iniciado sesión
        if (cedula && token) {
          // Intentar obtener el último estado conocido del servicio centralizado
          const estadoGuardado = estadoServiceGuia.getEstado();
          
          // Establecer el estado visual desde el servicio
          setEstado(estadoGuardado);
          
          // Solo si no hay estado guardado o es la primera sesión, establecer a disponible
          if (!estadoGuardado || estadoGuardado === 'disponible') {
            // Llamar a la API para cambiar estado
            await axios.patch('http://localhost:10101/usuarios/cambiar-estado', 
              { nuevoEstado: "disponible", cedula }, 
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            // Actualizar estado local y en el servicio centralizado
            setEstado("disponible");
            estadoServiceGuia.setEstado("disponible");
          } else {
            // Si hay un estado guardado, verificar con el servidor y sincronizar
            try {
              await axios.patch('http://localhost:10101/usuarios/cambiar-estado', 
                { nuevoEstado: estadoGuardado, cedula }, 
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
            } catch (syncError) {
              console.error("Error al sincronizar el estado con el servidor:", syncError);
            }
          }
        }
      } catch (error) {
        console.error("Error al inicializar estado:", error);
      }
    };
    
    inicializarEstado();
  }, []); // Solo se ejecuta al montar el componente

  // Modificar el useEffect para cargar inmediatamente los datos del perfil
  useEffect(() => {
    // Intentar obtener la foto del localStorage para mostrarla rápidamente
    const storedFoto = localStorage.getItem("foto_perfil");
    if (storedFoto) {
      setPreviewFoto(storedFoto);
    }
    
    // Si estamos en la ruta principal o en la ruta de perfil, cargar los datos
    if (location.pathname === "/VistaGuia" || location.pathname === "/VistaGuia/PerfilGuia") {
      loadGuiaData(); // Cargar los datos del perfil automáticamente
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
    if (location.pathname === "/VistaGuia") {
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
        axios.get(`http://localhost:10101/guia/perfil-completo/${cedula}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(response => {
          if (response.data) {
            const guiaData = Array.isArray(response.data) ? response.data[0] : response.data;
            
            if (guiaData.foto_perfil) {
              let fotoUrl;
              if (guiaData.foto_perfil.startsWith('http')) {
                fotoUrl = guiaData.foto_perfil;
              } else if (guiaData.foto_perfil.includes('/uploads/images/')) {
                fotoUrl = `http://localhost:10101${guiaData.foto_perfil}`;
              } else {
                fotoUrl = `http://localhost:10101/uploads/images/${guiaData.foto_perfil}`;
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

    axios.get(`http://localhost:10101/guia/perfil-completo/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos del guia recibidos:", response.data);
        // Guardar los datos del guía
        setGuia(response.data);
        
        // Verificar si hay una foto en la respuesta del servidor
        const guiaData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (guiaData.foto_perfil) {
          // Si la foto comienza con http, es una URL completa
          if (guiaData.foto_perfil.startsWith('http')) {
            setPreviewFoto(guiaData.foto_perfil);
            localStorage.setItem("foto_perfil", guiaData.foto_perfil);
          } 
          // Si la foto no comienza con http, construir la URL completa
          else {
            let fotoUrl;
            if (guiaData.foto_perfil.includes('/uploads/images/')) {
              fotoUrl = `http://localhost:10101${guiaData.foto_perfil}`;
            } else {
              fotoUrl = `http://localhost:10101/uploads/images/${guiaData.foto_perfil}`;
            }
            
            setPreviewFoto(fotoUrl);
            localStorage.setItem("foto_perfil", fotoUrl);
          }
        } 
        // Verificar si hay foto en otros campos posibles
        else if (guiaData.foto) {
          let fotoUrl;
          if (guiaData.foto.startsWith('http')) {
            fotoUrl = guiaData.foto;
          } else if (guiaData.foto.includes('/uploads/images/')) {
            fotoUrl = `http://localhost:10101${guiaData.foto}`;
          } else {
            fotoUrl = `http://localhost:10101/uploads/images/${guiaData.foto}`;
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
      path: "/VistaGuia/Dashboard",
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
      title: "Alertas y Recordatorios",
      icon: <UserPlus className="w-5 h-5" />,
      path: "/VistaGuia/AlertasyRecordatorios",
      section: "Customers"
    },
    {
      title: "Calendario de Citas",
      icon: <UserCheck className="w-5 h-5" />,
      path: "/VistaGuia/CalendarioCitas",
      section: "Customers"
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
      section: "GestionPerfil"
    },
    {
      title: "ActualizarGuia",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaGuia/ActualizarGuia",
      section: "ActualizarGuia"
    },
    {
      title: "EliminarCuentaGuia",
      icon: <Trash2 className="w-5 h-5" />,
      path: "/VistaGuia/EliminarCuentaGuia",
      section: "EliminarCuenta"
    }
  ];
  
  const sections = ["Dashboard", "Customers", "GestionPerfil"];

  const toggleMenu = (e) => {
    e.stopPropagation();
    setProfileMenuOpen(!profileMenuOpen);
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
    setProfileMenuOpen(false);
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
      <div className="bg-white text-gray-700 rounded-lg p-6 shadow-lg text-center">
        Cargando perfil...
      </div>
    );
    
    if (error) return (
      <div className="bg-white rounded-lg p-6 shadow-lg text-center text-red-500">
        {error}
      </div>
    );
    
    // Si no hay datos, mostrar un mensaje
    if (!guia) return (
      <div className="bg-white text-gray-700 rounded-lg p-6 shadow-lg text-center">
        No se encontraron datos del guía.
      </div>
    );
    
    // Verificamos si guia es un array o un objeto
    const guiaData = Array.isArray(guia) ? guia[0] : guia;
    
    // Extraer nombre
    const nombreCompleto = guiaData.nombre || guiaData.nombre_completo || guiaData.nombre_del_guia || "No disponible";
    const { nombres, apellidos } = separarNombre(nombreCompleto);
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg text-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-emerald-800">Perfil del Guía</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen de perfil */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-emerald-500">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Perfil del guía"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=059669&color=fff`;
                  }}
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=059669&color=fff`}
                  alt="Perfil del guía"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <button className={`py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200`}>
              Cambiar foto
            </button>
          </div>
          
          {/* Información personal */}
          <div className="flex-1">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600`}>
              <div>
                <h3 className={`text-sm uppercase mb-1 text-emerald-400`}>Nombre</h3>
                <p className="font-medium text-lg">{nombres}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 text-emerald-400`}>Apellidos</h3>
                <p className="font-medium text-lg">{apellidos}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 text-emerald-400`}>Cédula</h3>
                <p className="font-medium text-lg">{guiaData.cedula || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 text-emerald-400`}>Correo electrónico</h3>
                <p className="font-medium text-lg">{guiaData.email || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 text-emerald-400`}>Teléfono</h3>
                <p className="font-medium text-lg">{guiaData.telefono || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 text-emerald-400`}>Especialidad</h3>
                <p className="font-medium text-lg">{guiaData.especialidad || "No disponible"}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button className={`py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors duration-200`}>
                Editar información
              </button>
              <button 
                onClick={() => navigate("/VistaGuia/CambiarContraseña")}
                className={`py-2 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-colors duration-200`}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
        
        {/* Sección de estadísticas - Valores estáticos por ahora */}
        <div className="mt-8">
          <h3 className={`text-xl font-bold mb-4 text-emerald-800`}>Estadísticas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg bg-emerald-100`}>
              <h4 className={`text-sm uppercase mb-1 text-emerald-300`}>Rutas completadas</h4>
              <p className={`text-2xl font-bold text-emerald-700`}>127</p>
            </div>
            
            <div className={`p-4 rounded-lg bg-emerald-100`}>
              <h4 className={`text-sm uppercase mb-1 text-emerald-300`}>Valoración media</h4>
              <p className={`text-2xl font-bold text-emerald-700`}>4.8/5.0</p>
            </div>
            
            <div className={`p-4 rounded-lg bg-emerald-100`}>
              <h4 className={`text-sm uppercase mb-1 text-emerald-300`}>Clientes atendidos</h4>
              <p className={`text-2xl font-bold text-emerald-700`}>350+</p>
            </div>
          </div>
        </div>

        {/* Botón para ir al Dashboard */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => navigate("/VistaGuia/Dashboard")}
            className={`py-2 px-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors duration-200 flex items-center gap-2`}
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

  // Add this function to get estado indicator styles
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
  
  // Add this function for the dot indicator styles
  const getEstadoDotStyles = () => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-500';
      case 'ocupado':
        return 'bg-yellow-500';
      case 'inactivo':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Actualizar el SelectorEstado para que use estadoServiceGuia
  const handleCambioEstado = (nuevoEstado) => {
    setEstado(nuevoEstado);
    // Actualizar el servicio centralizado
    estadoServiceGuia.setEstado(nuevoEstado);
  };

  // Agregar un listener para sincronizar el estado del layout con el componente EstadoGuia
  useEffect(() => {
    const handleEstadoChange = (event) => {
      if (event.detail && event.detail.estado) {
        setEstado(event.detail.estado);
      }
    };
    
    window.addEventListener('estadoGuiaCambiado', handleEstadoChange);
    
    return () => {
      window.removeEventListener('estadoGuiaCambiado', handleEstadoChange);
    };
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden bg-[#f0f9f4]`}>
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
          {!collapsed && <h1 className="text-lg font-bold text-emerald-700 mt-1 text-center w-40">Guia</h1>}
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
            to="/VistaGuia/settings"
            onClick={() => setShowProfile(false)}
            className={`flex items-center gap-2 w-full p-2 mb-2 rounded-lg ${
              location.pathname === '/VistaGuia/settings'
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
          <div className="flex items-center justify-between p-4">
            <div className="flex-1"></div> {/* Empty div to maintain layout */}
            <div className="flex items-center gap-4">
              {localStorage.getItem('cedula') && (
                <SelectorEstado 
                  estadoActual={estado}
                  onCambioEstado={handleCambioEstado}
                  cedula={localStorage.getItem('cedula')}
                  esAdmin={false}
                  esPropio={true}
                />
              )}
              <div className="relative" ref={notificacionesRef}>
                <button 
                  className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 relative"
                  onClick={toggleNotificaciones}
                >
                  <Bell className="w-5 h-5" />
                  {notificaciones.filter(n => !n.leida).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {notificaciones.filter(n => !n.leida).length}
                    </span>
                  )}
                </button>
                
                {mostrarNotificaciones && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notificaciones.length > 0 ? (
                        notificaciones.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors ${!notif.leida ? 'bg-emerald-50/50' : ''}`}
                            onClick={() => handleNotificacionClick(notif.id)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-emerald-800">{notif.titulo}</h4>
                              {!notif.leida && (
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{notif.descripcion}</p>
                            <p className="text-xs text-gray-500">{formatearFechaNotificacion(notif.fecha)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          </svg>
                          <p>No hay notificaciones</p>
                        </div>
                      )}
                    </div>
                    
                    {notificaciones.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button 
                          className="w-full py-1.5 text-sm text-emerald-600 hover:text-emerald-700 text-center"
                          onClick={() => {
                            setNotificaciones(prev => prev.map(n => ({...n, leida: true})));
                            setMostrarNotificaciones(false);
                          }}
                        >
                          Marcar todas como leídas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden cursor-pointer"
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
                        const nombreGuia = guia ? (Array.isArray(guia) ? guia[0].nombre_del_guia : guia.nombre_del_guia) : "User";
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreGuia || "User")}&background=059669&color=fff`;
                      }}
                    />
                  ) : (
                    <img
                      src="https://ui-avatars.com/api/?name=User&background=059669&color=fff"
                      alt="Perfil de usuario"
                      className="h-full w-full object-cover transform transition hover:scale-110 active:scale-95"
                    />
                  )}
                </div>
                
                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                    bg-white
                    ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div 
                      onClick={() => handleOptionClick("/VistaGuia/PerfilGuia")}
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
          <div className="flex-1 p-4">
            {showProfile && location.pathname === "/VistaGuia" ? (
              <div className="bg-white rounded-lg p-6 shadow-lg text-gray-700">
                {loading ? (
                  <div className="text-center">Cargando perfil...</div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : !guia ? (
                  <div className="text-center">No se encontraron datos del guía.</div>
                ) : (
                  <PerfilGuiaComponent />
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

export default DashboardLayoutGuia;