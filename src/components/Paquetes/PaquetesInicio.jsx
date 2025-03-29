import axios from 'axios';
import {
  Clock, DollarSign,
  Map,
  Package
} from 'lucide-react';
import { useEffect, useState } from 'react';

const GestionPaquetes = () => {
  // Estados para la gestión de paquetes
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las imágenes
  const [paquetesConFotos, setPaquetesConFotos] = useState({});
  const [cargandoFotos, setCargandoFotos] = useState({});

  // Función para obtener la lista de paquetes
  const fetchPaquetes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:10101/paquete/lista-paquetes');
      console.log('Paquetes cargados:', response.data);
      
      // Verificar la estructura de la respuesta
      const paquetesData = response.data.result || [];
      
      // Filtrar paquetes duplicados por idPaquete
      const paquetesUnicos = Array.isArray(paquetesData) 
        ? paquetesData.filter((paquete, index, self) => 
            index === self.findIndex(p => p.idPaquete === paquete.idPaquete)
          )
        : [];
      
      // Para cada paquete, obtener sus rutas asociadas
      const paquetesConRutas = await Promise.all(
        paquetesUnicos.map(async (paquete) => {
          if (paquete.idPaquete) {
            const rutasAsociadas = await obtenerRutasAsociadas(paquete.idPaquete);
            return {
              ...paquete,
              rutasAsociadas: rutasAsociadas
            };
          }
          return paquete;
        })
      );
      
      setPaquetes(paquetesConRutas);
      
      // Obtener fotos para cada paquete
      if (Array.isArray(paquetesConRutas)) {
        paquetesConRutas.forEach(paquete => {
          if (paquete.idPaquete) {
            obtenerFotosPaquete(paquete.idPaquete);
          }
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar paquetes:', err);
      setError('No se pudieron cargar los paquetes. Por favor, intente de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Función para obtener las fotos de un paquete
  const obtenerFotosPaquete = async (idPaquete) => {
    try {
      setCargandoFotos(prev => ({ ...prev, [idPaquete]: true }));
      
      const response = await axios.get(`http://localhost:10101/paquete/fotos-publicas/${idPaquete}`);
      
      // Extraer los datos de las fotos según la estructura de la respuesta
      let fotosArray = response.data;
      
      // Si la respuesta tiene una propiedad 'fotos', usar esa
      if (response.data && response.data.fotos && Array.isArray(response.data.fotos)) {
        fotosArray = response.data.fotos;
      }
      
      if (Array.isArray(fotosArray)) {
        // Formatear las imágenes para mostrarlas
        const fotosFormateadas = fotosArray.map(foto => {
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
          }
          
          return {
            id: foto.id || foto.idFoto,
            url: imageUrl
          };
        });
        
        // Actualizar el estado con las fotos formateadas
        setPaquetesConFotos(prev => ({
          ...prev,
          [idPaquete]: fotosFormateadas
        }));
      } else {
        setPaquetesConFotos(prev => ({
          ...prev,
          [idPaquete]: []
        }));
      }
    } catch (err) {
      console.error('Error al obtener fotos del paquete:', err);
      setPaquetesConFotos(prev => ({
        ...prev,
        [idPaquete]: []
      }));
    } finally {
      setCargandoFotos(prev => ({ ...prev, [idPaquete]: false }));
    }
  };

  // Función para obtener información de las rutas asociadas
  const obtenerRutasAsociadas = async (idPaquete) => {
    try {
      console.log('Obteniendo rutas para el paquete:', idPaquete);
      
      // Intentar obtener el paquete directamente por ID
      const response = await axios.get(`http://localhost:10101/paquete/obtener-paquete/${idPaquete}`);
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
            nombreRuta: item.nombreRuta || `Ruta ${item.idRuta}`,
            tiempoEstimado: item.duracion || item.tiempoEstimado || null
          });
        });
        
        console.log('Rutas encontradas:', rutasInfo);
        return rutasInfo;
      } else if (response.data && typeof response.data === 'object') {
        // Si la respuesta es un objeto único, buscar rutas en él
        const rutasInfo = [];
        
        // Verificar si el objeto tiene propiedades de ruta
        if (response.data.idRuta || response.data.nombreRuta) {
          rutasInfo.push({
            idRuta: response.data.idRuta,
            nombreRuta: response.data.nombreRuta || `Ruta ${response.data.idRuta}`,
            tiempoEstimado: response.data.duracion || response.data.tiempoEstimado || null
          });
        }
        
        // Verificar si hay un array de rutas en alguna propiedad
        if (response.data.rutas && Array.isArray(response.data.rutas)) {
          response.data.rutas.forEach(ruta => {
            if (!rutasInfo.some(r => r.idRuta === ruta.idRuta)) {
              rutasInfo.push({
                idRuta: ruta.idRuta,
                nombreRuta: ruta.nombreRuta || `Ruta ${ruta.idRuta}`,
                tiempoEstimado: ruta.duracion || ruta.tiempoEstimado || null
              });
            }
          });
        }
        
        // Si encontramos rutas, retornar el array
        if (rutasInfo.length > 0) {
          console.log('Rutas encontradas:', rutasInfo);
          return rutasInfo;
        } else {
          // Si no hay rutas en la respuesta, mostrar mensaje
          console.log('No se encontraron rutas en la respuesta');
          return [];
        }
      } else {
        console.log('Formato de respuesta no reconocido');
        return [];
      }
    } catch (err) {
      console.error('Error al obtener rutas asociadas:', err);
      return [];
    }
  };

  // Cargar paquetes al montar el componente
  useEffect(() => {
    fetchPaquetes();
  }, []);

  // Función para mostrar precio formateado
  const mostrarPrecio = (precio) => {
    if (!precio) return '$0';
    return `$${parseInt(precio).toLocaleString('es-CO')}`;
  };

  // Función para obtener un ícono según el tipo de paquete
  const getPackageIcon = () => {
    return <Package className="w-16 h-16 text-emerald-600" />;
  };

  // Función para calcular la duración total de las rutas de un paquete
  const calcularDuracionTotalPaquete = (paquete) => {
    if (!paquete.rutasAsociadas || !paquete.rutasAsociadas.length) return paquete.duracion || 'No especificada';
    
    let horasTotales = 0;
    let minutosTotales = 0;
    
    paquete.rutasAsociadas.forEach(ruta => {
      if (ruta.tiempoEstimado) {
        const tiempo = ruta.tiempoEstimado.toLowerCase();
        
        // Extraer horas
        const horasMatch = tiempo.match(/(\d+)\s*(?:h|hora|horas)/);
        if (horasMatch) horasTotales += parseInt(horasMatch[1]);
        
        // Extraer minutos
        const minutosMatch = tiempo.match(/(\d+)\s*(?:m|min|minuto|minutos)/);
        if (minutosMatch) minutosTotales += parseInt(minutosMatch[1]);
      }
    });
    
    // Convertir minutos excedentes a horas
    if (minutosTotales >= 60) {
      horasTotales += Math.floor(minutosTotales / 60);
      minutosTotales = minutosTotales % 60;
    }
    
    // Formar el string de duración total
    let duracionTotal = '';
    if (horasTotales > 0) duracionTotal += `${horasTotales} hora${horasTotales !== 1 ? 's' : ''}`;
    if (minutosTotales > 0) {
      if (duracionTotal) duracionTotal += ' ';
      duracionTotal += `${minutosTotales} minuto${minutosTotales !== 1 ? 's' : ''}`;
    }
    
    return duracionTotal || paquete.duracion || 'No especificada';
  };

  return (
    <div className="min-h-screen text-gray-800 container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Paquetes Turísticos</h1>
        <p className="text-emerald-700 mt-1">Descubre nuestras experiencias más completas</p>
      </div>
      
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-rose-900 bg-opacity-30 text-white p-4 rounded-lg">
            <p className="text-center">{error}</p>
          </div>
        ) : paquetes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paquetes.map((paquete, index) => (
              <div 
                key={`paquete-${paquete.idPaquete || paquete.id || index}`} 
                className="bg-emerald-50 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-emerald-900/30 transition-all"
              >
                <div className="h-48 bg-emerald-950 relative overflow-hidden">
                  {cargandoFotos[paquete.idPaquete] ? (
                    <div className="flex justify-center items-center h-full bg-emerald-950">
                      <div className="animate-spin w-8 h-8 border-2 border-emerald-300 border-t-transparent rounded-full"></div>
                    </div>
                  ) : paquetesConFotos[paquete.idPaquete] && paquetesConFotos[paquete.idPaquete].length > 0 ? (
                    <div className="w-full h-full overflow-hidden">
                      <img
                        src={paquetesConFotos[paquete.idPaquete][0].url}
                        alt={paquete.nombrePaquete}
                        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-emerald-950">
                              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <path d="M14.5 12l2.5 -2.5"/>
                                <path d="M14.5 12l2.5 2.5"/>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={64} className="text-emerald-600" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 truncate">{paquete.nombrePaquete}</h3>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Clock size={16} />
                      <span>{calcularDuracionTotalPaquete(paquete)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-emerald-700">
                      <DollarSign size={16} />
                      <span>{mostrarPrecio(paquete.precio)}</span>
                      {paquete.descuento > 0 && (
                        <span className="bg-emerald-600 text-white text-xs px-1 rounded">
                          {paquete.descuento}% desc.
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Map size={16} />
                      <span>{paquete.rutasAsociadas?.length || 0} rutas incluidas</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 text-center p-8 rounded-lg border border-emerald-100">
            <div className="flex justify-center mb-4">
              {getPackageIcon()}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay paquetes disponibles</h3>
            <p className="text-emerald-700">No se encontraron paquetes turísticos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionPaquetes;

