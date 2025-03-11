// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
// import { Mail, Phone, RefreshCw, Search, Filter, CheckCircle, XCircle, UserPlus, Clock } from 'lucide-react';
// import { toast } from 'react-toastify';
// import EstadoGuia from '../../../components/Guias/EstadoGuia';
// import guiaEstadoService from '../../../services/guiaEstadoService';

// const GestionEstados = () => {
//   const [usuarios, setUsuarios] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [darkMode, setDarkMode] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, guia, operador
//   const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, disponible, ocupado, inactivo
//   const [ordenarPor, setOrdenarPor] = useState('nombre');
//   const [mostrarFiltros, setMostrarFiltros] = useState(false);
//   const [actualizando, setActualizando] = useState(false);
  
//   // Función para actualizar estados en tiempo real
//   const actualizarEstados = async () => {
//     try {
//       setActualizando(true);
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
//         setActualizando(false);
//         return;
//       }
      
//       const response = await axios.get('http://localhost:10101/usuarios/listar-estados', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.data && response.data.success) {
//         // Actualizar solo los estados manteniendo el resto de la información
//         const nuevosEstados = response.data.data || [];
        
//         setUsuarios(prevUsuarios => {
//           return prevUsuarios.map(usuario => {
//             const estadoActualizado = nuevosEstados.find(
//               e => e.cedula === usuario.cedula || e.id === usuario.id
//             );
            
//             if (estadoActualizado) {
//               return {
//                 ...usuario,
//                 estado: estadoActualizado.estado
//               };
//             }
//             return usuario;
//           });
//         });
        
//         toast.success("Estados actualizados correctamente");
//       } else {
//         throw new Error(response.data?.message || "Error al actualizar estados");
//       }
//     } catch (error) {
//       console.error("Error al actualizar estados:", error);
//       toast.error(error.response?.data?.message || "No se pudieron actualizar los estados");
//     } finally {
//       setActualizando(false);
//     }
//   };
  
//   // Función para cambiar el estado de un usuario
//   const cambiarEstadoUsuario = async (usuario, nuevoEstado) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
//         return;
//       }

//       // Llamada a la API para actualizar el estado
//       const response = await axios.patch(
//         `http://localhost:10101/usuarios/cambiar-estado/cedula/${usuario.cedula}`,
//         { 
//           estado: nuevoEstado 
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data && response.data.success) {
//         // Actualizar el estado en el frontend
//         setUsuarios(prevUsuarios => 
//           prevUsuarios.map(u => {
//             if (u.cedula === usuario.cedula) {
//               return { ...u, estado: nuevoEstado };
//             }
//             return u;
//           })
//         );
        
//         toast.success(`Estado del usuario actualizado a: ${nuevoEstado}`);
//       } else {
//         throw new Error(response.data?.message || "Error al actualizar estado");
//       }
//     } catch (error) {
//       console.error("Error al actualizar estado:", error);
//       toast.error(error.response?.data?.message || "No se pudo actualizar el estado del usuario");
//     }
//   };

//   // Función para construir nombre completo
//   const construirNombreCompleto = (usuario) => {
//     if (!usuario) return "Usuario";
    
//     const primerNombre = usuario.primerNombre || "";
//     const segundoNombre = usuario.segundoNombre || "";
//     const primerApellido = usuario.primerApellido || "";
//     const segundoApellido = usuario.segundoApellido || "";
    
//     return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
//   };

//   // Función para obtener el color del badge según el estado
//   const getEstadoColor = (estado) => {
//     switch(estado) {
//       case 'disponible':
//         return {
//           bg: darkMode ? 'bg-green-900' : 'bg-green-100',
//           text: darkMode ? 'text-green-300' : 'text-green-800',
//           icon: <CheckCircle className="w-4 h-4 mr-1" />
//         };
//       case 'ocupado':
//         return {
//           bg: darkMode ? 'bg-yellow-900' : 'bg-yellow-100',
//           text: darkMode ? 'text-yellow-300' : 'text-yellow-800',
//           icon: <Clock className="w-4 h-4 mr-1" />
//         };
//       case 'inactivo':
//         return {
//           bg: darkMode ? 'bg-red-900' : 'bg-red-100',
//           text: darkMode ? 'text-red-300' : 'text-red-800',
//           icon: <XCircle className="w-4 h-4 mr-1" />
//         };
//       default:
//         return {
//           bg: darkMode ? 'bg-gray-900' : 'bg-gray-100',
//           text: darkMode ? 'text-gray-300' : 'text-gray-800',
//           icon: null
//         };
//     }
//   };
  
//   // Cargar datos iniciales
//   useEffect(() => {
//     const cargarUsuarios = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
        
//         if (!token) {
//           setError("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
//           setLoading(false);
//           return;
//         }

//         // Solicitud para obtener todos los usuarios con sus estados
//         const response = await axios.get('http://localhost:10101/usuarios/listar-estados', {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (response.data && response.data.success) {
//           const usuariosData = response.data.data || [];
          
//           // Ahora consultamos datos adicionales para cada usuario
//           const usuariosCompletosPromises = usuariosData.map(async (usuario) => {
//             // Intentar obtener más datos según si es guía u operador
//             try {
//               // Determinar el tipo de usuario y consultar el endpoint correspondiente
//               const endpoint = usuario.rol === 'guia' 
//                 ? `http://localhost:10101/guia/perfil-completo/${usuario.cedula}`
//                 : `http://localhost:10101/operador/perfil-completo/${usuario.cedula}`;
                
//               const perfilResponse = await axios.get(endpoint, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//               });
              
//               // Extraer los datos del perfil
//               let datosPerfil = null;
//               if (perfilResponse.data) {
//                 if (Array.isArray(perfilResponse.data)) {
//                   if (perfilResponse.data.length > 0) {
//                     if (Array.isArray(perfilResponse.data[0])) {
//                       datosPerfil = perfilResponse.data[0][0];
//                     } else {
//                       datosPerfil = perfilResponse.data[0];
//                     }
//                   }
//                 } else {
//                   datosPerfil = perfilResponse.data;
//                 }
//               }
              
//               if (datosPerfil) {
//                 return { ...usuario, ...datosPerfil };
//               }
//             } catch (perfilError) {
//               console.warn(`No se pudo obtener perfil completo para ${usuario.cedula}:`, perfilError.message);
//             }
            
//             return usuario;
//           });
          
//           const usuariosCompletos = await Promise.all(usuariosCompletosPromises);
//           setUsuarios(usuariosCompletos);
//         } else {
//           throw new Error(response.data?.message || "Error al obtener usuarios");
//         }
//       } catch (error) {
//         console.error("Error al cargar usuarios:", error);
//         setError(error.response?.data?.message || "No se pudieron cargar los usuarios");
//       } finally {
//         setLoading(false);
//       }
//     };

//     cargarUsuarios();
    
//     // Configurar intervalo para actualizar estados cada 30 segundos
//     const intervalId = setInterval(actualizarEstados, 30000);
    
//     // Limpiar intervalo al desmontar
//     return () => clearInterval(intervalId);
//   }, []);

//   // Añadir este efecto para escuchar cambios de estado
//   useEffect(() => {
//     // Función que actualiza los usuarios cuando cambia el estado de un usuario
//     const handleEstadoCambiado = (event) => {
//       if (!event.detail || !event.detail.cedula) return;
      
//       // Actualizar el usuario en la lista
//       setUsuarios(prevUsuarios => {
//         const nuevosUsuarios = prevUsuarios.map(usuario => {
//           if (usuario.cedula === event.detail.cedula) {
//             return { ...usuario, estado: event.detail.nuevoEstado };
//           }
//           return usuario;
//         });
        
//         return nuevosUsuarios;
//       });
//     };
    
//     // Suscribirse al evento global de cambio de estado de usuarios
//     window.addEventListener('guiaEstadoCambiado', handleEstadoCambiado);
    
//     // Limpieza al desmontar
//     return () => {
//       window.removeEventListener('guiaEstadoCambiado', handleEstadoCambiado);
//     };
//   }, []);

//   // Funciones de filtro
//   const filtrarUsuarios = () => {
//     let resultado = [...usuarios];
    
//     // Filtrar por tipo de usuario
//     if (filtroTipo !== 'todos') {
//       resultado = resultado.filter(usuario => usuario.rol === filtroTipo);
//     }
    
//     // Filtrar por estado
//     if (filtroEstado !== 'todos') {
//       resultado = resultado.filter(usuario => usuario.estado === filtroEstado);
//     }
    
//     // Filtrar por término de búsqueda
//     if (searchTerm.trim() !== '') {
//       const termino = searchTerm.toLowerCase();
//       resultado = resultado.filter(usuario => {
//         const nombreCompleto = construirNombreCompleto(usuario).toLowerCase();
//         return nombreCompleto.includes(termino) || 
//                (usuario.cedula && usuario.cedula.toLowerCase().includes(termino)) ||
//                (usuario.email && usuario.email.toLowerCase().includes(termino));
//       });
//     }
    
//     // Ordenar resultados
//     resultado.sort((a, b) => {
//       if (ordenarPor === 'nombre') {
//         const nombreA = construirNombreCompleto(a).toLowerCase();
//         const nombreB = construirNombreCompleto(b).toLowerCase();
//         return nombreA.localeCompare(nombreB);
//       } else if (ordenarPor === 'rol') {
//         return a.rol.localeCompare(b.rol);
//       } else if (ordenarPor === 'estado') {
//         return a.estado.localeCompare(b.estado);
//       }
//       return 0;
//     });
    
//     return resultado;
//   };

//   return (
//     <DashboardLayoutAdmin>
//       <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//           <h1 className="text-2xl font-bold">Gestión de Estados</h1>
          
//           <div className="flex flex-wrap gap-2">
//             <div className="flex">
//               <input
//                 type="text"
//                 placeholder="Buscar por nombre o cédula..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className={`px-4 py-2 rounded-l-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'} min-w-[300px]`}
//               />
//               <button 
//                 onClick={(e) => e.preventDefault()}
//                 className={`px-3 py-2 rounded-r-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
//               >
//                 <Search className="w-5 h-5" />
//               </button>
//             </div>
            
//             <button
//               onClick={() => setMostrarFiltros(!mostrarFiltros)}
//               className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
//             >
//               <Filter className="w-5 h-5 mr-1.5" />
//               Filtros
//             </button>
            
//             <button
//               onClick={actualizarEstados}
//               disabled={actualizando}
//               className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white 
//                 ${actualizando ? 'opacity-70 cursor-not-allowed' : ''}`}
//             >
//               <RefreshCw className={`w-5 h-5 mr-1.5 ${actualizando ? 'animate-spin' : ''}`} />
//               {actualizando ? 'Actualizando...' : 'Actualizar estados'}
//             </button>
//           </div>
//         </div>
        
//         {/* Panel de filtros */}
//         {mostrarFiltros && (
//           <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <h3 className="text-sm font-medium mb-2">Tipo de Usuario</h3>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => setFiltroTipo('todos')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       filtroTipo === 'todos' 
//                         ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Todos
//                   </button>
//                   <button
//                     onClick={() => setFiltroTipo('guia')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       filtroTipo === 'guia' 
//                         ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Guías
//                   </button>
//                   <button
//                     onClick={() => setFiltroTipo('operador')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       filtroTipo === 'operador' 
//                         ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Operadores
//                   </button>
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium mb-2">Estado</h3>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => setFiltroEstado('todos')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       filtroEstado === 'todos' 
//                         ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Todos
//                   </button>
//                   <button
//                     onClick={() => setFiltroEstado('disponible')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       filtroEstado === 'disponible' 
//                         ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Disponible
//                   </button>
//                   <button
//                     onClick={() => setFiltroEstado('ocupado')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       filtroEstado === 'ocupado' 
//                         ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Ocupado
//                   </button>
//                   <button
//                     onClick={() => setFiltroEstado('inactivo')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       filtroEstado === 'inactivo' 
//                         ? (darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Inactivo
//                   </button>
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium mb-2">Ordenar por</h3>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => setOrdenarPor('nombre')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       ordenarPor === 'nombre' 
//                         ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Nombre
//                   </button>
//                   <button
//                     onClick={() => setOrdenarPor('rol')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       ordenarPor === 'rol' 
//                         ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Rol
//                   </button>
//                   <button
//                     onClick={() => setOrdenarPor('estado')}
//                     className={`px-3 py-1 text-sm rounded-md ${
//                       ordenarPor === 'estado' 
//                         ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
//                         : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
//                     }`}
//                   >
//                     Estado
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tarjetas de estadísticas */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} flex items-center justify-between`}>
//             <div>
//               <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Total Usuarios</p>
//               <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-700'}`}>
//                 {usuarios.length}
//               </p>
//             </div>
//             <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
//               <UserPlus className={`w-6 h-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
//             </div>
//           </div>
          
//           <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-50'} flex items-center justify-between`}>
//             <div>
//               <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Disponibles</p>
//               <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>
//                 {usuarios.filter(u => u.estado === 'disponible').length}
//               </p>
//             </div>
//             <div className={`p-3 rounded-full ${darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
//               <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} flex items-center justify-between`}>
//             <div>
//               <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>Ocupados</p>
//               <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-yellow-700'}`}>
//                 {usuarios.filter(u => u.estado === 'ocupado').length}
//               </p>
//             </div>
//             <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-800' : 'bg-yellow-100'}`}>
//               <Clock className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`} />
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900' : 'bg-red-50'} flex items-center justify-between`}>
//             <div>
//               <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Inactivos</p>
//               <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-700'}`}>
//                 {usuarios.filter(u => u.estado === 'inactivo').length}
//               </p>
//             </div>
//             <div className={`p-3 rounded-full ${darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
//               <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
//             </div>
//           </div>
//         </div>

//         {/* Lista de usuarios */}
//         {loading ? (
//           <div className="flex justify-center items-center p-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         ) : error ? (
//           <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
//             <p className="text-lg font-medium mb-2">Error al cargar datos</p>
//             <p className="mb-4">{error}</p>
//             <button 
//               onClick={() => window.location.reload()} 
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
//             >
//               Reintentar
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className={`min-w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} border rounded-lg shadow-lg`}>
//               <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                     Usuario
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                     Cédula
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                     Contacto
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                     Rol
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                     Estado
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                     Acciones
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-700">
//                 {filtrarUsuarios().map((usuario, index) => {
//                   const estadoStyle = getEstadoColor(usuario.estado);
                  
//                   return (
//                     <tr key={usuario.id || usuario.cedula || index} className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}`}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="h-10 w-10 flex-shrink-0">
//                             <img
//                               className="h-10 w-10 rounded-full object-cover"
//                               src={usuario.foto 
//                                 ? (usuario.foto.startsWith('http') ? usuario.foto : `http://localhost:10101/uploads/images/${usuario.foto}`) 
//                                 : "https://i.pinimg.com/736x/8d/37/31/8d3731a57b8209114c08488eeb0b6a64.jpg"}
//                               alt=""
//                             />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium">
//                               {construirNombreCompleto(usuario)}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {usuario.cedula || 'No disponible'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm">
//                           <div className="flex items-center">
//                             <Mail className="h-4 w-4 mr-1 text-blue-500" />
//                             {usuario.email || 'No disponible'}
//                           </div>
//                           <div className="flex items-center mt-1">
//                             <Phone className="h-4 w-4 mr-1 text-green-500" />
//                             {usuario.telefono || usuario.numeroCelular || usuario.numero_celular || 'No disponible'}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
//                           ${usuario.rol === 'guia' 
//                             ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800')
//                             : usuario.rol === 'operador'
//                               ? (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800')
//                               : (darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800')
//                           }`}
//                         >
//                           {usuario.rol ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1) : 'Desconocido'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <EstadoGuia 
//                           cedula={usuario.cedula} 
//                           nombre={construirNombreCompleto(usuario)}
//                           tamanio="normal" 
//                           onChangeEstado={(nuevoEstado) => {
//                             // Actualizar el estado en la base de datos
//                             cambiarEstadoUsuario(usuario, nuevoEstado);
//                           }}
//                         />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <div className="relative group">
//                           <button className={`px-3 py-1.5 rounded-md text-xs font-medium ${
//                             usuario.estado === 'disponible' ? 'bg-green-600 hover:bg-green-700' : 
//                             usuario.estado === 'ocupado' ? 'bg-yellow-600 hover:bg-yellow-700' : 
//                             'bg-red-600 hover:bg-red-700'
//                           } text-white`}>
//                             Cambiar estado
//                           </button>
//                           <div className="absolute left-0 right-0 bottom-full mb-1 bg-white dark:bg-gray-800 rounded-md shadow-lg hidden group-hover:block z-10">
//                             <div className="py-1">
//                               <button 
//                                 onClick={() => cambiarEstadoUsuario(usuario, 'disponible')}
//                                 className="block w-full text-left px-4 py-2 text-xs text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"
//                               >
//                                 Disponible
//                               </button>
//                               <button 
//                                 onClick={() => cambiarEstadoUsuario(usuario, 'ocupado')}
//                                 className="block w-full text-left px-4 py-2 text-xs text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700"
//                               >
//                                 Ocupado
//                               </button>
//                               <button 
//                                 onClick={() => cambiarEstadoUsuario(usuario, 'inactivo')}
//                                 className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
//                               >
//                                 Inactivo
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
            
//             {filtrarUsuarios().length === 0 && (
//               <div className={`p-8 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                 <XCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
//                 <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
//                 <p>No hay usuarios que coincidan con los criterios de búsqueda.</p>
//                 <button 
//                   onClick={() => {
//                     setSearchTerm('');
//                     setFiltroTipo('todos');
//                     setFiltroEstado('todos');
//                   }}
//                   className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
//                 >
//                   Limpiar filtros
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </DashboardLayoutAdmin>
//   );
// };

// export default GestionEstados;
