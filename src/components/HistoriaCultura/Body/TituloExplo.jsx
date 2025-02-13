import React from "react";
import { useTranslation } from 'react-i18next';

export const TituloExplo = () => {
  const { t, i18n } = useTranslation();

  const title = i18n.language === 'es' 
    ? 'Descubre la Magia del Valle del Cocora'
    : 'Discover the Magic of Cocora Valley';

  return (
<div className="flex items-center justify-center p-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-center">


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
      </div>
    </div>
  );
};

export default TituloExplo;