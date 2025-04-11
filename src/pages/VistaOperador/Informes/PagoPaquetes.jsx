import { useState, useEffect } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { Package, Search, Filter, Calendar, Download, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logoImage from '../../../assets/Images/logo.webp'; // Importamos el logo

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

  // Añadir estado para guardar la información de reservas
  const [datosReservas, setDatosReservas] = useState([]);

  // Cargar los datos directamente del endpoint específico para todas las reservas
  useEffect(() => {
    const cargarDatosReservas = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No se encontró token de autenticación');
          return;
        }
        
        // Usar la ruta para todas las reservas
        const response = await axios.get('http://localhost:10101/reserva/todas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Guardar los datos, pero filtrando solo los que son paquetes
        if (response.data && response.data.result) {
          // Filtrar para incluir solo los que tienen infoPaquete
          const soloReservasPaquetes = response.data.result.filter(
            reserva => reserva.infoPaquete !== null
          );
          
          setDatosReservas(soloReservasPaquetes);
          console.log("Datos de reservas (solo paquetes):", soloReservasPaquetes);
        }
      } catch (error) {
        console.error("Error al cargar datos de reservas:", error);
      }
    };
    
    cargarDatosReservas();
  }, []);

  // Update the useEffect that fetches pagos to filter based on datosReservas
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
        
        // Mostrar información detallada de cada pago
        pagosList.forEach((pago, index) => {
          console.log(`Pago ${index + 1} - Datos completos:`, pago);
        });
        
        // Filtrar pagos para que solo incluya los que están en datosReservas
        const pagosFiltrados = pagosList.filter(pago => {
          // Si datosReservas está vacío, no filtramos para evitar que no se muestre nada
          if (datosReservas.length === 0) return true;
          
          // Intentar encontrar una reserva que coincida con el pago
          return datosReservas.some(reserva => {
            // Usar diferentes propiedades para hacer coincidir pago con reserva
            const nombrePaquetePago = pago.nombrePaquete || (pago.infoPaquete ? pago.infoPaquete.nombrePaquete : '');
            const nombrePaqueteReserva = reserva.infoPaquete ? reserva.infoPaquete.nombrePaquete : '';
            
            // Cliente del pago
            const clientePago = 
              pago.nombreCliente ||
              (pago.infoCliente ? pago.infoCliente.nombreCompleto : '') ||
              (pago.cliente ? (typeof pago.cliente === 'string' ? pago.cliente : pago.cliente.nombre) : '') ||
              `${pago.primerNombre || ''} ${pago.primerApellido || ''}`.trim() || 
              `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.trim();
            
            const clienteReserva = reserva.nombre_cliente || '';
            
            // Intentar hacer coincidir por nombre de paquete y cliente
            const coincidePaqueteYCliente = 
              nombrePaquetePago && 
              nombrePaqueteReserva && 
              clientePago && 
              clienteReserva &&
              nombrePaquetePago.toLowerCase() === nombrePaqueteReserva.toLowerCase() && 
              clientePago.toLowerCase().includes(clienteReserva.toLowerCase());
            
            // Intentar hacer coincidir por ID si está disponible
            const coincideID = 
              pago.idReserva && 
              reserva.id && 
              pago.idReserva.toString() === reserva.id.toString();
            
            return coincidePaqueteYCliente || coincideID;
          });
        });
        
        console.log('Pagos filtrados que coinciden con reservas:', pagosFiltrados);
        console.log(`Se filtró de ${pagosList.length} pagos a ${pagosFiltrados.length} pagos`);
        
        setPagos(pagosFiltrados);
        setFilteredPagos(pagosFiltrados);
        
        // Calcular estadísticas con los pagos filtrados
        const montoTotal = pagosFiltrados.reduce((sum, pago) => sum + (pago.montoPagado || pago.monto || 0), 0);
        const pagosPendientes = pagosFiltrados.filter(p => 
          p.estado === 'pendiente' || p.estadoPago === 'pendiente'
        ).length;
        const pagosCompletados = pagosFiltrados.filter(p => 
          p.estado === 'completado' || p.estadoPago === 'completado'
        ).length;
        
        setEstadisticas({
          totalPagos: pagosFiltrados.length,
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
    
    // Only fetch pagos if we have reservas data
    if (datosReservas.length > 0) {
      fetchPagos();
    }
  }, [datosReservas]); // Add datosReservas as a dependency to re-run when it changes

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
          pago.nombreCliente ||
          pago.infoCliente?.nombreCompleto ||
          pago.cliente?.nombre ||
          (pago.cliente && typeof pago.cliente === 'string' ? pago.cliente : '') ||
          `${pago.primerNombre || ''} ${pago.primerApellido || ''}`.trim() || 
          `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.trim() ||
          'N/A';
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
      // Crear un nuevo libro y hoja de trabajo
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pagos de Paquetes', {
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
      worksheet.mergeCells('A1:L1');
      const titleRow = worksheet.getRow(1);
      titleRow.height = 50;
      titleRow.getCell(1).value = 'REPORTE DE PAGOS DE PAQUETES TURÍSTICOS';
      titleRow.getCell(1).style = titleStyle;
      
      // Subtítulo con fecha
      worksheet.mergeCells('A2:L2');
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
      worksheet.mergeCells('A3:L3');
      const dividerRow = worksheet.getRow(3);
      dividerRow.height = 6;
      dividerRow.getCell(1).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: '007F66' } 
      };
      
      // Encabezado del resumen estadístico
      worksheet.mergeCells('A4:L4');
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
      worksheet.mergeCells('G5:H5');
      statLabelsRow.getCell(7).value = 'Monto Total';
      statLabelsRow.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
      statLabelsRow.getCell(7).font = { bold: true };
      
      // Valores de estadísticas
      const statValuesRow = worksheet.getRow(6);
      statValuesRow.height = 30;
      
      // Valor Total de Pagos
      worksheet.mergeCells('A6:B6');
      statValuesRow.getCell(1).value = estadisticas.totalPagos;
      statValuesRow.getCell(1).style = totalPagosStyle;
      
      // Valor Pagos Completados
      worksheet.mergeCells('C6:D6');
      statValuesRow.getCell(3).value = estadisticas.pagosCompletados;
      statValuesRow.getCell(3).style = pagosCompletadosStyle;
      
      // Valor Pagos Pendientes
      worksheet.mergeCells('E6:F6');
      statValuesRow.getCell(5).value = estadisticas.pagosPendientes;
      statValuesRow.getCell(5).style = pagosPendientesStyle;
      
      // Valor Monto Total
      worksheet.mergeCells('G6:H6');
      statValuesRow.getCell(7).value = estadisticas.montoTotal;
      statValuesRow.getCell(7).style = montoTotalStyle;
      
      // Espacio entre estadísticas y tabla
      const spacerRow = worksheet.getRow(7);
      spacerRow.height = 10;
      
      // Encabezado de HISTORIAL DE TRANSACCIONES
      worksheet.mergeCells('A8:L8');
      const headerRow = worksheet.getRow(8);  
      headerRow.height = 25;
      headerRow.getCell(1).value = 'HISTORIAL DE TRANSACCIONES';
      headerRow.getCell(1).style = subHeaderStyle;
      
      // Encabezados de columnas
      const columnHeaderRow = worksheet.getRow(9);
      columnHeaderRow.height = 25;
      columnHeaderRow.values = [
        'ID Pago', 
        'Radicado', 
        'Paquete', 
        'Cliente', 
        'Guía', 
        'Personas', 
        'Método de Pago', 
        'Fecha Reserva', 
        'Fecha Inicio', 
        'Hora Inicio', 
        'Monto', 
        'Estado'
      ];
      columnHeaderRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      
      // Iniciar fila para datos
      let rowIndex = 10;
      
      // Agregar datos de pagos
      filteredPagos.forEach((pago, index) => {
        // Extraer el nombre del cliente
        const cliente = 
          pago.nombreCliente ||
          pago.infoCliente?.nombreCompleto ||
          pago.cliente?.nombre ||
          (pago.cliente && typeof pago.cliente === 'string' ? pago.cliente : '') ||
          `${pago.primerNombre || ''} ${pago.primerApellido || ''}`.trim() || 
          `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.trim() ||
          'N/A';
        
        // Buscar la reserva correspondiente usando nombre de paquete y cliente como criterios
        const reserva = datosReservas.find(r => {
          const nombrePaqueteReserva = r.infoPaquete?.nombrePaquete || '';
          // Solo considerar si es un paquete (tiene infoPaquete)
          return r.infoPaquete !== null && 
                 r.nombre_cliente === cliente && 
                 (nombrePaqueteReserva === pago.nombrePaquete || pago.nombrePaquete === r.infoPaquete?.nombrePaquete);
        });
        
        // Si no encuentra por paquete, intentar por fecha
        const reservaAlternativa = !reserva ? datosReservas.find(r => 
          r.nombre_cliente === cliente && 
          new Date(r.fechaInicio).toDateString() === new Date(pago.fechaInicio || pago.fecha || pago.fechaReserva).toDateString()
        ) : null;
        
        // Usar la reserva encontrada o la alternativa
        const reservaFinal = reserva || reservaAlternativa;
        
        // Usar exactamente los campos que vienen de la API
        const horaInicio = reservaFinal ? reservaFinal.horaInicio : 'N/A';
        const fechaInicio = reservaFinal ? formatearFecha(reservaFinal.fechaInicio) : formatearFecha(pago.fechaReserva || pago.createdAt || pago.fecha || pago.fechaPago);
        const nombreGuia = reservaFinal ? reservaFinal.nombre_guia : 'N/A';
        
        // Asegurarse de obtener el número de personas de todos los posibles campos
        const numPersonas = 
          pago.numPersonas || 
          pago.numeroPersonas || 
          pago.cantidadPersonas || 
          pago.cantidad_personas || 
          (pago.personas && typeof pago.personas === 'number' ? pago.personas : null) ||
          'N/A';
        
        const monto = pago.monto || pago.montoPagado || 0;
        const metodoPago = pago.metodoPago || 'N/A';
        
        const estado = pago.estado || pago.estadoPago || 'pendiente';
        
        // Obtener la cédula del cliente
        const cedulaCliente = reservaFinal ? reservaFinal.cedula : 'N/A';
        
        // Format only the client with cedula
        const clienteFormateado = `${cliente}\nCC: ${cedulaCliente !== 'N/A' ? cedulaCliente : 'No disponible'}`;
        
        // Keep guide name only, without cedula
        const guiaFormateado = nombreGuia;
        
        // Get the actual fecha_reserva or fechaReserva field from reservation
        let fechaReserva = 'N/A';
        if (reservaFinal) {
          fechaReserva = formatearFecha(reservaFinal.fecha_reserva || reservaFinal.fechaReserva);
        }
        
        const row = worksheet.addRow([
          pago.idPago || 'N/A',
          pago.radicado || pago.numRadicado || 'N/A',
          pago.nombrePaquete || pago.infoPaquete?.nombrePaquete || 'N/A',
          clienteFormateado,
          guiaFormateado,
          numPersonas,
          metodoPago,
          fechaReserva,
          fechaInicio,
          horaInicio,
          monto,
          estado.charAt(0).toUpperCase() + estado.slice(1)
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
          if (colNumber === 11) {
            cell.style = {
              ...cell.style,
              ...moneyStyle
            };
          }
        });
        
        // Aplicar estilo especial a la columna de estado
        const estadoCell = row.getCell(12);
        if (estado.toLowerCase() === 'completado') {
          Object.assign(estadoCell.style, completadoCellStyle);
        } else {
          Object.assign(estadoCell.style, pendienteCellStyle);
        }
        
        rowIndex++;
      });
      
      // Agregar un footer
      const footerRowIndex = rowIndex + 1;
      worksheet.mergeCells(`A${footerRowIndex}:L${footerRowIndex}`);
      const footerRow = worksheet.getRow(footerRowIndex);
      footerRow.height = 24;
      footerRow.getCell(1).value = 'ExploCocora - Sistema de Gestión de Rutas Turísticas © 2024';
      footerRow.getCell(1).style = footerStyle;
      
      // Generar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `pagos_paquetes_${new Date().toISOString().slice(0,10)}.xlsx`);
      
    } catch (error) {
      console.error('Error al exportar datos:', error);
      alert('Error al exportar los datos a Excel');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return 'N/A';
    }
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pago</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radicado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquete</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guía</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Reserva</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Inicio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        <span className="mt-4 text-gray-500">Cargando pagos...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-8 text-center">
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
                    <td colSpan="12" className="px-6 py-8 text-center">
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
                    // Extraer el nombre del cliente
                    const cliente = 
                      pago.nombreCliente ||
                      pago.infoCliente?.nombreCompleto ||
                      pago.cliente?.nombre ||
                      (pago.cliente && typeof pago.cliente === 'string' ? pago.cliente : '') ||
                      `${pago.primerNombre || ''} ${pago.primerApellido || ''}`.trim() || 
                      `${pago.clienteNombre || ''} ${pago.clienteApellido || ''}`.trim() ||
                      'N/A';
                    
                    // Buscar la reserva correspondiente usando nombre de paquete y cliente como criterios
                    const reserva = datosReservas.find(r => {
                      const nombrePaqueteReserva = r.infoPaquete?.nombrePaquete || '';
                      // Solo considerar si es un paquete (tiene infoPaquete)
                      return r.infoPaquete !== null && 
                             r.nombre_cliente === cliente && 
                             (nombrePaqueteReserva === pago.nombrePaquete || pago.nombrePaquete === r.infoPaquete?.nombrePaquete);
                    });
                    
                    // Si no encuentra por paquete, intentar por fecha
                    const reservaAlternativa = !reserva ? datosReservas.find(r => 
                      r.nombre_cliente === cliente && 
                      new Date(r.fechaInicio).toDateString() === new Date(pago.fechaInicio || pago.fecha || pago.fechaReserva).toDateString()
                    ) : null;
                    
                    // Usar la reserva encontrada o la alternativa
                    const reservaFinal = reserva || reservaAlternativa;
                    
                    // Usar exactamente los campos que vienen de la API
                    const horaInicio = reservaFinal ? reservaFinal.horaInicio : 'N/A';
                    const fechaInicio = reservaFinal ? formatearFecha(reservaFinal.fechaInicio) : formatearFecha(pago.fechaReserva || pago.createdAt || pago.fecha || pago.fechaPago);
                    const nombreGuia = reservaFinal ? reservaFinal.nombre_guia : 'N/A';
                    
                    // Asegurarse de obtener el número de personas de todos los posibles campos
                    const numPersonas = 
                      pago.numPersonas || 
                      pago.numeroPersonas || 
                      pago.cantidadPersonas || 
                      pago.cantidad_personas || 
                      (pago.personas && typeof pago.personas === 'number' ? pago.personas : null) ||
                      'N/A';
                    
                    const monto = pago.monto || pago.montoPagado || 0;
                    const metodoPago = pago.metodoPago || 'N/A';
                    
                    const estado = pago.estado || pago.estadoPago || 'pendiente';
                    
                    // Obtener la cédula del cliente
                    const cedulaCliente = reservaFinal ? reservaFinal.cedula : 'N/A';
                    
                    // Format only the client with cedula
                    const clienteFormateado = `${cliente}\nCC: ${cedulaCliente !== 'N/A' ? cedulaCliente : 'No disponible'}`;
                    
                    // Keep guide name only, without cedula
                    const guiaFormateado = nombreGuia;
                    
                    // Get the actual fecha_reserva or fechaReserva field from reservation
                    let fechaReserva = 'N/A';
                    if (reservaFinal) {
                      fechaReserva = formatearFecha(reservaFinal.fecha_reserva || reservaFinal.fechaReserva);
                    }
                    
                    // Solo renderizar si está relacionado con un paquete
                    if (!pago.nombrePaquete || pago.nombrePaquete === 'N/A') {
                      return null; // No renderizar esta fila si no es un paquete
                    }
                    
                    return (
                      <tr key={`${pago.idPago}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pago.idPago}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pago.radicado || pago.numRadicado || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{pago.nombrePaquete || pago.infoPaquete?.nombrePaquete || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="font-medium">{cliente}</div>
                          <div className="text-xs text-gray-500">CC: {cedulaCliente !== 'N/A' ? cedulaCliente : 'No disponible'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="font-medium">{nombreGuia}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{numPersonas}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-800">{metodoPago}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fechaReserva}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fechaInicio}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{horaInicio}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          ${Number(monto).toLocaleString('es-CO')}
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
