import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { FaSearch, FaFileDownload } from 'react-icons/fa';

const PagoPaquete = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        setLoading(true);
        console.log('Intentando obtener pagos desde la API...');
        
        // Ajustar la URL de la API - asegúrate de que esta URL sea correcta
        // Si estás usando un proxy en vite.config.js, usa la ruta relativa
        // Si no, usa la URL completa incluyendo el dominio
        const response = await axios.get('http://localhost:10101/pago-paquetes/todos');
        
        console.log('Respuesta de la API:', response.data);
        
        // Asegurarse de que response.data sea un array
        if (Array.isArray(response.data)) {
          setPagos(response.data);
        } else {
          console.error('La respuesta no es un array:', response.data);
          setPagos([]);
          setError('El formato de datos recibido no es válido');
        }
      } catch (err) {
        console.error('Error al obtener los pagos:', err);
        setPagos([]);
        setError(`No se pudieron cargar los datos de pagos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  // Filtrar pagos solo si pagos es un array
  const pagosFiltrados = Array.isArray(pagos) ? pagos.filter(pago => {
    const coincideFiltro = 
      pago.nombrePaquete?.toLowerCase().includes(filtro.toLowerCase()) ||
      `${pago.primerNombre || ''} ${pago.primerApellido || ''}`.toLowerCase().includes(filtro.toLowerCase()) ||
      pago.metodoPago?.toLowerCase().includes(filtro.toLowerCase()) ||
      (pago.id?.toString() || '').includes(filtro);
    
    const coincideEstado = estadoFiltro === 'todos' || pago.estado === estadoFiltro;
    
    return coincideFiltro && coincideEstado;
  }) : [];

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Exportar a CSV
  const exportarCSV = () => {
    if (!Array.isArray(pagos) || pagos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    const encabezados = ['ID', 'Paquete', 'Cliente', 'Monto', 'Método de Pago', 'Estado', 'Fecha'];
    const filas = pagosFiltrados.map(pago => [
      pago.id || '',
      pago.nombrePaquete || '',
      `${pago.primerNombre || ''} ${pago.primerApellido || ''}`,
      pago.montoPagado || 0,
      pago.metodoPago || '',
      pago.estado || '',
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
    link.setAttribute('download', `pagos_paquetes_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayoutAdmin>
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold text-white">Informe de Pagos de Paquetes</h1>
        
        {/* Información de depuración */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <p className="text-white">Estado de carga: {loading ? 'Cargando...' : 'Completado'}</p>
          <p className="text-white">Error: {error || 'Ninguno'}</p>
          <p className="text-white">Número de pagos cargados: {Array.isArray(pagos) ? pagos.length : 'No es un array'}</p>
          <p className="text-white">Tipo de datos recibidos: {typeof pagos}</p>
          {!Array.isArray(pagos) && <p className="text-white">Valor de pagos: {JSON.stringify(pagos)}</p>}
        </div>
        
        {/* Filtros y acciones */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2 w-full md:w-1/3">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por cliente, paquete, método..."
              className="bg-transparent text-white w-full focus:outline-none"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="bg-gray-700 text-white rounded-lg px-3 py-2"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="completado">Completado</option>
              <option value="pendiente">Pendiente</option>
            </select>
            
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              disabled={!Array.isArray(pagos) || pagos.length === 0}
            >
              <FaFileDownload /> Exportar
            </button>
          </div>
        </div>
        
        {/* Tabla de pagos */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 text-white p-4 rounded-lg">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-white">ID</th>
                  <th className="px-4 py-3 text-left text-white">Paquete</th>
                  <th className="px-4 py-3 text-left text-white">Cliente</th>
                  <th className="px-4 py-3 text-left text-white">Monto</th>
                  <th className="px-4 py-3 text-left text-white">Método de Pago</th>
                  <th className="px-4 py-3 text-left text-white">Estado</th>
                  <th className="px-4 py-3 text-left text-white">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {pagosFiltrados.length > 0 ? (
                  pagosFiltrados.map((pago) => (
                    <tr key={pago.id || Math.random()} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-white">{pago.id}</td>
                      <td className="px-4 py-3 text-white">{pago.nombrePaquete}</td>
                      <td className="px-4 py-3 text-white">{`${pago.primerNombre || ''} ${pago.primerApellido || ''}`}</td>
                      <td className="px-4 py-3 text-white">${(pago.montoPagado || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-white">{pago.metodoPago}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pago.estado === 'completado' ? 'bg-green-500 text-white' : 
                          pago.estado === 'pendiente' ? 'bg-yellow-500 text-black' : 
                          'bg-gray-500 text-white'
                        }`}>
                          {pago.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">{formatearFecha(pago.fechaPago)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
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
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Resumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-400">Total de pagos</p>
                <p className="text-xl font-bold text-white">{pagosFiltrados.length}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-400">Monto total</p>
                <p className="text-xl font-bold text-white">
                  ${pagosFiltrados.reduce((sum, pago) => sum + (pago.montoPagado || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-400">Pagos pendientes</p>
                <p className="text-xl font-bold text-white">
                  {pagosFiltrados.filter(pago => pago.estado === 'pendiente').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutAdmin>
  );
};

export default PagoPaquete; 