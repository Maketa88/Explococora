import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaLeaf, FaMapMarkedAlt, FaTree, FaUsers } from "react-icons/fa";
import { GiHorseHead, GiHorseshoe } from "react-icons/gi";
import quienes from "../../assets/Images/carrusel2.webp";
import './quienesSomos.css';

const QuienesSomos = () => {
  useTranslation();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[70vh] md:h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-bottom zoom-effect" 
          style={{ 
            backgroundImage: `url(${quienes})`,
            backgroundAttachment: "fixed"
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative flex flex-col items-center justify-center h-full px-4 text-center z-10">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 md:mb-4 text-white drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            ExploCocora
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto text-white px-2 drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Pioneros en la preservación y gestión sostenible del Valle de Cocora
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto ">
       <section className="relative py-16 px-4 overflow-hidden">
         {/* Fondo decorativo inspirado en el Valle del Cocora */}
         <div className="absolute inset-0 -z-10 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

           {/* Siluetas de palmeras de cera */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg
               viewBox="0 0 1200 600"
               className="w-full h-full"
               preserveAspectRatio="xMidYMid slice"
             >
               {/* Silueta de montaña con árboles */}
               <path
                 d="M0,600 L300,200 L400,300 L500,150 L600,250 L800,100 L1000,300 L1200,200 L1200,600 Z"
                 fill="#047857"
                 opacity="0.3"
               />
               
               {/* Arroyo serpenteante */}
               <path
                 d="M0,450 C100,430 150,470 250,440 C350,410 400,450 500,430 C600,410 650,450 750,430 C850,410 900,450 1000,430 C1100,410 1150,450 1200,430 L1200,500 C1100,520 1050,480 950,500 C850,520 800,480 700,500 C600,520 550,480 450,500 C350,520 300,480 200,500 C100,520 50,480 0,500 Z"
                 fill="#047857"
                 opacity="0.4"
               />
               
               {/* Silueta de árbol 1 - pino */}
               <path
                 d="M200,600 L200,400 L150,400 L200,350 L170,350 L220,300 L190,300 L240,250 L210,250 L250,200 L230,200 L270,150 L250,150 L280,100 L310,150 L290,150 L330,200 L310,200 L350,250 L320,250 L370,300 L340,300 L390,350 L360,350 L410,400 L360,400 L360,600 Z"
                 fill="#047857"
                 opacity="0.7"
               />
               
               {/* Silueta de árbol 2 - frondoso */}
               <path
                 d="M600,600 L600,350 C600,350 550,300 570,250 C590,200 630,220 650,180 C670,140 700,160 720,130 C740,100 780,120 800,150 C820,180 850,160 870,200 C890,240 930,220 950,270 C970,320 920,350 920,350 L920,600 Z"
                 fill="#047857"
                 opacity="0.7"
               />
               
               {/* Silueta de árbol 3 - roble */}
               <path
                 d="M1000,600 L1000,400 C1000,400 950,380 960,340 C970,300 1000,320 1010,280 C1020,240 1050,260 1060,220 C1070,180 1100,200 1110,240 C1120,280 1150,260 1160,300 C1170,340 1200,320 1200,360 C1200,400 1150,400 1150,400 L1150,600 Z"
                 fill="#047857"
                 opacity="0.7"
               />
               
               {/* Flores en el campo - grupo 1 */}
               <g opacity="0.6">
                 <circle cx="150" cy="500" r="15" fill="#047857" />
                 <circle cx="170" cy="485" r="15" fill="#047857" />
                 <circle cx="190" cy="500" r="15" fill="#047857" />
                 <circle cx="170" cy="515" r="15" fill="#047857" />
                 <circle cx="170" cy="500" r="10" fill="#047857" />
               </g>
               
               {/* Flores en el campo - grupo 2 */}
               <g opacity="0.6">
                 <circle cx="450" cy="520" r="15" fill="#047857" />
                 <circle cx="470" cy="505" r="15" fill="#047857" />
                 <circle cx="490" cy="520" r="15" fill="#047857" />
                 <circle cx="470" cy="535" r="15" fill="#047857" />
                 <circle cx="470" cy="520" r="10" fill="#047857" />
               </g>
               
               {/* Flores en el campo - grupo 3 */}
               <g opacity="0.6">
                 <circle cx="750" cy="500" r="15" fill="#047857" />
                 <circle cx="770" cy="485" r="15" fill="#047857" />
                 <circle cx="790" cy="500" r="15" fill="#047857" />
                 <circle cx="770" cy="515" r="15" fill="#047857" />
                 <circle cx="770" cy="500" r="10" fill="#047857" />
               </g>
               
               {/* Mariposas */}
               <g opacity="0.7">
                 {/* Mariposa 1 */}
                 <path
                   d="M300,200 C320,180 340,190 330,210 C340,230 320,240 300,220 C280,240 260,230 270,210 C260,190 280,180 300,200 Z"
                   fill="#047857"
                 />
                 {/* Mariposa 2 */}
                 <path
                   d="M700,150 C720,130 740,140 730,160 C740,180 720,190 700,170 C680,190 660,180 670,160 C660,140 680,130 700,150 Z"
                   fill="#047857"
                 />
                 {/* Mariposa 3 */}
                 <path
                   d="M900,250 C920,230 940,240 930,260 C940,280 920,290 900,270 C880,290 860,280 870,260 C860,240 880,230 900,250 Z"
                   fill="#047857"
                 />
               </g>
             </svg>
           </div>
         </div>
         {/* Introducción */}
         <motion.section 
           className="text-center mb-12 md:mb-20"
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={fadeIn}
         >
           <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 relative inline-block text-emerald-900">
             Quiénes Somos
             <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-700 transform translate-y-2"></span>
           </h2>
           <p className="text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-6 md:mb-8 px-2 text-emerald-900">
             En ExploCocora, somos pioneros en el desarrollo de soluciones tecnológicas para la gestión integral de rutas ecológicas en el Valle de Cocora, uno de los destinos turísticos más emblemáticos de Colombia. Nacimos de la necesidad de preservar este paraíso natural mientras mejoramos la experiencia de los visitantes y optimizamos los recursos disponibles.
           </p>
           <p className="text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed px-2 text-emerald-900">
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
             <h2 className="text-2xl sm:text-3xl font-bold text-center relative inline-block text-emerald-900">
               Nuestra Solución
               <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-700 transform translate-y-2"></span>
             </h2>
           </div>
           
           <div className="flex flex-col md:flex-row justify-center gap-6 px-4">
             <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 w-full sm:max-w-xl">
               <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
                 <GiHorseHead className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
                 <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Gestión Integral de Recursos</h3>
               </div>
               <p className="text-gray-700 leading-relaxed text-center sm:text-left mb-4">
                 Desarrollamos un sistema que permite el registro y control detallado de caballos, guías y operadores turísticos, optimizando la asignación de recursos y mejorando la experiencia de los visitantes.
               </p>
               <ul className="text-gray-700 leading-relaxed list-disc pl-5 text-center sm:text-left mx-auto sm:mx-0 max-w-md sm:max-w-none">
                 <li>Registro y monitoreo de caballos</li>
                 <li>Gestión eficiente de guías turísticos</li>
                 <li>Coordinación de operadores y rutas</li>
                 <li>Generación de reportes detallados</li>
               </ul>
             </div>

             <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 w-full sm:max-w-xl">
               <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
                 <FaMapMarkedAlt className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
                 <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Administración Inteligente de Recursos</h3>
               </div>
               <p className="text-gray-700 leading-relaxed text-center sm:text-left mb-4">
                 Implementamos un sistema avanzado para el registro, seguimiento y control de caballos, guías y operadores turísticos, garantizando una gestión eficiente y una experiencia optimizada para los visitantes.
               </p>
               <ul className="text-gray-700 leading-relaxed list-disc pl-5 text-center sm:text-left mx-auto sm:mx-0 max-w-md sm:max-w-none">
                 <li>Supervisión y control de caballos</li>
                 <li>Gestión centralizada de guías turísticos</li>
                 <li>Coordinación estratégica de operadores y rutas</li>
                 <li>Elaboración de reportes analíticos</li>
               </ul>
             </div>
           </div>
         </motion.section>

         {/* Nuestro Impacto */}
         <motion.section 
           className="mb-12 md:mb-20 text-center"
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={fadeIn}
         >
           <div className="flex justify-center mb-8 md:mb-12">
             <h2 className="text-2xl sm:text-3xl font-bold text-center relative inline-block text-emerald-900">
               Nuestro Impacto
               <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-700 transform translate-y-2"></span>
             </h2>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
               <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
                 <FaUsers className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
                 <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Experiencia Mejorada</h3>
               </div>
               <p className="text-gray-700 leading-relaxed text-center sm:text-left">
                 Reducción de tiempos de espera y mejor organización para los visitantes
               </p>
             </div>
             
             <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
               <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
                 <GiHorseshoe className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
                 <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Bienestar Animal</h3>
               </div>
               <p className="text-gray-700 leading-relaxed text-center sm:text-left">
                 Monitoreo de la condición de los caballos y optimización de su uso
               </p>
             </div>
             
             <div className="bg-white text-teal-800 p-6 md:p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 lg:col-span-1 md:col-span-2 mx-auto md:mx-0 max-w-md md:max-w-none">
               <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
                 <FaMapMarkedAlt className="text-3xl md:text-4xl text-teal-600 mb-2 sm:mb-0 sm:mr-4" />
                 <h3 className="text-xl md:text-2xl font-bold text-center sm:text-left">Preservación Ambiental</h3>
               </div>
               <p className="text-gray-700 leading-relaxed text-center sm:text-left">
                 Contribución a la conservación del Valle de Cocora mediante prácticas sostenibles
               </p>
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
           <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6 text-emerald-900">¿Listo para explorar el Valle de Cocora?</h2>
           <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-6 md:mb-8 px-2 text-emerald-900">
             Únete a nosotros en esta aventura por uno de los paisajes más hermosos de Colombia, con la tranquilidad de contar con un servicio organizado y comprometido con la naturaleza.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
             <a 
               href="/NuestrasRutas" 
               className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-full transition-colors duration-300 shadow-lg text-sm sm:text-base"
             >
               Descubre Nuestras Rutas
             </a>
             <a 
               href="/ContactForm" 
               className="bg-transparent hover:bg-teal-500 text-emerald-900 hover:text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-full border-2 border-emerald-900 transition-colors duration-300 mt-3 sm:mt-0 text-sm sm:text-base"
             >
               Contáctanos
             </a>
           </div>
         </motion.section>
       </section>
      </main>
      
      {/* Footer Section */}
      <footer className="bg-teal-900 p-6 md:p-8 text-center mt-8 text-white">
        <p className="text-base md:text-lg">&copy; 2024 ExploCocora. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default QuienesSomos;
