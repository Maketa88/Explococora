import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { FaSearch, FaFileDownload } from 'react-icons/fa';

const PagoRuta = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const pagosPorPagina = 10;

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        setLoading(true);
        console.log('Intentando obtener pagos de rutas desde la API...');
        
        // Obtener el token del localStorage
        const token = localStorage.getItem('token');
        
        // Cambiada la URL para obtener pagos de rutas e incluir el token en los headers
        const response = await axios.get('http://localhost:10101/pagos-rutas/historial', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Respuesta de la API:', response.data);
        
        // Verificar si la respuesta contiene un array en la propiedad 'historial'
        if (response.data && Array.isArray(response.data.historial)) {
          setPagos(response.data.historial);
        } else {
          console.error('La respuesta no contiene un array de historial válido:', response.data);
          setPagos([]);
          setError('El formato de datos recibido no es válido');
        }
      } catch (err) {
        console.error('Error al obtener los pagos de rutas:', err);
        setPagos([]);
        setError(`No se pudieron cargar los datos de pagos de rutas: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  // Filtrar pagos solo si pagos es un array
  const pagosFiltrados = Array.isArray(pagos) ? pagos.filter(pago => {
    const coincideFiltro = 
      pago.nombreRuta?.toLowerCase().includes(filtro.toLowerCase()) ||
      `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.toLowerCase().includes(filtro.toLowerCase()) ||
      pago.metodoPago?.toLowerCase().includes(filtro.toLowerCase()) ||
      (pago.idPago?.toString() || '').includes(filtro);
    
    const coincideEstado = estadoFiltro === 'todos' || 
                           (pago.estadoPago?.toLowerCase() === estadoFiltro.toLowerCase());
    
    return coincideFiltro && coincideEstado;
  }).sort((a, b) => {
    // Ordenar por ID de forma descendente (más reciente primero)
    return (b.idPago || 0) - (a.idPago || 0);
  }) : [];

  // Calcular pagos para la página actual
  const indexUltimoPago = paginaActual * pagosPorPagina;
  const indexPrimerPago = indexUltimoPago - pagosPorPagina;
  const pagosActuales = pagosFiltrados.slice(indexPrimerPago, indexUltimoPago);
  
  // Calcular total de páginas
  const totalPaginas = Math.ceil(pagosFiltrados.length / pagosPorPagina);
  
  // Cambiar de página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };
  
  // Ir a la página anterior
  const irPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };
  
  // Ir a la página siguiente
  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Exportar a Excel
  const exportarCSV = () => {
    if (!Array.isArray(pagos) || pagos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    // Crear encabezados exactamente como en el ejemplo
    const headers = ['ID,Ruta,Cliente,Monto,Método de Pago,Estado,Fecha'];
    
    // Crear filas de datos con el formato exacto del ejemplo
    const filas = pagosFiltrados.map(pago => {
      // Obtener ID del pago
      const id = pago.idPago || '';
      
      // Obtener nombre de la ruta
      const ruta = pago.nombreRuta || '';
      
      // Nombre completo del cliente
      const cliente = `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.trim();
      
      // Monto del pago
      const monto = pago.monto || '0';
      
      // Método de pago
      const metodoPago = pago.metodoPago || 'MercadoPago';
      
      // Estado del pago
      const estado = pago.estadoPago || 'pendiente';
      
      // Fecha formateada
      const fecha = formatearFecha(pago.fechaPago);
      
      // Formato exacto como en el ejemplo
      return `${id},${ruta},${cliente},${monto},${metodoPago},${estado},${fecha}`;
    });
    
    // Combinar encabezados y filas
    const csvContent = [headers, ...filas].join('\n');
    
    // Para asegurar que Excel interprete correctamente los caracteres
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;
    
    // Crear un blob con el contenido
    const blob = new Blob([csvContentWithBOM], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    
    // Crear un enlace para descargar el archivo
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pagos_rutas_${new Date().toISOString().slice(0,10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayoutAdmin>
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Informe de Pagos de Rutas</h1>
        
        {/* Filtros y acciones */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full md:w-1/3 shadow-sm">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por cliente, ruta, método..."
              className="bg-transparent text-gray-700 w-full focus:outline-none"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="bg-white text-gray-700 border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="completado">Completado</option>
              <option value="pendiente">Pendiente</option>
            </select>
            
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm"
              disabled={!Array.isArray(pagos) || pagos.length === 0}
            >
              <FaFileDownload /> Exportar
            </button>
          </div>
        </div>
        
        {/* Tabla de pagos */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagosActuales.length > 0 ? (
                  pagosActuales.map((pago) => (
                    <tr key={pago.idPago || Math.random()} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{pago.idPago}</td>
                      <td className="px-4 py-3 text-gray-700">{pago.nombreRuta || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-700">{`${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`}</td>
                      <td className="px-4 py-3 text-gray-700">${(pago.monto || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-700">{pago.metodoPago}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pago.estadoPago === 'completado' || pago.estadoPago === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 
                          pago.estadoPago === 'pendiente' || pago.estadoPago === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pago.estadoPago || 'No definido'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatearFecha(pago.fechaPago)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No se encontraron pagos que coincidan con los criterios de búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Paginador */}
            {pagosFiltrados.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={irPaginaAnterior}
                    disabled={paginaActual === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={irPaginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{indexPrimerPago + 1}</span> a{' '}
                      <span className="font-medium">
                        {indexUltimoPago > pagosFiltrados.length ? pagosFiltrados.length : indexUltimoPago}
                      </span>{' '}
                      de <span className="font-medium">{pagosFiltrados.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={irPaginaAnterior}
                        disabled={paginaActual === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Anterior</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPaginas).keys()].map((numero) => (
                        <button
                          key={numero + 1}
                          onClick={() => cambiarPagina(numero + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            paginaActual === numero + 1
                              ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {numero + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={irPaginaSiguiente}
                        disabled={paginaActual === totalPaginas}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Siguiente</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Resumen */}
        {!loading && !error && Array.isArray(pagos) && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Resumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-gray-500">Total de pagos</p>
                <p className="text-xl font-bold text-gray-800">{pagosFiltrados.length}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-gray-500">Monto total</p>
                <p className="text-xl font-bold text-gray-800">
                  ${pagosFiltrados.reduce((sum, pago) => sum + (pago.monto || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-gray-500">Pagos pendientes</p>
                <p className="text-xl font-bold text-gray-800">
                  {pagosFiltrados.filter(pago => pago.estadoPago === 'pendiente').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutAdmin>
  );
};

export default PagoRuta; 