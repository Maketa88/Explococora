import { useEffect, useState } from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import axios from 'axios';
import { Pencil, Plus, Trash, Mountain, X, Filter, RefreshCw, Eye, ChevronLeft, ChevronRight, Search, XCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Rutas = () => {
  const [rutas, setRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rutaActual, setRutaActual] = useState({
    id: null,
    nombreRuta: '',
    duracion: '',
    descripcion: '',
    dificultad: '',
    capacidadMaxima: '',
    distancia: '',
    tipo: '',
    estado: '',
    precio: ''
  });
  const [imagenes, setImagenes] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [fotosCompletas, setFotosCompletas] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [token] = useState(localStorage.getItem('token') || '');
  const [isDetailView, setIsDetailView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado para confirmación de eliminación estilo Guias.jsx
  const [confirmacionEliminar, setConfirmacionEliminar] = useState({
    mostrar: false,
    tipo: '', // 'ruta' o 'foto'
    id: null,
    nombre: '',
    mensaje: '',
    ids: [] // Para múltiples fotos
  });
  
  // Nuevos estados para manejar las fotos de las rutas en la lista
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [cargandoFotos, setCargandoFotos] = useState({});
  
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    dificultad: '',
    duracion: '',
    estado: '',
    tipo: ''
  });

  // Añadir el estado para el término de búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Configuración de axios con token de autorización
  const axiosWithAuth = axios.create({
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  useEffect(() => {
    fetchRutas();
  }, []);

  // Función para cargar las rutas
  const fetchRutas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://servicio-explococora.onrender.com/rutas');
      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setRutas(response.data);
        setRutasFiltradas(response.data);
        
        // Obtener fotos para cada ruta
        response.data.forEach(ruta => {
          // Verificar que la ruta tenga un ID válido
          if (ruta && ruta.idRuta && !isNaN(ruta.idRuta)) {
            setCargandoFotos(prev => ({...prev, [ruta.idRuta]: true}));
            obtenerFotosRuta(ruta.idRuta);
          }
        });
      } else {
        throw new Error("La respuesta no es un array");
      }
    } catch (error) {
      console.error("Error al obtener las rutas:", error);
      setError(error.message);
      toast.error("Error al cargar las rutas", {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mejorar la función para obtener todas las fotos de una ruta
  const obtenerFotosRuta = async (idRuta) => {
    try {
      console.log(`Obteniendo todas las fotos disponibles para la ruta ${idRuta}...`);
      setCargandoFotos(prev => ({...prev, [idRuta]: true}));
      
      let fotosArray = [];
      let fotosCompletasArray = [];
      let intentoExitoso = false;
      
      // INTENTO 1: Endpoint fotos
      try {
        const response = await axios.get(`https://servicio-explococora.onrender.com/rutas/fotos/${idRuta}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Respuesta de endpoint fotos:', response.data);
        
        if (response.data && response.data.fotos) {
          if (Array.isArray(response.data.fotos)) {
            // Si es un array de strings (solo URLs)
            if (typeof response.data.fotos[0] === 'string') {
              fotosArray = response.data.fotos;
              // No tenemos IDs en este caso, solo URLs
              fotosCompletasArray = response.data.fotos.map(url => ({ foto: url }));
              intentoExitoso = true;
            } 
            // Si es un array de objetos con propiedad foto
            else if (response.data.fotos[0] && response.data.fotos[0].foto) {
              fotosArray = response.data.fotos.map(item => item.foto);
              fotosCompletasArray = response.data.fotos;
              intentoExitoso = true;
            } 
            // Si es un array anidado
            else if (Array.isArray(response.data.fotos[0])) {
              response.data.fotos[0].forEach(item => {
                if (item && typeof item === 'object' && item.foto) {
                  fotosArray.push(item.foto);
                  fotosCompletasArray.push(item);
                } else if (typeof item === 'string') {
                  fotosArray.push(item);
                  fotosCompletasArray.push({ foto: item });
                }
              });
              intentoExitoso = fotosArray.length > 0;
            }
          }
        }
      } catch (error) {
        console.log('Error en primer intento (endpoint fotos):', error.message);
      }
      
      // INTENTO 2: Endpoint fotos-publicas (solo si el primer intento no fue exitoso)
      if (!intentoExitoso) {
        try {
          console.log(`Intentando con endpoint fotos-publicas para ruta ${idRuta}...`);
          const response = await axios.get(`https://servicio-explococora.onrender.com/rutas/fotos-publicas/${idRuta}`);
          
          console.log('Respuesta de endpoint fotos-publicas:', response.data);
          
          if (response.data && response.data.fotos) {
            if (Array.isArray(response.data.fotos)) {
              if (typeof response.data.fotos[0] === 'string') {
                fotosArray = response.data.fotos;
                fotosCompletasArray = response.data.fotos.map(url => ({ foto: url }));
              } else if (response.data.fotos[0] && response.data.fotos[0].foto) {
                fotosArray = response.data.fotos.map(item => item.foto);
                fotosCompletasArray = response.data.fotos;
              } else if (Array.isArray(response.data.fotos[0])) {
                response.data.fotos[0].forEach(item => {
                  if (item && typeof item === 'object' && item.foto) {
                    fotosArray.push(item.foto);
                    fotosCompletasArray.push(item);
                  } else if (typeof item === 'string') {
                    fotosArray.push(item);
                    fotosCompletasArray.push({ foto: item });
                  }
                });
              }
            }
          }
        } catch (error) {
          console.log('Error en segundo intento (endpoint fotos-publicas):', error.message);
        }
      }
      
      // INTENTO 3: Como último recurso, intenta obtener las fotos de la ruta específica
      if (fotosArray.length === 0) {
        try {
          console.log(`Intentando obtener directamente la ruta ${idRuta} con sus fotos...`);
          const rutaResponse = await axios.get(`https://servicio-explococora.onrender.com/rutas/${idRuta}`);
          
          if (rutaResponse.data && rutaResponse.data.fotos) {
            if (Array.isArray(rutaResponse.data.fotos)) {
              fotosArray = rutaResponse.data.fotos;
              fotosCompletasArray = rutaResponse.data.fotos.map(url => ({ foto: url }));
            }
          }
        } catch (error) {
          console.log('Error en tercer intento (obtener ruta completa):', error.message);
        }
      }
      
      console.log(`Se encontraron ${fotosArray.length} fotos para la ruta ${idRuta}`);
      
      // Actualizamos los estados con las fotos encontradas
      if (fotosArray.length > 0) {
        setRutasConFotos(prev => ({
          ...prev,
          [idRuta]: fotosArray
        }));
        
        setImagenesPreview(fotosArray);
        setFotosCompletas(fotosCompletasArray);
      } else {
        console.log(`No se encontraron fotos para la ruta ${idRuta}`);
        setRutasConFotos(prev => ({...prev, [idRuta]: []}));
        setImagenesPreview([]);
        setFotosCompletas([]);
      }
      
      setCargandoFotos(prev => ({...prev, [idRuta]: false}));
      return fotosArray.length > 0;
    } catch (error) {
      console.log(`Error general al obtener fotos para la ruta ${idRuta}:`, error.message);
      setCargandoFotos(prev => ({...prev, [idRuta]: false}));
      setRutasConFotos(prev => ({...prev, [idRuta]: []}));
      setImagenesPreview([]);
      setFotosCompletas([]);
      return false;
    }
  };

  // Obtener color según dificultad
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Facil':
        return 'bg-emerald-500';
      case 'Moderada':
        return 'bg-amber-500';
      case 'Desafiante':
        return 'bg-rose-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Obtener icono según tipo
  const getRouteTypeIcon = (type) => {
    switch(type) {
      case 'Cabalgata':
        return '🐴';
      case 'Caminata':
        return '🥾';
      case 'Cabalgata y Caminata':
        return '🐴🥾';
      default:
        return '🏞️';
    }
  };

  // Función para obtener todas las fotos de una ruta - versión mejorada
  const fetchRutaImages = async (rutaId) => {
    // Simplemente llamamos a obtenerFotosRuta para mantener consistencia
    await obtenerFotosRuta(rutaId);
  };

  // Función para manejar errores de la API en español
  const extractErrorMessage = (error) => {
    if (!error.response) {
      return error.message || "Error de conexión";
    }
    
    const { data, status } = error.response;
    
    // Simplificar mensajes de error específicos
    if (status === 403 && data.message && data.message.includes("Token inválido")) {
      return "Token inválido";
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(err => err.msg || err.message).join(', ');
    }
    
    if (typeof data === 'string') {
      return data;
    }
    
    return "Error desconocido al procesar la solicitud";
  };

  // También necesitamos actualizar la función uploadImages para asegurarnos de que funcione correctamente
  const uploadImages = async (rutaId) => {
    try {
      console.log(`Subiendo ${imagenes.length} imágenes para la ruta ${rutaId}`);
      
      if (!imagenes.length) {
        console.log('No hay imágenes para subir');
        return true;
      }
      
      const formData = new FormData();
      imagenes.forEach(imagen => {
        formData.append('fotos', imagen); // Asegurarse de que el nombre del campo sea 'fotos'
      });
      
      console.log('Datos de formulario preparados');
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Usar la URL correcta para subir imágenes
      const response = await axios.post(
        `https://servicio-explococora.onrender.com/rutas/subir-fotos/${rutaId}`, 
        formData, 
        config
      );
      
      console.log('Respuesta de subida:', response.data);
      toast.success('Imágenes subidas correctamente', {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
      
      // Recargar la página para mostrar las nuevas imágenes
      fetchRutas();
      
      return true;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error('Error al subir imágenes: ' + extractErrorMessage(error), {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
      return false;
    }
  };

  // Función para mostrar el modal de confirmación de eliminación de foto
  const confirmarEliminarFoto = (idFoto, index) => {
    setConfirmacionEliminar({
      mostrar: true,
      tipo: 'foto',
      id: idFoto,
      nombre: `Foto #${index + 1}`,
      mensaje: '¿Está seguro que desea eliminar esta foto? Esta acción no se puede deshacer.'
    });
  };

  // Modal de confirmación de eliminación
  const ConfirmacionEliminarModal = () => {
    if (!confirmacionEliminar.mostrar) return null;
    
    const esRuta = confirmacionEliminar.tipo === 'ruta';
    const esFoto = confirmacionEliminar.tipo === 'foto';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold text-emerald-700 mb-4">Confirmar Eliminación</h2>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-100 rounded-full p-2 text-red-600 shrink-0">
                <XCircle size={24} />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800">{confirmacionEliminar.nombre}</h3>
                <p className="text-red-600 mt-2">Será eliminado permanentemente</p>
              </div>
            </div>
            
            <div className="border-l-4 border-amber-400 pl-3 py-2 bg-amber-50 mb-6">
              <p className="text-gray-700 text-sm">
                {confirmacionEliminar.mensaje || "¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer."}
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmacionEliminar({ mostrar: false, tipo: '', id: null, ids: [] });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              
              <button
                onClick={() => {
                  if (esRuta) {
                    eliminarRutaConfirmada(confirmacionEliminar.id);
                  } else if (esFoto) {
                    eliminarFotoConfirmada(confirmacionEliminar.id);
                  }
                }}
                className="px-4 py-2 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash size={16} />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Función para mostrar el modal de confirmación de eliminación de ruta
  const confirmarEliminarRuta = (ruta) => {
    const rutaId = ruta.idRuta || ruta.id;
    setConfirmacionEliminar({
      mostrar: true,
      tipo: 'ruta',
      id: rutaId,
      nombre: ruta.nombreRuta || 'Ruta sin nombre',
      mensaje: '¿Está seguro que desea eliminar esta ruta? Esta acción no se puede deshacer.'
    });
  };

  // Función para eliminar una ruta después de la confirmación
  const eliminarRutaConfirmada = async (rutaId) => {
    try {
      setConfirmacionEliminar({ ...confirmacionEliminar, mostrar: false });
      
      await axiosWithAuth.delete(`https://servicio-explococora.onrender.com/rutas/${rutaId}`);
      toast.success('Ruta eliminada correctamente', {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
      
      // Refrescar la lista
      fetchRutas();
      
      // Cerrar la vista de detalles si está abierta
      if (isDetailView) {
        closeDetailView();
      }
    } catch (error) {
      console.error("Error al eliminar la ruta:", error);
      toast.error(error.response?.data?.message || 'Error al eliminar la ruta', {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
    }
  };

  // Mantener la función para eliminar una foto después de confirmar
  const eliminarFotoConfirmada = async (idFoto) => {
    try {
      setIsProcessing(true);
      setConfirmacionEliminar({ ...confirmacionEliminar, mostrar: false });
      
      // Llamar al endpoint para eliminar la foto
      const response = await axiosWithAuth.delete(`https://servicio-explococora.onrender.com/rutas/foto/${idFoto}`);
      
      console.log('Respuesta de eliminación de foto:', response.data);
      
      // Corregir la lógica para actualizar el estado de las fotos
      // Primero filtramos por ID o idFoto
      setFotosCompletas(prevFotos => 
        prevFotos.filter(foto => 
          (foto.id !== idFoto) && (foto.idFoto !== idFoto)
        )
      );
      
      // Encontrar el índice correcto para eliminar la vista previa
      const indexToRemove = fotosCompletas.findIndex(foto => 
        foto.id === idFoto || foto.idFoto === idFoto
      );
      
      // Solo actualizar las previsualizaciones si encontramos la foto
      if (indexToRemove >= 0) {
        setImagenesPreview(prevPreview => 
          prevPreview.filter((_, i) => i !== indexToRemove)
        );
      }
      
      // Cerrar el modal si está abierto
      if (modalOpen) {
        setModalOpen(false);
      }
      
      // Mostrar mensaje de éxito
      toast.success('Foto eliminada correctamente', {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
      
      // Recargar la página para mostrar los cambios
      fetchRutas();
      
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      toast.error('Error al eliminar foto: ' + extractErrorMessage(error), {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para eliminar una ruta (actualizada)
  const handleDeleteRuta = (ruta) => {
    // Mostrar el modal de confirmación de eliminación
    confirmarEliminarRuta(ruta);
  };

  // Fix the function to open the modal for editing
  const handleOpenModal = (ruta = null) => {
    setAlert({show: false, message: '', type: ''});
    if (ruta) {
      // Make sure we're capturing the correct ID field
      const rutaId = ruta.idRuta || ruta.id;
      console.log("Editing route with ID:", rutaId);
      
      setRutaActual({
        id: rutaId, // Ensure correct ID is used
        nombreRuta: ruta.nombreRuta,
        duracion: ruta.duracion,
        descripcion: ruta.descripcion,
        dificultad: ruta.dificultad,
        capacidadMaxima: ruta.capacidadMaxima,
        distancia: ruta.distancia,
        tipo: ruta.tipo,
        estado: ruta.estado,
        precio: ruta.precio || '0' // Asegurar que siempre haya un valor
      });
      
      // Limpiar las fotos actuales antes de cargar nuevas
      setImagenesPreview([]);
      setFotosCompletas([]);
      
      // Cargar las imágenes existentes si hay un ID de ruta
      if (rutaId) {
        fetchRutaImages(rutaId);
      }
      
      setImagenes([]);
      setIsEditing(true);
    } else {
      setRutaActual({
        id: null,
        nombreRuta: '',
        duracion: '',
        descripcion: '',
        dificultad: '',
        capacidadMaxima: '',
        distancia: '',
        tipo: '',
        estado: '',
        precio: ''
      });
      setImagenesPreview([]);
      setFotosCompletas([]);
      setImagenes([]);
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  // Fixed function to properly update existing routes
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form fields
      if (!rutaActual.nombreRuta || !rutaActual.duracion || !rutaActual.descripcion || 
          !rutaActual.dificultad || !rutaActual.tipo || !rutaActual.estado || !rutaActual.precio) {
        setAlert({
          show: true,
          message: 'Por favor complete todos los campos obligatorios',
          type: 'error'
        });
        return;
      }
      
      // Parse numeric values correctly
      const capacidadMaxima = parseInt(rutaActual.capacidadMaxima);
      const distancia = parseFloat(rutaActual.distancia);
      const precio = parseInt(rutaActual.precio);
      
      if (isNaN(capacidadMaxima) || isNaN(distancia) || isNaN(precio)) {
        setAlert({
          show: true,
          message: 'Los valores de capacidad, distancia y precio deben ser números válidos',
          type: 'error'
        });
        return;
      }
      
      let response;
      let rutaId;
      
      if (isEditing && rutaActual.id) {
        // UPDATING AN EXISTING ROUTE
        rutaId = rutaActual.id;
        console.log(`Updating existing route with ID: ${rutaId}`);
        
        // Find the original route to compare what has changed
        const rutaOriginal = rutas.find(ruta => (ruta.id === rutaId || ruta.idRuta === rutaId));
        
        // Only include fields that have actually changed to avoid uniqueness validation errors
        const updateData = {};
        
        // Don't include nombreRuta if it hasn't changed (to avoid unique constraint error)
        if (rutaOriginal && rutaActual.nombreRuta !== rutaOriginal.nombreRuta) {
          updateData.nombreRuta = rutaActual.nombreRuta.trim();
        }
        
        // Add the rest of the fields
        updateData.duracion = rutaActual.duracion.trim();
        updateData.descripcion = rutaActual.descripcion.trim();
        updateData.dificultad = rutaActual.dificultad;
        updateData.capacidadMaxima = capacidadMaxima;
        updateData.distancia = distancia;
        updateData.tipo = rutaActual.tipo;
        updateData.estado = rutaActual.estado;
        updateData.precio = precio;
        
        console.log("Update data:", updateData);
        
        // Use direct fetch API
        const requestOptions = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        };
        
        const fetchResponse = await fetch(`https://servicio-explococora.onrender.com/rutas/${rutaId}`, requestOptions);
        
        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json();
          console.error(`Error status: ${fetchResponse.status}`, errorData);
          
          // Check if it's a duplicate name error
          if (errorData && errorData.errors && errorData.errors.some(err => 
              err.path === 'nombreRuta' && err.msg.includes('ya existe'))) {
            throw new Error('El nombre de la ruta ya existe. Por favor, elija otro nombre.');
          }
          
          // Simplificar mensaje para errores de token
          if (fetchResponse.status === 403 && errorData.message && errorData.message.includes('Token inválido')) {
            throw new Error('Token inválido');
          }
          
          throw new Error(`Error ${fetchResponse.status}: ${JSON.stringify(errorData)}`);
        }
        
        console.log('Route successfully updated');
        toast.success('Ruta actualizada correctamente', {
          position: "top-right",
          autoClose: 3000,
          containerId: "rutas-toast",
          theme: "colored"
        });
      } else {
        // CREATING A NEW ROUTE
        const rutaData = {
          nombreRuta: rutaActual.nombreRuta.trim(),
          duracion: rutaActual.duracion.trim(),
          descripcion: rutaActual.descripcion.trim(),
          dificultad: rutaActual.dificultad,
          capacidadMaxima: capacidadMaxima,
          distancia: distancia,
          tipo: rutaActual.tipo,
          estado: rutaActual.estado,
          precio: precio
        };
        
        console.log('Creating new route:', rutaData);
        response = await axiosWithAuth.post('https://servicio-explococora.onrender.com/rutas', rutaData);
        
        console.log('Create response:', response.data);
        rutaId = response.data.id || response.data.idRuta;
        
        toast.success('Ruta creada correctamente', {
          position: "top-right",
          autoClose: 3000,
          containerId: "rutas-toast",
          theme: "colored"
        });
      }
      
      // Handle image uploads if needed
      if (imagenes.length > 0 && rutaId) {
        await uploadImages(rutaId);
      } else {
        // Si no hay imágenes nuevas, igual refrescamos la lista
        fetchRutas();
      }
      
      // Reset form and close modal
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error al guardar la ruta:", error);
      
      let errorMessage = error.message || "Error al procesar la solicitud";
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
      setAlert({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    }
  };

  // Add a helper function to reset the form
  const resetForm = () => {
    setRutaActual({
      id: null,
      nombreRuta: '',
      duracion: '',
      descripcion: '',
      dificultad: '',
      capacidadMaxima: '',
      distancia: '',
      tipo: '',
      estado: '',
      precio: ''
    });
    setImagenes([]);
    setImagenesPreview([]);
    setFotosCompletas([]);
    setIsEditing(false);
    setAlert({ show: false, message: '', type: '' });
  };

  // Función para manejar cambios en las imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagenesPreview(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  // Función para eliminar una imagen de la vista previa
  const removeImage = (index) => {
    setImagenesPreview(prev => prev.filter((_, i) => i !== index));
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  // Función para verificar si el nombre de la ruta ya existe
  const checkRouteNameExists = (name) => {
    // Skip check if editing and name hasn't changed
    if (isEditing && rutaActual.nombreRuta === name) {
      return false;
    }
    
    return rutas.some(ruta => 
      ruta.nombreRuta.toLowerCase() === name.toLowerCase()
    );
  };

  // Función para manejar cambios en el nombre de la ruta
  const handleRouteNameChange = (e) => {
    const newName = e.target.value;
    
    // Check for duplicate names as user types
    if (newName && checkRouteNameExists(newName)) {
      setAlert({
        show: true,
        message: 'Este nombre de ruta ya existe, por favor elija otro',
        type: 'error'
      });
    } else {
      // Clear error if it was showing
      if (alert.show && alert.message.includes('nombre de ruta ya existe')) {
        setAlert({ show: false, message: '', type: '' });
      }
    }
    
    setRutaActual({ ...rutaActual, nombreRuta: newName });
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let resultado = [...rutas];
    
    if (filtros.dificultad) {
      resultado = resultado.filter(ruta => ruta.dificultad === filtros.dificultad);
    }
    
    if (filtros.estado) {
      resultado = resultado.filter(ruta => ruta.estado === filtros.estado);
    }
    
    if (filtros.tipo) {
      resultado = resultado.filter(ruta => ruta.tipo === filtros.tipo);
    }
    
    if (filtros.duracion) {
      switch(filtros.duracion) {
        case 'corta':
          resultado = resultado.filter(ruta => {
            const duracionHoras = parseInt(ruta.duracion);
            return duracionHoras <= 2;
          });
          break;
        case 'media':
          resultado = resultado.filter(ruta => {
            const duracionHoras = parseInt(ruta.duracion);
            return duracionHoras > 2 && duracionHoras <= 4;
          });
          break;
        case 'larga':
          resultado = resultado.filter(ruta => {
            const duracionHoras = parseInt(ruta.duracion);
            return duracionHoras > 4;
          });
          break;
        default:
          break;
      }
    }
    
    setRutasFiltradas(resultado);
    setMostrarFiltros(false);
  };

  // Función para limpiar los filtros
  const limpiarFiltros = () => {
    setFiltros({
      dificultad: '',
      duracion: '',
      estado: '',
      tipo: ''
    });
    setRutasFiltradas(rutas);
    setMostrarFiltros(false);
  };

  // Añadir esta función para cerrar la vista de detalles
  const closeDetailView = () => {
    setIsDetailView(false);
    setActiveRoute(null);
    setImagenesPreview([]);
    setFotosCompletas([]);
  };

  // Actualizar la función para abrir el detalle y asegurar que cargue todas las fotos
  const openDetailView = async (ruta) => {
    setActiveRoute(ruta);
    setIsDetailView(true);
    
    // Obtenemos el ID correcto de la ruta
    const rutaId = ruta.idRuta || ruta.id;
    
    // Limpiar previsualizaciones existentes
    setImagenesPreview([]);
    setFotosCompletas([]);
    
    // Intentamos obtener todas las fotos y mostramos mensaje según resultado
    const fotosCargadas = await obtenerFotosRuta(rutaId);
    
    if (fotosCargadas) {
      console.log(`Fotos cargadas exitosamente para la ruta ${rutaId}`);
    } else {
      console.log(`No se pudieron cargar fotos para la ruta ${rutaId}`);
    }
  };

  // Open lightbox for image gallery
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Navigate through lightbox images
  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < imagenesPreview.length) {
      setLightboxIndex(newIndex);
    }
  };

  // Modificar la función de búsqueda para incluir precio y dificultad
  const handleBusqueda = (e) => {
    const termino = e.target.value.toLowerCase();
    setTerminoBusqueda(termino);
    
    if (!termino.trim()) {
      setRutasFiltradas(rutas);
      return;
    }
    
    const resultado = rutas.filter(ruta => {
      // Buscar por nombre de ruta
      const coincideNombre = ruta.nombreRuta.toLowerCase().includes(termino);
      
      // Buscar por precio (como texto para que coincida con lo que el usuario escribe)
      const precioCadena = String(ruta.precio);
      const coincidePrecio = precioCadena.includes(termino);
      
      // Buscar por dificultad
      const coincideDificultad = ruta.dificultad.toLowerCase().includes(termino);
      
      // Retornar true si coincide con cualquiera de los campos
      return coincideNombre || coincidePrecio || coincideDificultad;
    });
    
    setRutasFiltradas(resultado);
  };

  // Primero añadir un efecto para controlar la visibilidad del footer
  useEffect(() => {
    // Ocultar el footer cuando el modal de detalles está abierto
    const footer = document.querySelector('footer');
    const dashboardFooter = document.querySelector('.sticky.bottom-0.border-t.border-emerald-100');
    const estadoIndicator = document.querySelector('.fixed.bottom-4.right-4.z-50');
    const toastContainer = document.getElementById('rutas-toast');
    
    if (footer) {
      if (isDetailView) {
        footer.style.display = 'none';
      } else {
        footer.style.display = '';
      }
    }
    
    if (dashboardFooter) {
      if (isDetailView) {
        dashboardFooter.style.display = 'none';
      } else {
        dashboardFooter.style.display = '';
      }
    }
    
    if (estadoIndicator) {
      if (isDetailView) {
        estadoIndicator.style.display = 'none';
      } else {
        estadoIndicator.style.display = '';
      }
    }
    
    if (toastContainer) {
      if (isDetailView) {
        toastContainer.style.display = 'none';
      } else {
        toastContainer.style.display = '';
      }
    }
    
    // Limpieza al desmontar
    return () => {
      if (footer) {
        footer.style.display = '';
      }
      if (dashboardFooter) {
        dashboardFooter.style.display = '';
      }
      if (estadoIndicator) {
        estadoIndicator.style.display = '';
      }
      if (toastContainer) {
        toastContainer.style.display = '';
      }
    };
  }, [isDetailView]);

  return (
    <DashboardLayoutAdmin>
      <div className="p-6">
        {/* Modal de confirmación de eliminación */}
        <ConfirmacionEliminarModal />
        
        {/* Contenedor de Toast para mantener las alertas en esta página */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={3}
          containerId="rutas-toast"
        />
        
        {/* Header with Title and Create Button */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">Rutas Disponibles</h1>
            <p className="text-emerald-600">Gestiona las rutas de turismo ecológico</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {/* Añadir el buscador aquí */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar rutas..."
                value={terminoBusqueda}
                onChange={handleBusqueda}
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-white shadow-sm border border-emerald-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-emerald-500" size={18} />
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded shadow-sm transition-colors"
            >
              <Filter size={18} />
              Filtros
            </button>
            
            <button
              onClick={fetchRutas}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded shadow-sm transition-colors"
              title="Recargar rutas"
            >
              <RefreshCw size={18} />
            </button>
            
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition-colors"
            >
              <Plus size={18} />
              Nueva Ruta
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-emerald-100">
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">Filtrar Rutas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Dificultad</label>
                <select
                  value={filtros.dificultad}
                  onChange={(e) => setFiltros({ ...filtros, dificultad: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todas</option>
                  <option value="Facil">Fácil</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Desafiante">Desafiante</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Duración</label>
                <select
                  value={filtros.duracion}
                  onChange={(e) => setFiltros({ ...filtros, duracion: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todas</option>
                  <option value="corta">Corta (hasta 2h)</option>
                  <option value="media">Media (2-4h)</option>
                  <option value="larga">Larga (más de 4h)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Tipo</label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  <option value="Cabalgata">Cabalgata</option>
                  <option value="Caminata">Caminata</option>
                  <option value="Cabalgata y Caminata">Cabalgata y Caminata</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={aplicarFiltros}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-emerald-600">Cargando rutas...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 shadow-sm">
            <p className="font-semibold">
              {error.includes("Error 403") ? "Token inválido" : "Error al cargar las rutas"}
            </p>
            <p>{error.includes("Error 403") ? "Por favor, inicie sesión nuevamente" : error}</p>
            <button 
              onClick={fetchRutas}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
        
        {/* Routes Grid */}
        <div className="mt-6">
          {!loading && !error && rutasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rutasFiltradas.map((ruta) => (
                <div 
                  key={ruta.idRuta || ruta.id} 
                  className="bg-white bg-gradient-to-br from-emerald-50 to-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-emerald-100 transition-all duration-300"
                >
                  <div className="h-48 bg-emerald-100 relative">
                    {cargandoFotos[ruta.idRuta] ? (
                      <div className="flex justify-center items-center h-full bg-emerald-50">
                        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : rutasConFotos[ruta.idRuta] && rutasConFotos[ruta.idRuta].length > 0 ? (
                      <img
                        src={rutasConFotos[ruta.idRuta][0]}
                        alt={ruta.nombreRuta}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <span className="text-6xl text-emerald-400">{getRouteTypeIcon(ruta.tipo)}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleOpenModal(ruta)}
                        className="p-2 bg-white bg-opacity-90 hover:bg-emerald-50 text-emerald-600 rounded-full shadow-sm transition-colors"
                        title="Editar ruta"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRuta(ruta)}
                        className="p-2 bg-white bg-opacity-90 hover:bg-red-50 text-red-600 rounded-full shadow-sm transition-colors"
                        title="Eliminar ruta"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className={`${getDifficultyColor(ruta.dificultad)} text-white text-xs px-2 py-1 rounded-full shadow-sm`}>
                        {ruta.dificultad}
                      </span>
                      <span className={`${ruta.estado === 'Activa' ? 'bg-green-500' : 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full shadow-sm`}>
                        {ruta.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-emerald-800 truncate">{ruta.nombreRuta}</h3>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>
                        <span className="block text-xs text-emerald-600">Duración</span>
                        <span>{ruta.duracion}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-emerald-600">Tipo</span>
                        <span>{ruta.tipo}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-emerald-600">Distancia</span>
                        <span>{ruta.distancia} km</span>
                      </div>
                      <div>
                        <span className="block text-xs text-emerald-600">Capacidad</span>
                        <span>{ruta.capacidadMaxima} personas</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100 shadow-sm">
                      <span className="block text-xs text-emerald-600">Precio</span>
                      <span className="text-emerald-700 font-semibold">$ {ruta.precio}</span>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{ruta.descripcion}</p>
                    
                    <button 
                      onClick={() => openDetailView(ruta)}
                      className="w-full mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-emerald-300 text-xl mb-4">No hay rutas disponibles con los filtros seleccionados</p>
              <button 
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-white"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </div>
        
        {/* Detail View */}
        {isDetailView && activeRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="relative">
                <div className="h-64 md:h-80 overflow-hidden bg-emerald-50">
                  {cargandoFotos[activeRoute.idRuta || activeRoute.id] ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (rutasConFotos[activeRoute.idRuta || activeRoute.id]?.length > 0 || imagenesPreview.length > 0) ? (
                    <div className="relative h-full">
                      <div className="flex space-x-2 overflow-x-auto h-full p-2">
                        {(rutasConFotos[activeRoute.idRuta || activeRoute.id]?.length > 0 
                          ? rutasConFotos[activeRoute.idRuta || activeRoute.id] 
                          : imagenesPreview).map((foto, idx) => (
                          <div 
                            key={idx} 
                            className="h-full min-w-[300px] relative group cursor-pointer"
                          >
                            <img
                              src={foto}
                              alt={`${activeRoute.nombreRuta} - imagen ${idx + 1}`}
                              className="h-full w-full object-cover rounded"
                              onClick={() => openLightbox(idx)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/800x400?text=Imagen+no+disponible';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                      <span className="text-8xl text-emerald-300">{getRouteTypeIcon(activeRoute.tipo)}</span>
                    </div>
                  )}
                </div>
                
                {/* Close button */}
                <button
                  onClick={closeDetailView}
                  className="absolute top-4 right-4 bg-white bg-opacity-80 text-emerald-700 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                >
                  <X size={20} />
                </button>
                
                {/* Route type and difficulty */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={`${getDifficultyColor(activeRoute.dificultad)} px-3 py-1 rounded-full flex items-center gap-1.5 text-white shadow-sm`}>
                    <Mountain size={16} />
                    {activeRoute.dificultad}
                  </span>
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full shadow-sm">
                    {activeRoute.tipo}
                  </span>
                </div>
                
                {/* Status badge */}
                <div className="absolute bottom-4 right-4">
                  <span className={`${activeRoute.estado === 'Activa' ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1 rounded-full shadow-sm`}>
                    {activeRoute.estado}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-grow overflow-y-auto bg-white">
                <h2 className="text-3xl font-bold text-emerald-700 mb-3">{activeRoute.nombreRuta}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Duración</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.duracion}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Distancia</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.distancia} km</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Capacidad</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.capacidadMaxima} personas</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Tipo</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.tipo}</p>
                  </div>
                </div>
                
                <div className="mb-6 bg-emerald-100 p-4 rounded-lg text-center">
                  <p className="text-emerald-600 text-sm mb-1">Precio por persona</p>
                  <p className="text-emerald-800 text-2xl font-bold">$ {activeRoute.precio}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-emerald-700 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {activeRoute.descripcion}
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-emerald-100">
                  <button
                    onClick={() => handleDeleteRuta(activeRoute)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Trash size={16} />
                    Eliminar
                  </button>
                  <button
                    onClick={() => {
                      closeDetailView();
                      handleOpenModal(activeRoute);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={imagenesPreview[lightboxIndex]} 
                alt="Vista ampliada"
                className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
              />
            </div>
            
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-80 text-emerald-700 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-md"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={() => navigateLightbox(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-emerald-700 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
              disabled={lightboxIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={() => navigateLightbox(1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-emerald-700 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
              disabled={lightboxIndex === imagenesPreview.length - 1}
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-emerald-800 px-4 py-2 rounded-full shadow-md">
              {lightboxIndex + 1} de {imagenesPreview.length}
            </div>
          </div>
        )}
        
        {/* Create/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center p-4 z-40">
            <div className="bg-white rounded-lg w-full max-w-md mx-auto mt-20 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-emerald-700 mb-4 flex items-center">
                  {isEditing ? 'Modificar Ruta' : 'Nueva Ruta'}
                </h2>
                
                {alert.show && alert.type === 'error' && (
                  <div className="mb-4 p-3 bg-red-50 rounded border border-red-100">
                    <p className="text-red-700 text-sm">
                      {alert.message.includes("Error 403") ? "Token inválido" : alert.message}
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleCreateOrUpdate} className="space-y-4 overflow-y-auto max-h-[60vh]">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre de la ruta</label>
                    <input
                      type="text"
                      placeholder="Nombre de la ruta"
                      value={rutaActual.nombreRuta}
                      onChange={handleRouteNameChange}
                      className={`w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                        checkRouteNameExists(rutaActual.nombreRuta) ? 'border-2 border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                    <textarea
                      placeholder="Descripción detallada de la ruta"
                      value={rutaActual.descripcion}
                      onChange={(e) => setRutaActual({ ...rutaActual, descripcion: e.target.value })}
                      className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Duración</label>
                      <input
                        type="text"
                        placeholder="ej: 2 horas"
                        value={rutaActual.duracion}
                        onChange={(e) => setRutaActual({ ...rutaActual, duracion: e.target.value })}
                        className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Distancia (km)</label>
                      <input
                        type="number"
                        placeholder="ej: 2.5"
                        value={rutaActual.distancia}
                        onChange={(e) => setRutaActual({ ...rutaActual, distancia: e.target.value })}
                        className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        step="0.1"
                        min="0.1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Capacidad</label>
                      <input
                        type="number"
                        placeholder="ej: 20"
                        value={rutaActual.capacidadMaxima}
                        onChange={(e) => setRutaActual({ ...rutaActual, capacidadMaxima: e.target.value })}
                        className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Dificultad</label>
                      <select
                        value={rutaActual.dificultad}
                        onChange={(e) => setRutaActual({ ...rutaActual, dificultad: e.target.value })}
                        className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="Facil">Fácil</option>
                        <option value="Moderada">Moderada</option>
                        <option value="Desafiante">Desafiante</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Precio (COP)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-gray-600">$</span>
                      <input
                        type="text"
                        placeholder="ej: 50000"
                        value={rutaActual.precio}
                        onChange={(e) => {
                          // Solo permitir dígitos
                          const value = e.target.value.replace(/\D/g, '');
                          setRutaActual({ ...rutaActual, precio: value });
                        }}
                        className="w-full p-2 pl-6 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tipo de ruta</label>
                    <select
                      value={rutaActual.tipo}
                      onChange={(e) => setRutaActual({ ...rutaActual, tipo: e.target.value })}
                      className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    >
                      <option value="">Seleccione</option>
                      <option value="Caminata">Caminata</option>
                      <option value="Cabalgata">Cabalgata</option>
                      <option value="Cabalgata y Caminata">Cabalgata y Caminata</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Estado</label>
                    <select
                      value={rutaActual.estado}
                      onChange={(e) => setRutaActual({ ...rutaActual, estado: e.target.value })}
                      className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    >
                      <option value="">Seleccione</option>
                      <option value="Activa">Activa</option>
                      <option value="Inactiva">Inactiva</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600 mb-1">Imágenes de la ruta (opcional)</label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      accept="image/*"
                      multiple
                    />
                    
                    <div className="text-xs text-gray-500 mt-1">
                      Puedes seleccionar múltiples imágenes a la vez
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                    >
                      {isEditing ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutAdmin>
  );
};

export default Rutas;