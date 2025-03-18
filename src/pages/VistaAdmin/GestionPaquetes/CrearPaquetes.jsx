import React, { useState } from 'react';
import axios from 'axios';
import { X, Map, Calendar, DollarSign, Clock, Package, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const CrearPaquetes = ({ onClose, onCreated, rutasDisponibles }) => {
  // Estado para el formulario
  const [paquete, setPaquete] = useState({
    nombrePaquete: '',
    descripcion: '',
    duracion: '',
    precio: '',
    idRutas: []
  });
  
  // Estados para imágenes
  const [imagenes, setImagenes] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  
  // Estado para mensajes de error/éxito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Token para autenticación
  const token = localStorage.getItem('token');
  
  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaquete({
      ...paquete,
      [name]: value
    });
  };
  
  // Función para manejar selección de rutas
  const handleRutasChange = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => parseInt(option.value));
    setPaquete({
      ...paquete,
      idRutas: values
    });
  };
  
  // Función para manejar selección de imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes([...imagenes, ...files]);
    
    // Crear previsualizaciones
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagenesPreview([...imagenesPreview, ...newPreviews]);
  };
  
  // Función para eliminar imagen
  const removeImage = (index) => {
    const newImages = [...imagenes];
    const newPreviews = [...imagenesPreview];
    
    newImages.splice(index, 1);
    URL.revokeObjectURL(newPreviews[index]); // Liberar memoria
    newPreviews.splice(index, 1);
    
    setImagenes(newImages);
    setImagenesPreview(newPreviews);
  };
  
  // Función para subir imágenes
  const uploadImages = async (paqueteId) => {
    if (imagenes.length === 0) return true;
    
    try {
      const formData = new FormData();
      imagenes.forEach(imagen => {
        formData.append('fotos', imagen);
      });
      
      await axios.post(`http://localhost:10101/paquete/subir-fotos/${paqueteId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error('No se pudieron subir algunas imágenes');
      return false;
    }
  };
  
  // Función para crear el paquete
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones básicas
      if (!paquete.nombrePaquete.trim()) {
        throw new Error('El nombre del paquete es obligatorio');
      }
      
      if (!paquete.descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      
      if (!paquete.duracion.trim()) {
        throw new Error('La duración es obligatoria');
      }
      
      if (!paquete.precio) {
        throw new Error('El precio es obligatorio');
      }
      
      if (paquete.idRutas.length === 0) {
        throw new Error('Debe seleccionar al menos una ruta');
      }
      
      // Formatear idRutas para la API
      const rutasIdsParam = paquete.idRutas.join(',');
      
      // Enviar solicitud al servidor
      const response = await axios.post(
        `http://localhost:10101/paquete/crear-paquete/${rutasIdsParam}`,
        {
          nombrePaquete: paquete.nombrePaquete,
          descripcion: paquete.descripcion,
          duracion: paquete.duracion,
          precio: paquete.precio
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Paquete creado:', response.data);
      
      // Si hay imágenes, las subimos
      if (imagenes.length > 0) {
        const paqueteId = response.data.id || response.data.idPaquete;
        await uploadImages(paqueteId);
      }
      
      toast.success('Paquete creado exitosamente');
      onCreated();
      onClose();
    } catch (err) {
      console.error('Error al crear paquete:', err);
      setError(err.response?.data?.message || err.message || 'Error al crear el paquete');
      toast.error(err.response?.data?.message || err.message || 'Error al crear el paquete');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-teal-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-teal-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package size={24} />
            Crear Nuevo Paquete Turístico
          </h2>
          <button
            onClick={onClose}
            className="text-teal-300 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-rose-900 bg-opacity-40 text-white p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-teal-300 mb-1">Nombre del Paquete</label>
              <input
                type="text"
                name="nombrePaquete"
                value={paquete.nombrePaquete}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-teal-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Ej: Tour Valle del Cocora Premium"
                required
              />
            </div>
            
            <div>
              <label className="block text-teal-300 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={paquete.descripcion}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-teal-800 text-white h-32 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Describe el paquete turístico..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-teal-300 mb-1">
                  <Clock className="inline w-4 h-4 mr-1" /> Duración
                </label>
                <input
                  type="text"
                  name="duracion"
                  value={paquete.duracion}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-teal-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Ej: 2 días / 3 horas"
                  required
                />
              </div>
              
              <div>
                <label className="block text-teal-300 mb-1">
                  <DollarSign className="inline w-4 h-4 mr-1" /> Precio (COP)
                </label>
                <input
                  type="text"
                  name="precio"
                  value={paquete.precio}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-teal-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Ej: 150000"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-teal-300 mb-1">
                <Map className="inline w-4 h-4 mr-1" /> Rutas Incluidas
              </label>
              <select
                multiple
                name="idRutas"
                value={paquete.idRutas}
                onChange={handleRutasChange}
                className="w-full p-2 rounded bg-teal-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 h-32"
                required
              >
                {rutasDisponibles.map(ruta => (
                  <option 
                    key={ruta.idRuta || ruta.id} 
                    value={ruta.idRuta || ruta.id}
                  >
                    {ruta.nombreRuta} - {ruta.duracion}
                  </option>
                ))}
              </select>
              <small className="text-teal-400 mt-1 block">Mantén presionada la tecla Ctrl para seleccionar múltiples rutas</small>
            </div>
            
            <div>
              <label className="block text-teal-300 mb-1">Imágenes del paquete</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-2 rounded bg-teal-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              
              {imagenesPreview.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {imagenesPreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Vista previa ${index + 1}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-teal-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${loading ? 'bg-teal-700' : 'bg-teal-500 hover:bg-teal-400'} text-white rounded transition-colors flex items-center gap-2`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creando...
                  </>
                ) : (
                  <>Crear Paquete</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearPaquetes;
