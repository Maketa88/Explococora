import { useTranslation } from "react-i18next";
import Carta6 from "../../../assets/Images/caballito.png";
import Carta5 from "../../../assets/Images/casa.png";
import Carta1 from "../../../assets/Images/indigena.png";
import Carta7 from "../../../assets/Images/loro.png";
import Carta3 from "../../../assets/Images/madre-tierra.png";
import Carta2 from "../../../assets/Images/palma-de-cera.png";
import Carta8 from "../../../assets/Images/plantando.png";
import Carta4 from "../../../assets/Images/trucha-arcoiris.png";
import { Carta } from "./Carta";
import { TituloExplo } from "./TituloExplo";

export const HistoriaCultura = () => {
  const { t } = useTranslation();

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

      <div className="relative container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-12 md:pb-16 z-10">
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

        {/* Grid de cartas con padding superior para dejar espacio a la ola */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-10 md:pb-30">
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta1}
              title={t("card1Title")}
              text={t("card1Text")}
            />
          </div>
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta2}
              title={t("card2Title")}
              text={t("card2Text")}
            />
          </div>
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta3}
              title={t("card3Title")}
              text={t("card3Text")}
            />
          </div>
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta4}
              title={t("card4Title")}
              text={t("card4Text")}
            />
          </div>
          
          {/* Línea divisoria después de las primeras 4 cartas */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 my-2 md:my-4">
            <div className="flex items-center justify-center px-4 sm:px-8 md:px-16">
              <div className="border-t-2 border-teal-700 flex-grow"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 bg-teal-700 rounded-full mx-2 animate-pulse"></div>
              <div className="border-t-2 border-teal-700 flex-grow"></div>
            </div>
          </div>
          
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta5}
              title={t("card5Title")}
              text={t("card5Text")}
            />
          </div>
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta6}
              title={t("card6Title")}
              text={t("card6Text")}
            />
          </div>
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta7}
              title={t("card7Title")}
              text={t("card7Text")}
            />
          </div>
          <div className="border-2 border-teal-600/60 rounded-xl overflow-hidden shadow-sm">
            <Carta
              image={Carta8}
              title={t("card8Title")}
              text={t("card8Text")}
            />
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
      
      {/* Estilos CSS para animaciones */}
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
        
        /* Mejoras responsive */
        @media (max-width: 640px) {
          .min-h-[80vh] {
            min-height: 100dvh;
          }
        }
      `}</style>
    </div>
  );
};