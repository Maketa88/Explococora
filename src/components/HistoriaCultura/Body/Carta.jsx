export const Carta = ({ image, title, text }) => {
  return (
    <div className="flex flex-col items-center p-4 h-full">
      {/* Contenedor de la imagen con tamaño fijo */}
      <div className="mb-4 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center">
        <img 
          className="w-full h-full object-contain" 
          src={image} 
          alt={title} 
          loading="lazy"
        />
      </div>
      
      {/* Contenedor para el texto que ocupa todo el ancho disponible */}
      <div className="w-full flex flex-col flex-grow">
        {/* Título centrado con padding consistente y tamaño de texto responsivo */}
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-teal-700 mb-3 text-center w-full">
          {title}
        </h3>
        
        {/* Párrafo con texto justificado y tamaño de texto responsivo */}
        <p className="text-gray-800 text-xs sm:text-sm md:text-base text-justify w-full flex-grow">
          {text}
        </p>
      </div>
    </div>
  );
};