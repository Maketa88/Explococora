import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import CondicionesClimaticas from './CondicionesClimaticas';
import ReportesAccidentes from './ReportesAccidentes';
import SaludCaballos from './SaludCaballos';
import { PaisajeFondo } from '../../../components/UI/PaisajeFondo';

const GestionPlantillas = () => {
  const navigate = useNavigate();
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

  // Lista de plantillas disponibles
  const plantillas = [
    {
      id: 'condicionesClimaticas',
      nombre: 'Condiciones Climáticas',
      descripcion: 'Plantilla para registro y seguimiento de condiciones climáticas',
      componente: <CondicionesClimaticas />
    },
    {
      id: 'reportesAccidentes',
      nombre: 'Reportes de Accidentes',
      descripcion: 'Plantilla para registro de accidentes y medidas correctivas',
      componente: <ReportesAccidentes />
    },
    {
      id: 'saludCaballos',
      nombre: 'Salud de Caballos y Equipos',
      descripcion: 'Plantilla para seguimiento de salud equina y estado de equipos',
      componente: <SaludCaballos />
    },
    // Aquí puedes agregar más plantillas a medida que las vayas creando
    // Por ejemplo:
    // {
    //   id: 'registroEquipos',
    //   nombre: 'Registro de Equipos',
    //   descripcion: 'Plantilla para inventario y seguimiento de equipos',
    //   componente: <RegistroEquipos />
    // },
  ];

  // Función para seleccionar una plantilla
  const seleccionarPlantilla = (id) => {
    setPlantillaSeleccionada(id);
  };

  // Función para volver a la lista de plantillas
  const volverALista = () => {
    setPlantillaSeleccionada(null);
  };

  return (
    <DashboardLayoutAdmin>
      <PaisajeFondo />
      <div className="w-full max-w-[1600px] mx-auto px-4 py-6">
        {!plantillaSeleccionada ? (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Gestión de Plantillas</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plantillas.map((plantilla) => (
                <div key={plantilla.id} className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{plantilla.nombre}</h3>
                    <p className="text-gray-600">{plantilla.descripcion}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button 
                      onClick={() => seleccionarPlantilla(plantilla.id)}
                      className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                    >
                      Abrir Plantilla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mb-6">
            <button 
              onClick={volverALista} 
              className="flex items-center gap-1 mb-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-800 text-white rounded-md transition-colors"
            >
              <ChevronLeft size={18} />
              Volver a la lista de plantillas
            </button>
            
            <div>
              {plantillas.find(p => p.id === plantillaSeleccionada)?.componente}
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutAdmin>
  );
};

export default GestionPlantillas;
