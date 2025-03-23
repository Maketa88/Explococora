import { useState, useEffect } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { Package, Search, Filter, Calendar, Download, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const PagoPaquetes = () => {
  const [pagos, setPagos] = useState([]);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [error, setError] = useState(null);
  
  const [estadisticas, setEstadisticas] = useState({
    totalPagos: 0,
    montoTotal: 0,
    pagosPendientes: 0,
    pagosCompletados: 0
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedPagos, setPaginatedPagos] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  // Función para cargar los pagos de paquetes desde la API
  useEffect(() => {
    const fetchPagos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Obtener el token del localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
        }
        
        // Realizar la petición a la API con el token
        const response = await axios.get('http://localhost:10101/pago-paquetes/historial', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Respuesta de la API de pagos paquetes:', response.data);
        
        // Verificar la respuesta y procesarla según su estructura
        let pagosList = [];
        
        if (response.data && Array.isArray(response.data.historial)) {
          pagosList = response.data.historial;
        } else if (Array.isArray(response.data)) {
          pagosList = response.data;
        } else {
          console.warn('Formato de respuesta inesperado:', response.data);
          throw new Error('Formato de respuesta inválido desde el servidor.');
        }
        
        setPagos(pagosList);
        setFilteredPagos(pagosList);
        
        // Calcular estadísticas
        const montoTotal = pagosList.reduce((sum, pago) => sum + (pago.montoPagado || pago.monto || 0), 0);
        const pagosPendientes = pagosList.filter(p => 
          p.estado === 'pendiente' || p.estadoPago === 'pendiente'
        ).length;
        const pagosCompletados = pagosList.filter(p => 
          p.estado === 'completado' || p.estadoPago === 'completado'
        ).length;
        
        setEstadisticas({
          totalPagos: pagosList.length,
          montoTotal,
          pagosPendientes,
          pagosCompletados
        });
      } catch (error) {
        console.error('Error al cargar los pagos de paquetes:', error);
        
        // Determinar el tipo de error y mostrar un mensaje adecuado
        if (error.response) {
          // Error de respuesta del servidor
          if (error.response.status === 401) {
            setError('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
          } else if (error.response.status === 403) {
            setError('No tiene permisos suficientes para acceder a esta información.');
          } else {
            setError(`Error del servidor: ${error.response.data?.message || error.response.statusText}`);
          }
        } else if (error.request) {
          // Error de conexión (no se pudo contactar al servidor)
          setError('No se pudo conectar con el servidor. Verifique su conexión a internet o intente más tarde.');
        } else {
          // Otro tipo de error
          setError(`Error al cargar los pagos: ${error.message}`);
        }
        
        // Inicializar los estados con arrays vacíos en caso de error
        setPagos([]);
        setFilteredPagos([]);
        setEstadisticas({
          totalPagos: 0,
          montoTotal: 0,
          pagosPendientes: 0,
          pagosCompletados: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPagos();
  }, []);

  // Actualizar paginación cuando cambian los datos filtrados
  useEffect(() => {
    setTotalPages(Math.ceil(filteredPagos.length / itemsPerPage));
    setCurrentPage(1); // Resetear a primera página cuando cambian los filtros
    paginarDatos();
  }, [filteredPagos, itemsPerPage]);

  // Actualizar datos paginados cuando cambia la página actual
  useEffect(() => {
    paginarDatos();
  }, [currentPage]);

  // Función para paginar los datos
  const paginarDatos = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedPagos(filteredPagos.slice(startIndex, endIndex));
  };

  // Función para ir a una página específica
  const cambiarPagina = (numeroPagina) => {
    setCurrentPage(numeroPagina);
  };

  // Función para ir a la página anterior
  const irPaginaAnterior = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Función para ir a la página siguiente
  const irPaginaSiguiente = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredPagos(pagos);
    } else {
      const filtered = pagos.filter(pago => {
        // Buscar en diferentes campos dependiendo de la estructura de datos
        const nombrePaquete = pago.nombrePaquete || pago.infoPaquete?.nombrePaquete || '';
        const cliente = 
          (pago.cliente || '') || 
          `${pago.primerNombre || ''} ${pago.primerApellido || ''}` || 
          `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`;
        const metodoPago = pago.metodoPago || '';
        
        return (
          nombrePaquete.toLowerCase().includes(value) ||
          cliente.toLowerCase().includes(value) ||
          metodoPago.toLowerCase().includes(value)
        );
      });
      setFilteredPagos(filtered);
    }
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    let result = [...pagos];
    
    if (filters.estado) {
      result = result.filter(pago => 
        (pago.estado || pago.estadoPago || '').toLowerCase() === filters.estado.toLowerCase()
      );
    }
    
    if (filters.fechaInicio && filters.fechaFin) {
      // Convertir a objetos Date para comparar
      const start = new Date(filters.fechaInicio);
      const end = new Date(filters.fechaFin);
      
      result = result.filter(pago => {
        // Adaptar según la estructura de datos que venga de la API
        const fechaPago = new Date(pago.fecha || pago.fechaPago || pago.createdAt);
        return fechaPago >= start && fechaPago <= end;
      });
    }
    
    setFilteredPagos(result);
  };

  // Función para exportar a Excel
  const handleExport = async () => {
    if (filteredPagos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    setExportLoading(true);
    
    try {
      // Crear encabezados
      const headers = ['ID,Paquete,Cliente,Monto,Método de Pago,Estado,Fecha'];
      
      // Crear filas de datos
      const filas = filteredPagos.map(pago => {
        // Extraer datos según la estructura que venga de la API
        const id = pago.id || pago.idPago || '';
        const nombrePaquete = pago.nombrePaquete || pago.infoPaquete?.nombrePaquete || 'N/A';
        const cliente = 
          (pago.cliente || '') || 
          `${pago.primerNombre || ''} ${pago.primerApellido || ''}` || 
          `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}` ||
          'N/A';
        const monto = pago.monto || pago.montoPagado || 0;
        const metodoPago = pago.metodoPago || 'N/A';
        const estado = pago.estado || pago.estadoPago || 'N/A';
        const fecha = formatearFecha(pago.fecha || pago.fechaPago || pago.createdAt);
        
        return `${id},${nombrePaquete},${cliente},${monto},${metodoPago},${estado},${fecha}`;
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
      link.setAttribute('download', `pagos_paquetes_${new Date().toISOString().slice(0,10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error al exportar datos:', error);
      alert('Error al exportar los datos');
    } finally {
      setExportLoading(false);
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

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Encabezado y título */}
        <div className="mb-6 bg-gradient-to-r from-emerald-700 to-emerald-500 p-6 rounded-lg text-white shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="text-white" aria-hidden="true" />
            Informe de Pagos de Paquetes
          </h1>
          <p className="mt-2 opacity-90">Gestione y visualice todos los pagos asociados a paquetes turísticos</p>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-emerald-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Total de pagos</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{estadisticas.totalPagos}</p>
              <Package className="text-emerald-500 h-8 w-8" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Pagos completados</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{estadisticas.pagosCompletados}</p>
              <CheckCircle className="text-green-500 h-8 w-8" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Pagos pendientes</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{estadisticas.pagosPendientes}</p>
              <Clock className="text-yellow-500 h-8 w-8" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Monto total</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">${estadisticas.montoTotal.toLocaleString('es-CO')}</p>
              <span className="text-blue-500 text-xl font-bold">$</span>
            </div>
          </div>
        </div>
        
        {/* Controles de búsqueda y filtrado */}
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por cliente, paquete, método..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Buscar pagos"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} aria-hidden="true" />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-2 ${
                showFilters ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
              aria-expanded={showFilters}
              aria-controls="panel-filtros"
            >
              <Filter size={18} aria-hidden="true" />
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
            
            <button 
              onClick={handleExport}
              className={`px-4 py-2 ${exportLoading ? 'bg-emerald-400' : 'bg-emerald-600'} text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2`}
              disabled={filteredPagos.length === 0 || exportLoading}
            >
              {exportLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download size={18} aria-hidden="true" />
                  Exportar Excel
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Panel de filtros */}
        {showFilters && (
          <div id="panel-filtros" className="mb-6 p-4 bg-white rounded-lg shadow-md border-t-4 border-emerald-500">
            <h2 className="text-lg font-semibold text-emerald-800 mb-4">Filtrar Pagos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filter-estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  id="filter-estado"
                  value={filters.estado}
                  onChange={(e) => setFilters({...filters, estado: e.target.value})}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="filter-fecha-inicio" className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <div className="relative">
                  <input
                    id="filter-fecha-inicio"
                    type="date"
                    value={filters.fechaInicio}
                    onChange={(e) => setFilters({...filters, fechaInicio: e.target.value})}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} aria-hidden="true" />
                </div>
              </div>
              
              <div>
                <label htmlFor="filter-fecha-fin" className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <div className="relative">
                  <input
                    id="filter-fecha-fin"
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => setFilters({...filters, fechaFin: e.target.value})}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} aria-hidden="true" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6" role="alert">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}
        
        {/* Controles de paginación por encima de la tabla */}
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700">
            Mostrando {paginatedPagos.length} de {filteredPagos.length} registros
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-700">Mostrar:</label>
            <select 
              id="itemsPerPage"
              className="border border-gray-300 rounded-md p-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
        
        {/* Tabla de pagos */}
        <div className="bg-white rounded-lg overflow-hidden mb-6 shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquete</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        <span className="mt-4 text-gray-500">Cargando pagos...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-gray-500">No se pudieron cargar los datos</p>
                        <p className="text-sm text-gray-400 mt-1">Intente recargar la página</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPagos.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-gray-500">No se encontraron registros de pagos</p>
                        <p className="text-sm text-gray-400 mt-1">Intenta con otros criterios de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPagos.map((pago, index) => {
                    // Adaptar según la estructura de datos que venga de la API
                    const id = pago.id || pago.idPago || index;
                    const nombrePaquete = pago.nombrePaquete || pago.infoPaquete?.nombrePaquete || 'N/A';
                    const cliente = 
                      (pago.cliente || '') || 
                      `${pago.primerNombre || ''} ${pago.primerApellido || ''}` || 
                      `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}` ||
                      'N/A';
                    const monto = pago.monto || pago.montoPagado || 0;
                    const metodoPago = pago.metodoPago || 'N/A';
                    const estado = pago.estado || pago.estadoPago || 'pendiente';
                    const fecha = pago.fecha || pago.fechaPago || pago.createdAt;
                    
                    return (
                      <tr key={id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{nombrePaquete}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          ${Number(monto).toLocaleString('es-CO')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-800">{metodoPago}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            estado.toLowerCase() === 'completado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatearFecha(fecha)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Paginación */}
        {filteredPagos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50 rounded-lg shadow-sm mb-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={irPaginaAnterior}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={irPaginaSiguiente}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredPagos.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredPagos.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={irPaginaAnterior}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Mostrar números de página limitados para no sobrecargar la interfaz */}
                  {[...Array(Math.min(5, totalPages)).keys()].map((i) => {
                    // Calcular las páginas a mostrar (centradas en la página actual)
                    let pageNumber;
                    if (totalPages <= 5) {
                      // Si hay 5 o menos páginas, mostrarlas todas
                      pageNumber = i + 1;
                    } else {
                      // Si hay más de 5 páginas, mostrar centradas alrededor de la actual
                      const middlePage = Math.min(Math.max(3, currentPage), totalPages - 2);
                      pageNumber = i + middlePage - 2;
                      
                      // Ajustar el rango si estamos al inicio o al final
                      if (middlePage < 3) pageNumber = i + 1;
                      if (middlePage > totalPages - 2) pageNumber = totalPages - 4 + i;
                    }
                    
                    // Solo mostrar números válidos de página
                    if (pageNumber > 0 && pageNumber <= totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => cambiarPagina(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={irPaginaSiguiente}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </DashboardLayout>
  );
};

export default PagoPaquetes;
