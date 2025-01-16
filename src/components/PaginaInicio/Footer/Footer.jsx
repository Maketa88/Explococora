import { FaWhatsapp, FaFacebook, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";
import { MdPlace, MdEmail, MdSchedule } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-teal-800 text-white py-4">
      <div className="container mx-auto flex flex-wrap justify-between items-center px-4">
        {/* Ubicación */}
        <div className="flex items-center space-x-2">
          <MdPlace className="text-lg" />
          <span>Colombia</span>
        </div>

        {/* Horario */}
        <div className="flex items-center space-x-2">
          <MdSchedule className="text-lg" />
          <span>¡Programa tu ruta hoy!</span>
        </div>

        {/* Teléfono */}
        <div className="flex items-center space-x-2">
          <FaWhatsapp className="text-lg" />
          <span>+57 1234567890</span>
        </div>

        {/* Correo */}
        <div className="flex items-center space-x-2">
          <MdEmail className="text-lg" />
          <span>Explococora@gmail.com</span>
        </div>

        {/* Redes Sociales */}
        <div className="flex space-x-3">
          <a href="#" target="_blank" className="hover:text-gray-300">
            <FaTiktok className="text-xl" />
          </a>
          <a href="#" target="_blank" className="hover:text-gray-300">
            <FaYoutube className="text-xl" />
          </a>
          <a href="https://www.facebook.com/share/15mgyn1xN5/" target="_blank" className="hover:text-gray-300">
            <FaFacebook className="text-xl" />
          </a>
          <a href="#" target="_blank" className="hover:text-gray-300">
            <FaInstagram className="text-xl" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
