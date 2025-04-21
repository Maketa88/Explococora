import { useTranslation } from "react-i18next";
import { FaFacebookSquare, FaInstagram, FaTiktok } from "react-icons/fa";
import logo from "../../../assets/Images/LogoBlanco.webp";
import { FooterSeccion } from "./FooterSeccion";
import { IconoRedes } from "./IconoRedes";
import { LinkFooter } from "./LinkFooter";

export const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-teal-700">
      <div className="max-w-7xl mx-auto  py-2">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-3 ">
          {/* Logo Section */}
          <div className="flex flex-col items-start">
            <img
              src={logo}
              alt={t("valleCocora")}
              className="h-16 w-auto mb-4"
            />
            <p className="text-white font-medium text-lg">
              {t("footerDescripcion")}
            </p>
          </div>

          {/* Links Sections */}
          <FooterSeccion title={t("acercaDeNosotros")}>
            <LinkFooter href="/QuienesSomos">{t("quienesSomos")}</LinkFooter>
            <LinkFooter href="/ContactForm">{t("contacto")}</LinkFooter>
          </FooterSeccion>

          <FooterSeccion title={t("politicas")}>
            <LinkFooter href="/PoliticaPrivacidad">
              {t("politicasPrivacidad")}
            </LinkFooter>
            <LinkFooter href="/seguridad">
              {t("seguridadCaminatas")}
            </LinkFooter>
            <LinkFooter href="/terminos">{t("terminosCondiciones")}</LinkFooter>
          </FooterSeccion>

          <FooterSeccion title={t("siguenos")}>
            <div className="flex gap-6 items-center">
              <IconoRedes
                Icon={FaFacebookSquare}
                href="https://www.facebook.com/profile.php?id=61572216023743"
                label={t("sigueFacebook")}
                color="#1877F2" // Color oficial de Facebook
              />
              <IconoRedes
                Icon={FaInstagram}
                href="https://www.instagram.com/explo.cocora?igsh=MWtuc2hvc2dkdHoydA=="
                label={t("sigueInstagram")}
                color="#E4405F" // Color oficial de Instagram
              />
              <IconoRedes
                Icon={FaTiktok}
                href="https://www.tiktok.com/@explo.cocora?_t=ZS-8vEnVtXqVeB&_r=1"
                label={t("sigueTiktok")}
                color="#000000" // Color oficial de TikTok
              />
            </div>
            <p className="text-lg text-white font-medium mt-4">
              {t("mantenteConectado")}
            </p>
          </FooterSeccion>
        </div>
      </div>
    </footer>
  );
};

