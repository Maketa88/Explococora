import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaLeaf, FaMapMarkedAlt, FaTree, FaUsers } from "react-icons/fa";
import { GiHorseHead, GiHorseshoe } from "react-icons/gi";
import quienes from "../../assets/Images/carrusel4.jpg";

const QuienesSomosCliente = () => {
  useTranslation();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-gradient-to-b from-teal-800 to-teal-700 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url(${quienes})`,
          }}
        ></div>
        <div className="absolute inset-0 bg-teal-900 opacity-60"></div>
        <div className="relative flex flex-col items-center justify-center h-full px-4 text-center z-10">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 md:mb-4 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            ExploCocora
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto text-white px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Pioneros en la preservación y gestión sostenible del Valle de Cocora
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 md:py-16">
        {/* Introducción */}
        <motion.section 
          className="text-center mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 relative inline-block">
            Quiénes Somos
            <span className="absolute bottom-0 left-0 w-full h-1 bg-white transform translate-y-2"></span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-6 md:mb-8 px-2">
            En ExploCocora, somos pioneros en el desarrollo de soluciones tecnológicas para la gestión integral de rutas ecológicas en el Valle de Cocora, uno de los destinos turísticos más emblemáticos de Colombia. Nacimos de la necesidad de preservar este paraíso natural mientras mejoramos la experiencia de los visitantes y optimizamos los recursos disponibles.
          </p>
          <p className="text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed px-2">
            Nuestro equipo multidisciplinario combina la pasión por la naturaleza con la innovación tecnológica, creando herramientas que transforman la manera en que se administran las rutas ecológicas, los guías y los caballos en este entorno montañoso único.
          </p>
        </motion.section>

        {/* Misión, Visión y Valores con iconos */}
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
              <FaLeaf className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
              <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Nuestra Misión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-center sm:text-left">
              Desarrollar soluciones tecnológicas innovadoras que permitan una gestión eficiente y sostenible de las rutas ecológicas en el Valle de Cocora, mejorando la experiencia de los visitantes mientras preservamos el entorno natural y apoyamos a la comunidad local.
            </p>
          </div>
          
          <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
              <FaMapMarkedAlt className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
              <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Nuestra Visión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-center sm:text-left">
              Ser referentes en la implementación de tecnologías para el ecoturismo sostenible, expandiendo nuestras soluciones a otras áreas naturales de Colombia y Latinoamérica, contribuyendo a la preservación ambiental y al desarrollo de un turismo más consciente y responsable.
            </p>
          </div>
          
          <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 lg:col-span-1 md:col-span-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
              <FaTree className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
              <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Nuestros Valores</h3>
            </div>
            <ul className="text-gray-700 leading-relaxed list-disc pl-5 text-center sm:text-left mx-auto sm:mx-0 max-w-md sm:max-w-none">
              <li><span className="font-semibold">Sostenibilidad:</span> Compromiso con la preservación del medio ambiente</li>
              <li><span className="font-semibold">Innovación:</span> Búsqueda constante de soluciones creativas</li>
              <li><span className="font-semibold">Responsabilidad:</span> Hacia la comunidad y el entorno natural</li>
              <li><span className="font-semibold">Excelencia:</span> En cada aspecto de nuestro servicio</li>
            </ul>
          </div>
        </motion.section>

        {/* Lo que hacemos */}
        <motion.section 
          className="mb-12 md:mb-20 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="flex justify-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center relative inline-block">
              Nuestra Solución
              <span className="absolute bottom-0 left-0 w-full h-1 bg-white transform translate-y-2"></span>
            </h2>
          </div>
          
          <div className="flex justify-center px-2">
            <div className="bg-teal-900 bg-opacity-50 p-6 md:p-8 rounded-2xl shadow-lg w-full sm:max-w-xl">
              <div className="flex flex-col items-center mb-4 md:mb-6">
                <div className="bg-teal-600 p-3 md:p-4 rounded-full mb-3">
                  <GiHorseHead className="text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-center">Gestión Integral de Recursos</h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed mb-4 text-center">
                Desarrollamos un sistema que permite el registro y control detallado de caballos, guías y operadores turísticos, optimizando la asignación de recursos y mejorando la experiencia de los visitantes.
              </p>
              <div className="flex justify-center">
                <ul className="list-disc space-y-1 md:space-y-2 text-sm sm:text-base inline-block text-center">
                  <li className="text-left">Registro y monitoreo de caballos</li>
                  <li className="text-left">Gestión eficiente de guías turísticos</li>
                  <li className="text-left">Coordinación de operadores y rutas</li>
                  <li className="text-left">Generación de reportes detallados</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Nuestro Impacto */}
        <motion.section 
          className="bg-teal-900 bg-opacity-30 p-6 md:p-10 rounded-3xl shadow-lg mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8 text-center">Nuestro Impacto</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
            <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-teal-800 to-teal-900 shadow-md">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="bg-teal-600 p-3 md:p-4 rounded-full">
                  <FaUsers className="text-3xl md:text-4xl text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Experiencia Mejorada</h3>
              <p className="text-sm sm:text-base">Reducción de tiempos de espera y mejor organización para los visitantes</p>
            </div>
            
            <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-teal-800 to-teal-900 shadow-md">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="bg-teal-600 p-3 md:p-4 rounded-full">
                  <GiHorseshoe className="text-3xl md:text-4xl text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Bienestar Animal</h3>
              <p className="text-sm sm:text-base">Monitoreo de la condición de los caballos y optimización de su uso</p>
            </div>
            
            <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-teal-800 to-teal-900 shadow-md sm:col-span-2 lg:col-span-1 mx-auto sm:mx-0 max-w-md sm:max-w-none">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="bg-teal-600 p-3 md:p-4 rounded-full">
                  <FaMapMarkedAlt className="text-3xl md:text-4xl text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Preservación Ambiental</h3>
              <p className="text-sm sm:text-base">Contribución a la conservación del Valle de Cocora mediante prácticas sostenibles</p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section 
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6">¿Listo para explorar el Valle de Cocora?</h2>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-6 md:mb-8 px-2">
            Únete a nosotros en esta aventura por uno de los paisajes más hermosos de Colombia, con la tranquilidad de contar con un servicio organizado y comprometido con la naturaleza.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
            <a 
              href="/VistaCliente/NuestrasRutas" 
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-full transition-colors duration-300 shadow-lg text-sm sm:text-base"
            >
              Descubre Nuestras Rutas
            </a>
            <a 
              href="/VistaCliente/Contacto"
              className="bg-transparent hover:bg-white text-white hover:text-teal-800 font-bold py-2 md:py-3 px-6 md:px-8 rounded-full border-2 border-white transition-colors duration-300 mt-3 sm:mt-0 text-sm sm:text-base"
            >
              Contáctanos
            </a>
          </div>
        </motion.section>
      </main>

      {/* Footer Section */}
      <footer className="bg-teal-900 p-6 md:p-8 text-center mt-8">
        <p className="text-base md:text-lg">&copy; 2024 ExploCocora. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default QuienesSomosCliente;
