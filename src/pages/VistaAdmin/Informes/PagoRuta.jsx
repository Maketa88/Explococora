import { useState, useEffect } from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import axios from 'axios';
import { RefreshCw, DollarSign, Clock, AlertCircle, CheckCircle, FileText, Search, Filter, Download, Calendar } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logoImage from '../../../assets/Images/logo.webp'; // Importamos el logo

const PagoRuta = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [actualizando, setActualizando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: ''
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pagosPorPagina = itemsPerPage;

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      setActualizando(true);
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
      setActualizando(false);
    }
  };

  // Filtrar pagos solo si pagos es un array
  const pagosFiltrados = Array.isArray(pagos) ? pagos.filter(pago => {
    // Filtro por texto de búsqueda
    const coincideFiltro = 
      (pago.nombreRuta?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
      `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.toLowerCase().includes(filtro.toLowerCase()) ||
      (pago.metodoPago?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
      (pago.idPago?.toString() || '').includes(filtro);
    
    // Filtro por estado
    const coincideEstado = estadoFiltro === 'todos' || 
                           (pago.estadoPago?.toLowerCase() === estadoFiltro.toLowerCase());
    
    // Filtro por fechas
    let coincideFechas = true;
    if (filtros.fechaInicio && pago.fechaPago) {
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaPago = new Date(pago.fechaPago);
      if (fechaPago < fechaInicio) {
        coincideFechas = false;
      }
    }
    
    if (filtros.fechaFin && pago.fechaPago) {
      const fechaFin = new Date(filtros.fechaFin);
      fechaFin.setHours(23, 59, 59); // Establecer al final del día
      const fechaPago = new Date(pago.fechaPago);
      if (fechaPago > fechaFin) {
        coincideFechas = false;
      }
    }
    
    return coincideFiltro && coincideEstado && coincideFechas;
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

  // Aplicar filtros
  const aplicarFiltros = () => {
    setMostrarFiltros(false); // Ocultar modal de filtros después de aplicar
  };
  
  // Limpiar filtros
  const limpiarFiltros = () => {
    setEstadoFiltro('todos');
    setFiltros({
      fechaInicio: '',
      fechaFin: ''
    });
    setMostrarFiltros(false);
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
  const exportarCSV = async () => {
    if (!Array.isArray(pagos) || pagos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    try {
      // Crear un nuevo libro y hoja de trabajo
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pagos de Rutas', {
        pageSetup: {
          paperSize: 9, // A4
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0
        }
      });
      
      // Estilos personalizados
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '007F66' } }, // Verde Explococora
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const subHeaderStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '007F66' } }, // Verde Explococora
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const titleStyle = {
        font: { bold: true, size: 16, color: { argb: '007F66' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const subtitleStyle = {
        font: { italic: true, size: 10, color: { argb: '6B7280' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const totalPagosStyle = {
        font: { bold: true, size: 14, color: { argb: '1B5E20' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } }, // Verde muy claro
        border: {
          outline: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const pagosCompletadosStyle = {
        font: { bold: true, size: 14, color: { argb: '166534' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }, // Verde claro
        border: {
          outline: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const pagosPendientesStyle = {
        font: { bold: true, size: 14, color: { argb: '854D0E' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } }, // Amarillo claro
        border: {
          outline: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const montoTotalStyle = {
        font: { bold: true, size: 14, color: { argb: '1E40AF' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } }, // Azul claro
        border: {
          outline: { style: 'thin', color: { argb: 'D1D5DB' } }
        },
        numFmt: '$#,##0.00'
      };
      
      const tableCellStyle = {
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const moneyStyle = {
        font: { color: { argb: '1E3A8A' } },
        numFmt: '$#,##0.00',
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const completadoCellStyle = {
        font: { color: { argb: '166534' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const pendienteCellStyle = {
        font: { color: { argb: '854D0E' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const footerStyle = {
        font: { italic: true, color: { argb: '6B7280' } },
        alignment: { horizontal: 'center' }
      };
      
      // Configurar ancho de columnas
      worksheet.getColumn('A').width = 10;
      worksheet.getColumn('B').width = 25;
      worksheet.getColumn('C').width = 25;
      worksheet.getColumn('D').width = 15;
      worksheet.getColumn('E').width = 25;
      worksheet.getColumn('F').width = 15;
      worksheet.getColumn('G').width = 15;
      
      // Obtener el logo como Uint8Array
      const logoResponse = await fetch(logoImage);
      const logoArrayBuffer = await logoResponse.arrayBuffer();
      const logoBuffer = new Uint8Array(logoArrayBuffer);
      
      // Agregar el logo
      const logoId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'webp',
      });
      
      // Insertar logo en la esquina superior izquierda
      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 110, height: 50 }
      });
      
      // Título principal centrado
      worksheet.mergeCells('A1:G1');
      const titleRow = worksheet.getRow(1);
      titleRow.height = 50;
      titleRow.getCell(1).value = 'REPORTE DE PAGOS DE RUTAS TURÍSTICAS';
      titleRow.getCell(1).style = titleStyle;
      
      // Subtítulo con fecha
      worksheet.mergeCells('A2:G2');
      const subtitleRow = worksheet.getRow(2);
      subtitleRow.height = 20;
      subtitleRow.getCell(1).value = `Generado el: ${new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
      subtitleRow.getCell(1).style = subtitleStyle;
      
      // Línea divisoria verde
      worksheet.mergeCells('A3:G3');
      const dividerRow = worksheet.getRow(3);
      dividerRow.height = 6;
      dividerRow.getCell(1).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: '007F66' } 
      };
      
      // Encabezado del resumen estadístico
      worksheet.mergeCells('A4:G4');
      const statsHeaderRow = worksheet.getRow(4);
      statsHeaderRow.height = 25;
      statsHeaderRow.getCell(1).value = 'RESUMEN ESTADÍSTICO';
      statsHeaderRow.getCell(1).style = subHeaderStyle;
      
      // Etiquetas de estadísticas
      const statLabelsRow = worksheet.getRow(5);
      statLabelsRow.height = 20;
      
      // Total de Pagos
      worksheet.mergeCells('A5:B5');
      statLabelsRow.getCell(1).value = 'Total de Pagos';
      statLabelsRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(1).font = { bold: true };
      
      // Pagos Completados
      worksheet.mergeCells('C5:D5');
      statLabelsRow.getCell(3).value = 'Pagos Completados';
      statLabelsRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(3).font = { bold: true };
      
      // Pagos Pendientes
      worksheet.mergeCells('E5:F5');
      statLabelsRow.getCell(5).value = 'Pagos Pendientes';
      statLabelsRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(5).font = { bold: true };
      
      // Monto Total
      worksheet.mergeCells('G5:G5');
      statLabelsRow.getCell(7).value = 'Monto Total';
      statLabelsRow.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(7).font = { bold: true };
      
      // Calcular estadísticas
      const totalPagos = pagosFiltrados.length;
      const pagosCompletados = pagosFiltrados.filter(pago => pago.estadoPago === 'completado').length;
      const pagosPendientes = pagosFiltrados.filter(pago => pago.estadoPago === 'pendiente').length;
      const montoTotal = pagosFiltrados.reduce((sum, pago) => sum + (pago.monto || 0), 0);
      
      // Valores de estadísticas
      const statValuesRow = worksheet.getRow(6);
      statValuesRow.height = 30;
      
      // Valor Total de Pagos
      worksheet.mergeCells('A6:B6');
      statValuesRow.getCell(1).value = totalPagos;
      statValuesRow.getCell(1).style = totalPagosStyle;
      
      // Valor Pagos Completados
      worksheet.mergeCells('C6:D6');
      statValuesRow.getCell(3).value = pagosCompletados;
      statValuesRow.getCell(3).style = pagosCompletadosStyle;
      
      // Valor Pagos Pendientes
      worksheet.mergeCells('E6:F6');
      statValuesRow.getCell(5).value = pagosPendientes;
      statValuesRow.getCell(5).style = pagosPendientesStyle;
      
      // Valor Monto Total
      worksheet.mergeCells('G6:G6');
      statValuesRow.getCell(7).value = montoTotal;
      statValuesRow.getCell(7).style = montoTotalStyle;
      
      // Espacio entre estadísticas y tabla
      const spacerRow = worksheet.getRow(7);
      spacerRow.height = 10;
      
      // Encabezado de HISTORIAL DE TRANSACCIONES
      worksheet.mergeCells('A8:G8');
      const headerRow = worksheet.getRow(8);
      headerRow.height = 25;
      headerRow.getCell(1).value = 'HISTORIAL DE TRANSACCIONES';
      headerRow.getCell(1).style = subHeaderStyle;
      
      // Encabezados de columnas
      const columnHeaderRow = worksheet.getRow(9);
      columnHeaderRow.height = 25;
      columnHeaderRow.values = ['ID', 'Ruta', 'Cliente', 'Monto', 'Método de Pago', 'Estado', 'Fecha'];
      columnHeaderRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      
      // Iniciar fila para datos
      let rowIndex = 10;
      
      // Agregar datos de pagos
      pagosFiltrados.forEach((pago, index) => {
        // Obtener datos del pago
        const id = pago.idPago || '';
        const ruta = pago.nombreRuta || 'N/A';
        const cliente = `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.trim() || 'N/A';
        const monto = pago.monto || 0;
        const metodoPago = pago.metodoPago || 'N/A';
        const estado = pago.estadoPago || 'pendiente';
        const fecha = formatearFecha(pago.fechaPago);
        
        const row = worksheet.addRow([
          id,
          ruta,
          cliente,
          monto,
          metodoPago,
          estado.charAt(0).toUpperCase() + estado.slice(1),
          fecha
        ]);
        
        // Color de fondo alternado para mejor legibilidad
        const fillColor = index % 2 === 0 ? 'F9FAFB' : 'FFFFFF';
        
        // Aplicar estilos a las celdas
        row.eachCell((cell, colNumber) => {
          cell.style = {
            ...tableCellStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }
          };
          
          // Formato especial para la columna de monto
          if (colNumber === 4) {
            cell.style = {
              ...cell.style,
              ...moneyStyle
            };
          }
        });
        
        // Aplicar estilo especial a la columna de estado
        const estadoCell = row.getCell(6);
        if (estado.toLowerCase() === 'completado') {
          Object.assign(estadoCell.style, completadoCellStyle);
        } else {
          Object.assign(estadoCell.style, pendienteCellStyle);
        }
        
        rowIndex++;
      });
      
      // Agregar un footer
      const footerRowIndex = rowIndex + 1;
      worksheet.mergeCells(`A${footerRowIndex}:G${footerRowIndex}`);
      const footerRow = worksheet.getRow(footerRowIndex);
      footerRow.height = 24;
      footerRow.getCell(1).value = 'ExploCocora - Sistema de Gestión de Rutas Turísticas © 2024';
      footerRow.getCell(1).style = footerStyle;
      
      // Generar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `pagos_rutas_${new Date().toISOString().slice(0,10)}.xlsx`);
      
    } catch (error) {
      console.error('Error al exportar datos:', error);
      alert('Error al exportar los datos a Excel');
    }
  };

  return (
    <DashboardLayoutAdmin>
      <div className="p-6">
        {/* Encabezado y título */}
        <div className="mb-6 bg-gradient-to-r from-emerald-700 to-emerald-500 p-6 rounded-lg text-white shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="text-white" aria-hidden="true" />
            Informe de Pagos de Rutas
          </h1>
          <p className="mt-2 opacity-90">Gestión y seguimiento de transacciones de rutas turísticas</p>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-emerald-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Total de pagos</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{pagosFiltrados.length}</p>
              <FileText className="text-emerald-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Transacciones registradas</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Pagos completados</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">
                {pagosFiltrados.filter(pago => pago.estadoPago === 'completado').length}
              </p>
              <CheckCircle className="text-green-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Transacciones finalizadas</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Pagos pendientes</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">
                {pagosFiltrados.filter(pago => pago.estadoPago === 'pendiente').length}
              </p>
              <Clock className="text-yellow-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Transacciones por completar</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Monto total</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">
                ${pagosFiltrados.reduce((sum, pago) => sum + (pago.monto || 0), 0).toLocaleString('es-CO')}
              </p>
              <DollarSign className="text-blue-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Ingresos acumulados</p>
          </div>
        </div>
        
        {/* Controles de búsqueda y filtrado */}
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por cliente, ruta, método..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Buscar pagos"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} aria-hidden="true" />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`px-4 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-2 ${
                mostrarFiltros ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
              aria-expanded={mostrarFiltros}
              aria-controls="panel-filtros"
            >
              <Filter size={18} aria-hidden="true" />
              {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
            
            <button
              onClick={exportarCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              disabled={!Array.isArray(pagos) || pagos.length === 0}
            >
              <Download size={18} aria-hidden="true" />
              Exportar Excel
            </button>
          </div>
        </div>
        
        {/* Modal de filtros avanzados */}
        {mostrarFiltros && (
          <div id="panel-filtros" className="mb-6 p-4 bg-white rounded-lg shadow-md border-t-4 border-emerald-500">
            <h2 className="text-lg font-semibold text-emerald-800 mb-4">Filtrar Pagos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filter-estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  id="filter-estado"
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="todos">Todos los estados</option>
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
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
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
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} aria-hidden="true" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={limpiarFiltros}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mr-2"
              >
                Limpiar
              </button>
              <button
                onClick={aplicarFiltros}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
        
        {/* Estado de carga */}
        {loading && (
          <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando información de pagos...</p>
          </div>
        )}
        
        {/* Estado de error */}
        {error && !loading && (
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="p-4 border-b border-red-100 bg-red-50">
              <h3 className="text-red-600 font-medium text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Error de conexión
              </h3>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
            <div className="p-4 bg-white">
              <button 
                onClick={fetchPagos}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${actualizando ? 'animate-spin' : ''}`} />
                {actualizando ? 'Actualizando...' : 'Reintentar conexión'}
              </button>
            </div>
          </div>
        )}
        
        {/* Controles de paginación por encima de la tabla */}
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700">
            Mostrando {pagosActuales.length} de {pagosFiltrados.length} registros
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Historial de Transacciones</h2>
            <p className="text-sm text-gray-500">Detalle de pagos procesados para rutas turísticas</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
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
                ) : pagosActuales.length > 0 ? (
                  pagosActuales.map((pago) => (
                    <tr key={pago.idPago || Math.random()} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pago.idPago}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{pago.nombreRuta || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{`${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">${(pago.monto || 0).toLocaleString('es-CO')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-800">{pago.metodoPago}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pago.estadoPago === 'completado' || pago.estadoPago === 'Completado' 
                            ? 'bg-green-100 text-green-800' 
                            : pago.estadoPago === 'pendiente' || pago.estadoPago === 'Pendiente' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pago.estadoPago === 'completado' || pago.estadoPago === 'Completado' ? (
                            <><CheckCircle className="mr-1 h-3 w-3" /> {pago.estadoPago || 'No definido'}</>
                          ) : (
                            <><Clock className="mr-1 h-3 w-3" /> {pago.estadoPago || 'No definido'}</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatearFecha(pago.fechaPago)}</td>
                    </tr>
                  ))
                ) : (
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
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Paginación */}
        {pagosFiltrados.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50 rounded-lg shadow-sm mb-6">
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
                    {Math.min(indexUltimoPago, pagosFiltrados.length)}
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
                  
                  {/* Mostrar números de página limitados para no sobrecargar la interfaz */}
                  {[...Array(Math.min(5, totalPaginas)).keys()].map((i) => {
                    // Calcular las páginas a mostrar (centradas en la página actual)
                    let pageNumber;
                    if (totalPaginas <= 5) {
                      // Si hay 5 o menos páginas, mostrarlas todas
                      pageNumber = i + 1;
                    } else {
                      // Si hay más de 5 páginas, mostrar centradas alrededor de la actual
                      const middlePage = Math.min(Math.max(3, paginaActual), totalPaginas - 2);
                      pageNumber = i + middlePage - 2;
                      
                      // Ajustar el rango si estamos al inicio o al final
                      if (middlePage < 3) pageNumber = i + 1;
                      if (middlePage > totalPaginas - 2) pageNumber = totalPaginas - 4 + i;
                    }
                    
                    // Solo mostrar números válidos de página
                    if (pageNumber > 0 && pageNumber <= totalPaginas) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => cambiarPagina(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            paginaActual === pageNumber
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
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </DashboardLayoutAdmin>
  );
};

export default PagoRuta;