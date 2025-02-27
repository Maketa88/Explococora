import React from "react";
import { Carta } from "./Carta";
import Carta1 from "../../../assets/Images/indigena.png";
import Carta2 from "../../../assets/Images/palma-de-cera.png";
import Carta3 from "../../../assets/Images/madre-tierra.png";
import Carta4 from "../../../assets/Images/trucha-arcoiris.png";
import Carta5 from "../../../assets/Images/casa.png";
import Carta6 from "../../../assets/Images/caballito.png";
import Carta7 from "../../../assets/Images/loro.png";
import Carta8 from "../../../assets/Images/plantando.png";
import { TituloExplo } from "./TituloExplo";
import { useTranslation } from "react-i18next";

export const HistoriaCultura = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen ">
      <div className="py-8">
        <TituloExplo />
      </div>

      {/* Contenedor principal con posición relativa para las olas */}
      <div className="relative container mx-auto px-12 pb-16">
        {/* Ola superior */}
        <div className="absolute top-0 left-0 w-full h-8 overflow-hidden">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-20 pb-30">
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
        <div className="absolute bottom-0 left-0 w-full h-8 overflow-hidden transform rotate-180">
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