import React from "react";
import { useTranslation } from 'react-i18next';

export const TituloExplo = () => {
  const { t, i18n } = useTranslation();
  const title = i18n.language === 'es' 
    ? 'Descubre la Magia del Valle del Cocora' 
    : 'Discover the Magic of Cocora Valley';

  return (
    <div className="relative flex items-center justify-center p-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-center">
      {/* Borde Superior */}
      <div className="absolute top-0 left-0 w-full h-7 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 opacity-70 animate-pulse">
          <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 100 100">
            <path d="M0,20 Q25,50 50,20 T100,20 V100 L0,100 Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>
      </div>

      {/* Borde Inferior */}
      <div className="absolute bottom-0 left-0 w-full h-7 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 opacity-70 animate-pulse">
          <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 100 100">
            <path d="M0,20 Q25,40 50,20 T100,20 V100 L0,100 Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>
      </div>

      <div className="max-w-4xl">
  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
    {title.split('').map((char, index) => (
      <span
        key={index}
        className="inline-block animate-bounce-in text-black drop-shadow-[4px_4px_3px_rgba(0,0,0,0.3)] hover:drop-shadow-[6px_6px_4px_rgba(0,0,0,0.4)] transition-all duration-300"
        style={{
          animationDelay: `${index * 100}ms`,
          animationFillMode: 'backwards'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </h1>

  <p className="text-base sm:text-lg lg:text-2xl leading-relaxed text-justify font-nunito text-blue-gray-700">
    {t('descripcionValle')}
  </p>

  {/* Separador con líneas y círculo */}
  <div className="flex items-center justify-center mt-8">
  <div className="border-t-2 border-black flex-grow"></div>
  <div className="w-4 h-4 bg-black rounded-full mx-4"></div>
  <div className="border-t-2 border-black flex-grow"></div>
  </div>
</div>


    </div>
  );
};

export default TituloExplo;


<div className="w-full h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-80 animate-pulse"></div>