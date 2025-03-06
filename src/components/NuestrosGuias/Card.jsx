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
      className={`relative w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white flex-grow min-h-[auto] sm:min-h-[600px] transition-all duration-1000 ease-out ${
        animacionIniciada 
          ? 'opacity-100 transform translate-y-0 rotate-0 scale-100' 
          : 'opacity-0 transform -translate-y-16 rotate-3 scale-95'
      }`}
    >
      {/* Contenedor de la imagen con fondo - Ahora con altura responsiva */}
      <div 
        className="relative w-full bg-gray-100 flex items-center justify-center pt-4 px-4"
        style={{ height: 'min(40vh, 300px)' }}
      >
        {/* Indicador de carga */}
        {!imagenCargada && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            style={{ maxHeight: 'min(35vh, 280px)' }}
          />
        </div>
        
        {/* Degradado en la parte inferior de la imagen para transición suave */}
       
      </div>
      
      {/* Contenido - Ahora con altura automática y flex-grow para ocupar espacio disponible */}
      <div className="p-4 sm:p-6 z-20 bg-teal-50  relative shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] flex-grow flex flex-col justify-between">
        {/* Información del guía */}
        <div className="space-y-2 sm:space-y-3 text-gray-800">
          <div className="flex items-center mb-3">
            {/* Icono para el nombre - Persona/Guía */}
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mr-3 sm:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700">Nombres:</span>
              <h3 className="font-semibold text-lg sm:text-xl text-gray-950">
                {nombres}
              </h3>
            </div>
          </div>
          
          {apellidos && (
            <div className="flex items-center mb-4">
              {/* Icono para el apellido - Familia */}
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mr-3 sm:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-black">Apellidos:</span>
                <h4 className="font-semibold text-base sm:text-lg text-gray-950">
                  {apellidos}
                </h4>
              </div>
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-5">
           
            
            {guia.email && (
              <div className="flex items-start text-sm">
                {/* Icono para el email */}
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-3 sm:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="flex flex-col max-w-[calc(100%-60px)]">
                  <span className="text-xs font-semibold text-black">Email:</span>
                  <span className="truncate text-gray-950 break-words text-xs sm:text-sm font-semibold">{guia.email}</span>
                </div>
              </div>
            )}
            
            {/* Mostrar teléfono/celular si está disponible */}
            {guia.telefono && (
              <div className="flex items-start text-sm">
                {/* Icono para el teléfono */}
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mr-3 sm:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="flex flex-col max-w-[calc(100%-60px)]">
                  <span className="text-xs font-semibold text-black">Teléfono:</span>
                  <span className="truncate text-gray-700 font-medium text-xs sm:text-sm">{guia.telefono}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 5 estrellas al final - Versión con estrellas más grandes y animadas */}
        <div className="flex items-center justify-center pt-3 sm:pt-5 relative">
          <div className="relative flex items-center justify-center py-2 sm:py-3 px-2 sm:px-4">
            {/* Estrellas con efecto de rotación y brillo al hover */}
            <div className="flex items-center relative z-10">
              {[...Array(5)].map((_, index) => (
                <div 
                  key={index} 
                  className={`transform transition-all duration-300 hover:scale-125 hover:rotate-12 ${index === 0 ? 'hover:rotate-[-12deg]' : ''} ${index === 4 ? 'hover:rotate-12' : ''}`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 mx-0.5 drop-shadow-lg filter hover:drop-shadow-xl transition-all duration-300" 
                    viewBox="0 0 24 24" 
                    fill="url(#starGradient)"
                    stroke="none"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.7))' }}
                  >
                    <defs>
                      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFEA00" />
                        <stop offset="50%" stopColor="#FFD000" />
                        <stop offset="100%" stopColor="#FF8C00" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              ))}
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
    primerNombre: PropTypes.string,
    segundoNombre: PropTypes.string,
    primerApellido: PropTypes.string,
    cedula: PropTypes.string,
    foto: PropTypes.string,
    tipo: PropTypes.string,
    email: PropTypes.string,
    nombreCompleto: PropTypes.string,
    telefono: PropTypes.string
  }).isRequired
};

export { CardGuia };

