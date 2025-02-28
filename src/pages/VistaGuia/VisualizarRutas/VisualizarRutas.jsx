import React, { useEffect, useState } from 'react'; // Importar useEffect y useState
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import axios from 'axios'; // Importar axios para hacer solicitudes HTTP

const VisualizarRutas = () => {
  const [rutas, setRutas] = useState([]); // Estado para almacenar las rutas
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [error, setError] = useState(null); // Estado para manejar errores
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    dificultad: '',
    duracion: '',
    estado: '',
    tipo: ''
  });

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/rutas'); // Asegúrate de que esta URL sea correcta
        console.log("API Response:", response.data); // Log the data part of the response

        // Asegúrate de que la respuesta sea un array
        if (Array.isArray(response.data)) {
          setRutas(response.data);
          setRutasFiltradas(response.data); // Inicializar rutas filtradas con todas las rutas
        } else {
          throw new Error("La respuesta no es un array");
        }
      } catch (error) {
        console.error("Error al obtener las rutas:", error);
        setError(error.message); // Set error message
      }
    };

    fetchRutas(); // Llamar a la función para obtener rutas
  }, []);

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
      // Para la duración, podemos hacer un filtro más flexible
      switch(filtros.duracion) {
        case 'corta':
          // Menos de 1 hora o contiene "minutos"
          resultado = resultado.filter(ruta => 
            ruta.duracion.includes('minuto') || 
            (parseInt(ruta.duracion) < 1 && ruta.duracion.includes('hora'))
          );
          break;
        case 'media':
          // Entre 1 y 3 horas
          resultado = resultado.filter(ruta => {
            const horas = parseInt(ruta.duracion);
            return horas >= 1 && horas <= 3 && ruta.duracion.includes('hora');
          });
          break;
        case 'larga':
          // Más de 3 horas
          resultado = resultado.filter(ruta => {
            const horas = parseInt(ruta.duracion);
            return horas > 3 && ruta.duracion.includes('hora');
          });
          break;
        default:
          break;
      }
    }
    
    setRutasFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({
      dificultad: '',
      duracion: '',
      estado: '',
      tipo: ''
    });
    setRutasFiltradas(rutas);
  };

  return (
    <DashboardLayoutGuia>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Visualizar Rutas</h1>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
        
        {mostrarFiltros && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold text-white mb-3">Filtrar Rutas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Dificultad</label>
                <select
                  value={filtros.dificultad}
                  onChange={(e) => setFiltros({...filtros, dificultad: e.target.value})}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Todas</option>
                  <option value="Facil">Fácil</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Desafiante">Desafiante</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Duración</label>
                <select
                  value={filtros.duracion}
                  onChange={(e) => setFiltros({...filtros, duracion: e.target.value})}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Todas</option>
                  <option value="corta">Corta (menos de 1 hora)</option>
                  <option value="media">Media (1-3 horas)</option>
                  <option value="larga">Larga (más de 3 horas)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Todos</option>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Tipo</label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Todos</option>
                  <option value="Cabalgata">Cabalgata</option>
                  <option value="Caminata">Caminata</option>
                  <option value="Cabalgata y Caminata">Cabalgata y Caminata</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={limpiarFiltros}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Limpiar
              </button>
              <button
                onClick={aplicarFiltros}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
        
        {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        
        {/* Mostrar resultados filtrados */}
        {Array.isArray(rutasFiltradas) && rutasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rutasFiltradas.map((ruta) => (
              <div key={`${ruta.id}-${ruta.nombreRuta}`} className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-white">{ruta.nombreRuta}</h2>
                <p className="text-gray-400">Duración: {ruta.duracion} horas</p>
                <p className="text-gray-400">Descripción: {ruta.descripcion}</p>
                <p className="text-gray-400">Dificultad: {ruta.dificultad}</p>
                <p className="text-gray-400">Capacidad Máxima: {ruta.capacidadMaxima}</p>
                <p className="text-gray-400">Distancia: {ruta.distancia} km</p>
                <p className="text-gray-400">Tipo: {ruta.tipo}</p>
                <p className="text-gray-400">Estado: {ruta.estado}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No hay rutas disponibles con los filtros seleccionados.</p>
        )}
        {/* Contenido específico de Analytics */}
      </div>
    </DashboardLayoutGuia>
  );
};

export default VisualizarRutas;