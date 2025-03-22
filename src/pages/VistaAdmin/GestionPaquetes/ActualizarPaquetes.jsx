import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Map, Calendar, DollarSign, Clock, Package, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ActualizarPaquetes = ({ onClose, onUpdated, paquete, rutasDisponibles }) => {
  // Estado para el formulario
  const [paqueteData, setPaqueteData] = useState({
    nombrePaquete: '',
    descripcion: '',
    duracion: '',
    fechaInicio: '',
    fechaFin: '',
    precio: '',
    descuento: 0,
    idRutas: []
  });
  
  // Estados para imágenes
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [nuevasImagenesPreview, setNuevasImagenesPreview] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesParaEliminar, setImagenesParaEliminar] = useState([]);
  
  // Estado para mensajes de error/éxito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Token para autenticación
  const token = localStorage.getItem('token');
  
  // Estado para almacenar información de rutas
  const [rutasAsociadas, setRutasAsociadas] = useState([]);
  
  // Cargar los datos del paquete y sus imágenes al montar el componente
  useEffect(() => {
    if (paquete) {
      setPaqueteData({
        nombrePaquete: paquete.nombrePaquete || '',
        descripcion: paquete.descripcion || '',
        duracion: paquete.duracion || '',
        fechaInicio: paquete.fechaInicio ? paquete.fechaInicio.split('T')[0] : '',
        fechaFin: paquete.fechaFin ? paquete.fechaFin.split('T')[0] : '',
        precio: paquete.precio || '',
        descuento: paquete.descuento || 0,
        idRutas: Array.isArray(paquete.idRutas) ? paquete.idRutas : []
      });
      
      // Cargar las imágenes existentes
      obtenerFotosPaquete();
      
      // Cargar información de rutas asociadas
      obtenerRutasAsociadas();
    }
  }, [paquete]);
  
  // Función para obtener las fotos del paquete
  const obtenerFotosPaquete = async () => {
    try {
      const response = await axios.get(`http://localhost:10101/paquete/fotos-publicas/${paquete.idPaquete}`);
      console.log('Fotos obtenidas:', response.data);
      
      // Extraer los datos de las fotos según la estructura de la respuesta
      let fotosArray = response.data;
      
      // Si la respuesta tiene una propiedad 'fotos', usar esa
      if (response.data && response.data.fotos && Array.isArray(response.data.fotos)) {
        fotosArray = response.data.fotos;
      }
      
      if (Array.isArray(fotosArray)) {
        // Formatear las imágenes para mostrarlas
        setImagenesExistentes(fotosArray.map(foto => {
          // Construir URL correctamente, verificando las posibles propiedades
          let imageUrl;
          
          // Verificar todas las posibles propiedades donde podría estar la URL
          if (foto.urlFoto) {
            imageUrl = foto.urlFoto;
          } else if (foto.fotoUrl) {
            imageUrl = foto.fotoUrl;
          } else if (foto.urlImagen) {
            imageUrl = foto.urlImagen;
          } else if (foto.url) {
            imageUrl = foto.url;
          } else if (foto.ruta) {
            imageUrl = `http://localhost:10101${foto.ruta}`;
          } else {
            // URL de fallback si no hay ninguna ruta válida
            imageUrl = '';
            console.warn('Foto sin URL válida:', foto);
          }
          
          return {
            id: foto.id || foto.idFoto,
            url: imageUrl
          };
        }));
      } else {
        console.error('No se pudo encontrar un array de fotos en la respuesta:', response.data);
      }
    } catch (error) {
      console.error('Error al obtener fotos del paquete:', error);
      toast.error('No se pudieron cargar las imágenes del paquete');
    }
  };
  
  // Función para obtener información de las rutas asociadas
  const obtenerRutasAsociadas = async () => {
    try {
      console.log('Obteniendo rutas para el paquete:', paquete.idPaquete);
      
      // Intentar obtener el paquete directamente por ID
      const response = await axios.get(`http://localhost:10101/paquete/obtener-paquete/${paquete.idPaquete}`);
      console.log('Respuesta de obtener-paquete:', response.data);
      
      // Verificar si la respuesta es un array
      if (response.data && Array.isArray(response.data)) {
        // La respuesta es un array, extraer todas las rutas
        const rutasInfo = [];
        
        // Recorrer cada elemento del array para extraer información de rutas
        response.data.forEach(item => {
          // Agregar cada ruta del array sin filtrar por ID
          rutasInfo.push({
            idRuta: item.idRuta,
            nombreRuta: item.nombreRuta || `Ruta ${item.idRuta}`
          });
        });
        
        console.log('Rutas encontradas:', rutasInfo);
        setRutasAsociadas(rutasInfo);
      } else if (response.data && typeof response.data === 'object') {
        // Si la respuesta es un objeto único, buscar rutas en él
        const rutasInfo = [];
        
        // Verificar si el objeto tiene propiedades de ruta
        if (response.data.idRuta || response.data.nombreRuta) {
          rutasInfo.push({
            idRuta: response.data.idRuta,
            nombreRuta: response.data.nombreRuta || `Ruta ${response.data.idRuta}`
          });
        }
        
        // Verificar si hay un array de rutas en alguna propiedad
        if (response.data.rutas && Array.isArray(response.data.rutas)) {
          response.data.rutas.forEach(ruta => {
            if (!rutasInfo.some(r => r.idRuta === ruta.idRuta)) {
              rutasInfo.push({
                idRuta: ruta.idRuta,
                nombreRuta: ruta.nombreRuta || `Ruta ${ruta.idRuta}`
              });
            }
          });
        }
        
        // Si encontramos rutas, actualizar el estado
        if (rutasInfo.length > 0) {
          console.log('Rutas encontradas:', rutasInfo);
          setRutasAsociadas(rutasInfo);
        } else {
          // Si no hay rutas en la respuesta, mostrar mensaje
          console.log('No se encontraron rutas en la respuesta');
          setRutasAsociadas([]);
        }
      } else {
        console.log('Formato de respuesta no reconocido');
        setRutasAsociadas([]);
      }
    } catch (error) {
      console.error('Error al obtener rutas asociadas:', error);
      setRutasAsociadas([]);
    }
  };
  
  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaqueteData({
      ...paqueteData,
      [name]: value
    });
  };
  
  // Función para manejar selección de rutas
  const handleRutasChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setPaqueteData({
      ...paqueteData,
      idRutas: selectedOptions
    });
  };
  
  // Función para marcar una imagen para eliminar
  const marcarImagenParaEliminar = (imagen, index) => {
    // Agregar imagen a la lista de eliminación
    setImagenesParaEliminar([...imagenesParaEliminar, imagen]);
    
    // Eliminar imagen de la lista de imágenes existentes
    const nuevasImagenesExistentes = [...imagenesExistentes];
    nuevasImagenesExistentes.splice(index, 1);
    setImagenesExistentes(nuevasImagenesExistentes);
  };
  
  // Función para eliminar imágenes marcadas
  const deleteMarkedImages = async () => {
    try {
      // Eliminar cada imagen marcada usando la API
      const promesasEliminacion = imagenesParaEliminar.map(imagen => 
        axios.delete(`http://localhost:10101/paquete/foto/${imagen.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );
      
      await Promise.all(promesasEliminacion);
      console.log('Imágenes eliminadas correctamente');
    } catch (error) {
      console.error('Error al eliminar imágenes:', error);
      throw new Error('Error al eliminar imágenes');
    }
  };
  
  // Función para manejar la selección de nuevas imágenes
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNuevasImagenes([...nuevasImagenes, ...filesArray]);
      
      // Generar previsualizaciones
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setNuevasImagenesPreview([...nuevasImagenesPreview, ...previewsArray]);
    }
  };
  
  // Función para eliminar una imagen de la lista de nuevas imágenes
  const removeNuevaImagen = (index) => {
    const nuevasImagenesActualizadas = [...nuevasImagenes];
    nuevasImagenesActualizadas.splice(index, 1);
    setNuevasImagenes(nuevasImagenesActualizadas);
    
    const nuevasPreviewsActualizadas = [...nuevasImagenesPreview];
    URL.revokeObjectURL(nuevasPreviewsActualizadas[index]); // Liberar URL
    nuevasPreviewsActualizadas.splice(index, 1);
    setNuevasImagenesPreview(nuevasPreviewsActualizadas);
  };
  
  // Función para subir nuevas imágenes
  const uploadImages = async (idPaquete) => {
    if (nuevasImagenes.length === 0) return;
    
    try {
      const formData = new FormData();
      nuevasImagenes.forEach(img => formData.append('fotos', img));
      
      await axios.post(
        `http://localhost:10101/paquete/subir-fotos/${idPaquete}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Imágenes subidas correctamente');
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      throw new Error('Error al subir imágenes');
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones básicas
      if (!paqueteData.descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      
      if (!paqueteData.precio) {
        throw new Error('El precio es obligatorio');
      }
      
      // Crear objeto con solo los campos que queremos actualizar
      // Excluimos el nombre para evitar el error de duplicación
      const datosActualizados = {
        idPaquete: paquete.idPaquete,
        descripcion: paqueteData.descripcion,
        precio: parseFloat(paqueteData.precio),
        duracion: paqueteData.duracion
      };
      
      // Si el nombre ha cambiado, incluirlo en la actualización
      if (paqueteData.nombrePaquete !== paquete.nombrePaquete) {
        datosActualizados.nombrePaquete = paqueteData.nombrePaquete;
      }
      
      console.log('Enviando datos para actualización:', datosActualizados);
      
      // Enviar solicitud al servidor con JSON
      const response = await axios.patch(
        `http://localhost:10101/paquete/actualizar/${paquete.idPaquete}`,
        datosActualizados,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Paquete actualizado:', response.data);
      
      // Eliminar imágenes marcadas
      if (imagenesParaEliminar.length > 0) {
        await deleteMarkedImages();
      }
      
      // Si hay imágenes nuevas, las subimos
      if (nuevasImagenes.length > 0) {
        await uploadImages(paquete.idPaquete);
      }
      
      // Asegurarse de que el componente padre sepa que hubo una actualización
      if (typeof onUpdated === 'function') {
        // Crear un objeto con los datos actualizados para pasar al componente padre
        const paqueteActualizado = {
          ...paquete, // Mantener los datos originales
          ...datosActualizados // Sobrescribir con los datos actualizados
        };
        
        // Llamar a onUpdated con los datos actualizados
        onUpdated(paqueteActualizado);
        console.log('Notificando actualización al componente padre:', paqueteActualizado);
      }
      
      toast.success('Paquete actualizado exitosamente');
      
      // Cerrar el modal después de un breve retraso para permitir que se complete la actualización
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error('Error al actualizar paquete:', err);
      
      // Manejar errores de validación específicos
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors;
        
        // Buscar errores específicos
        const nombreError = validationErrors.find(e => e.path === 'nombrePaquete');
        if (nombreError) {
          setError(nombreError.msg);
          toast.error(nombreError.msg);
          return;
        }
        
        // Si hay otros errores, mostrar el primero
        if (validationErrors.length > 0 && validationErrors[0].msg) {
          setError(validationErrors[0].msg);
          toast.error(validationErrors[0].msg);
          return;
        }
      }
      
      // Mensaje de error genérico si no hay errores específicos
      setError(err.response?.data?.message || err.message || 'Error al actualizar el paquete');
      toast.error(err.response?.data?.message || err.message || 'Error al actualizar el paquete');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-emerald-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={24} className="text-emerald-500" />
            Actualizar Paquete Turístico
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-rose-100 text-rose-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-emerald-600 mb-1">Nombre del Paquete</label>
              <input
                type="text"
                name="nombrePaquete"
                value={paqueteData.nombrePaquete}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ej: Tour Valle del Cocora Premium"
                required
              />
            </div>
            
            <div>
              <label className="block text-emerald-600 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={paqueteData.descripcion}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Describe el paquete turístico..."
                required
              />
            </div>
            
            <div>
              <label className="block text-emerald-600 mb-1">
                <DollarSign className="inline w-4 h-4 mr-1 text-emerald-500" /> Precio (COP)
              </label>
              <input
                type="text"
                name="precio"
                value={paqueteData.precio}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ej: 150000"
                required
              />
            </div>
            
            {/* Sección informativa de rutas asociadas */}
            <div>
              <label className="block text-emerald-600 mb-1">
                <Map className="inline w-4 h-4 mr-1 text-emerald-500" /> Rutas Asociadas
              </label>
              
              {rutasAsociadas && rutasAsociadas.length > 0 ? (
                <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rutasAsociadas.map((ruta, index) => (
                      <div key={index} className="flex items-center gap-2 bg-emerald-100 p-2 rounded">
                        <Map size={16} className="text-emerald-500" />
                        <span className="text-gray-800">
                          {ruta.nombreRuta || `Ruta ID: ${ruta.idRuta || ruta.id || 'Desconocido'}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-emerald-600 text-sm mt-2">
                    Las rutas asociadas no pueden modificarse desde aquí.
                  </p>
                </div>
              ) : (
                <p className="text-emerald-600">Este paquete no tiene rutas asociadas</p>
              )}
            </div>
            
            <div>
              <label className="block text-emerald-600 mb-1">Imágenes actuales</label>
              {imagenesExistentes.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {imagenesExistentes.map((imagen, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imagen.url}
                        alt={`Imagen ${index + 1}`}
                        className="h-24 w-full object-cover rounded"
                        onError={(e) => {
                          console.log('Error cargando imagen:', imagen.url);
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M14.5 12l2.5 -2.5"/><path d="M14.5 12l2.5 2.5"/></svg>';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => marcarImagenParaEliminar(imagen, index)}
                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar imagen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-600">No hay imágenes asociadas a este paquete</p>
              )}
            </div>
            
            <div>
              <label className="block text-emerald-600 mb-1">Agregar nuevas imágenes</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-2 rounded bg-emerald-50 border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              
              {nuevasImagenesPreview.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {nuevasImagenesPreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Vista previa ${index + 1}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeNuevaImagen(index)}
                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-emerald-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${loading ? 'bg-emerald-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-white rounded transition-colors flex items-center gap-2`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Actualizando...
                  </>
                ) : (
                  <>Actualizar Paquete</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActualizarPaquetes;
