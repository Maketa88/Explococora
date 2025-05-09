import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCompass, FaDove, FaHiking } from 'react-icons/fa';
import { GiHorseHead, GiMountainClimbing, GiPalmTree, GiPathDistance } from 'react-icons/gi';
import { IoTrailSignSharp } from 'react-icons/io5';
import { RiTimerFlashFill } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import { BotonPagoRuta } from '../PagoRuta';
import NuestrasRutasTarjeta from './NuestrasRutasTarjeta';
import { Paisaje } from './Paisaje';


export const NuestrasRutas = () => {
  const { t } = useTranslation();
  const { idRuta } = useParams();
  const [rutas, setRutas] = useState([]);
  const [rutaActual, setRutaActual] = useState(null);
  const [fotosRutaActual, setFotosRutaActual] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [desplazando, setDesplazando] = useState(false);
  const carouselRef = useRef(null);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRutas = async () => {
      try {
        const response = await axios.get('https://servicio-explococora.onrender.com/rutas');
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
      const response = await axios.get(`https://servicio-explococora.onrender.com/rutas/fotos-publicas/${id}`);
      if (response.data?.fotos?.[0]) {
        const fotos = response.data.fotos[0]
          .filter(item => item?.foto)
          .map(item => item.foto);
        setFotosRutaActual(fotos);
        // Resetear la posición del scroll cuando cambian las fotos
        if (carouselRef.current) {
          carouselRef.current.scrollLeft = 0;
        }
      }
    } catch (error) {
      console.error('Error al obtener fotos:', error);
    }
  };

  

  const desplazarCarousel = (direccion) => {
    if (desplazando || !carouselRef.current) return;
    
    setDesplazando(true);
    
    const carousel = carouselRef.current;
    const scrollAmount = carousel.clientWidth * 0.5; // 30% del ancho visible (reducido del 70% original)
    const newScrollLeft = direccion === 'derecha' 
      ? carousel.scrollLeft + scrollAmount 
      : carousel.scrollLeft - scrollAmount;
    
    carousel.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
    
    setTimeout(() => setDesplazando(false), 500);
  };

  // Función para manejar la selección de ruta desde las tarjetas
  const handleRutaSeleccionada = (ruta) => {
    setRutaActual(ruta);
    obtenerFotosRuta(ruta.idRuta);
    // Desplazar la página hacia los detalles de la ruta
    window.scrollTo({
      top: document.querySelector('.container').offsetTop,
      behavior: 'smooth'
    });
  };

  // Funciones para el lightbox
  const handleLightbox = (index) => {
    setImagenActual(index);
    setLightboxAbierto(true);
  };

  const navigateLightbox = (direccion) => {
    if (direccion === 'siguiente') {
      setImagenActual((prev) => (prev === fotosRutaActual.length - 1 ? 0 : prev + 1));
    } else {
      setImagenActual((prev) => (prev === 0 ? fotosRutaActual.length - 1 : prev - 1));
    }
  };

  const cerrarLightbox = () => {
    setLightboxAbierto(false);
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

  // Renderizado del slider
  const renderSlider = () => {
    return (
      <div className="max-w-[1360px] mx-auto relative mb-8">
        {/* Áreas clickeables para navegar */}
        <div 
          className="absolute left-0 top-0 w-16 h-full z-10 cursor-pointer hover:bg-gradient-to-r from-black/20 to-transparent transition-all duration-300"
          onClick={() => desplazarCarousel('izquierda')}
        ></div>
        <div 
          className="absolute right-0 top-0 w-16 h-full z-10 cursor-pointer hover:bg-gradient-to-l from-black/20 to-transparent transition-all duration-300"
          onClick={() => desplazarCarousel('derecha')}
        ></div>
        
        {/* Contenedor del carousel */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto h-96 rounded-lg shadow-lg scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {fotosRutaActual.map((foto, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-1/2 p-1 relative"
            >
              <div 
                className="w-full h-full relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handleLightbox(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <img
                  src={foto}
                  alt={`Foto ${index + 1} de ${rutaActual.nombreRuta}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 text-white p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
                  <p className="text-sm font-medium">{rutaActual.nombreRuta} • Foto {index + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Botones de navegación fotos */}
        <button
          onClick={() => desplazarCarousel('izquierda')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group z-20"
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
          onClick={() => desplazarCarousel('derecha')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:scale-110 group z-20"
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
      </div>
    );
  };

  return (
    <>
    <section className="relative mb-10 overflow-hidden">
        {/* Fondo decorativo inspirado en el Valle del Cocora */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

          {/* Siluetas de palmeras de cera */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg
              viewBox="0 0 1200 600"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Silueta de montaña con árboles */}
              <path
                d="M0,600 L300,200 L400,300 L500,150 L600,250 L800,100 L1000,300 L1200,200 L1200,600 Z"
                fill="#047857"
                opacity="0.3"
              />
              
              {/* Arroyo serpenteante */}
              <path
                d="M0,450 C100,430 150,470 250,440 C350,410 400,450 500,430 C600,410 650,450 750,430 C850,410 900,450 1000,430 C1100,410 1150,450 1200,430 L1200,500 C1100,520 1050,480 950,500 C850,520 800,480 700,500 C600,520 550,480 450,500 C350,520 300,480 200,500 C100,520 50,480 0,500 Z"
                fill="#047857"
                opacity="0.4"
              />
              
              {/* Silueta de árbol 1 - pino */}
              <path
                d="M200,600 L200,400 L150,400 L200,350 L170,350 L220,300 L190,300 L240,250 L210,250 L250,200 L230,200 L270,150 L250,150 L280,100 L310,150 L290,150 L330,200 L310,200 L350,250 L320,250 L370,300 L340,300 L390,350 L360,350 L410,400 L360,400 L360,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Silueta de árbol 2 - frondoso */}
              <path
                d="M600,600 L600,350 C600,350 550,300 570,250 C590,200 630,220 650,180 C670,140 700,160 720,130 C740,100 780,120 800,150 C820,180 850,160 870,200 C890,240 930,220 950,270 C970,320 920,350 920,350 L920,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Silueta de árbol 3 - roble */}
              <path
                d="M1000,600 L1000,400 C1000,400 950,380 960,340 C970,300 1000,320 1010,280 C1020,240 1050,260 1060,220 C1070,180 1100,200 1110,240 C1120,280 1150,260 1160,300 C1170,340 1200,320 1200,360 C1200,400 1150,400 1150,400 L1150,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Flores en el campo - grupo 1 */}
              <g opacity="0.6">
                <circle cx="150" cy="500" r="15" fill="#047857" />
                <circle cx="170" cy="485" r="15" fill="#047857" />
                <circle cx="190" cy="500" r="15" fill="#047857" />
                <circle cx="170" cy="515" r="15" fill="#047857" />
                <circle cx="170" cy="500" r="10" fill="#047857" />
              </g>
              
              {/* Flores en el campo - grupo 2 */}
              <g opacity="0.6">
                <circle cx="450" cy="520" r="15" fill="#047857" />
                <circle cx="470" cy="505" r="15" fill="#047857" />
                <circle cx="490" cy="520" r="15" fill="#047857" />
                <circle cx="470" cy="535" r="15" fill="#047857" />
                <circle cx="470" cy="520" r="10" fill="#047857" />
              </g>
              
              {/* Flores en el campo - grupo 3 */}
              <g opacity="0.6">
                <circle cx="750" cy="500" r="15" fill="#047857" />
                <circle cx="770" cy="485" r="15" fill="#047857" />
                <circle cx="790" cy="500" r="15" fill="#047857" />
                <circle cx="770" cy="515" r="15" fill="#047857" />
                <circle cx="770" cy="500" r="10" fill="#047857" />
              </g>
              
              {/* Mariposas */}
              <g opacity="0.7">
                {/* Mariposa 1 */}
                <path
                  d="M300,200 C320,180 340,190 330,210 C340,230 320,240 300,220 C280,240 260,230 270,210 C260,190 280,180 300,200 Z"
                  fill="#047857"
                />
                {/* Mariposa 2 */}
                <path
                  d="M700,150 C720,130 740,140 730,160 C740,180 720,190 700,170 C680,190 660,180 670,160 C660,140 680,130 700,150 Z"
                  fill="#047857"
                />
                {/* Mariposa 3 */}
                <path
                  d="M900,250 C920,230 940,240 930,260 C940,280 920,290 900,270 C880,290 860,280 870,260 C860,240 880,230 900,250 Z"
                  fill="#047857"
                />
              </g>
            </svg>
          </div>
        </div>
   
          <NuestrasRutasTarjeta 
            onRutaSeleccionada={handleRutaSeleccionada}
            rutaActualId={rutaActual?.idRuta}
          />
          
          {/* Subtítulo o decoración */}
         
          {/* Líneas decorativas bajo el título */}
          
      
    <div className="container mx-auto px-4">
    <div className="mt-2 text-xs font-medium uppercase tracking-widest text-teal-600 group relative text-center p-4">
            <span className="inline-block mx-2">✦</span>
            <span className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-700 font-semibold text-2xl">
                {rutaActual.nombreRuta}
              </span>
              
            </span>
            <span className="inline-block mx-2">✦</span>
          </div>
          
      {/* Botones de navegación entre rutas */}
      

      {/* Slider de Fotos */}
      {renderSlider()}
      

      {/* Información de la Ruta - Estilo Guía de Senderismo */}
      <div className="relative">
        {/* Textura sutil de fondo */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20"></div>
        
        {/* Guía de Senderismo */}
        <div className="max-w-[1360px] mx-auto">
          {/* Título estilo mapa de aventura con color teal */}
          

          {/* Sendero ilustrativo con estilo más natural */}
          <div className="relative overflow-hidden mb-8 border-4 border-teal-800/20 rounded-lg shadow-xl">
            <Paisaje />
          </div>
          
          {/* Sección principal con fondo de silueta */}
          
            
            {/* Contenido principal */}
            <div>
              {/* Descripción estilo notas de explorador */}
              <div className="mb-8 mx-0">
                <div className="relative pl-4 py-2">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-1 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <p className="text-gray-900 text-lg font-medium">{rutaActual.descripcion}</p>
                  <p className="mt-2 text-gray-700 text-base font-normal">
                    &ldquo;La ruta {rutaActual.nombreRuta} ofrece un recorrido que te permitirá conectar con la naturaleza mientras disfrutas 
                    de impresionantes vistas panorámicas del valle. El camino serpentea entre la vegetación nativa, revelando 
                    la diversidad ecológica de nuestro paisaje.&rdquo;
                  </p>
                </div>
              </div>
              
              {/* Detalles de la ruta en estilo guía de senderismo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-0 mb-6">
                {/* Columna izquierda */}
                <div>
                  {/* Panel con estilo ultra premium de tarjetas con tema teal */}
                  <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 h-full flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                    {/* Patrones decorativos elegantes */}
                    <div className="absolute -top-12 -right-12 w-56 h-56 opacity-[0.03] rotate-12">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" stroke="#0d9488" strokeWidth="0.6" />
                        <circle cx="50" cy="50" r="30" stroke="#0d9488" strokeWidth="0.6" />
                        <circle cx="50" cy="50" r="20" stroke="#0d9488" strokeWidth="0.6" />
                        <path d="M50 10V90M10 50H90M26 26L74 74M26 74L74 26" stroke="#0d9488" strokeWidth="0.4" />
                      </svg>
                    </div>
                    
                    {/* Título con estilo exquisito pero más compacto */}
                    <div className="relative mb-4">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                      <h2 className="pl-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                        Detalles de la Expedición
                      </h2>
                     
                    </div>
                    
                    {/* Tarjetas de información con efectos elegantes pero más compactas */}
                    <div className="flex-grow grid grid-cols-1 gap-3">
                      {/* Duración - tarjeta elegante */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                                {/* Icono mejorado de duración */}
                                <RiTimerFlashFill className="w-5 h-5 text-teal-700" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <span className="text-teal-600 text-xs font-medium block leading-tight">Duración</span>
                              <span className="text-gray-800 text-base tracking-wide block group-hover:text-teal-800 transition-colors duration-500">{rutaActual.duracion}</span>
                            </div>
                          </div>
                          <div className="text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 group-hover:w-2/3 transition-all duration-700"></div>
                      </div>
                      
                      {/* Dificultad - tarjeta elegante */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                                {/* Icono mejorado de dificultad */}
                                <GiMountainClimbing className="w-6 h-6 text-teal-700" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <span className="text-teal-600 text-xs font-medium block leading-tight">Dificultad</span>
                              <span className="text-gray-800 text-base tracking-wide block group-hover:text-teal-800 transition-colors duration-500">{rutaActual.dificultad}</span>
                            </div>
                          </div>
                          <div className="text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 group-hover:w-2/3 transition-all duration-700"></div>
                      </div>
                      
                      {/* Tipo - tarjeta elegante */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                                {/* Icono mejorado de tipo */}
                                <IoTrailSignSharp className="w-5 h-5 text-teal-700" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <span className="text-teal-600 text-xs font-medium block leading-tight">Tipo</span>
                              <span className="text-gray-800 text-base tracking-wide block group-hover:text-teal-800 transition-colors duration-500">{rutaActual.tipo}</span>
                            </div>
                          </div>
                          <div className="text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 group-hover:w-2/3 transition-all duration-700"></div>
                      </div>
                      
                      {/* Distancia - tarjeta elegante */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                                {/* Icono mejorado de distancia */}
                                <GiPathDistance className="w-6 h-6 text-teal-700" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <span className="text-teal-600 text-xs font-medium block leading-tight">Distancia</span>
                              <span className="text-gray-800 text-base tracking-wide block group-hover:text-teal-800 transition-colors duration-500">{rutaActual.distancia} km</span>
                            </div>
                          </div>
                          <div className="text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 group-hover:w-2/3 transition-all duration-700"></div>
                      </div>
                    </div>
                    
                    {/* Separador elegante */}
                    <div className="my-4 w-full h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent opacity-70"></div>
                    
                    {/* Botones con estilo elegante pero más compactos */}
                    <div className="flex flex-col gap-4">
                      {/* Botón de pago/reserva */}
                      <BotonPagoRuta 
                        ruta={rutaActual} 
                        className="w-full py-3 rounded-xl text-white relative overflow-hidden group shadow-md transition-all duration-500"
                      />
                      
                      {/* Estado de la ruta */}
                      <div className="flex gap-4">
                        <button 
                          className={`flex-1 py-3 rounded-xl transition-all duration-500 relative overflow-hidden group shadow-sm ${
                            rutaActual.estado === 'Activa' 
                              ? 'bg-gradient-to-br from-emerald-50 to-green-50 text-green-700 border border-green-100 hover:border-green-200' 
                              : 'bg-gradient-to-br from-rose-50 to-red-50 text-red-700 border border-red-100 hover:border-red-200'
                          }`}
                        >
                          <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <div className={`absolute -inset-[100%] ${
                              rutaActual.estado === 'Activa' 
                                ? 'bg-gradient-to-tr from-green-500/5 to-emerald-500/10' 
                                : 'bg-gradient-to-tr from-red-500/5 to-rose-500/10'
                            } animate-[gradient_8s_ease_infinite] blur-xl opacity-30`}></div>
                          </div>
                          <div className="relative z-10 flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full mr-2 shadow-sm ${
                              rutaActual.estado === 'Activa' 
                                ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                                : 'bg-gradient-to-br from-rose-400 to-red-500'
                            }`}></div>
                            <span className="font-medium tracking-wide text-sm">{rutaActual.estado}</span>
                          </div>
                        </button>
                        
                        {/* Precio */}
                        <button className="flex-1 py-3 rounded-xl text-gray-700 relative overflow-hidden group shadow-sm transition-all duration-500 bg-white border border-teal-200 hover:bg-teal-50">
                          <span className="relative z-10 font-medium tracking-wide flex items-center justify-center transition-colors duration-500 text-sm">
                            <svg className="w-4 h-4 mr-1.5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            {rutaActual.precio} COP
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Columna derecha */}
                <div>
                  {/* Información añadida creativamente - Vegetación y consejos */}
                  <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 h-full flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                    {/* Patrones decorativos elegantes */}
                    <div className="absolute -top-12 -right-12 w-56 h-56 opacity-[0.03] rotate-12">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" stroke="#0d9488" strokeWidth="0.6" />
                        <circle cx="50" cy="50" r="30" stroke="#0d9488" strokeWidth="0.6" />
                        <circle cx="50" cy="50" r="20" stroke="#0d9488" strokeWidth="0.6" />
                        <path d="M50 10V90M10 50H90M26 26L74 74M26 74L74 26" stroke="#0d9488" strokeWidth="0.4" />
                      </svg>
                    </div>
                    
                    <div className="relative mb-4">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                      <h2 className="pl-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                        Valle del Cocora
                      </h2>
                    </div>
                    
                    <div className="flex-grow space-y-4">
                      {/* Palmas de cera */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-start">
                          <div className="relative">
                            <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                              <GiPalmTree className="text-teal-700 w-6 h-6" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <span className="text-teal-600 text-xs font-medium block leading-tight">Palmas de Cera</span>
                            <span className="text-gray-700 text-sm block">Hogar del árbol nacional de Colombia, la majestuosa Palma de Cera puede alcanzar hasta 60 metros de altura. Estas imponentes palmas crean un paisaje surrealista durante los recorridos.</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Caminatas */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-start">
                          <div className="relative">
                            <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                              <FaHiking className="text-teal-700 w-5 h-5" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <span className="text-teal-600 text-xs font-medium block leading-tight">Caminatas</span>
                            <span className="text-gray-700 text-sm block">Recorre senderos ecológicos de diferentes niveles de dificultad. El circuito principal 5 km cruza ríos con puentes colgantes y te lleva a miradores con vistas panorámicas espectaculares.</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Cabalgatas */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-start">
                          <div className="relative">
                            <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                              <GiHorseHead className="text-teal-700 w-6 h-6" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <span className="text-teal-600 text-xs font-medium block leading-tight">Cabalgatas</span>
                            <span className="text-gray-700 text-sm block">Explora el valle a lomos de caballos criollos dóciles y entrenados. Las cabalgatas duran entre 1 y 3 horas y permiten acceder a zonas que serían difíciles a pie mientras disfrutas del paisaje.</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recomendaciones */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-start">
                          <div className="relative">
                            <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                              <FaCompass className="text-teal-700 w-5 h-5" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <span className="text-teal-600 text-xs font-medium block leading-tight">Consejos Prácticos</span>
                            <span className="text-gray-700 text-sm block">Programa tu visita temprano (antes de las 9 a.m.) para evitar la neblina y lluvias de la tarde. Lleva calzado impermeable, ropa abrigada, y repelente.</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Avistamiento de Aves */}
                      <div className="bg-gradient-to-br from-white to-teal-50/50 p-3 rounded-xl border border-teal-100/80 hover:shadow-md group transition-all duration-300 transform hover:-translate-y-0.5 hover:border-teal-200">
                        <div className="flex items-start">
                          <div className="relative">
                            <div className="absolute inset-0 bg-teal-500/10 rounded-lg blur-md transform group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm group-hover:shadow transition-all duration-500 flex items-center justify-center">
                              <FaDove className="text-teal-700 w-5 h-5" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <span className="text-teal-600 text-xs font-medium block leading-tight">Avistamiento de Aves</span>
                            <span className="text-gray-700 text-sm block">El Valle del Cocora es un paraíso para los amantes de las aves. Con más de 200 especies registradas, podrás observar colibríes, tucanes esmeralda y el majestuoso cóndor andino en su hábitat natural. Lleva binoculares y disfruta de la biodiversidad única de la región.</span>
                          </div>
                        </div>
                      </div>
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
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
    
    {/* Lightbox */}
    {lightboxAbierto && (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <button 
          className="absolute top-4 right-4 text-white text-3xl" 
          onClick={cerrarLightbox}
        >
          ×
        </button>
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300"
          onClick={() => navigateLightbox('anterior')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img 
          src={fotosRutaActual[imagenActual]} 
          alt={`Foto ${imagenActual + 1} de ${rutaActual.nombreRuta}`} 
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-all duration-300"
          onClick={() => navigateLightbox('siguiente')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="absolute bottom-4 text-white text-center w-full">
          <span>{imagenActual + 1} de {fotosRutaActual.length}</span>
        </div>
      </div>
    )}
    </>
  );
};

export default NuestrasRutas;