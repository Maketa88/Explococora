import React, { useEffect, useState } from 'react'; // Importar useEffect y useState
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import axios from 'axios'; // Importar axios para hacer solicitudes HTTP

const VisualizarRutas = () => {
  const [rutas, setRutas] = useState([]); // Estado para almacenar las rutas
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/rutas'); // Asegúrate de que esta URL sea correcta
        console.log("API Response:", response.data); // Log the data part of the response

        // Asegúrate de que la respuesta sea un array
        if (Array.isArray(response.data)) {
          setRutas(response.data); // Actualizar el estado con las rutas obtenidas
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

  return (
    <DashboardLayoutGuia>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Visualizar Rutas</h1>
        {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        {Array.isArray(rutas) && rutas.length > 0 ? (
          rutas.map((ruta) => ( // Renderizar cada ruta en una carta
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
          ))
        ) : (
          <p className="text-gray-400">No hay rutas disponibles.</p>
        )}
        {/* Contenido específico de Analytics */}
      </div>
    </DashboardLayoutGuia>
  );
};

export default VisualizarRutas;