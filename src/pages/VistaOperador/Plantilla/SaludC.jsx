import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { FileDown, CheckCircle, AlertTriangle, Thermometer, Activity, Clock } from 'lucide-react';

const SaludC = () => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    responsable: '',
    cargo: '',
    caballeriza: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    serial: '',
    estadoGeneral: '',
    temperatura: '',
    respiracion: '',
    pulso: '',
    observacionesLesiones: '',
    tratamientos: '',
    estadoEquipo: '',
    equiposDanados: '',
    descripcionDanos: '',
    medidasTomadas: '',
    responsableRevision: ''
  });

  // Estado para indicar que se está exportando
  const [exportLoading, setExportLoading] = useState(false);

  // Manejador para cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Función para exportar a Excel
  const exportarExcel = async () => {
    try {
      setExportLoading(true);
      
      const workbook = new ExcelJS.Workbook();
      
      // Configuración de propiedades del libro
      workbook.creator = 'Sistema Explococora';
      workbook.lastModifiedBy = 'Usuario';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // Crear hoja de trabajo
      const sheet = workbook.addWorksheet('Reporte Salud Caballos');
      
      // Estilos para el Excel con bordes negros
      const titleStyle = {
        font: { bold: true, size: 16, color: { argb: '006400' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6FFE6' } }, // Verde muy claro
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const sectionHeaderStyle = {
        font: { bold: true, size: 14, color: { argb: '006400' } }, // Verde oscuro
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6FFE6' } }, // Verde muy claro
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const headerCellStyle = {
        font: { bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const dataCellStyle = {
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      // Estilos condicionales para el estado del caballo
      const saludableStyle = Object.assign({}, dataCellStyle, {
        font: { color: { argb: '006400' } }, // Verde
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6FFE6' } }
      });
      
      const lesionadoStyle = Object.assign({}, dataCellStyle, {
        font: { color: { argb: '854D0E' } }, // Amarillo
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } }
      });
      
      const enfermoStyle = Object.assign({}, dataCellStyle, {
        font: { color: { argb: 'B91C1C' } }, // Rojo
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }
      });
      
      // Título principal
      const titleRow = sheet.addRow(['REPORTE DE SALUD DE CABALLOS Y EQUIPOS']);
      titleRow.getCell(1).style = titleStyle;
      sheet.mergeCells('A1:B1');
      
      // Información del Responsable - SIN ESPACIO DESPUÉS DEL TÍTULO
      const respHeaderRow = sheet.addRow(['Información del Responsable', '']);
      respHeaderRow.getCell(1).style = sectionHeaderStyle;
      respHeaderRow.getCell(2).style = sectionHeaderStyle;
      sheet.mergeCells(`A${respHeaderRow.number}:B${respHeaderRow.number}`);
      
      const responsableRows = [
        ['Responsable', formData.responsable],
        ['Cargo', formData.cargo],
        ['Caballeriza', formData.caballeriza],
        ['Fecha', formData.fecha],
        ['Hora', formData.hora]
      ];
      
      responsableRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Información del Caballo - SIN ESPACIO ANTES DE ESTA SECCIÓN
      const caballoHeaderRow = sheet.addRow(['Información del Caballo', '']);
      caballoHeaderRow.getCell(1).style = sectionHeaderStyle;
      caballoHeaderRow.getCell(2).style = sectionHeaderStyle;
      sheet.mergeCells(`A${caballoHeaderRow.number}:B${caballoHeaderRow.number}`);
      
      const caballoRows = [
        ['Serial', formData.serial],
        ['Estado general', formData.estadoGeneral]
      ];
      
      caballoRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Ajustar filas para que "Signos Vitales" esté en la fila 12
      const currentRow = sheet.rowCount;
      if (currentRow < 11) {
        const rowsToAdd = 11 - currentRow;
        for (let i = 0; i < rowsToAdd; i++) {
          sheet.addRow([]);
        }
      }
      
      // Signos Vitales - asegurando que esté en la fila 12
      const signosVitalesRow = sheet.addRow(['Signos Vitales', '']);
      signosVitalesRow.getCell(1).style = sectionHeaderStyle;
      signosVitalesRow.getCell(2).style = sectionHeaderStyle;
      sheet.mergeCells(`A${signosVitalesRow.number}:B${signosVitalesRow.number}`);
      
      // Verificar que estamos en la fila 12
      if (signosVitalesRow.number !== 12) {
        console.warn(`Signos Vitales está en la fila ${signosVitalesRow.number} en lugar de 12`);
      }
      
      const signosRows = [
        ['Temperatura', formData.temperatura],
        ['Respiración', formData.respiracion],
        ['Pulso', formData.pulso]
      ];
      
      signosRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Si está lesionado o enfermo, agregar observaciones
      if (formData.estadoGeneral === 'Lesionado' || formData.estadoGeneral === 'Enfermo') {
        sheet.addRow(['Observaciones y Tratamientos', '']);
        const obsHeaderRow = sheet.rowCount;
        sheet.getCell(`A${obsHeaderRow}`).style = sectionHeaderStyle;
        sheet.getCell(`B${obsHeaderRow}`).style = sectionHeaderStyle;
        sheet.mergeCells(`A${obsHeaderRow}:B${obsHeaderRow}`);
        
        const obsRows = [
          ['Observaciones de lesiones o anomalías', formData.observacionesLesiones],
          ['Tratamientos administrados', formData.tratamientos]
        ];
        
        obsRows.forEach(row => {
          const excelRow = sheet.addRow(row);
          excelRow.getCell(1).style = headerCellStyle;
          excelRow.getCell(2).style = dataCellStyle;
        });
      }
      
      // Información del Equipo
      const equipoHeaderRow = sheet.rowCount + 1;
      sheet.addRow(['Información del Equipo', '']);
      sheet.getCell(`A${equipoHeaderRow}`).style = sectionHeaderStyle;
      sheet.getCell(`B${equipoHeaderRow}`).style = sectionHeaderStyle;
      sheet.mergeCells(`A${equipoHeaderRow}:B${equipoHeaderRow}`);
      
      const equipoRows = [
        ['Estado del equipo', formData.estadoEquipo],
        ['Equipos dañados', formData.equiposDanados || 'Ninguno'],
        ['Medidas tomadas', formData.medidasTomadas],
        ['Responsable de la revisión', formData.responsableRevision]
      ];
      
      equipoRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Pie de página - ubicado exactamente en la fila 21
      const currentRowCount = sheet.rowCount;
      if (currentRowCount < 20) {
        const rowsToAdd = 20 - currentRowCount;
        for (let i = 0; i < rowsToAdd; i++) {
          sheet.addRow([]);
        }
      } else if (currentRowCount > 20) {
        // Si ya hay más de 20 filas, ajustar para agregar el footer
        console.warn(`Ya hay ${currentRowCount} filas, el footer podría no estar en la fila 21`);
      }
      
      // Añadir el footer en la fila 21
      const footerRow = sheet.addRow(['Reporte generado por Sistema Explococora - ' + format(new Date(), 'dd/MM/yyyy HH:mm')]);
      footerRow.getCell(1).style = {
        font: { italic: true, color: { argb: '6B7280' } },
        alignment: { horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      sheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
      
      // Ajustar ancho de columnas
      sheet.getColumn('A').width = 30;
      sheet.getColumn('B').width = 50;
      
      // Generar archivo Excel y descargarlo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Nombre de archivo con fecha actual
      const fileName = `Reporte_Salud_Caballos_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
      saveAs(blob, fileName);
      
      setExportLoading(false);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setExportLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md border border-emerald-500">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">Reporte de Salud de Caballos y Equipos</h2>
      
      {/* Tarjetas de información de estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-emerald-500">
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Responsable</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-gray-800 truncate">{formData.responsable || 'Sin asignar'}</p>
            <CheckCircle className="text-emerald-500 h-6 w-6" />
          </div>
        </div>
        
        <div className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${
          formData.estadoGeneral === 'Saludable' ? 'border-green-500' : 
          formData.estadoGeneral === 'Lesionado' ? 'border-yellow-500' : 
          formData.estadoGeneral === 'Enfermo' ? 'border-red-500' : 'border-gray-300'
        }`}>
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Estado del caballo</h3>
          <div className="flex items-center justify-between">
            <p className={`text-xl font-bold ${
              formData.estadoGeneral === 'Saludable' ? 'text-green-700' : 
              formData.estadoGeneral === 'Lesionado' ? 'text-yellow-700' : 
              formData.estadoGeneral === 'Enfermo' ? 'text-red-700' : 'text-gray-400'
            }`}>
              {formData.estadoGeneral || 'No especificado'}
            </p>
            {formData.estadoGeneral === 'Saludable' ? (
              <CheckCircle className="text-green-500 h-6 w-6" />
            ) : formData.estadoGeneral === 'Lesionado' ? (
              <AlertTriangle className="text-yellow-500 h-6 w-6" />
            ) : formData.estadoGeneral === 'Enfermo' ? (
              <AlertTriangle className="text-red-500 h-6 w-6" />
            ) : (
              <AlertTriangle className="text-gray-300 h-6 w-6" />
            )}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Temperatura</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-gray-800">{formData.temperatura ? `${formData.temperatura}°C` : 'No registrada'}</p>
            <Thermometer className="text-blue-500 h-6 w-6" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Fecha de revisión</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-gray-800">{formData.fecha || format(new Date(), 'yyyy-MM-dd')}</p>
            <Clock className="text-purple-500 h-6 w-6" />
          </div>
        </div>
      </div>
      
      {/* Información del Responsable */}
      <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-emerald-500">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-700">Información del Responsable</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <input
              type="text"
              name="responsable"
              value={formData.responsable}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caballeriza</label>
            <input
              type="text"
              name="caballeriza"
              value={formData.caballeriza}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Información del Caballo */}
      <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-emerald-500">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-700">Información del Caballo</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial</label>
            <input
              type="text"
              name="serial"
              value={formData.serial}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado general del caballo</label>
            <select
              name="estadoGeneral"
              value={formData.estadoGeneral}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Seleccione</option>
              <option value="Saludable">Saludable</option>
              <option value="Lesionado">Lesionado</option>
              <option value="Enfermo">Enfermo</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Signos Vitales */}
      <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-emerald-500">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-700">Signos Vitales</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
            <input
              type="text"
              name="temperatura"
              value={formData.temperatura}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Respiración (por minuto)</label>
            <input
              type="text"
              name="respiracion"
              value={formData.respiracion}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pulso (por minuto)</label>
            <input
              type="text"
              name="pulso"
              value={formData.pulso}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>
      </div>
      
      {/* Observaciones y Tratamientos (condicional) */}
      {(formData.estadoGeneral === 'Lesionado' || formData.estadoGeneral === 'Enfermo') && (
        <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-yellow-500">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-700">Observaciones y Tratamientos</h3>
          </div>
          <div className="p-4 grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones de lesiones o anomalías</label>
              <textarea
                name="observacionesLesiones"
                value={formData.observacionesLesiones}
                onChange={handleFormChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tratamientos administrados</label>
              <textarea
                name="tratamientos"
                value={formData.tratamientos}
                onChange={handleFormChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              ></textarea>
            </div>
          </div>
        </div>
      )}
      
      {/* Información del Equipo */}
      <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-emerald-500">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-700">Información del Equipo</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado del equipo (montura, bridas, sillas, etc.)</label>
            <textarea
              name="estadoEquipo"
              value={formData.estadoEquipo}
              onChange={handleFormChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Hay equipos dañados?</label>
            <select
              name="equiposDanados"
              value={formData.equiposDanados}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Seleccione</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          {formData.equiposDanados === 'Sí' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de los daños</label>
              <textarea
                name="descripcionDanos"
                value={formData.descripcionDanos}
                onChange={handleFormChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              ></textarea>
            </div>
          )}
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Medidas tomadas (reparaciones, cuarentena, atención veterinaria)</label>
            <textarea
              name="medidasTomadas"
              value={formData.medidasTomadas}
              onChange={handleFormChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de la revisión</label>
            <input
              type="text"
              name="responsableRevision"
              value={formData.responsableRevision}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={exportarExcel}
          disabled={exportLoading}
          className={`flex items-center gap-2 ${
            exportLoading ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'
          } text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors shadow-md`}
        >
          {exportLoading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generando Excel...
            </>
          ) : (
            <>
              <FileDown size={20} />
              Listo - Descargar Excel
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SaludC;
