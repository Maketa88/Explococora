import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Avatar from "../../assets/Images/default-guia.png";
const CardGuia = ({ guia }) => {
  // Estado para manejar la carga de la imagen
  const [imagenCargada, setImagenCargada] = useState(false);
  // Estado para manejar errores de carga de imagen
  const [errorImagen, setErrorImagen] = useState(false);
  // Estado para la URL de la imagen optimizada
  const [imagenOptimizada, setImagenOptimizada] = useState('');
  // Estado para controlar la animación de entrada
  const [animacionIniciada, setAnimacionIniciada] = useState(false);
  // Estado para controlar el volteo de la carta
  const [cartaVolteada, setCartaVolteada] = useState(false);
  
  // Efecto para procesar la URL de la imagen cuando cambia guia.foto
  useEffect(() => {
    if (!guia.foto) {
      setImagenOptimizada('');
      return;
    }

    // Si la URL ya tiene parámetros de redimensionamiento, la usamos directamente
    if (guia.foto.includes('width=') || guia.foto.includes('height=')) {
      setImagenOptimizada(guia.foto);
      return;
    }

    try {
      // Verificar si es una URL válida
      const url = new URL(guia.foto);
      
      // Si es una URL de Cloudinary, podemos usar sus parámetros de transformación
      if (url.hostname.includes('cloudinary.com')) {
        // Insertar parámetros de transformación antes de /upload/
        const partes = guia.foto.split('/upload/');
        if (partes.length === 2) {
          // c_scale: redimensiona la imagen sin recortar, preservando todo el contenido
          // w_600: ancho máximo para buena calidad sin excesivo peso
          // q_auto: calidad automática para optimizar
          setImagenOptimizada(`${partes[0]}/upload/c_scale,w_600,q_auto/${partes[1]}`);
          return;
        }
      }
      
      // Para otras URLs, simplemente usamos la original
      setImagenOptimizada(guia.foto);
    } catch {
      // Si no es una URL válida, usamos la original
      console.warn('URL de imagen no válida:', guia.foto);
      setImagenOptimizada(guia.foto);
    }
  }, [guia.foto]);

  // Efecto para iniciar la animación después de que el componente se monte
  useEffect(() => {
    // Pequeño retraso para asegurar que la animación se vea bien
    const timer = setTimeout(() => {
      setAnimacionIniciada(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Obtener nombres y apellidos de forma más eficiente
  const { nombres, apellidos } = (() => {
    // Si tenemos los campos separados, usarlos
    if (guia.primerNombre || guia.segundoNombre || guia.primerApellido) {
      return {
        nombres: `${guia.primerNombre || ''} ${guia.segundoNombre || ''}`.trim(),
        apellidos: guia.primerApellido || ''
      };
    }
    
    // Si tenemos el nombre completo, dividirlo
    if (guia.nombreCompleto) {
      const partes = guia.nombreCompleto.split(' ');
      
      // Si hay al menos 3 partes, asumimos que las dos primeras son nombres
      if (partes.length >= 3) {
        return {
          nombres: `${partes[0]} ${partes[1]}`,
          apellidos: partes.slice(2).join(' ')
        };
      }
      
      // Si hay 2 partes, asumimos que la primera es nombre y la segunda apellido
      if (partes.length === 2) {
        return {
          nombres: partes[0],
          apellidos: partes[1]
        };
      }
      
      // Si solo hay una parte, es el nombre
      return {
        nombres: partes[0] || 'Nombre',
        apellidos: ''
      };
    }
    
    // Fallback
    return {
      nombres: 'Nombre',
      apellidos: ''
    };
  })();

  // Función para manejar errores de carga de imagen
  const handleImageError = () => {
    setErrorImagen(true);
    setImagenCargada(true); // Consideramos que la carga ha terminado aunque sea con error
  };

  // Función para voltear la carta
  const voltearCarta = () => {
    setCartaVolteada(!cartaVolteada);
  };

  // Altura fija para mantener consistencia en las cartas
  const alturaFija = 'min-h-[auto] sm:min-h-[600px]';

  return (
    <div 
      className={`relative w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white flex-grow ${alturaFija} transition-all duration-1000 ease-out card-container ${
        animacionIniciada 
          ? 'opacity-100 transform translate-y-0 rotate-0 scale-100' 
          : 'opacity-0 transform -translate-y-16 rotate-3 scale-95'
      } ${cartaVolteada ? 'ring-4 ring-gradient-to-r from-emerald-400 to-teal-400 ring-opacity-70' : ''}`}
      onClick={voltearCarta}
      style={{ 
        perspective: '1000px', 
        cursor: 'pointer',
        boxShadow: cartaVolteada 
          ? '0 0 15px rgba(5, 150, 105, 0.4), 0 0 30px rgba(5, 150, 105, 0.2)' 
          : ''
      }}
    >
      {/* Contenedor 3D para la animación de volteo */}
      <div 
        className="w-full h-full transition-transform duration-700 ease-in-out relative card-flip-inner"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: cartaVolteada ? 'rotateY(180deg)' : 'rotateY(0deg)',
          height: '100%',
          transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Cara frontal de la carta */}
        <div 
          className="absolute w-full h-full backface-hidden card-front"
          style={{ 
            backfaceVisibility: 'hidden',
            height: '100%'
          }}
        >
          {/* Contenedor de la imagen con fondo - Ahora con altura responsiva */}
          <div 
            className="relative w-full bg-gray-100 flex items-center justify-center pt-2 sm:pt-4 px-2 sm:px-4 card-front-image"
            style={{ height: 'min(35vh, 250px)' }}
          >
            {/* Indicador de carga */}
            {!imagenCargada && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            
            {/* Imagen con object-fit:contain para mostrar la imagen completa */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300">
              <img 
                src={errorImagen ? Avatar : (imagenOptimizada || guia.foto || Avatar)} 
                alt={`Foto de ${nombres}`} 
                className={`w-full h-full object-contain transition-all duration-500 ${!imagenCargada ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImagenCargada(true)}
                onError={handleImageError}
                loading="lazy"
                style={{ maxHeight: 'min(30vh, 230px)' }}
              />
            </div>
          </div>
          
          {/* Contenido - Ahora con altura automática y flex-grow para ocupar espacio disponible */}
          <div className="p-3 sm:p-4 md:p-6 z-20 bg-teal-50 relative shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] flex-grow flex flex-col justify-between card-content">
            {/* Información del guía */}
            <div className="space-y-1 sm:space-y-2 md:space-y-3 text-gray-800">
              <div className="flex items-center mb-2 sm:mb-3">
                {/* Icono para el nombre - Persona/Guía */}
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mr-2 sm:mr-3 md:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-700">Nombres:</span>
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl text-gray-950">
                    {nombres}
                  </h3>
                </div>
              </div>
              
              {apellidos && (
                <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                  {/* Icono para el apellido - Familia */}
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mr-2 sm:mr-3 md:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-black">Apellidos:</span>
                    <h4 className="font-semibold text-sm sm:text-base md:text-lg text-gray-950">
                      {apellidos}
                    </h4>
                  </div>
                </div>
              )}
              
              
            </div>
            
            {/* 5 estrellas al final */}
            <div className="flex items-center justify-center pt-2 sm:pt-3 md:pt-5 relative">
              <div className="relative flex items-center justify-center py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4">
                {/* Estrellas con efecto de rotación y brillo al hover */}
                <div className="flex items-center relative z-10">
                  {[...Array(5)].map((_, index) => (
                    <div 
                      key={index} 
                      className={`transform transition-all duration-300 hover:scale-125 hover:rotate-12 ${index === 0 ? 'hover:rotate-[-12deg]' : ''} ${index === 4 ? 'hover:rotate-12' : ''}`}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-0.5 drop-shadow-lg filter hover:drop-shadow-xl transition-all duration-300" 
                        viewBox="0 0 24 24" 
                        fill="url(#starGradient)"
                        stroke="none"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.7))' }}
                      >
                        <defs>
                          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#FFA500" />
                          </linearGradient>
                        </defs>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cara trasera de la carta (descripción) */}
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-3 sm:p-4 md:p-6 flex flex-col justify-between items-center backface-hidden rounded-xl card-back"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            height: '100%',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-teal-500"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-emerald-400 opacity-30"></div>
            
            {/* Patrón de hojas */}
            <svg className="absolute top-2 left-2 w-16 h-16 text-emerald-700 opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,4c0,0-3-3-9-3s-9,3-9,3s3,3,9,3S21,4,21,4z M12,7c-6,0-9-3-9-3s3-3,9-3s9,3,9,3S18,7,12,7z M3,8c0,0,3,3,9,3 s9-3,9-3s-3-3-9-3S3,8,3,8z M12,5c6,0,9,3,9,3s-3,3-9,3s-9-3-9-3S6,5,12,5z M3,12c0,0,3,3,9,3s9-3,9-3s-3-3-9-3S3,12,3,12z M12,9c6,0,9,3,9,3s-3,3-9,3s-9-3-9-3S6,9,12,9z M3,16c0,0,3,3,9,3s9-3,9-3s-3-3-9-3S3,16,3,16z M12,13c6,0,9,3,9,3s-3,3-9,3 s-9-3-9-3S6,13,12,13z M3,20c0,0,3,3,9,3s9-3,9-3s-3-3-9-3S3,20,3,20z M12,17c6,0,9,3,9,3s-3,3-9,3s-9-3-9-3S6,17,12,17z"/>
            </svg>
            
            <svg className="absolute bottom-2 right-2 w-16 h-16 text-emerald-700 opacity-10 transform rotate-180" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,4c0,0-3-3-9-3s-9,3-9,3s3,3,9,3S21,4,21,4z M12,7c-6,0-9-3-9-3s3-3,9-3s9,3,9,3S18,7,12,7z M3,8c0,0,3,3,9,3 s9-3,9-3s-3-3-9-3S3,8,3,8z M12,5c6,0,9,3,9,3s-3,3-9,3s-9-3-9-3S6,5,12,5z M3,12c0,0,3,3,9,3s9-3,9-3s-3-3-9-3S3,12,3,12z M12,9c6,0,9,3,9,3s-3,3-9,3s-9-3-9-3S6,9,12,9z M3,16c0,0,3,3,9,3s9-3,9-3s-3-3-9-3S3,16,3,16z M12,13c6,0,9,3,9,3s-3,3-9,3 s-9-3-9-3S6,13,12,13z M3,20c0,0,3,3,9,3s9-3,9-3s-3-3-9-3S3,20,3,20z M12,17c6,0,9,3,9,3s-3,3-9,3s-9-3-9-3S6,17,12,17z"/>
            </svg>
          </div>
          
          <div className="w-full h-full flex flex-col relative z-10">
            {/* Encabezado con nombre del guía - Altura fija */}
            <div className="text-center h-16 sm:h-20 flex flex-col justify-center items-center">
              <div className="inline-block relative">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-800 mb-1 sm:mb-2 px-4">{`${nombres} ${apellidos}`}</h2>
              </div>
              <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full mt-1"></div>
            </div>
            
            {/* Contenedor central que ocupa todo el espacio disponible */}
            <div className="flex-grow flex items-center justify-center px-1 sm:px-2 py-2">
              {/* Descripción del guía */}
              <div className="w-full bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-inner relative border border-emerald-100">
                <div className="absolute -top-3.5 left-4 sm:left-6 z-10">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm px-4 py-1 rounded-full font-medium shadow-md border-2 border-white">
                    Sobre mí
                  </div>
                </div>
                
                <div className="mt-2 sm:mt-3">
                  <div className="relative">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed sm:leading-loose font-medium px-1 overflow-y-auto max-h-[30vh]">
                      {guia.descripcion || "Este guía aún no tiene una descripción disponible. ¡Pero seguro tiene mucho que compartir sobre el Valle del Cocora y sus maravillosos paisajes!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pie con botón de volver - Altura fija */}
            <div className="h-16 sm:h-20 flex items-center justify-center">
              <div className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700 text-xs sm:text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Toca para volver</span>
              </div>
            </div>
            
            {/* Decoración inferior */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de que se puede voltear */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full p-1 sm:p-1.5 shadow-lg z-30" style={{ animation: 'pulseIndicator 2s infinite' }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
        </svg>
      </div>
    </div>
  );
};

CardGuia.propTypes = {
  guia: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cedula: PropTypes.string,
    primerNombre: PropTypes.string,
    segundoNombre: PropTypes.string,
    primerApellido: PropTypes.string,
    nombreCompleto: PropTypes.string,
    email: PropTypes.string,
    telefono: PropTypes.string,
    foto: PropTypes.string,
    estado: PropTypes.string,
    descripcion: PropTypes.string,
  }).isRequired,
};

export { CardGuia };

