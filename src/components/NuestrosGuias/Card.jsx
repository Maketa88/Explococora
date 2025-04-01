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

  return (
    <div 
      className={`relative w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white flex-grow transition-all duration-1000 ease-out ${
        animacionIniciada 
          ? 'opacity-100 transform translate-y-0 rotate-0 scale-100' 
          : 'opacity-0 transform -translate-y-16 rotate-3 scale-95'
      }`}
      style={{ 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Contenedor principal simplificado */}
      <div className="w-full h-full flex flex-col">
        {/* Contenedor de la imagen con fondo - Altura adaptativa */}
        <div 
          className="relative w-full bg-gray-100 flex items-center justify-center pt-2 sm:pt-4 px-2 sm:px-4"
          style={{ height: 'clamp(150px, 30vw, 250px)' }}
        >
          {/* Indicador de carga */}
          {!imagenCargada && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <svg className="animate-spin h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              style={{ maxHeight: 'clamp(130px, 25vw, 230px)' }}
            />
          </div>
        </div>
        
        {/* Contenido - Altura adaptativa y flex-grow para ocupar espacio disponible */}
        <div className="p-2 xs:p-3 sm:p-4 md:p-6 z-20 bg-teal-50 relative shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] flex-grow flex flex-col justify-between">
          {/* Información del guía */}
          <div className="space-y-1 sm:space-y-2 md:space-y-3 text-gray-800">
            <div className="flex items-center mb-1 xs:mb-2 sm:mb-3">
              {/* Icono para el nombre - Persona/Guía */}
              <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 mr-1 xs:mr-2 sm:mr-3 md:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 md:h-6 md:w-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-teal-800">Nombres:</span>
                <h3 className="text-xs xs:text-sm sm:text-lg md:text-xl text-gray-700 break-words max-w-[calc(100vw-80px)] sm:max-w-none">
                  {nombres}
                </h3>
              </div>
            </div>
            
            {apellidos && (
              <div className="flex items-center mb-1 xs:mb-2 sm:mb-3 md:mb-4">
                {/* Icono para el apellido - Familia */}
                <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 mr-1 xs:mr-2 sm:mr-3 md:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 md:h-6 md:w-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-teal-800">Apellidos:</span>
                  <h4 className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-700 break-words max-w-[calc(100vw-80px)] sm:max-w-none">
                    {apellidos}
                  </h4>
                </div>
              </div>
            )}
            
            {/* Descripción del guía */}
            <div className="mt-1 xs:mt-2 mb-2 xs:mb-3 sm:mb-4">
              <div className="flex items-start mb-1 xs:mb-2">
                {/* Icono para la descripción */}
                <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 mr-1 xs:mr-2 sm:mr-3 md:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6 mt-[2px]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 md:h-6 md:w-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-semibold text-teal-800">Sobre mí:</span>
                  <p className="text-xs xs:text-sm text-gray-700 leading-relaxed max-h-[20vh] overflow-y-auto pr-1 xs:pr-2 break-words mt-1">
                    {guia.descripcion || "Este guía aún no tiene una descripción disponible. ¡Pero seguro tiene mucho que compartir sobre el Valle del Cocora y sus maravillosos paisajes!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 5 estrellas al final */}
          <div className="flex items-center justify-center pt-1 xs:pt-2 sm:pt-3 md:pt-5 relative">
            <div className="relative flex items-center justify-center py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-4">
              {/* Estrellas con efecto de rotación y brillo al hover */}
              <div className="flex items-center justify-center relative z-10 flex-wrap">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`transform transition-all duration-300 hover:scale-125 hover:rotate-12 ${index === 0 ? 'hover:rotate-[-12deg]' : ''} ${index === 4 ? 'hover:rotate-12' : ''}`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-0.5 drop-shadow-lg filter hover:drop-shadow-xl transition-all duration-300" 
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

