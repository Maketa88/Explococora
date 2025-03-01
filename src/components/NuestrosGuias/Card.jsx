import PropTypes from 'prop-types';

const CardGuia = ({ guia }) => {
  // Datos de ejemplo para cuando no se proporciona un guía
  const guiaEjemplo = {
    primerNombre: 'Juan',
    segundoNombre: 'Carlos',
    primerApellido: 'Rodríguez',
    cedula: '1234567890',
    email: 'ejemplo@vallecocora.com',
    estado: 'disponible',
    foto: '/default-avatar.png'
  };

  // Usar los datos proporcionados o los de ejemplo
  const guiaData = guia || guiaEjemplo;

  // Determinar el color del estado
  const estadoColor = (() => {
    const estadoLowerCase = guiaData.estado?.toLowerCase() || '';
    
    // Lógica actualizada para manejar los tres estados
    if (estadoLowerCase === 'disponible') {
      return 'bg-green-500 text-white';
    } else if (estadoLowerCase === 'ocupado') {
      return 'bg-orange-500 text-white';
    } else if (estadoLowerCase === 'inactivo') {
      return 'bg-red-500 text-white';
    } else {
      // Para cualquier otro estado desconocido
      return 'bg-yellow-500 text-white';
    }
  })();

  // Obtener nombres y apellidos de forma más eficiente
  const { nombres, apellidos } = (() => {
    // Si tenemos los campos separados, usarlos
    if (guiaData.primerNombre || guiaData.segundoNombre || guiaData.primerApellido) {
      return {
        nombres: `${guiaData.primerNombre || ''} ${guiaData.segundoNombre || ''}`.trim(),
        apellidos: guiaData.primerApellido || ''
      };
    }
    
    // Si tenemos el nombre completo, dividirlo
    if (guiaData.nombreCompleto) {
      const partes = guiaData.nombreCompleto.split(' ');
      
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

  return (
    <div className="relative group w-80 h-[450px] rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-emerald-200/30 hover:shadow-2xl bg-white">
      {/* Imagen de fondo con efecto parallax */}
      <div className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110">
        <img 
          src={guiaData.foto || '/default-avatar.png'} 
          alt={`Foto de ${nombres}`} 
          className="w-full h-full object-cover"
        />
        {/* Capa semitransparente para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-white/50"></div>
      </div>
      
      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 h-3/5 flex flex-col justify-end bg-white/80">
        {/* Información del guía */}
        <div className="text-gray-800">
          <div className="flex items-center mb-1">
            {/* Icono para el nombre - Persona/Guía */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 mr-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-black">Nombres:</span>
              <h3 className="font-bold text-xl text-gray-700">
                {nombres}
              </h3>
            </div>
          </div>
          
          {apellidos && (
            <div className="flex items-center mb-3">
              {/* Icono para el apellido - Familia */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 mr-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-black">Apellidos:</span>
                <h4 className="font-medium text-lg text-gray-700">
                  {apellidos}
                </h4>
              </div>
            </div>
          )}
          
          <div className="space-y-3 mt-4">
            <div className="flex items-start sm:items-center text-sm flex-wrap">
              {/* Icono para la cédula */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 mr-3 shadow-md shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-black">Cédula:</span>
                <span className="text-gray-700">{guiaData.cedula || 'No disponible'}</span>
              </div>
            </div>
            
            {guiaData.email && (
              <div className="flex items-start sm:items-center text-sm flex-wrap">
                {/* Icono para el email */}
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 mr-3 shadow-md shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col max-w-[calc(100%-40px)]">
                  <span className="text-xs font-semibold text-black">Email:</span>
                  <span className="truncate text-gray-700">{guiaData.email}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 5 estrellas al final - Versión simplificada */}
          <div className="flex items-center justify-center mt-5 relative">
            <div className="relative flex items-center justify-center py-2 px-4">
              {/* Estrellas con efecto de rotación al hover */}
              <div className="flex items-center relative z-10">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`transform transition-all duration-300 hover:scale-125 hover:rotate-12 ${index === 0 ? 'hover:rotate-[-12deg]' : ''} ${index === 4 ? 'hover:rotate-12' : ''}`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-9 w-9 mx-0.5 drop-shadow-lg" 
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
          
          {/* Etiqueta de estado - Ahora debajo de las estrellas y centrada */}
          
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
    estado: PropTypes.string,
    nombreCompleto: PropTypes.string
  })
};

export { CardGuia };

