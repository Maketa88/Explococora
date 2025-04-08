import { FaBook, FaCalendarAlt, FaUserShield, FaUsers } from 'react-icons/fa';
import { GiMountains } from 'react-icons/gi';
import { HiDocumentText } from 'react-icons/hi';
import { MdPets, MdPrivacyTip, MdSecurity, MdSupport } from 'react-icons/md';

export const TerminosCondiciones = () => {
  return (
    <section className="relative py-12 px-4 overflow-hidden">
      {/* Fondo decorativo inspirado en el Valle del Cocora */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-emerald-100/30 to-white"></div>

        {/* Siluetas de montañas y vegetación */}
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
            
            {/* Siluetas de palmeras y árboles */}
            <path
              d="M200,600 L200,400 L150,400 L200,350 L170,350 L220,300 L190,300 L240,250 L210,250 L250,200 L230,200 L270,150 L250,150 L280,100 L310,150 L290,150 L330,200 L310,200 L350,250 L320,250 L370,300 L340,300 L390,350 L360,350 L410,400 L360,400 L360,600 Z"
              fill="#047857"
              opacity="0.7"
            />
            
            {/* Silueta de palmera */}
            <path
              d="M600,600 L600,350 C600,350 550,300 570,250 C590,200 630,220 650,180 C670,140 700,160 720,130 C740,100 780,120 800,150 C820,180 850,160 870,200 C890,240 930,220 950,270 C970,320 920,350 920,350 L920,600 Z"
              fill="#047857"
              opacity="0.7"
            />
          </svg>
        </div>
        
        {/* Elementos flotantes decorativos */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-8 h-8 bg-emerald-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-20 w-6 h-6 bg-emerald-600 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/3 left-14 w-10 h-10 bg-emerald-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          
          <div className="absolute top-1/3 right-16 w-10 h-10 bg-emerald-500 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 right-10 w-8 h-8 bg-emerald-600 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 right-24 w-6 h-6 bg-emerald-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto max-w-6xl relative">
        {/* Encabezado con efecto especial */}
        <div className="relative py-10 mb-12 text-center">
          {/* Líneas decorativas */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent opacity-80"></div>
          
          {/* Bolitas decorativas a los lados del título */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Bolitas lado izquierdo */}
            <div className="absolute top-1/4 left-4 w-6 h-6 bg-emerald-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-1/2 left-12 w-4 h-4 bg-emerald-700 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 left-8 w-5 h-5 bg-emerald-500 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            
            {/* Bolitas lado derecho */}
            <div className="absolute top-1/3 right-10 w-5 h-5 bg-emerald-600 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
            <div className="absolute top-2/3 right-6 w-7 h-7 bg-emerald-700 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
            <div className="absolute bottom-1/3 right-16 w-4 h-4 bg-emerald-500 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Título principal con decoración */}
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 relative inline-block mx-auto">
            Términos y Condiciones
            <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-emerald-700 transform"></span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-emerald-800 max-w-3xl mx-auto font-light">
            Bienvenido(a) a ExploCocora, Te invitamos a conocer las condiciones que rigen el uso de nuestra plataforma y aseguran una aventura sostenible para todos.
          </p>
        </div>

        {/* Introducción */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-10">
          <p className="text-gray-700 leading-relaxed mb-0">
            Al acceder, navegar y utilizar nuestros servicios a través del sitio web o aplicación móvil, aceptas cumplir con los términos y condiciones que se describen a continuación. Si no estás de acuerdo con alguno de ellos, te solicitamos abstenerte de utilizar la plataforma.
          </p>
        </div>
      
        {/* Secciones de Términos y Condiciones */}
        <div className="space-y-8 mb-12">
          {/* Sección 1: Objeto del Sitio */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            {/* Franja superior decorativa */}
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            
            {/* Contenido */}
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <GiMountains className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  1. Objeto del Sitio
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                ExploCocora ofrece un sistema integral de gestión turística que permite:
              </p>
              
              <ul className="space-y-2 mb-0">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Consultar y reservar rutas ecológicas a pie y a caballo.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Coordinar la disponibilidad de guías, caballos y operadores turísticos locales.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Brindar información actualizada sobre rutas, recomendaciones de seguridad y estado ambiental.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Promover la sostenibilidad y conservación del entorno natural del Valle del Cocora.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Sección 2: Registro y Uso de la Cuenta */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <FaUserShield className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  2. Registro y Uso de la Cuenta
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Para acceder a determinadas funcionalidades, los usuarios deberán registrarse en la plataforma, proporcionando información personal veraz, actual y completa. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso. En caso de uso no autorizado o sospecha de actividad irregular, debe notificarlo inmediatamente al equipo de ExploCocora.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Los perfiles disponibles en la plataforma son: administrador, guía, operador turístico, observador y cliente. Cada uno cuenta con permisos específicos para garantizar la integridad de la información y el correcto funcionamiento del sistema.
              </p>
            </div>
          </div>

          {/* Sección 3: Responsabilidades del Usuario */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <FaUsers className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  3. Responsabilidades del Usuario
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                El usuario se compromete a:
              </p>
              
              <ul className="space-y-2 mb-0">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Usar la plataforma exclusivamente con fines lícitos y conforme a estos términos.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Respetar los horarios, rutas establecidas y recomendaciones de seguridad durante las actividades.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>No alterar, copiar, distribuir o hacer uso indebido de los contenidos disponibles en el sitio.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Mantener un comportamiento respetuoso con los guías, animales, otros turistas y el entorno natural.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Sección 4: Seguridad en Actividades Turísticas */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <MdSecurity className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  4. Seguridad en Actividades Turísticas
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                ExploCocora promueve experiencias turísticas seguras, inclusivas y responsables. Todos los usuarios que participen en caminatas o cabalgatas deben acatar las medidas de seguridad publicadas en el sitio, tales como:
              </p>
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Uso de vestimenta y calzado adecuado.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Respeto por los senderos señalizados.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Reporte inmediato de cualquier incidente o malestar al guía encargado.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                  </span>
                  <p>Prohibición de molestar animales, dañar flora o retirar elementos naturales.</p>
                </li>
              </ul>
              
              <p className="text-gray-700 leading-relaxed mb-0">
                La plataforma no se hace responsable por lesiones, pérdidas o accidentes derivados del incumplimiento de estas medidas.
              </p>
            </div>
          </div>

          {/* Sección 5: Bienestar Animal y Sostenibilidad */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <MdPets className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  5. Bienestar Animal y Sostenibilidad
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                ExploCocora vela por el bienestar de los caballos y la conservación del ecosistema. Está prohibido el uso indebido de los animales o cualquier práctica que ponga en riesgo su salud o comodidad. Los recorridos están organizados para garantizar períodos adecuados de descanso y evitar sobrecargas.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-0">
                Se invita a los usuarios a minimizar su impacto ambiental evitando residuos, siguiendo las rutas marcadas y respetando la flora y fauna locales.
              </p>
            </div>
          </div>

          {/* Sección 6: Política de Reservas, Cancelaciones y Cambios */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <FaCalendarAlt className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  6. Política de Reservas, Cancelaciones y Cambios
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Todas las reservas de rutas están sujetas a disponibilidad. En caso de condiciones climáticas adversas o por motivos logísticos, ExploCocora podrá reprogramar actividades. Las solicitudes de cancelación por parte del usuario deberán realizarse con al menos 24 horas de anticipación.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-0">
                Cualquier reembolso, reprogramación o cambio estará sujeto a las condiciones establecidas por el operador turístico correspondiente.
              </p>
            </div>
          </div>

          {/* Sección 7: Propiedad Intelectual */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <FaBook className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  7. Propiedad Intelectual
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-0">
                Todo el contenido del sitio web y la aplicación móvil, incluyendo textos, fotografías, ilustraciones, mapas, logotipos y diseños, está protegido por derechos de autor y otras leyes de propiedad intelectual. Está prohibida su reproducción total o parcial sin autorización expresa de ExploCocora.
              </p>
            </div>
          </div>

          {/* Sección 8: Protección de Datos Personales */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <MdPrivacyTip className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  8. Protección de Datos Personales
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                ExploCocora garantiza que el tratamiento de los datos personales de sus usuarios se realiza conforme a la legislación colombiana vigente. La información recopilada es utilizada exclusivamente para prestar un servicio eficiente, gestionar reservas, mejorar la experiencia del usuario y enviar comunicaciones relevantes.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-0">
                El usuario puede ejercer sus derechos de acceso, corrección o eliminación de sus datos en cualquier momento, contactando al equipo responsable.
              </p>
            </div>
          </div>

          {/* Sección 9: Modificaciones a los Términos */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <HiDocumentText className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  9. Modificaciones a los Términos
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-0">
                ExploCocora se reserva el derecho de modificar los presentes Términos y Condiciones cuando lo considere necesario. Las modificaciones entrarán en vigor desde el momento de su publicación en la plataforma. Se recomienda al usuario revisar esta sección de forma periódica.
              </p>
            </div>
          </div>

          {/* Sección 10: Contacto y Soporte */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-3 rounded-xl shadow-md">
                  <MdSupport className="text-2xl md:text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                  10. Contacto y Soporte
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-0">
                Para cualquier inquietud, sugerencia, reclamación o solicitud de información relacionada con los servicios ofrecidos por ExploCocora, puedes comunicarte con nuestro equipo a través del formulario de contacto disponible en la web, vía correo electrónico o mediante nuestras redes sociales oficiales.
              </p>
            </div>
          </div>
        </div>
        
        {/* Firma y fechas */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-8 text-center">
          <p className="text-emerald-700 mb-2 font-semibold">Última actualización: Abril 2025</p>
          <p className="text-gray-700">
            Al utilizar nuestra plataforma, aceptas los términos y condiciones aquí descritos.
          </p>
        </div>
        
        
        {/* Elemento decorativo final */}
        <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent opacity-70 mx-auto mb-6"></div>
      </div>
    </section>
  )
}
