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
  }) : [];

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

  // Exportar a CSV
  const exportarCSV = () => {
    if (!Array.isArray(pagos) || pagos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    const encabezados = ['ID', 'Ruta', 'Cliente', 'Monto', 'Método de Pago', 'Estado', 'Fecha'];
    const filas = pagosFiltrados.map(pago => [
      pago.idPago || '',
      pago.nombreRuta || '',
      `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`,
      pago.monto || 0,
      pago.metodoPago || '',
      pago.estadoPago || '',
      formatearFecha(pago.fechaPago)
    ]);
    
    let csvContent = encabezados.join(',') + '\n';
    filas.forEach(fila => {
      csvContent += fila.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pagos_rutas_${new Date().toISOString().slice(0,10)}.csv`);
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
                {pagosFiltrados.length > 0 ? (
                  pagosFiltrados.map((pago) => (
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