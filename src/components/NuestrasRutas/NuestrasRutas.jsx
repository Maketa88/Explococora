import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const NuestrasRutas = () => {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    dificultad: '',
    duracion: '',
    estado: '',
    tipo: ''
  });

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/rutas');
        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          setRutas(response.data);
          setRutasFiltradas(response.data);
        } else {
          throw new Error("La respuesta no es un array");
        }
      } catch (error) {
        console.error("Error al obtener las rutas:", error);
        setError(error.message);
      }
    };

    fetchRutas();
  }, []);

  const aplicarFiltros = () => {
    let resultado = [...rutas];
    
    if (filtros.dificultad) {
      resultado = resultado.filter(ruta => ruta.dificultad === filtros.dificultad);
    }
    
    if (filtros.estado) {
      resultado = resultado.filter(ruta => ruta.estado === filtros.estado);
    }
    
    if (filtros.tipo) {
      resultado = resultado.filter(ruta => ruta.tipo === filtros.tipo);
    }
    
    if (filtros.duracion) {
      switch(filtros.duracion) {
        case 'corta':
          resultado = resultado.filter(ruta => 
            ruta.duracion.includes('minuto') || 
            (parseInt(ruta.duracion) < 1 && ruta.duracion.includes('hora'))
          );
          break;
        case 'media':
          resultado = resultado.filter(ruta => {
            const horas = parseInt(ruta.duracion);
            return horas >= 1 && horas <= 3 && ruta.duracion.includes('hora');
          });
          break;
        case 'larga':
          resultado = resultado.filter(ruta => {
            const horas = parseInt(ruta.duracion);
            return horas > 3 && ruta.duracion.includes('hora');
          });
          break;
        default:
          break;
      }
    }
    
    setRutasFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({
      dificultad: '',
      duracion: '',
      estado: '',
      tipo: ''
    });
    setRutasFiltradas(rutas);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-600">
        {t('tituloRutas')}
      </h1>
      
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          {mostrarFiltros ? t('ocultarFiltros') : t('mostrarFiltros')}
        </button>
      </div>
      
      {mostrarFiltros && (
        <div className="bg-green-100 p-4 rounded-lg mb-8 shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-3">{t('filtrarRutas')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-green-700 mb-1">{t('dificultad')}</label>
              <select
                value={filtros.dificultad}
                onChange={(e) => setFiltros({...filtros, dificultad: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todas')}</option>
                <option value="Facil">{t('facil')}</option>
                <option value="Moderada">{t('moderada')}</option>
                <option value="Desafiante">{t('desafiante')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-green-700 mb-1">{t('duracion')}</label>
              <select
                value={filtros.duracion}
                onChange={(e) => setFiltros({...filtros, duracion: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todas')}</option>
                <option value="corta">{t('corta')}</option>
                <option value="media">{t('media')}</option>
                <option value="larga">{t('larga')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-green-700 mb-1">{t('estado')}</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todos')}</option>
                <option value="Activa">{t('activa')}</option>
                <option value="Inactiva">{t('inactiva')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-green-700 mb-1">{t('tipo')}</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                className="w-full p-2 rounded border border-green-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="">{t('todos')}</option>
                <option value="Cabalgata">{t('cabalgata')}</option>
                <option value="Caminata">{t('caminata')}</option>
                <option value="Cabalgata y Caminata">{t('cabalgataYCaminata')}</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={limpiarFiltros}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              {t('limpiar')}
            </button>
            <button
              onClick={aplicarFiltros}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {t('aplicarFiltros')}
            </button>
          </div>
        </div>
      )}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {Array.isArray(rutasFiltradas) && rutasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rutasFiltradas.map((ruta) => (
            <div key={`${ruta.id}-${ruta.nombreRuta}`} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-green-500">{ruta.nombreRuta}</h2>
              <p className="text-gray-600 mb-2"><span className="font-medium">{t('duracion')}:</span> {ruta.duracion} horas</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">{t('descripcion')}:</span> {ruta.descripcion}</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">{t('dificultad')}:</span> {ruta.dificultad}</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">{t('capacidadMaxima')}:</span> {ruta.capacidadMaxima}</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">{t('distancia')}:</span> {ruta.distancia} km</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">{t('tipo')}:</span> {ruta.tipo}</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">{t('estado')}:</span> {ruta.estado}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">{t('noRutasDisponibles')}</p>
      )}
    </div>
  );
}; 

export default NuestrasRutas;
