import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const TituloExplo = () => {
  const { t, i18n } = useTranslation();
  const title =
    i18n.language === "es"
      ? "Descubre la Magia del Valle del Cocora"
      : "Discover the Magic of Cocora Valley";

  // Estado para controlar la animación en bucle
  const [animationKey, setAnimationKey] = useState(0);

  // Efecto para reiniciar la animación cuando termine
  useEffect(() => {
    const animationDuration = title.length * 150 + 1500; // Duración basada en el número de caracteres + buffer
    
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, animationDuration);
    
    return () => clearInterval(interval);
  }, [title]);

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-6">
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20">
        {/* Capa de fondo con olas */}
        <div className="absolute inset-0 w-full h-full">
          <div className="w-full h-full bg-gradient-to-r from-teal-900 via-teal-800 to-teal-700">
            {/* Ola superior */}
            <div>
              <div className="w-full h-full bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 opacity-70 animate-pulse">
                <svg
                  preserveAspectRatio="none"
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                >
                  <path
                    d="M0,20 Q25,50 50,20 T100,20 V100 L0,100 Z"
                    fill="rgba(255,255,255,0.3)"
                  />
                </svg>
              </div>
            </div>
            
            {/* Ola inferior */}
            
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8 relative z-10">
          {/* Lado izquierdo - Tarjeta con título */}
          <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
            <div className="bg-white/90 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 w-full max-w-xs sm:max-w-sm transform hover:scale-105 transition-transform duration-300">
              <h1 key={animationKey} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 text-center text-gray-950">
                {/* División por palabras para mantener la integridad */}
                {title.split(" ").map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-block mr-1 sm:mr-2 mb-1 sm:mb-2">
                    {word.split("").map((char, charIndex) => (
                      <span
                        key={`${wordIndex}-${charIndex}`}
                        className="inline-block animate-bounce-in drop-shadow-[1px_1px_1px_rgba(0,0,0,0.3)] sm:drop-shadow-[2px_2px_2px_rgba(0,0,0,0.3)] hover:drop-shadow-[2px_2px_1px_rgba(0,0,0,0.4)] sm:hover:drop-shadow-[3px_3px_2px_rgba(0,0,0,0.4)] transition-all duration-300"
                        style={{
                          animationDelay: `${(wordIndex * 5 + charIndex) * 100}ms`,
                          animationFillMode: "backwards",
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>
              
              {/* Divisor decorativo */}
              <div className="flex items-center justify-center mt-4 sm:mt-6 md:mt-8 lg:mt-10">
                <div className="border-t-2 border-gray-950 flex-grow"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-950 rounded-full mx-1 sm:mx-2"></div>
                <div className="border-t-2 border-gray-950 flex-grow"></div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Párrafo */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="text-white font-medium w-full max-w-xs sm:max-w-sm md:max-w-md bg-teal-800/50 backdrop-blur-sm p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg text-center">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                {t("descripcionValle")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TituloExplo;