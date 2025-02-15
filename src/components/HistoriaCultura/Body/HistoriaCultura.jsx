import { Carta } from "./Carta";
import Carta1 from "../../../assets/Images/historia1.webp";
import Carta2 from "../../../assets/Images/carrusel2.webp";
import Carta3 from "../../../assets/Images/historia3.webp";
import Carta4 from "../../../assets/Images/historia4.webp";
import Carta5 from "../../../assets/Images/historia5.webp";
import Carta6 from "../../../assets/Images/historia6.webp";
import Carta7 from "../../../assets/Images/historia7.webp";
import Carta8 from "../../../assets/Images/historia8.webp";
import { TituloExplo } from "./TituloExplo";
import { useTranslation } from "react-i18next";

export const HistoriaCultura = () => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <TituloExplo />
      </div>

      <div className="min-h-screen bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-10">
        {/* Contenido */}

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Asegúrate de que las cartas estén ajustadas para hacer hover sobre ellas */}
          <Carta image={Carta1} title={t("card1Title")} text={t("card1Text")} />
          <Carta image={Carta2} title={t("card2Title")} text={t("card2Text")} />
          <Carta image={Carta3} title={t("card3Title")} text={t("card3Text")} />
          <Carta image={Carta5} title={t("card4Title")} text={t("card4Text")} />
          <Carta image={Carta4} title={t("card5Title")} text={t("card5Text")} />
          <Carta image={Carta6} title={t("card6Title")} text={t("card6Text")} />
          <Carta image={Carta7} title={t("card7Title")} text={t("card7Text")} />
          <Carta image={Carta8} title={t("card8Title")} text={t("card8Text")} />
        </div>
      </div>
    </>
  );
};
