import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { FileDown, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

const ReportesAccidentes = () => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    responsable: '',
    cargo: '',
    areaAccidente: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    lugarExacto: '',
    tipoAccidente: '',
    personasInvolucradas: '',
    descripcionAccidente: '',
    gravedadAccidente: '',
    atencionMedica: '',
    descripcionAtencionMedica: '',
    danosMateriales: '',
    descripcionDanosMateriales: '',
    testigos: '',
    accionesCorrectivas: '',
    fuenteInformacion: ''
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
      
      // Crear hoja de información del reporte
      const sheet = workbook.addWorksheet('Reporte de Accidente');
      
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
      
      const leveStyle = Object.assign({}, dataCellStyle, {
        font: { color: { argb: '006400' } }, // Verde
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6FFE6' } }
      });
      
      const moderadoStyle = Object.assign({}, dataCellStyle, {
        font: { color: { argb: '854D0E' } }, // Amarillo
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } }
      });
      
      const graveStyle = Object.assign({}, dataCellStyle, {
        font: { color: { argb: 'B91C1C' } }, // Rojo
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }
      });
      
      // Agregar título y fusionar celdas
      sheet.addRow(['REPORTE DE ACCIDENTE', '']);
      sheet.getCell('A1').style = titleStyle;
      sheet.mergeCells('A1:B1');
      
      // Información del responsable
      sheet.addRow(['Información del Responsable', '']);
      sheet.getCell('A2').style = sectionHeaderStyle;
      sheet.getCell('B2').style = sectionHeaderStyle;
      sheet.mergeCells('A2:B2');
      
      const responsableRows = [
        ['Responsable', formData.responsable],
        ['Cargo', formData.cargo],
        ['Área del accidente', formData.areaAccidente],
        ['Fecha', formData.fecha],
        ['Hora', formData.hora]
      ];
      
      responsableRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Información del accidente
      sheet.addRow(['Información del Accidente', '']);
      sheet.getCell('A8').style = sectionHeaderStyle;
      sheet.getCell('B8').style = sectionHeaderStyle;
      sheet.mergeCells('A8:B8');
      
      const accidenteRows = [
        ['Lugar exacto', formData.lugarExacto],
        ['Tipo de accidente', formData.tipoAccidente],
        ['Personas involucradas', formData.personasInvolucradas],
        ['Descripción del accidente', formData.descripcionAccidente]
      ];
      
      accidenteRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Gravedad y atención
      sheet.addRow(['Gravedad y Atención', '']);
      sheet.getCell('A13').style = sectionHeaderStyle;
      sheet.getCell('B13').style = sectionHeaderStyle;
      sheet.mergeCells('A13:B13');
      
      // Aplicar estilo condicional a la gravedad
      const gravedadRow = sheet.addRow(['Gravedad del accidente', formData.gravedadAccidente]);
      gravedadRow.getCell(1).style = headerCellStyle;
      
      // Aplicar estilo según gravedad
      if (formData.gravedadAccidente === 'Leve') {
        gravedadRow.getCell(2).style = leveStyle;
      } else if (formData.gravedadAccidente === 'Moderado') {
        gravedadRow.getCell(2).style = moderadoStyle;
      } else if (formData.gravedadAccidente === 'Grave') {
        gravedadRow.getCell(2).style = graveStyle;
      } else {
        gravedadRow.getCell(2).style = dataCellStyle;
      }
      
      const atencionRows = [
        ['¿Requirió atención médica?', formData.atencionMedica],
        ['Descripción de la atención médica', formData.descripcionAtencionMedica],
        ['¿Hubo daños materiales?', formData.danosMateriales],
        ['Descripción de los daños', formData.descripcionDanosMateriales]
      ];
      
      atencionRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Información adicional
      sheet.addRow(['Información Adicional', '']);
      sheet.getCell('A19').style = sectionHeaderStyle;
      sheet.getCell('B19').style = sectionHeaderStyle;
      sheet.mergeCells('A19:B19');
      
      const adicionalRows = [
        ['Testigos', formData.testigos],
        ['Acciones correctivas tomadas', formData.accionesCorrectivas],
        ['Fuente de información', formData.fuenteInformacion]
      ];
      
      adicionalRows.forEach(row => {
        const excelRow = sheet.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Calcular cuántas filas tenemos hasta ahora
      const currentRowCount = sheet.rowCount;

      // Ajustar filas para asegurar que el footer esté en la fila 23
      if (currentRowCount < 22) {
        // Si hay menos de 22 filas, agregar filas vacías hasta tener 22
        // (así el footer quedará en la 23)
        const rowsToAdd = 22 - currentRowCount;
        for (let i = 0; i < rowsToAdd; i++) {
          sheet.addRow([]);
        }
      } else if (currentRowCount > 22) {
        // Si ya hay más de 22 filas, mostrar advertencia
        console.warn(`Ya hay ${currentRowCount} filas, el footer podría no estar en la fila 23`);
      }

      // Añadir el footer en la fila 23
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
      const fileName = `Reporte_Accidente_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
      saveAs(blob, fileName);
      
      setExportLoading(false);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setExportLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md border border-emerald-500">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">Reporte de Accidentes</h2>
      
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
          formData.gravedadAccidente === 'Leve' ? 'border-green-500' : 
          formData.gravedadAccidente === 'Moderado' ? 'border-yellow-500' : 
          formData.gravedadAccidente === 'Grave' ? 'border-red-500' : 'border-gray-300'
        }`}>
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Gravedad del accidente</h3>
          <div className="flex items-center justify-between">
            <p className={`text-xl font-bold ${
              formData.gravedadAccidente === 'Leve' ? 'text-green-700' : 
              formData.gravedadAccidente === 'Moderado' ? 'text-yellow-700' : 
              formData.gravedadAccidente === 'Grave' ? 'text-red-700' : 'text-gray-400'
            }`}>
              {formData.gravedadAccidente || 'No especificado'}
            </p>
            {formData.gravedadAccidente === 'Leve' ? (
              <CheckCircle className="text-green-500 h-6 w-6" />
            ) : formData.gravedadAccidente === 'Moderado' ? (
              <AlertTriangle className="text-yellow-500 h-6 w-6" />
            ) : formData.gravedadAccidente === 'Grave' ? (
              <AlertTriangle className="text-red-500 h-6 w-6" />
            ) : (
              <AlertTriangle className="text-gray-300 h-6 w-6" />
            )}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Personas involucradas</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-gray-800 truncate">{formData.personasInvolucradas ? 'Registradas' : 'No registradas'}</p>
            <Users className="text-blue-500 h-6 w-6" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Fecha del accidente</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-gray-800">{formData.fecha || format(new Date(), 'yyyy-MM-dd')}</p>
            <Clock className="text-purple-500 h-6 w-6" />
          </div>
        </div>
      </div>
      
      {/* Información del Responsable */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Información del Responsable</h3>
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
        </div>
      </div>
      
      {/* Información del Accidente */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Información del Accidente</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área del accidente</label>
            <input
              type="text"
              name="areaAccidente"
              value={formData.areaAccidente}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar exacto</label>
            <input
              type="text"
              name="lugarExacto"
              value={formData.lugarExacto}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de accidente</label>
            <select
              name="tipoAccidente"
              value={formData.tipoAccidente}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Seleccione el tipo</option>
              <option value="Caída">Caída</option>
              <option value="Golpe">Golpe</option>
              <option value="Corte">Corte</option>
              <option value="Quemadura">Quemadura</option>
              <option value="Fractura">Fractura</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gravedad del accidente</label>
            <select
              name="gravedadAccidente"
              value={formData.gravedadAccidente}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Seleccione la gravedad</option>
              <option value="Leve">Leve</option>
              <option value="Moderado">Moderado</option>
              <option value="Grave">Grave</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Descripción y Personas */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Descripción y Personas</h3>
        </div>
        <div className="p-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personas involucradas</label>
            <textarea
              name="personasInvolucradas"
              value={formData.personasInvolucradas}
              onChange={handleFormChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del accidente</label>
            <textarea
              name="descripcionAccidente"
              value={formData.descripcionAccidente}
              onChange={handleFormChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            ></textarea>
          </div>
        </div>
      </div>
      
      {/* Atención y Daños */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Atención y Daños</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Se recibió atención médica?</label>
            <select
              name="atencionMedica"
              value={formData.atencionMedica}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Seleccione</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          {formData.atencionMedica === 'Sí' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la atención</label>
              <textarea
                name="descripcionAtencionMedica"
                value={formData.descripcionAtencionMedica}
                onChange={handleFormChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              ></textarea>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Hubo daños materiales?</label>
            <select
              name="danosMateriales"
              value={formData.danosMateriales}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Seleccione</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          {formData.danosMateriales === 'Sí' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de los daños</label>
              <textarea
                name="descripcionDanosMateriales"
                value={formData.descripcionDanosMateriales}
                onChange={handleFormChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              ></textarea>
            </div>
          )}
        </div>
      </div>
      
      {/* Información Adicional */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Información Adicional</h3>
        </div>
        <div className="p-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Testigos</label>
            <textarea
              name="testigos"
              value={formData.testigos}
              onChange={handleFormChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acciones correctivas tomadas</label>
            <textarea
              name="accionesCorrectivas"
              value={formData.accionesCorrectivas}
              onChange={handleFormChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuente de información (quién reportó)</label>
            <input
              type="text"
              name="fuenteInformacion"
              value={formData.fuenteInformacion}
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

export default ReportesAccidentes;
