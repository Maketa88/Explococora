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
    <div className="relative w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white flex-grow min-h-[auto] sm:min-h-[600px]">
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
      <div className="p-4 sm:p-6 z-20 bg-white relative shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] flex-grow flex flex-col justify-between">
        {/* Información del guía */}
        <div className="space-y-2 sm:space-y-3 text-gray-800">
          <div className="flex items-center mb-3">
            {/* Icono para el nombre - Persona/Guía */}
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 mr-2 sm:mr-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-black">Nombres:</span>
              <h3 className="font-bold text-lg sm:text-xl text-gray-700">
                {nombres}
              </h3>
            </div>
          </div>
          
          {apellidos && (
            <div className="flex items-center mb-4">
              {/* Icono para el apellido - Familia */}
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 mr-2 sm:mr-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-black">Apellidos:</span>
                <h4 className="font-medium text-base sm:text-lg text-gray-700">
                  {apellidos}
                </h4>
              </div>
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-5">
            <div className="flex items-start text-sm">
              {/* Icono para la cédula */}
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 mr-2 sm:mr-3 shadow-md shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-black">Cédula:</span>
                <span className="text-gray-700 font-medium">{guia.cedula || 'No disponible'}</span>
              </div>
            </div>
            
            {guia.email && (
              <div className="flex items-start text-sm">
                {/* Icono para el email */}
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 mr-2 sm:mr-3 shadow-md shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col max-w-[calc(100%-44px)]">
                  <span className="text-xs font-semibold text-black">Email:</span>
                  <span className="truncate text-gray-700 font-medium break-words text-xs sm:text-sm">{guia.email}</span>
                </div>
              </div>
            )}
            
            {/* Mostrar teléfono/celular si está disponible */}
            {guia.telefono && (
              <div className="flex items-start text-sm">
                {/* Icono para el teléfono */}
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 mr-2 sm:mr-3 shadow-md shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex flex-col max-w-[calc(100%-44px)]">
                  <span className="text-xs font-semibold text-black">Teléfono:</span>
                  <span className="truncate text-gray-700 font-medium text-xs sm:text-sm">{guia.telefono}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 5 estrellas al final - Versión con estrellas más grandes */}
        <div className="flex items-center justify-center pt-1 sm:pt-4 relative">
          <div className="relative flex items-center justify-center py-1 sm:py-2 px-2 sm:px-4">
            {/* Estrellas con efecto de rotación al hover */}
            <div className="flex items-center relative z-10">
              {[...Array(5)].map((_, index) => (
                <div 
                  key={index} 
                  className={`transform transition-all duration-300 hover:scale-125 hover:rotate-12 ${index === 0 ? 'hover:rotate-[-12deg]' : ''} ${index === 4 ? 'hover:rotate-12' : ''}`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 sm:h-8 sm:w-8 md:h-10 md:w-10 mx-0.5 drop-shadow-lg" 
                    viewBox="0 0 20 20" 
                    fill="#FFD700"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

