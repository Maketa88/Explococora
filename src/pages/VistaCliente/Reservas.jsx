import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';

export const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/reserva/todas');
        setReservas(response.data.result);
        setLoading(false);
      } catch {
        setError('Error al cargar las reservas');
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Fondo decorativo inspirado en el Valle del Cocora */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

        {/* Siluetas de palmeras de cera */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg
            viewBox="0 0 1200 600"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M100,600 C100,400 150,300 200,100 C220,300 240,400 260,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
            <path
              d="M400,600 C400,350 450,250 500,50 C520,250 540,350 560,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
            <path
              d="M700,600 C700,400 750,300 800,100 C820,300 840,400 860,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
            <path
              d="M1000,600 C1000,350 1050,250 1100,50 C1120,250 1140,350 1160,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-6 text-center">Mis Reservas</h1>
        
        {reservas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No tienes reservas registradas</p>
          </div>
        ) : (
          <div className="grid gap-10 grid-cols-1 lg:grid-cols-2">
            {reservas.map((reserva) => (
              <div key={reserva.idReserva} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-center">
                  <h2 className="text-xl font-semibold text-white">
                    {reserva.infoRuta ? 
                      reserva.infoRuta.nombreRuta : 
                      reserva.infoPaquete.nombrePaquete
                    }
                  </h2>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between flex-wrap gap-2 mb-5">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                      reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Estado Reserva: {reserva.estado}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reserva.estadoPago === 'completado' ? 'bg-blue-100 text-blue-800' :
                      reserva.estadoPago === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Pago: {reserva.estadoPago}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                      <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Cantidad de personas</p>
                        <p className="text-gray-700">{Number(reserva.cantidadPersonas)} {Number(reserva.cantidadPersonas) === 1 ? 'persona' : 'personas'}</p>
                      </div>
                    </div>

                    <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                      <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Precio</p>
                        <p className="text-gray-700">${reserva.monto?.toLocaleString('es-CO')}</p>
                      </div>
                    </div>

                    <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                      <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Fecha de la aventura</p>
                        <p className="text-gray-700">{format(new Date(reserva.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                      </div>
                    </div>

                    {reserva.horaInicio && (
                      <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-emerald-700">Hora</p>
                          <p className="text-gray-700">{reserva.horaInicio}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                      <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Radicado</p>
                        <p className="text-gray-700">{reserva.radicado}</p>
                      </div>
                    </div>

                    {reserva.nombre_guia && (
                      <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-emerald-700">Guía</p>
                          <p className="text-gray-700">{reserva.nombre_guia}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
