import { useState, useEffect } from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import axios from 'axios';
import { Search, Filter, Calendar, RefreshCw, CheckCircle, AlertCircle, Clock, FileText, DollarSign, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logoImage from '../../../assets/Images/logo.webp'; // Importamos el logo

const Reserva = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: ''
  });
  
  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalReservas: 0,
    reservasConfirmadas: 0,
    reservasPendientes: 0,
    reservasPagadas: 0,
    reservasCompletadas: 0
  });
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const reservasPorPagina = itemsPerPage;

  // Nuevos estados para manejar los filtros y estadísticas de pagos
  const [estadoPagoFiltro, setEstadoPagoFiltro] = useState('todos');
  
  useEffect(() => {
    fetchReservas();
  }, []);
  
  // Efecto para actualizar las estadísticas cuando cambian las reservas
  useEffect(() => {
    if (reservas.length > 0) {
      const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada').length;
      const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
      const montoTotal = reservas.reduce((sum, r) => {
        const precio = r.infoPaquete?.precio || r.infoRuta?.precio || 0;
        return sum + (precio * (r.cantidadPersonas || 1));
      }, 0);
      
      setEstadisticas({
        totalReservas: reservas.length,
        reservasConfirmadas,
        reservasPendientes,
        montoTotal,
        reservasPagadas: reservas.filter(r => r.estadoPago === 'completado').length,
        reservasCompletadas: reservas.length
      });
    }
  }, [reservas]);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      setActualizando(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await axios.get('http://localhost:10101/reserva/todas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      const reservasData = response.data.result || [];
      console.log('Datos de reservas procesados:', reservasData);
      
      setReservas(reservasData);
    } catch (err) {
      console.error('Error al obtener reservas:', err);
      setError('Error al cargar las reservas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };
  
  // Filtrar reservas - aplicar filtros a la lista original
  const reservasFiltroAplicado = reservas.filter(reserva => {
    // Filtro por texto de búsqueda
    const matchBusqueda = filtro === '' || 
      (reserva.nombre_cliente && reserva.nombre_cliente.toLowerCase().includes(filtro.toLowerCase())) ||
      (reserva.cedula && reserva.cedula.toLowerCase().includes(filtro.toLowerCase())) ||
      (reserva.infoPaquete?.nombrePaquete && reserva.infoPaquete.nombrePaquete.toLowerCase().includes(filtro.toLowerCase())) ||
      (reserva.infoRuta?.nombreRuta && reserva.infoRuta.nombreRuta.toLowerCase().includes(filtro.toLowerCase()));
    
    // Filtro por estado
    const matchEstado = estadoFiltro === 'todos' || 
      (reserva.estado && reserva.estado.toLowerCase() === estadoFiltro.toLowerCase());
    
    // Filtro por fechas
    let matchFechas = true;
    if (filtros.fechaInicio && reserva.fechaReserva) {
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaReserva = new Date(reserva.fechaReserva);
      if (fechaReserva < fechaInicio) {
        matchFechas = false;
      }
    }
    
    if (filtros.fechaFin && reserva.fechaReserva) {
      const fechaFin = new Date(filtros.fechaFin);
      fechaFin.setHours(23, 59, 59); // Establecer al final del día
      const fechaReserva = new Date(reserva.fechaReserva);
      if (fechaReserva > fechaFin) {
        matchFechas = false;
      }
    }
    
    return matchBusqueda && matchEstado && matchFechas;
  });
  
  // Calcular reservas para la página actual
  const indexUltimaReserva = paginaActual * reservasPorPagina;
  const indexPrimeraReserva = indexUltimaReserva - reservasPorPagina;
  const reservasActuales = reservasFiltroAplicado.slice(indexPrimeraReserva, indexUltimaReserva);
  
  // Calcular total de páginas
  const totalPaginas = Math.ceil(reservasFiltroAplicado.length / reservasPorPagina);
  
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
  
  // Función para exportar a Excel
  const exportarExcel = async () => {
    try {
      console.log('Iniciando exportación a Excel...');
      
      // Crear un nuevo libro y hoja de trabajo
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reservas', {
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
      
      const totalReservasStyle = {
        font: { size: 14, color: { argb: '0000' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } }, // Verde muy claro
        border: {
          outline: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const reservasConfirmadasStyle = {
        font: { bold: true, size: 14, color: { argb: '166534' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }, // Verde claro
        border: {
          outline: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const reservasPendientesStyle = {
        font: { bold: true, size: 14, color: { argb: '854D0E' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } }, // Amarillo claro
        border: {
          outline: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      

      
      const tableCellStyle = {
        alignment: { horizontal: 'center', vertical: 'middle' },
        font: { name: 'Calibri', size: 11, color: { argb: '000000' } }, // Negro para todo el texto
        border: {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const moneyStyle = {
        font: { color: { argb: '000000' } },
        numFmt: '$#,##0.00',
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const confirmadaCellStyle = {
        font: { color: { argb: '000000' } }, // Cambiado a negro (era azul)
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const pendienteCellStyle = {
        font: { color: { argb: '000000' } }, // Cambiado a negro (era naranja/amarillo)
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      
      const footerStyle = {
        font: { italic: true, color: { argb: '6B7280' } },
        alignment: { horizontal: 'center' }
      };
      
      // Configurar ancho de columnas
      worksheet.getColumn('A').width = 10; // ID
      worksheet.getColumn('B').width = 25; // Cliente
      worksheet.getColumn('C').width = 25; // Ruta/Paquete
      worksheet.getColumn('D').width = 15; // Fecha
      worksheet.getColumn('E').width = 12; // Personas
      worksheet.getColumn('F').width = 15; // Estado
      worksheet.getColumn('G').width = 15; // Radicado
      worksheet.getColumn('H').width = 15; // Fecha Reserva
      worksheet.getColumn('I').width = 15; // Fecha Inicio
      worksheet.getColumn('J').width = 15; // Fecha Fin
      worksheet.getColumn('K').width = 15; // ID Pago
      worksheet.getColumn('L').width = 20; // Guía
      worksheet.getColumn('M').width = 12; // Hora Inicio
      
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
      worksheet.mergeCells('A1:M1');
      const titleRow = worksheet.getRow(1);
      titleRow.height = 50;
      titleRow.getCell(1).value = 'REPORTE DE RESERVAS TURÍSTICAS';
      titleRow.getCell(1).style = titleStyle;
      
      // Subtítulo con fecha
      worksheet.mergeCells('A2:M2');
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
      worksheet.mergeCells('A3:M3');
      const dividerRow = worksheet.getRow(3);
      dividerRow.height = 6;
      dividerRow.getCell(1).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: '007F66' } 
      };
      
      // Encabezado del resumen estadístico
      worksheet.mergeCells('A4:M4');
      const statsHeaderRow = worksheet.getRow(4);
      statsHeaderRow.height = 25;
      statsHeaderRow.getCell(1).value = 'RESUMEN ESTADÍSTICO';
      statsHeaderRow.getCell(1).style = subHeaderStyle;
      
      // Etiquetas de estadísticas
      const statLabelsRow = worksheet.getRow(5);
      statLabelsRow.height = 20;
      
      // Total de Reservas
      worksheet.mergeCells('A5:B5');
      statLabelsRow.getCell(1).value = 'Total de Reservas';
      statLabelsRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(1).font = { bold: true };
      
      // Reservas Confirmadas
      worksheet.mergeCells('C5:D5');
      statLabelsRow.getCell(3).value = 'Reservas Confirmadas';
      statLabelsRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(3).font = { bold: true };
      
      // Reservas Pendientes
      worksheet.mergeCells('E5:F5');
      statLabelsRow.getCell(5).value = 'Reservas Pendientes';
      statLabelsRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(5).font = { bold: true };
      
      
      // Valores de estadísticas
      const statValuesRow = worksheet.getRow(6);
      statValuesRow.height = 30;
      
      // Valor Total de Reservas
      worksheet.mergeCells('A6:B6');
      statValuesRow.getCell(1).value = estadisticas.totalReservas;
      statValuesRow.getCell(1).style = totalReservasStyle;
      
      // Valor Reservas Confirmadas
      worksheet.mergeCells('C6:D6');
      statValuesRow.getCell(3).value = estadisticas.reservasConfirmadas;
      statValuesRow.getCell(3).style = reservasConfirmadasStyle;
      
      // Valor Reservas Pendientes
      worksheet.mergeCells('E6:F6');
      statValuesRow.getCell(5).value = estadisticas.reservasPendientes;
      statValuesRow.getCell(5).style = reservasPendientesStyle;

      
      // Espacio entre estadísticas y tabla
      const spacerRow = worksheet.getRow(7);
      spacerRow.height = 10;
      
      // Encabezado de HISTORIAL DE RESERVAS
      worksheet.mergeCells('A8:M8');
      const headerRow = worksheet.getRow(8);  
      headerRow.height = 25;
      headerRow.getCell(1).value = 'HISTORIAL DE RESERVAS';
      headerRow.getCell(1).style = subHeaderStyle;
      
      // Encabezados de columnas
      const columnHeaderRow = worksheet.getRow(9);
      columnHeaderRow.height = 25;
      columnHeaderRow.values = [
        'Reserva', 
        'Cliente', 
        'Ruta/Paquete', 
        'Fecha', 
        'Personas', 
        'Estado', 
        'Radicado', 
        'Fecha Reserva', 
        'Fecha Inicio', 
        'Fecha Fin', 
        'ID Pago', 
        'Guía', 
        'Hora Inicio'
      ];
      columnHeaderRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      
      // Iniciar fila para datos
      let rowIndex = 10;
      
      // Agregar datos de reservas
      reservasFiltroAplicado.forEach((reserva, index) => {
        const row = worksheet.getRow(rowIndex++);
        row.height = 22;
        
        const tipo = reserva.infoPaquete ? 'Paquete' : reserva.infoRuta ? 'Ruta' : 'N/A';
        const nombre = reserva.infoPaquete?.nombrePaquete || 
                     (reserva.infoRuta && reserva.infoRuta.nombreRuta) || 'N/A';
        
        const estado = reserva.estado || 'No definido';
        
        // Asegúrate de obtener el ID de forma correcta, verificando todas las posibles ubicaciones
        // Modifica esta línea para buscar el ID en diferentes propiedades posibles
        row.getCell(1).value = reserva.id || reserva._id || 
                              (reserva._id && reserva._id.$oid) || 
                              reserva.idReserva || 
                              reserva.reservaId || 
                              'N/A';
        
        // Asegúrate de que el ID se muestre correctamente
        row.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell(1).font = { name: 'Calibri', size: 11, color: { argb: '000000' } }; // Negro en lugar de azul
        
        // Crear celdas con datos
        row.getCell(2).value = reserva.nombre_cliente || 'N/A';
        row.getCell(3).value = `${tipo}: ${nombre}`;
        row.getCell(3).font = { name: 'Calibri', size: 11, color: { argb: '000000' } }; // Negro para Ruta/Paquete
        row.getCell(4).value = formatearFecha(reserva.fechaReserva);
        row.getCell(5).value = reserva.cantidadPersonas || 'N/A';
        row.getCell(6).value = estado;
        row.getCell(7).value = reserva.radicado || reserva.numRadicado || 'N/A';
        row.getCell(8).value = reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString() : 'N/A';
        row.getCell(9).value = reserva.fechaInicio ? new Date(reserva.fechaInicio).toLocaleDateString() : 'N/A';
        row.getCell(10).value = reserva.fechaFin ? new Date(reserva.fechaFin).toLocaleDateString() : 'N/A';
        const idPago = row.getCell(11);
        idPago.value = reserva.idPago || 'N/A';
        idPago.style = {
          alignment: { horizontal: 'center', vertical: 'middle' },
          font: { name: 'Calibri', size: 11, color: { argb: '000000' } }
        };
        idPago.numFmt = '0';
        row.getCell(12).value = reserva.nombre_guia ? 
          (reserva.idGuia ? `${reserva.idGuia} - ${reserva.nombre_guia}` : reserva.nombre_guia) : 
          (reserva.idGuia || 'Sin asignar');
        row.getCell(13).value = reserva.horaInicio || 'N/A';
        
        // Aplicar estilos a las celdas
        row.eachCell((cell) => {
          cell.style = tableCellStyle;
        });
        
        // Aplicar estilo especial a la columna de estado
        const estadoCell = row.getCell(6);
        if (estado.toLowerCase() === 'confirmada') {
          Object.assign(estadoCell.style, confirmadaCellStyle);
        } else if (estado.toLowerCase() === 'pendiente') {
          Object.assign(estadoCell.style, pendienteCellStyle);
        }
        
        // Agregar esta línea para forzar el color negro en todas las celdas de la fila
        for (let i = 1; i <= worksheet.columnCount; i++) {
          if (row.getCell(i).font) {
            row.getCell(i).font.color = { argb: '000000' };
          } else {
            row.getCell(i).font = { color: { argb: '000000' } };
          }
        }
      });
      
      // Agregar un footer
      const footerRowIndex = rowIndex + 1;
      worksheet.mergeCells(`A${footerRowIndex}:M${footerRowIndex}`);
      const footerRow = worksheet.getRow(footerRowIndex);
      footerRow.height = 24;
      footerRow.getCell(1).value = 'ExploCocora - Sistema de Gestión de Rutas Turísticas © 2024';
      footerRow.getCell(1).style = footerStyle;
      
      // Generar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `reservas_${new Date().toISOString().slice(0,10)}.xlsx`);
      
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
            Informe de Reservas
          </h1>
          <p className="mt-2 opacity-90">Gestión y seguimiento de reservas de rutas y paquetes turísticos</p>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-emerald-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Total de reservas</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{estadisticas.totalReservas}</p>
              <FileText className="text-emerald-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Registros en el sistema</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Confirmadas</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{estadisticas.reservasConfirmadas}</p>
              <CheckCircle className="text-green-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Reservas confirmadas</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Pendientes</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{estadisticas.reservasPendientes}</p>
              <Clock className="text-yellow-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Reservas por confirmar</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Pagos</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">
                {estadisticas.reservasCompletadas ? 
                  `${Math.round((estadisticas.reservasPagadas / estadisticas.reservasCompletadas) * 100)}%` : 
                  '0%'}
              </p>
              <DollarSign className="text-blue-500 h-8 w-8" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {estadisticas.reservasPagadas || 0} de {estadisticas.reservasCompletadas || 0} pagadas
            </p>
          </div>
        </div>
        
        {/* Controles de búsqueda y filtrado */}
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por cliente, ruta, paquete..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Buscar reservas"
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
              onClick={exportarExcel}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              disabled={reservasFiltroAplicado.length === 0}
            >
              <Download size={18} aria-hidden="true" />
              Exportar Excel
            </button>
          </div>
        </div>
        
        {/* Modal de filtros avanzados */}
        {mostrarFiltros && (
          <div id="panel-filtros" className="mb-6 p-4 bg-white rounded-lg shadow-md border-t-4 border-emerald-500">
            <h2 className="text-lg font-semibold text-emerald-800 mb-4">Filtrar Reservas</h2>
            
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
                  <option value="confirmada">Confirmada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelada">Cancelada</option>
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
              
              <div>
                <label htmlFor="filter-pago" className="block text-sm font-medium text-gray-700 mb-1">Estado de Pago</label>
                <select
                  id="filter-pago"
                  value={estadoPagoFiltro}
                  onChange={(e) => setEstadoPagoFiltro(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="todos">Todos los pagos</option>
                  <option value="completado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
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
            <p className="text-gray-600">Cargando información de reservas...</p>
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
                onClick={fetchReservas}
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
            Mostrando {reservasActuales.length} de {reservasFiltroAplicado.length} registros
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
        
        {/* Tabla de reservas */}
        <div className="bg-white rounded-lg overflow-hidden mb-6 shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Listado de Reservas</h2>
            <p className="text-sm text-gray-500">Detalle de todas las reservas registradas en el sistema</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserva</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta/Paquete</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radicado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Reserva</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Fin</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guía</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Inicio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="13" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        <span className="mt-4 text-gray-500">Cargando reservas...</span>
                      </div>
                    </td>
                  </tr>
                ) : reservasActuales.length > 0 ? (
                  reservasActuales.map((reserva, index) => (
                    <tr key={reserva._id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {reserva._id || index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          {reserva.nombre_cliente || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reserva.cedula ? `Cédula: ${reserva.cedula}` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="text-xs text-gray-500 font-bold">
                          {reserva.infoPaquete ? 'Paquete' : reserva.infoRuta ? 'Ruta' : 'N/A'}
                        </div>
                        <div className="font-medium">
                          {reserva.infoPaquete?.nombrePaquete || 
                           (reserva.infoRuta && reserva.infoRuta.nombreRuta) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatearFecha(reserva.fechaReserva)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {reserva.cantidadPersonas || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reserva.estado === 'confirmada'
                            ? 'bg-green-100 text-green-800' 
                            : reserva.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {reserva.estado === 'confirmada' ? (
                            <><CheckCircle className="mr-1 h-3 w-3" /> {reserva.estado || 'No definido'}</>
                          ) : (
                            <><Clock className="mr-1 h-3 w-3" /> {reserva.estado || 'No definido'}</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.radicado || reserva.numRadicado || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reserva.fechaInicio ? new Date(reserva.fechaInicio).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reserva.fechaFin ? new Date(reserva.fechaFin).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.idPago || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{reserva.idGuia}</div>
                        <div className="text-xs text-gray-600">
                          {reserva.nombre_guia || 'Sin asignar'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.horaInicio || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-gray-500">No se encontraron registros de reservas</p>
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
        {reservasFiltroAplicado.length > 0 && (
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
                  Mostrando <span className="font-medium">{indexPrimeraReserva + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(indexUltimaReserva, reservasFiltroAplicado.length)}
                  </span>{' '}
                  de <span className="font-medium">{reservasFiltroAplicado.length}</span> resultados
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
                  
                  {[...Array(Math.min(5, totalPaginas)).keys()].map((i) => {
                    let pageNumber;
                    if (totalPaginas <= 5) {
                      pageNumber = i + 1;
                    } else {
                      const middlePage = Math.min(Math.max(3, paginaActual), totalPaginas - 2);
                      pageNumber = i + middlePage - 2;
                      
                      if (middlePage < 3) pageNumber = i + 1;
                      if (middlePage > totalPaginas - 2) pageNumber = totalPaginas - 4 + i;
                    }
                    
                    if (pageNumber > 0 && pageNumber <= totalPaginas) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => cambiarPagina(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            pageNumber === paginaActual
                              ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
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
    </DashboardLayoutAdmin>
  );
};

// Función para convertir una imagen a base64
const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default Reserva;