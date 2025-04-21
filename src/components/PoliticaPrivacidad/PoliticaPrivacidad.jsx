import { useTranslation } from 'react-i18next';
import { FaLock, FaUserShield, FaCookieBite, FaClipboardList } from 'react-icons/fa';
import { RiFilePaper2Line, RiShieldUserFill } from 'react-icons/ri';
import { MdSecurity, MdContactMail } from 'react-icons/md';
import { IoShareSocialOutline } from 'react-icons/io5';

export const PoliticaPrivacidad = () => {
  const { t } = useTranslation();

  return (
    <section className="relative mb-10 overflow-hidden">
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

      <div className="container mx-auto px-4">
        <div className="relative py-8 mb-10">
          {/* Bolitas decorativas a los lados */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Bolitas lado izquierdo */}
            <div className="absolute top-1/4 left-4 w-6 h-6 bg-teal-600 rounded-full opacity-20 animate-pulse"></div>
            <div
              className="absolute top-1/2 left-12 w-4 h-4 bg-teal-700 rounded-full opacity-30 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-1/4 left-8 w-5 h-5 bg-teal-500 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>

            {/* Bolitas lado derecho */}
            <div
              className="absolute top-1/3 right-10 w-5 h-5 bg-teal-600 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "0.7s" }}
            ></div>
            <div
              className="absolute top-2/3 right-6 w-7 h-7 bg-teal-700 rounded-full opacity-15 animate-pulse"
              style={{ animationDelay: "1.2s" }}
            ></div>
            <div
              className="absolute bottom-1/3 right-16 w-4 h-4 bg-teal-500 rounded-full opacity-25 animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Líneas decorativas */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>

          {/* Título principal con efectos */}
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-black tracking-tight relative inline-block">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 drop-shadow-sm">
                Política de Privacidad
              </span>
            </h1>

            <div className="mt-2 text-xs font-medium uppercase tracking-widest text-teal-600">
              ✦ TRANSPARENCIA Y PROTECCIÓN ✦
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative">
          {/* Textura sutil de fondo */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20"></div>
        
          {/* Contenido principal */}
          <div className="max-w-[1360px] mx-auto">
            {/* Contenido actual */}
            <div className="space-y-6">
              {/* Sección 1: Introducción */}
              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <RiFilePaper2Line className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    1. Introducción
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    Bienvenido a ExploCocora, una plataforma digital especializada en la facilitación de actividades turísticas dentro del Valle de Cocora, Colombia. A través de nuestra aplicación y sitio web, brindamos una gama de servicios que incluyen la gestión de rutas ecológicas, actividades de ecoturismo, cabalgatas y otras experiencias al aire libre. El presente documento detalla nuestra política de privacidad y los términos de uso bajo los cuales se regula la interacción con nuestra plataforma.
                  </p>
                  <p className="text-gray-700">
                    Al acceder y utilizar los servicios proporcionados por ExploCocora, usted acepta y se compromete a cumplir con los términos y condiciones que aquí se establecen, así como con las políticas relacionadas con la recolección, uso y protección de su información personal.
                  </p>
                </div>
              </div>

              {/* Sección 2: Información que Recopilamos */}
              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <FaClipboardList className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    2. Información que Recopilamos
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    Para proporcionar una experiencia personalizada, optimizada y segura, ExploCocora recopila diferentes tipos de información personal y técnica a lo largo de la interacción con nuestros usuarios. Los tipos de datos que podemos recabar incluyen, entre otros:
                  </p>
                  
                  <h3 className="text-teal-700 font-medium text-lg mb-2 mt-4">2.1. Información Personal</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
                    <li><span className="font-medium">Datos Identificativos:</span> Nombre completo, apellidos, nacionalidad y, cuando sea pertinente, número de documento de identificación (por ejemplo, cédula de ciudadanía o pasaporte).</li>
                    <li><span className="font-medium">Datos de Contacto:</span> Dirección de correo electrónico, número telefónico móvil y/o fijo. Estos datos son esenciales para gestionar la comunicación relacionada con las reservas, la confirmación de servicios y la entrega de información relevante.</li>
                    <li><span className="font-medium">Información Financiera:</span> Detalles asociados con pagos y transacciones, incluidos los métodos de pago, números de tarjeta, e información bancaria, procesados exclusivamente a través de plataformas de pago seguras que cumplen con los más altos estándares de encriptación.</li>
                  </ul>
                  
                  <h3 className="text-teal-700 font-medium text-lg mb-2 mt-4">2.2. Información Relacionada con Reservas y Actividades</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
                    <li><span className="font-medium">Historial de Reservas:</span> Detalles sobre las rutas ecológicas, actividades de ecoturismo y otros paquetes adquiridos. Incluye fechas de las actividades, número de personas, pagos realizados, así como preferencias y solicitudes especiales realizadas durante la reserva.</li>
                    <li><span className="font-medium">Preferencias de Usuario:</span> Datos sobre las rutas o actividades favoritas, tipo de experiencia preferida (por ejemplo, senderismo, cabalgatas, tours ecológicos), así como las calificaciones y comentarios sobre las actividades realizadas.</li>
                  </ul>
                  
                  <h3 className="text-teal-700 font-medium text-lg mb-2 mt-4">2.3. Información Técnica y de Uso</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li><span className="font-medium">Datos de Navegación y Conexión:</span> Dirección IP, detalles del tipo de dispositivo, sistema operativo, versión del navegador utilizado y la localización geográfica aproximada, con el fin de personalizar la experiencia y mejorar la funcionalidad de la plataforma.</li>
                    <li><span className="font-medium">Cookies y Tecnologías de Seguimiento:</span> Utilizamos cookies, píxeles de seguimiento y tecnologías similares para analizar patrones de uso, personalizar la experiencia de navegación, mejorar la eficiencia de nuestros servicios y ofrecer publicidad relevante.</li>
                    <li><span className="font-medium">Registros de Actividad:</span> Mantenemos un registro detallado del uso de la aplicación, incluyendo interacciones con la interfaz de usuario, tiempos de conexión y duración de la actividad dentro de la plataforma.</li>
                  </ul>
                </div>
              </div>
              
              {/* Sección 3: Uso de la Información Recopilada */}
              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <RiShieldUserFill className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    3. Uso de la Información Recopilada
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    La información recopilada es utilizada con los fines específicos de proporcionar y mejorar nuestros servicios, así como para garantizar una experiencia de usuario segura y fluida. El uso de los datos incluye, pero no se limita a:
                  </p>
                  
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li><span className="font-medium">Procesamiento de Reservas:</span> La gestión y confirmación de las reservas realizadas a través de nuestra plataforma, incluida la verificación de pagos y la asignación de recursos para las actividades programadas.</li>
                    <li><span className="font-medium">Personalización de la Experiencia:</span> Utilizamos sus datos de preferencias y comportamientos de navegación para ofrecerle recomendaciones de rutas, actividades y eventos que se ajusten a sus intereses y necesidades específicas.</li>
                    <li><span className="font-medium">Autenticación de Usuario y Seguridad:</span> Implementamos protocolos avanzados de autenticación, incluidos sistemas de autenticación multifactor (MFA), para garantizar que solo los usuarios autorizados accedan a su cuenta y a la información asociada con la misma.</li>
                    <li><span className="font-medium">Mejora de los Servicios:</span> Utilizamos análisis de datos sobre cómo interactúan los usuarios con la plataforma para optimizar continuamente las funcionalidades, la interfaz y la oferta de servicios de ExploCocora.</li>
                    <li><span className="font-medium">Comunicación:</span> Envío de notificaciones esenciales, como confirmaciones de reservas, recordatorios de actividades, alertas de cambios y actualizaciones de seguridad. Además, ofrecemos la opción de recibir newsletters y promociones.</li>
                    <li><span className="font-medium">Cumplimiento de Obligaciones Legales:</span> El procesamiento de información para cumplir con nuestras obligaciones legales, fiscales y regulatorias.</li>
                  </ul>
                </div>
              </div>
              
              {/* Las demás secciones siguiendo el mismo patrón */}
              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <MdSecurity className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    4. Seguridad de la Información
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    ExploCocora adopta medidas de seguridad técnicas, organizativas y físicas robustas para proteger los datos personales de nuestros usuarios. Esto incluye, pero no se limita a:
                  </p>
                  
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li><span className="font-medium">Cifrado de Datos:</span> Utilizamos encriptación avanzada (TLS/SSL) para proteger la transmisión de información personal sensible a través de la plataforma.</li>
                    <li><span className="font-medium">Protección en la Almacenamiento:</span> Los datos personales se almacenan en servidores de alta seguridad, protegidos por capas adicionales de seguridad física y lógica.</li>
                    <li><span className="font-medium">Acceso Controlado:</span> Sólo personal autorizado tiene acceso a la información personal. Utilizamos protocolos de control de acceso estrictos para minimizar los riesgos de acceso no autorizado.</li>
                    <li><span className="font-medium">Monitoreo Continuo:</span> Implementamos soluciones de monitoreo y auditoría para detectar actividades sospechosas o intentos de intrusión en tiempo real.</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <IoShareSocialOutline className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    5. Compartición de Datos con Terceros
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    ExploCocora se compromete a no vender, alquilar ni intercambiar los datos personales de los usuarios con terceros sin su consentimiento explícito. No obstante, podemos compartir datos con terceros en los siguientes casos específicos:
                  </p>
                  
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li><span className="font-medium">Proveedores de Pago:</span> Colaboramos con pasarelas de pago autorizadas, que procesan las transacciones en nombre de ExploCocora. Estos proveedores están sujetos a estrictos acuerdos de confidencialidad y cumplen con los estándares de seguridad de la industria.</li>
                    <li><span className="font-medium">Autoridades Gubernamentales y Regulatorias:</span> En aquellos casos en los que sea requerido por la ley o como resultado de procedimientos legales válidos, podemos compartir información con organismos gubernamentales o autoridades judiciales.</li>
                    <li><span className="font-medium">Socios Comerciales:</span> En el contexto de acuerdos con socios turísticos, operadores locales, restaurantes u otras entidades comerciales, podemos compartir información limitada con su consentimiento explícito, para mejorar la oferta de servicios o realizar promociones conjuntas.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <FaUserShield className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    6. Derechos del Usuario
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    De acuerdo con las normativas legales aplicables, los usuarios tienen los siguientes derechos sobre su información personal:
                  </p>
                  
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li><span className="font-medium">Derecho de Acceso:</span> El usuario tiene el derecho de solicitar acceso a los datos personales que tenemos almacenados, así como detalles sobre cómo se procesan.</li>
                    <li><span className="font-medium">Derecho de Rectificación:</span> El usuario puede solicitar la corrección de datos incorrectos o incompletos.</li>
                    <li><span className="font-medium">Derecho de Cancelación:</span> El usuario puede solicitar la eliminación de su cuenta y de los datos personales asociados, excepto en los casos en los que debamos retener dicha información por obligaciones legales.</li>
                    <li><span className="font-medium">Derecho de Oposición:</span> El usuario puede oponerse al tratamiento de ciertos datos, particularmente para fines de marketing directo.</li>
                    <li><span className="font-medium">Derecho de Portabilidad:</span> El usuario tiene derecho a recibir una copia de sus datos personales en un formato estructurado y legible, para transferirlo a otro proveedor de servicios.</li>
                  </ul>
                  
                  <p className="text-gray-700 mt-3">
                    Los usuarios pueden ejercer estos derechos poniéndose en contacto con nuestro equipo de soporte mediante los canales indicados en la sección 11 de este documento.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <FaCookieBite className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    7. Cookies y Tecnologías de Seguimiento
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    Utilizamos cookies y tecnologías similares para recopilar información sobre la interacción de los usuarios con la plataforma y para ofrecer una experiencia personalizada. Las cookies son archivos pequeños que se almacenan en el dispositivo del usuario y permiten recordar sus preferencias y comportamientos a lo largo de las sesiones.
                  </p>
                  
                  <p className="text-gray-700 mb-3">ExploCocora utiliza cookies para:</p>
                  
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li><span className="font-medium">Mejorar la navegación:</span> Las cookies nos permiten recordar las preferencias del usuario y facilitar el proceso de autenticación.</li>
                    <li><span className="font-medium">Análisis del uso:</span> Herramientas de análisis como Google Analytics nos permiten comprender cómo los usuarios interactúan con la plataforma para mejorar los servicios ofrecidos.</li>
                  </ul>
                  
                  <p className="text-gray-700 mt-3">
                    El usuario tiene la opción de configurar su navegador para rechazar todas las cookies o alertarlo cuando se envíen cookies. Sin embargo, esto puede afectar la funcionalidad de algunos aspectos de la plataforma.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-white p-2.5 rounded-lg shadow-sm mr-3">
                    <FaLock className="w-5 h-5 text-teal-700" />
                  </div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-xl font-medium tracking-wide">
                    8. Uso Responsable del Servicio
                  </h2>
                </div>
                <div className="pl-4">
                  <p className="text-gray-700 mb-4">
                    El uso de ExploCocora está sujeto a ciertas normas y políticas diseñadas para garantizar la seguridad y la calidad de la experiencia de todos los usuarios. Se espera que los usuarios:
                  </p>
                  
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Proporcionen información veraz y precisa. Cualquier intento de fraude o manipulación de los datos será motivo de suspensión inmediata de la cuenta.</li>
                    <li>No utilicen la plataforma con fines ilícitos ni para actividades fraudulentas, y respeten las leyes locales e internacionales aplicables.</li>
                    <li>Cumplan con las recomendaciones y regulaciones de seguridad para las actividades al aire libre, como las indicaciones sobre vestimenta y requisitos físicos para las rutas ecológicas.</li>
                  </ul>
                  
                  <p className="text-gray-700 mt-3">
                    El incumplimiento de estas normas puede dar lugar a la suspensión o cancelación del acceso al servicio.
                  </p>
                </div>
              </div>

              {/* Continuar con las secciones 9, 10 y 11 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                  <div className="relative mb-4 flex items-center">
                    <div className="w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm mr-3"></div>
                    <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-lg font-medium tracking-wide">
                      9. Modificaciones
                    </h2>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm">
                      Nos reservamos el derecho de actualizar y modificar esta Política de Privacidad en cualquier momento. Cualquier cambio será notificado a los usuarios a través de la plataforma o por correo electrónico, y entrará en vigor de inmediato. Se recomienda que los usuarios revisen periódicamente esta sección para estar informados sobre las actualizaciones.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                  <div className="relative mb-4 flex items-center">
                    <div className="w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm mr-3"></div>
                    <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-lg font-medium tracking-wide">
                      10. Sincronización
                    </h2>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm">
                      ExploCocora ofrece funcionalidades de uso offline, permitiendo a los usuarios acceder a información sobre rutas y reservas incluso en áreas sin conexión a internet. En este modo, los datos se almacenan temporalmente en el dispositivo móvil del usuario y se sincronizan automáticamente con la base de datos de ExploCocora cuando la conexión a internet es restablecida.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 flex flex-col shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                  <div className="relative mb-4 flex items-center">
                    <div className="w-1 h-10 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm mr-3"></div>
                    <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 text-lg font-medium tracking-wide flex items-center">
                      <MdContactMail className="w-5 h-5 mr-2" />
                      11. Contacto
                    </h2>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm mb-2">
                      Si tiene alguna duda o inquietud sobre nuestra Política de Privacidad o los Términos de Uso, puede contactarnos a través de:
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li><span className="font-medium">Email:</span> soporte@explococora.com</li>
                      <li><span className="font-medium">Teléfono:</span> +57 310 455 5400</li>
                      <li><span className="font-medium">Sitio web:</span> www.explococora.com</li>
                    </ul>
                    <p className="text-gray-700 text-sm mt-2">
                      Nuestro equipo está disponible para asistirle en el horario de atención de lunes a sábado, de 8:00 a.m. a 6:00 p.m.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nota final */}
              <div className="mt-8 bg-gradient-to-br from-teal-50/90 via-white to-teal-50/70 p-6 rounded-2xl border border-teal-100 shadow-[0_10px_25px_-12px_rgba(13,148,136,0.25)] relative overflow-hidden backdrop-blur-sm">
                <p className="text-gray-600 italic text-center">
                  Este documento es parte integral de la transparencia y compromiso de ExploCocora en proteger la información personal de nuestros usuarios y garantizar el cumplimiento de las leyes de privacidad y protección de datos aplicables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PoliticaPrivacidad; 