import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { FileDown, Plus, X } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

const CondicionesClimaticas = () => {
  // Estado para los datos del formulario principal
  const [formData, setFormData] = useState({
    observacionesArea: '',
    responsable: '',
    cargo: '',
    caballeriza: '',
    areaVerificada: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    observacionesAreaVerificada: '',
  });

  // Estado para indicar que se está exportando
  const [exportLoading, setExportLoading] = useState(false);

  // Estado para los registros climáticos (tabla)
  const [registrosClimaticos, setRegistrosClimaticos] = useState([
    {
      id: 1,
      fuenteInformacion: '',
      numeroRegistro: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm'),
      temperatura: '',
      visibilidad: '',
      probabilidadLluvia: '',
      humedadRelativa: '',
      precipitaciones: '',
      viento: '',
    },
  ]);

  // Manejador para cambios en el formulario principal
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejador para cambios en los registros climáticos
  const handleRegistroChange = (e, index) => {
    const { name, value } = e.target;
    const newRegistros = [...registrosClimaticos];
    newRegistros[index] = {
      ...newRegistros[index],
      [name]: value,
    };
    setRegistrosClimaticos(newRegistros);
  };

  // Agregar una nueva fila de registro climático
  const agregarRegistro = () => {
    setRegistrosClimaticos([
      ...registrosClimaticos,
      {
        id: registrosClimaticos.length + 1,
        fuenteInformacion: '',
        numeroRegistro: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        hora: format(new Date(), 'HH:mm'),
        temperatura: '',
        visibilidad: '',
        probabilidadLluvia: '',
        humedadRelativa: '',
        precipitaciones: '',
        viento: '',
      },
    ]);
  };

  // Eliminar una fila de registro climático
  const eliminarRegistro = (id) => {
    if (registrosClimaticos.length > 1) {
      setRegistrosClimaticos(registrosClimaticos.filter(registro => registro.id !== id));
    }
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
      
      // Crear hoja de información general
      const sheetGeneral = workbook.addWorksheet('Información General');
      
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
        font: { bold: true, size: 12, color: { argb: '006400' } },
        alignment: { horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6FFE6' } },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const headerCellStyle = {
        font: { bold: true },
        alignment: { vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const dataCellStyle = {
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      // Título principal en hoja general
      const titleRow = sheetGeneral.addRow(['REGISTRO DE CONDICIONES CLIMÁTICAS']);
      titleRow.height = 30;
      titleRow.getCell(1).style = titleStyle;
      sheetGeneral.mergeCells('A1:B1');
      
      // Sección de información del responsable
      const respHeaderRow = sheetGeneral.addRow(['Información del Responsable', '']);
      respHeaderRow.getCell(1).style = sectionHeaderStyle;
      respHeaderRow.getCell(2).style = sectionHeaderStyle;
      sheetGeneral.mergeCells(`A${respHeaderRow.number}:B${respHeaderRow.number}`);
      
      const responsableData = [
        ['Responsable', formData.responsable],
        ['Cargo', formData.cargo],
        ['Caballeriza', formData.caballeriza]
      ];
      
      responsableData.forEach(row => {
        const excelRow = sheetGeneral.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Sección de área verificada
      const areaHeaderRow = sheetGeneral.addRow(['Información del Área Verificada', '']);
      areaHeaderRow.getCell(1).style = sectionHeaderStyle;
      areaHeaderRow.getCell(2).style = sectionHeaderStyle;
      sheetGeneral.mergeCells(`A${areaHeaderRow.number}:B${areaHeaderRow.number}`);
      
      const areaData = [
        ['Área verificada', formData.areaVerificada],
        ['Fecha', formData.fecha],
        ['Hora', formData.hora]
      ];
      
      areaData.forEach(row => {
        const excelRow = sheetGeneral.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Sección de observaciones
      const obsHeaderRow = sheetGeneral.addRow(['Observaciones', '']);
      obsHeaderRow.getCell(1).style = sectionHeaderStyle;
      obsHeaderRow.getCell(2).style = sectionHeaderStyle;
      sheetGeneral.mergeCells(`A${obsHeaderRow.number}:B${obsHeaderRow.number}`);
      
      const obsData = [
        ['Observaciones del área explorada', formData.observacionesArea],
        ['Observaciones del área verificada', formData.observacionesAreaVerificada]
      ];
      
      obsData.forEach(row => {
        const excelRow = sheetGeneral.addRow(row);
        excelRow.getCell(1).style = headerCellStyle;
        excelRow.getCell(2).style = dataCellStyle;
      });
      
      // Ajustar ancho de columnas en hoja general
      sheetGeneral.getColumn('A').width = 40;
      sheetGeneral.getColumn('B').width = 50;
      
      // Footer en hoja general (fila 13)
      const footerRowGeneral = sheetGeneral.getRow(13);
      footerRowGeneral.getCell(1).value = 'Reporte generado por Sistema Explococora - ' + format(new Date(), 'dd/MM/yyyy HH:mm');
      footerRowGeneral.getCell(1).style = {
        font: { italic: true, color: { argb: '6B7280' } },
        alignment: { horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      sheetGeneral.mergeCells('A13:B13');
      
      // Crear hoja de registros climáticos
      const sheetRegistros = workbook.addWorksheet('Registros Climáticos');
      
      // Título principal en hoja de registros
      const titleRowReg = sheetRegistros.addRow(['REGISTRO DE CONDICIONES CLIMÁTICAS']);
      titleRowReg.height = 30;
      titleRowReg.getCell(1).style = titleStyle;
      sheetRegistros.mergeCells('A1:J1');
      
      // Agregar encabezados a la hoja de registros
      const headersRow = sheetRegistros.addRow([
        'Fuente de información', 
        'N° Registro', 
        'Fecha (DD/MM/AA)', 
        'Hora', 
        'Temperatura °C', 
        'Visibilidad', 
        'Probabilidad de lluvia (%)', 
        'Humedad Relativa', 
        'Precipitaciones', 
        'Viento'
      ]);
      
      // Dar formato a los encabezados
      headersRow.eachCell((cell) => {
        cell.style = {
          font: { bold: true, color: { argb: '006400' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6FFE6' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
          }
        };
      });
      
      // Agregar datos a la hoja de registros
      registrosClimaticos.forEach(registro => {
        const row = sheetRegistros.addRow([
          registro.fuenteInformacion,
          registro.numeroRegistro,
          registro.fecha,
          registro.hora,
          registro.temperatura,
          registro.visibilidad,
          registro.probabilidadLluvia,
          registro.humedadRelativa,
          registro.precipitaciones,
          registro.viento
        ]);
        
        // Aplicar estilo a todas las celdas de la fila
        row.eachCell(cell => {
          cell.style = dataCellStyle;
        });
      });
      
      // Ajustar ancho de columnas
      sheetRegistros.columns.forEach(column => {
        column.width = 15;
      });
      
      // Pie de página - ubicado exactamente en la fila 4
      const footerRowRegistros = sheetRegistros.getRow(4);
      footerRowRegistros.getCell(1).value = 'Reporte generado por Sistema Explococora - ' + format(new Date(), 'dd/MM/yyyy HH:mm');
      footerRowRegistros.getCell(1).style = {
        font: { italic: true, color: { argb: '6B7280' } },
        alignment: { horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      sheetRegistros.mergeCells('A4:J4');
      
      // Generar archivo Excel y descargarlo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Nombre de archivo con fecha actual
      const fileName = `Condiciones_Climaticas_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
      saveAs(blob, fileName);
      
      setExportLoading(false);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      setExportLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md border border-emerald-500">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">Registro de Condiciones Climáticas</h2>
      
      {/* Tarjetas de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-emerald-500">
          <h3 className="text-gray-500 font-medium mb-2 text-sm uppercase">Responsable</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-gray-800 truncate">{formData.responsable || 'Sin asignar'}</p>
            <CheckCircle className="text-emerald-500 h-6 w-6" />
          </div>
        </div>
        
        {/* ... other cards ... */}
      </div>
      
      {/* Observaciones del área explorada */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-emerald-500">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Observaciones y restricciones del área explorada</h3>
        </div>
        <div className="p-4">
          <textarea
            rows={3}
            name="observacionesArea"
            value={formData.observacionesArea}
            onChange={handleFormChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Información del Responsable */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-emerald-500">
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
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleFormChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caballeriza</label>
            <input
              type="text"
              name="caballeriza"
              value={formData.caballeriza}
              onChange={handleFormChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Información del Área Verificada */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-emerald-500">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Información del Área Verificada</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área verificada</label>
            <input
              type="text"
              name="areaVerificada"
              value={formData.areaVerificada}
              onChange={handleFormChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleFormChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleFormChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Registro de condiciones climáticas */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-emerald-500">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-emerald-600">Registro de condiciones climáticas</h3>
          <button 
            onClick={agregarRegistro}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus size={16} />
            <span>Agregar registro</span>
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente info.</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Registro</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp. °C</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibilidad</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prob. lluvia</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humedad</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precipitaciones</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viento</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrosClimaticos.map((registro, index) => (
                <tr key={registro.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      name="fuenteInformacion"
                      value={registro.fuenteInformacion}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      name="numeroRegistro"
                      value={registro.numeroRegistro}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      name="fecha"
                      value={registro.fecha}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="time"
                      name="hora"
                      value={registro.hora}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      name="temperatura"
                      value={registro.temperatura}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      name="visibilidad"
                      value={registro.visibilidad}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      name="probabilidadLluvia"
                      value={registro.probabilidadLluvia}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      name="humedadRelativa"
                      value={registro.humedadRelativa}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      name="precipitaciones"
                      value={registro.precipitaciones}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      name="viento"
                      value={registro.viento}
                      onChange={(e) => handleRegistroChange(e, index)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button 
                      onClick={() => eliminarRegistro(registro.id)}
                      disabled={registrosClimaticos.length === 1}
                      className={`p-1.5 rounded-md ${
                        registrosClimaticos.length === 1 
                          ? 'bg-red-200 text-red-400 cursor-not-allowed' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observaciones del área verificada */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-emerald-500">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-emerald-600">Observaciones y restricciones del área verificada</h3>
        </div>
        <div className="p-4">
          <textarea
            rows={3}
            name="observacionesAreaVerificada"
            value={formData.observacionesAreaVerificada}
            onChange={handleFormChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
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

export default CondicionesClimaticas;
