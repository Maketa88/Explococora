import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const NuestrasRutas = () => {
  const { t } = useTranslation();
  const { idRuta } = useParams();
  const [rutas, setRutas] = useState([]);
  const [rutaActual, setRutaActual] = useState(null);
  const [fotosRutaActual, setFotosRutaActual] = useState([]);
  const [indiceSliderFotos, setIndiceSliderFotos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get('http://localhost:10101/rutas');
        if (Array.isArray(response.data)) {
          setRutas(response.data);
          
          // Determinar la ruta inicial
          const rutaInicial = idRuta 
            ? response.data.find(r => r.idRuta === parseInt(idRuta))
            : response.data[0];
            
          if (rutaInicial) {
            setRutaActual(rutaInicial);
            await obtenerFotosRuta(rutaInicial.idRuta);
          }
        }
        setCargando(false);
      } catch (error) {
        setError(error.message);
        setCargando(false);
      }
    };
    fetchRutas();
  }, [idRuta]);

  const obtenerFotosRuta = async (id) => {
    try {
      const response = await axios.get(`http://localhost:10101/rutas/fotos-publicas/${id}`);
      if (response.data?.fotos?.[0]) {
        const fotos = response.data.fotos[0]
          .filter(item => item?.foto)
          .map(item => item.foto);
        setFotosRutaActual(fotos);
        setIndiceSliderFotos(0);
      }
    } catch (error) {
      console.error('Error al obtener fotos:', error);
    }
  };

  const cambiarRuta = async (direccion) => {
    const indiceActual = rutas.findIndex(r => r.idRuta === rutaActual.idRuta);
    const nuevoIndice = direccion === 'siguiente'
      ? (indiceActual + 1) % rutas.length
      : (indiceActual - 1 + rutas.length) % rutas.length;
    
    setRutaActual(rutas[nuevoIndice]);
    await obtenerFotosRuta(rutas[nuevoIndice].idRuta);
  };

  const cambiarFoto = (direccion) => {
    setIndiceSliderFotos(prevIndice => {
      const nuevoIndice = direccion === 'siguiente'
        ? (prevIndice + 1) % fotosRutaActual.length
        : (prevIndice - 1 + fotosRutaActual.length) % fotosRutaActual.length;
      return nuevoIndice;
    });
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {t('errorCargando', 'Error al cargar las rutas')}: {error}
      </div>
    );
  }

  if (!rutaActual) {
    return (
      <div className="text-center p-4">
        {t('noRutasDisponibles', 'No hay rutas disponibles')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botones de navegación entre rutas */}
      <div className="fixed left-4 right-4 top-[63%] -translate-y-1/2 flex justify-between z-10">
        <button
          onClick={() => cambiarRuta('anterior')}
          className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 transition-all duration-300 shadow-lg hover:scale-110 group"
          aria-label="Ruta anterior"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => cambiarRuta('siguiente')}
          className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 transition-all duration-300 shadow-lg hover:scale-110 group"
          aria-label="Siguiente ruta"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slider de Fotos */}
      <div className="relative mb-8 h-96">
        <div className="flex h-full overflow-hidden rounded-lg">
          {fotosRutaActual.slice(indiceSliderFotos, indiceSliderFotos + 2).map((foto, index) => (
            <div key={index} className="w-1/2 p-1">
              <img
                src={foto}
                alt={`Foto ${index + 1} de ${rutaActual.nombreRuta}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
        
        {/* Botones de navegación fotos */}
        <button
          onClick={() => cambiarFoto('anterior')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => cambiarFoto('siguiente')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Indicadores de fotos */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          {fotosRutaActual.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === indiceSliderFotos 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Información de la Ruta - Estilo Guía de Senderismo */}
      <div className="relative px-4 py-10">
        {/* Textura sutil de fondo */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20"></div>
        
        {/* Guía de Senderismo */}
        <div className="max-w-5xl mx-auto">
          {/* Título estilo mapa de aventura con color teal */}
          <div className="relative text-center mb-8">
            <h1 className="text-5xl font-serif font-bold text-teal-800 tracking-wide drop-shadow-md">
              {rutaActual.nombreRuta}
            </h1>
            <div className="w-56 h-1.5 mx-auto mt-3 bg-teal-600 rounded-full"></div>
            {/* Brújula decorativa en teal */}
            <div className="absolute -right-10 -top-10 w-24 h-24 opacity-20">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-900 fill-current">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15L15 12L12 9L9 12L12 15Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 12H22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Sendero ilustrativo con estilo más natural */}
          <div className="relative overflow-hidden mb-10 border-4 border-teal-800/20 rounded-lg shadow-xl">
            <div className="h-40 md:h-60 bg-[#e8f3f1] flex items-center justify-center overflow-hidden">
              {/* Ilustración de paisaje natural */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 300 150" className="overflow-visible">
                  {/* Cielo con gradiente */}
                  <defs>
                    <linearGradient id="cieloGradiente" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e0f2f1" />
                      <stop offset="100%" stopColor="#b2dfdb" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="300" height="70" fill="url(#cieloGradiente)" />
                  
                  {/* Montañas al fondo */}
                  <path d="M0,70 L40,30 L50,45 L70,25 L100,55 L130,35 L160,60 L190,20 L220,50 L250,25 L300,70" 
                    fill="#115e59" opacity="0.5" />
                  <path d="M0,70 L20,45 L60,55 L100,30 L140,60 L180,40 L210,55 L240,35 L270,50 L300,70" 
                    fill="#0d9488" opacity="0.4" />
                  
                  {/* Lago/Río */}
                  <path d="M0,110 C50,95 70,105 100,90 C130,75 170,85 200,80 C230,75 260,90 300,85 L300,150 L0,150 Z" 
                    fill="#0f766e" opacity="0.3" />
                  
                  {/* Ondas de agua */}
                  <path d="M20,95 Q35,90 50,95 T80,95" stroke="#0d9488" strokeWidth="1" fill="none" />
                  <path d="M100,90 Q115,85 130,90 T160,90" stroke="#0d9488" strokeWidth="1" fill="none" />
                  <path d="M180,85 Q195,80 210,85 T240,85" stroke="#0d9488" strokeWidth="1" fill="none" />
                  <path d="M40,105 Q55,100 70,105 T100,105" stroke="#0d9488" strokeWidth="1" fill="none" />
                  <path d="M150,100 Q165,95 180,100 T210,100" stroke="#0d9488" strokeWidth="1" fill="none" />
                  
                  {/* Terreno y colinas */}
                  <path d="M0,70 C30,65 60,75 90,68 C120,60 150,67 180,70 C210,73 240,65 300,70 L300,150 L0,150 Z" 
                    fill="#2d6a4f" opacity="0.5" />
                  
                  {/* Línea de horizonte con colinas */}
                  <path d="M0,80 C15,75 30,78 45,80 S75,85 90,80 S120,75 150,78 S180,85 210,80 S240,75 270,80 S285,85 300,80" 
                    stroke="none" fill="#115e59" opacity="0.6" />
                  
                  {/* Árboles de diferentes tamaños */}
                  {[...Array(8)].map((_, i) => (
                    <g key={`tree-${i}`} transform={`translate(${25 + i * 35}, ${90 - (i % 3) * 5})`}>
                      {/* Tronco */}
                      <rect x="-1.5" y="0" width="3" height="15" fill="#5f4339" />
                      {/* Copa del árbol */}
                      <path d={`M-12,0 L0,-${10 + (i % 3) * 5} L12,0 Z`} fill="#115e59" />
                      <path d={`M-10,-7 L0,-${17 + (i % 3) * 5} L10,-7 Z`} fill="#0d9488" />
                      <path d={`M-8,-14 L0,-${23 + (i % 3) * 5} L8,-14 Z`} fill="#0f766e" />
                    </g>
                  ))}
                  
                  {/* Arbustos y vegetación */}
                  {[...Array(12)].map((_, i) => (
                    <g key={`bush-${i}`} transform={`translate(${10 + i * 25}, ${110 + (i % 4) * 8})`}>
                      <circle cx="0" cy="0" r={3 + (i % 3)} fill="#0d9488" opacity="0.7" />
                      <circle cx="3" cy="-2" r={2 + (i % 2)} fill="#0f766e" opacity="0.8" />
                      <circle cx="-2" cy="2" r={2.5 + (i % 2)} fill="#115e59" opacity="0.6" />
                    </g>
                  ))}
                  
                  {/* Flores pequeñas dispersas */}
                  {[...Array(15)].map((_, i) => (
                    <g key={`flower-${i}`} transform={`translate(${5 + i * 20 + (i % 5) * 5}, ${120 + (i % 5) * 6})`}>
                      <circle cx="0" cy="0" r="1" fill="#f0f9ff" />
                      <circle cx="0" cy="0" r="0.5" fill="#fbbf24" />
                    </g>
                  ))}
                  
                  {/* Aves volando */}
                  <path d="M50,30 C52,28 54,29 56,30 C58,29 60,28 62,30" stroke="#134e4a" fill="none" strokeWidth="0.7" />
                  <path d="M150,25 C152,23 154,24 156,25 C158,24 160,23 162,25" stroke="#134e4a" fill="none" strokeWidth="0.7" />
                  <path d="M250,35 C252,33 254,34 256,35 C258,34 260,33 262,35" stroke="#134e4a" fill="none" strokeWidth="0.7" />
                  
                  {/* Sol o luna decorativo */}
                  <circle cx="260" cy="25" r="8" fill="#fbbf24" opacity="0.6" />
                  <circle cx="260" cy="25" r="12" stroke="#fbbf24" strokeWidth="0.5" fill="none" opacity="0.3" />
                  
                  {/* Puntos destacados del paisaje */}
                  <g className="punto-cascada">
                    <circle cx="80" cy="100" r="4" fill="#0f766e"/>
                    <text x="65" y="115" fontSize="6" fill="#0f766e" className="font-medium">CASCADA</text>
                  </g>
                  
                  <g className="punto-mirador">
                    <circle cx="190" cy="65" r="4" fill="#0f766e"/>
                    <text x="177" y="80" fontSize="6" fill="#0f766e" className="font-medium">MIRADOR</text>
                  </g>
                  
                  <g className="punto-laguna">
                    <circle cx="250" cy="90" r="4" fill="#0f766e"/>
                    <text x="240" y="105" fontSize="6" fill="#0f766e" className="font-medium">LAGUNA</text>
                  </g>
                </svg>
              </div>
              
              {/* Sello "Aventura Certificada" */}
              <div className="absolute bottom-3 right-3 w-20 h-20 rounded-full border-2 border-teal-700 flex items-center justify-center p-1 rotate-[20deg] opacity-80">
                <div className="w-full h-full rounded-full border border-teal-700 flex items-center justify-center text-center">
                  <div>
                    <p className="text-teal-800 text-[8px] font-bold tracking-tight">AVENTURA<br/>CERTIFICADA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Descripción estilo notas de explorador */}
          <div className="mb-10 mx-4">
            <div className="border-l-4 border-teal-700 pl-4 py-2 italic text-gray-700">
              <p className="text-lg">{rutaActual.descripcion}</p>
              <p className="mt-3 text-sm font-serif text-teal-800">
                &ldquo;La ruta {rutaActual.nombreRuta} ofrece un recorrido que te permitirá conectar con la naturaleza mientras disfrutas 
                de impresionantes vistas panorámicas del valle. El camino serpentea entre la vegetación nativa, revelando 
                la diversidad ecológica de nuestro paisaje.&rdquo;
              </p>
            </div>
          </div>
          
          {/* Detalles de la ruta en estilo guía de senderismo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Columna izquierda */}
            <div>
              {/* Panel con estilo moderno de tarjetas */}
              <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-lg border border-teal-100 h-full flex flex-col shadow-sm">
                {/* Título con estilo moderno */}
                <div className="flex items-center mb-6">
                  <div className="bg-teal-600 w-1.5 h-8 rounded-full mr-3"></div>
                  <h2 className="text-teal-800 text-2xl font-medium">
                    Detalles de la Ruta
                  </h2>
                </div>
                
                {/* Tarjetas de información */}
                <div className="flex-grow grid grid-cols-1 gap-5">
                  {/* Duración - tarjeta */}
                  <div className="bg-white p-4 rounded-lg border border-teal-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-teal-100 p-2 rounded-lg mr-3 group-hover:bg-teal-200 transition-colors">
                          <svg className="w-5 h-5 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="8" />
                            <path d="M12 8v4l3 2" />
                          </svg>
                        </div>
                        <span className="text-teal-700 font-medium">Duración</span>
                      </div>
                      <span className="text-gray-800 text-lg">{rutaActual.duracion}</span>
                    </div>
                  </div>
                  
                  {/* Dificultad - tarjeta */}
                  <div className="bg-white p-4 rounded-lg border border-teal-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-teal-100 p-2 rounded-lg mr-3 group-hover:bg-teal-200 transition-colors">
                          <svg className="w-5 h-5 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 15l4-8 4 8" />
                          </svg>
                        </div>
                        <span className="text-teal-700 font-medium">Dificultad</span>
                      </div>
                      <span className="text-gray-800 text-lg">{rutaActual.dificultad}</span>
                    </div>
                  </div>
                  
                  {/* Tipo - tarjeta */}
                  <div className="bg-white p-4 rounded-lg border border-teal-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-teal-100 p-2 rounded-lg mr-3 group-hover:bg-teal-200 transition-colors">
                          <svg className="w-5 h-5 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9h18M3 15h18" />
                          </svg>
                        </div>
                        <span className="text-teal-700 font-medium">Tipo</span>
                      </div>
                      <span className="text-gray-800 text-lg">{rutaActual.tipo}</span>
                    </div>
                  </div>
                  
                  {/* Distancia - tarjeta */}
                  <div className="bg-white p-4 rounded-lg border border-teal-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-teal-100 p-2 rounded-lg mr-3 group-hover:bg-teal-200 transition-colors">
                          <svg className="w-5 h-5 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" />
                            <path d="M3 12l2-2m-2 2l2 2" />
                            <path d="M21 12l-2-2m2 2l-2 2" />
                          </svg>
                        </div>
                        <span className="text-teal-700 font-medium">Distancia</span>
                      </div>
                      <span className="text-gray-800 text-lg">{rutaActual.distancia} km</span>
                    </div>
                  </div>
                </div>
                
                {/* Botones con estilo moderno */}
                <div className="mt-6 flex gap-4">
                  <button 
                    className={`flex-1 py-3 rounded-lg border transition-all ${
                      rutaActual.estado === 'Activa' 
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        rutaActual.estado === 'Activa' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">{rutaActual.estado}</span>
                    </div>
                  </button>
                  
                  <button className="flex-1 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                    <span className="font-medium">${rutaActual.precio}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Columna derecha */}
            <div>
              {/* Información añadida creativamente - Vegetación y consejos */}
              <div className="bg-teal-50 p-6 rounded-lg border border-teal-200 shadow-md h-full">
                <h2 className="font-serif text-teal-800 text-2xl mb-4 underline underline-offset-4 decoration-wavy decoration-teal-300">
                  Maravillas Naturales
                </h2>
                
                <div className="space-y-4">
                  {/* Flora y fauna */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-2">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="text-teal-700">
                        <path d="M12 8C12 8 10 4 6 4C2 4 2 8 2 8C2 11 3 14 6 16L12 22L18 16C21 14 22 11 22 8C22 8 22 4 18 4C14 4 12 8 12 8Z" 
                          fill="none" stroke="currentColor" strokeWidth="1"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-teal-800 text-sm font-medium">Flora y Fauna</p>
                      <p className="text-gray-700 text-sm">Bromelias, helechos nativos, mariposas multicolores, y si tienes suerte, podrás avistar el esquivo pájaro carpintero.</p>
                    </div>
                  </div>
                  
                  {/* Mejor temporada */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-2">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="text-teal-700">
                        <path d="M12 3V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <path d="M21 12H19" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <path d="M5 12H3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <path d="M12 21V19" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-teal-800 text-sm font-medium">Mejor Temporada</p>
                      <p className="text-gray-700 text-sm">De diciembre a mayo, cuando el clima es más estable y los colores del valle son más vibrantes.</p>
                    </div>
                  </div>
                  
                  {/* Consejos del guía */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-2">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="text-teal-700">
                        <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12Z" 
                          fill="none" stroke="currentColor" strokeWidth="1"/>
                        <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-teal-800 text-sm font-medium">Consejos del Guía</p>
                      <p className="text-gray-700 text-sm">Lleva calzado cómodo, protector solar y una cámara para capturar los impresionantes paisajes. El amanecer ofrece la mejor luz para fotografías.</p>
                    </div>
                  </div>
                  
                  {/* Historia local */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-2">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="text-teal-700">
                        <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" 
                          fill="none" stroke="currentColor" strokeWidth="1"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-teal-800 text-sm font-medium">Historia Local</p>
                      <p className="text-gray-700 text-sm">Este valle fue el hogar ancestral de comunidades indígenas que consideraban la montaña como un guardián sagrado de la región.</p>
                    </div>
                  </div>
                </div>
                
                {/* Pequeño mapa de ubicación con estilo teal */}
                <div className="mt-4 w-full h-24 bg-teal-50 rounded-lg relative overflow-hidden border border-teal-100">
                  {/* Simulación de mapa */}
                  <div className="absolute inset-0 opacity-40">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M10,10 L30,15 L50,5 L70,20 L90,15" stroke="#0D9488" fill="none" strokeWidth="0.5"/>
                      <path d="M20,25 L40,20 L60,30 L80,25" stroke="#0D9488" fill="none" strokeWidth="0.5"/>
                      <path d="M15,35 L35,40 L55,30 L75,40" stroke="#0D9488" fill="none" strokeWidth="0.5"/>
                      <circle cx="40" cy="25" r="2" fill="#0D9488" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-teal-800 text-sm font-serif italic">Coordenadas: 3°15&apos;24&rdquo;N 76°32&apos;16&rdquo;O</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer con logo teal */}
          <div className="bg-teal-800 text-white p-4 rounded-lg shadow-md relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="h-full w-full">
                <path d="M0,0 L200,0 L200,100 L0,100 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M0,50 Q50,30 100,50 T200,50" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,60 Q50,40 100,60 T200,60" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,70 Q50,50 100,70 T200,70" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,80 Q50,60 100,80 T200,80" stroke="white" fill="none" strokeWidth="1"/>
                <path d="M0,90 Q50,70 100,90 T200,90" stroke="white" fill="none" strokeWidth="1"/>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="font-serif text-white text-lg">
                  &ldquo;Descubre la belleza natural de {rutaActual.nombreRuta} y vive una experiencia inolvidable&rdquo;
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <span className="font-serif italic mr-3">Equipo de Exploradores</span>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14L12 10L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuestrasRutas;