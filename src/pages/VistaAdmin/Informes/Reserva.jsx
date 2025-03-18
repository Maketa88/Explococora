import React, { useState, useEffect } from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import axios from 'axios';

const Reserva = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/reserva/todas');
        console.log('Respuesta del servidor:', response.data);
        
        const reservasData = response.data.result || [];
        console.log('Datos de reservas procesados:', reservasData);
        
        setReservas(reservasData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las reservas');
        setLoading(false);
        console.error('Error al obtener reservas:', err);
      }
    };

    fetchReservas();
  }, []);

  return (
    <DashboardLayoutAdmin>
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-2xl font-bold text-white">Informe de Reservas</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta/Paquete</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(reservas) && reservas.length > 0 ? (
                    reservas.map((reserva, index) => {
                      console.log('Renderizando reserva:', reserva); // Para depuración
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva._id || index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {reserva.nombre_cliente || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reserva.cedula ? `Cédula: ${reserva.cedula}` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva.infoPaquete?.nombrePaquete || 
                             (reserva.infoRuta && reserva.infoRuta.nombreRuta) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva.cantidadPersonas || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' : 
                                reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {reserva.estado || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva.infoPaquete?.precio ? `$${reserva.infoPaquete.precio.toFixed(2)}` : 
                             (reserva.infoRuta?.precio ? `$${reserva.infoRuta.precio.toFixed(2)}` : '$N/A')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay reservas disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Total de reservas: <span className="font-medium">{reservas.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutAdmin>
  );
};

export default Reserva; 