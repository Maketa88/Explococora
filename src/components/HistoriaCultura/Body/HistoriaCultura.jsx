import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Carta6 from "../../../assets/Images/historia6.webp";
import Carta5 from "../../../assets/Images/historia4.webp";
import Carta1 from "../../../assets/Images/historia1.webp";
import Carta7 from "../../../assets/Images/historia7.webp";
import Carta3 from "../../../assets/Images/historia3.webp";
import Carta2 from "../../../assets/Images/carrusel4.jpg";
import Carta8 from "../../../assets/Images/historia8.webp";
import Carta4 from "../../../assets/Images/historia5.webp";
import { TituloExplo } from "./TituloExplo";

export const HistoriaCultura = () => {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef(null);

  // Control del slider
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === 7 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? 7 : prev - 1));
  };

  // Todas las tarjetas para el slider
  const cardsData = [
    { image: Carta1, title: t("card1Title"), text: t("card1Text") },
    { image: Carta2, title: t("card2Title"), text: t("card2Text") },
    { image: Carta3, title: t("card3Title"), text: t("card3Text") },
    { image: Carta4, title: t("card4Title"), text: t("card4Text") },
    { image: Carta5, title: t("card5Title"), text: t("card5Text") },
    { image: Carta6, title: t("card6Title"), text: t("card6Text") },
    { image: Carta7, title: t("card7Title"), text: t("card7Text") },
    { image: Carta8, title: t("card8Title"), text: t("card8Text") },
  ];

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-teal-50 to-white flex flex-col items-center justify-start p-3 md:p-6 transition-all duration-1000 ease-in-out relative overflow-hidden">
      {/* Patrón SVG de fondo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Título como marca de agua en el fondo */}
          <text
            x="600"
            y="300"
            textAnchor="middle"
            className="text-5xl font-bold"
            fill="#047857"
            fontSize="120"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            opacity="0.10"
            letterSpacing="10"
          >
            PATRIMONIO
          </text>
          
          {/* Montañas en diferentes capas */}
          <path
            d="M0,600 L100,450 L200,500 L300,380 L400,450 L500,300 L600,420 L700,350 L800,480 L900,400 L1000,320 L1100,450 L1200,380 L1200,600 Z"
            fill="#047857"
            fillOpacity="0.15"
          />
          <path
            d="M0,600 L150,500 L250,550 L350,450 L450,520 L550,400 L650,480 L750,420 L850,500 L950,450 L1050,500 L1200,420 L1200,600 Z"
            fill="#047857"
            fillOpacity="0.1"
          />
          
          {/* Siluetas de animales */}
          <path
            d="M900,500 C920,480 940,490 930,510 C940,530 920,540 900,520 C880,540 860,530 870,510 C860,490 880,480 900,500 Z"
            fill="#047857"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Título Explo */}
      <div className="py-4 md:py-8 w-full z-10">
        <TituloExplo />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 z-10">
        {/* Ola superior */}
        <div className="absolute top-0 left-0 w-full h-6 md:h-8 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 opacity-70">
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

        {/* Slider de tarjetas */}
        <div className="pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-20 md:pb-20 relative" ref={sliderRef}>
          <div className="w-full max-w-4xl mx-auto relative">
            {/* Botón anterior - posicionado más a la izquierda */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-teal-600/80 hover:bg-teal-700 text-white p-1.5 sm:p-2 rounded-full shadow-md transition-all duration-300 btn-prev"
              style={{ transform: "translateY(-50%) translateX(-120%)" }}
              aria-label="Anterior"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              {/* Tarjetas del slider */}
              <div className="relative h-[400px] sm:h-[380px] md:h-[400px] transition-all duration-500">
                {cardsData.map((card, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out transform ${
                      index === activeSlide
                        ? "opacity-100 translate-x-0"
                        : index < activeSlide
                        ? "opacity-0 -translate-x-full"
                        : "opacity-0 translate-x-full"
                    }`}
                  >
                    <div className="w-full h-full border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2 h-48 md:h-full relative flex items-center justify-center">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-contain p-4 sm:p-6 md:p-8"
                        />
                      </div>
                      <div className="w-full md:w-1/2 p-4 sm:p-5 md:p-6 flex flex-col justify-center">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 md:mb-4">
                          {card.title}
                        </h3>
                        <div className="text-content-wrapper">
                          <p className="text-sm sm:text-base text-teal-700">
                            {card.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Indicadores de posición - ahora fuera del contenido */}
            <div className="flex justify-center space-x-1.5 sm:space-x-2 mt-4">
              {cardsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                    index === activeSlide
                      ? "bg-teal-600"
                      : "bg-teal-300"
                  } transition-all`}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Botón siguiente - posicionado más a la derecha */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-teal-600/80 hover:bg-teal-700 text-white p-1.5 sm:p-2 rounded-full shadow-md transition-all duration-300 btn-next"
              style={{ transform: "translateY(-50%) translateX(120%)" }}
              aria-label="Siguiente"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Ola inferior */}
        <div className="absolute bottom-0 left-0 w-full h-6 md:h-8 overflow-hidden transform rotate-180">
          <div className="w-full h-full bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 opacity-70">
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
      </div>
      
      {/* Elementos decorativos animados */}
      <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }, (_, i) => (
          <div 
            key={i}
            className="absolute animate-float opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`
            }}
          >
            <svg width={Math.random() * 20 + 15} height={Math.random() * 20 + 15} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" 
                stroke="rgba(4, 120, 87, 0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </div>
      
      {/* Estilos CSS para animaciones y ajustes responsivos mejorados */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) translateX(20px) rotate(10deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        /* Contenedor de texto con altura máxima y scroll solo en móviles */
        .text-content-wrapper {
          padding-right: 5px;
        }
        
        /* Estilo para scrollbar */
        .text-content-wrapper::-webkit-scrollbar {
          width: 5px;
        }
        
        .text-content-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .text-content-wrapper::-webkit-scrollbar-thumb {
          background: #0d9488;
          border-radius: 5px;
        }
        
        /* Mejoras responsive */
        @media (max-width: 640px) {
          .min-h-[80vh] {
            min-height: 100dvh;
          }
          .text-content-wrapper {
            max-height: 95px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #0d9488 transparent;
          }
          .btn-prev {
            transform: translateY(-50%) translateX(-100%) !important;
          }
          .btn-next {
            transform: translateY(-50%) translateX(100%) !important;
          }
        }
        
        /* Ajustes para tablets pequeñas */
        @media (min-width: 641px) and (max-width: 767px) {
          .text-content-wrapper {
            max-height: 110px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #0d9488 transparent;
          }
        }
        
        /* Pantallas grandes sin scroll */
        @media (min-width: 768px) {
          .text-content-wrapper {
            max-height: none;
            overflow-y: visible;
          }
        }
      `}</style>
    </div>
  );
};