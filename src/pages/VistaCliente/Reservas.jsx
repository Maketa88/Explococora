import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { PaisajeFondo } from '../../components/UI/PaisajeFondo';

export const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [busquedaRadicado, setBusquedaRadicado] = useState('');

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await axios.get('https://servicio-explococora.onrender.com/reserva/todas');
        setReservas(response.data.result);
        setLoading(false);
      } catch {
        setError('Error al cargar las reservas');
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  const getReservasFiltradas = () => {
    let resultado = reservas;
    if (filtroActivo === 'ruta') resultado = reservas.filter(reserva => reserva.infoRuta);
    if (filtroActivo === 'paquete') resultado = reservas.filter(reserva => reserva.infoPaquete);
    
    if (busquedaRadicado.trim() !== '') {
      resultado = resultado.filter(reserva => 
        reserva.radicado?.toLowerCase().includes(busquedaRadicado.toLowerCase())
      );
    }
    
    return resultado;
  };

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

  const reservasFiltradas = getReservasFiltradas();

  return (    <div style={{ position: 'relative' }}>
      <PaisajeFondo />

      <div className="container mx-auto max-w-7xl pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-6 text-center">

          Mis Reservas
          </h1>
        
        {/* Filtros y buscador */}
        <div className="mb-6 space-y-4">
          {/* Filtros */}
          <div className="flex justify-center">
            <div className="inline-flex bg-emerald-100/70 rounded-xl shadow-sm p-1">
              <button
                onClick={() => setFiltroActivo('todos')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filtroActivo === 'todos' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-emerald-600 hover:bg-white/50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroActivo('ruta')}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                  filtroActivo === 'ruta' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-emerald-600 hover:bg-white/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none">
                  <path d="M4,19 C6,16 10,13 12,16 C14,19 18,16 20,13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4,14 C6,11 10,8 12,11 C14,14 18,11 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Rutas
              </button>
              <button
                onClick={() => setFiltroActivo('paquete')}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                  filtroActivo === 'paquete' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-emerald-600 hover:bg-white/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm0 0V6a2 2 0 012 2h-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8H8m8 0a4 4 0 01-4 4H8m8 0H8" />
                  <rect x="3" y="8" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Paquetes
              </button>
            </div>
          </div>
          
          {/* Buscador de radicado */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                value={busquedaRadicado}
                onChange={(e) => setBusquedaRadicado(e.target.value)}
                className="bg-white/70 border border-emerald-200 text-emerald-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Buscar por radicado (ej: RES-123456)"
              />
              {busquedaRadicado && (
                <button
                  onClick={() => setBusquedaRadicado('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-500 hover:text-emerald-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {reservasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center mb-16">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">
              {filtroActivo === 'todos' 
                ? 'No tienes reservas registradas' 
                : `No tienes reservas de ${filtroActivo === 'ruta' ? 'rutas' : 'paquetes'}`}
            </p>
          </div>
        ) : (
          <div className="grid gap-10 grid-cols-1 lg:grid-cols-2 mb-16">
            {reservasFiltradas.map((reserva) => (
              <div key={reserva.idReserva} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-center">
                  <h2 className="text-xl font-semibold text-white">
                    {reserva.infoRuta ? (
                      <>
                        <span className="inline-flex items-center font-medium text-xs uppercase tracking-wider bg-white text-sky-900 px-2.5 py-1 rounded-md shadow-sm mr-3 transform -translate-y-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none">
                            <path d="M4,19 C6,16 10,13 12,16 C14,19 18,16 20,13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M4,14 C6,11 10,8 12,11 C14,14 18,11 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          Ruta
                        </span>
                        {reserva.infoRuta.nombreRuta}
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center font-medium text-xs uppercase tracking-wider bg-white text-sky-900 px-2.5 py-1 rounded-md shadow-sm mr-3 transform -translate-y-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm0 0V6a2 2 0 012 2h-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8H8m8 0a4 4 0 01-4 4H8m8 0H8" />
                            <rect x="3" y="8" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                          Paquete
                        </span>
                        {reserva.infoPaquete.nombrePaquete}
                      </>
                    )}
                  </h2>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
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
                    
                    <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                      {reserva.estado === 'pendiente' ? (
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Estado Reserva</p>
                        <p className={`text-gray-700 capitalize ${reserva.estado === 'pendiente' ? 'text-emerald-600 font-medium' : ''}`}>{reserva.estado}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-emerald-100/70 p-3 rounded-lg border border-emerald-200/50">
                      {reserva.estadoPago === 'completado' ? (
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Estado Pago</p>
                        <p className={`text-gray-700 capitalize ${reserva.estadoPago !== 'completado' ? 'text-emerald-600 font-medium' : ''}`}>{reserva.estadoPago}</p>
                      </div>
                    </div>
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
