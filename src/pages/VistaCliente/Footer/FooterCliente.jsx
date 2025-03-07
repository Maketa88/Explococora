import { FaFacebookSquare, FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import logo from "../../../assets/Images/logo.webp";
import { IconoRedes } from "../../../components/PaginaInicio/Footer/IconoRedes";
import { LinkFooter } from "../../../components/PaginaInicio/Footer/LinkFooter";
import { FooterSeccion } from "../../../components/PaginaInicio/Footer/FooterSeccion";

export const FooterCliente = () => {
  return (
    <footer className="bg-teal-800">
      <div className="max-w-7xl mx-auto  py-2">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-3 ">
          {/* Logo Section */}
          <div className="flex flex-col items-start">
            <img
              src={logo}
              alt="Valle del Cocora Logo"
              className="h-16 w-auto mb-4"
            />
            <p className="text-white font-medium text-lg">
              Descubre la magia del Valle del Cocora, hogar de las majestuosas
              palmas de cera y experiencias únicas en la naturaleza.
            </p>
          </div>

          {/* Links Sections */}
          <FooterSeccion title="Acerca de Nosotros">
            <LinkFooter href="/VistaCliente/QuienesSomos">Quiénes Somos</LinkFooter>

            <LinkFooter href="/VistaCliente/Contacto">Contacto</LinkFooter>
          </FooterSeccion>

          <FooterSeccion title="Políticas">
            <LinkFooter href="/privacidad">
              Políticas de Privacidad
            </LinkFooter>
            <LinkFooter href="/seguridad">
              Seguridad en Caminatas y Cabalgatas
            </LinkFooter>
            <LinkFooter href="/terminos">Términos y Condiciones</LinkFooter>
          </FooterSeccion>

          <FooterSeccion title="Síguenos">
            <div className="flex gap-6 items-center">
              <IconoRedes
                Icon={FaFacebookSquare}
                href="https://facebook.com/valledelcocora"
                label="Síguenos en Facebook"
                color="#1877F2" // Color oficial de Facebook
              />
              <IconoRedes
                Icon={FaInstagram}
                href="https://instagram.com/valledelcocora"
                label="Síguenos en Instagram"
                color="#E4405F" // Color oficial de Instagram
              />
              <IconoRedes
                Icon={FaTiktok}
                href="https://tiktok.com/@valledelcocora"
                label="Síguenos en TikTok"
                color="#000000" // Color oficial de TikTok
              />
            </div>
            <p className="text-lg text-white font-medium mt-4">
              Mantente conectado con nuestras últimas aventuras y novedades
            </p>
          </FooterSeccion>
        </div>
      </div>
    </footer>
  );
};

