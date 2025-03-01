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
    <div className="min-h-screen w-full">
      <div className="py-4 md:py-8">
        <TituloExplo />
      </div>

      {/* Contenedor principal con posición relativa para las olas */}
      <div className="relative container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-12 md:pb-16">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-20 md:pb-30">
          <Carta
            image={Carta1}
            title={t("card1Title")}
            text={t("card1Text")}
          />
          <Carta
            image={Carta2}
            title={t("card2Title")}
            text={t("card2Text")}
          />
          <Carta
            image={Carta3}
            title={t("card3Title")}
            text={t("card3Text")}
          />
          <Carta
            image={Carta4}
            title={t("card4Title")}
            text={t("card4Text")}
          />
          
          {/* Línea divisoria después de las primeras 4 cartas */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 my-2 md:my-4">
            <div className="flex items-center justify-center px-4 sm:px-8 md:px-16">
              <div className="border-t-2 border-gray-950 flex-grow"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-950 rounded-full mx-2"></div>
              <div className="border-t-2 border-gray-950 flex-grow"></div>
            </div>
          </div>
          
          <Carta
            image={Carta5}
            title={t("card5Title")}
            text={t("card5Text")}
          />
          <Carta
            image={Carta6}
            title={t("card6Title")}
            text={t("card6Text")}
          />
          <Carta
            image={Carta7}
            title={t("card7Title")}
            text={t("card7Text")}
          />
          <Carta
            image={Carta8}
            title={t("card8Title")}
            text={t("card8Text")}
          />
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
    </div>
  );
};