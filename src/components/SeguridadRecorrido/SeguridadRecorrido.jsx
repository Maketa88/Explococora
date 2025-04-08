import { FaHiking, FaShieldAlt } from 'react-icons/fa';
import { GiBackpack, GiHorseshoe } from 'react-icons/gi';
import { MdOutlineSecurity, MdTipsAndUpdates } from 'react-icons/md';

export const SeguridadRecorrido = () => {
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
        <div className="relative py-10 mb-16 text-center">
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
            Seguridad en Recorridos
            <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-emerald-700 transform"></span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-emerald-800 max-w-3xl mx-auto font-light italic">
            &ldquo;Vivimos la aventura con respeto, cuidemos cada sendero&rdquo;
          </p>
        </div>
      
        {/* Sección de Seguridad en Caminatas */}
        <div className="mb-20">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            {/* Franja superior decorativa */}
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-3"></div>
            
            {/* Contenido principal */}
            <div className="p-6 md:p-10">
              <div className="flex items-center mb-8">
                <div className="mr-5 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-4 rounded-2xl shadow-lg">
                  <FaHiking className="text-5xl md:text-6xl" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2">
                  Seguridad en Caminatas
                </h2>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Las caminatas ecológicas son ideales para sumergirse en la naturaleza del Valle del Cocora. Para ofrecer una experiencia segura, hemos implementado protocolos orientados a la prevención de riesgos, sostenibilidad y accesibilidad.
              </p>
              
              {/* Protocolos */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center">
                  <span className="inline-block p-2 bg-emerald-100 rounded-full mr-3">
                    <FaShieldAlt className="h-6 w-6 text-emerald-600" />
                  </span>
                  Protocolos y medidas de seguridad
                </h3>
                
                <div className="bg-emerald-50/60 rounded-2xl p-6 shadow-inner">
                  <ul className="space-y-4">
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Senderos clasificados por nivel de dificultad:</span> Cada ruta está categorizada como fácil, intermedia o avanzada, permitiendo que el visitante elija la más adecuada según su condición física y experiencia.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Inspección y señalización constante:</span> Los senderos se revisan regularmente para asegurar su buen estado y cuentan con señalización clara y visible.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Guías capacitados:</span> Todos nuestros guías han sido formados en primeros auxilios, orientación en campo y manejo de grupos en terreno natural.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Puntos de descanso estratégicos:</span> Se incluyen áreas seguras para hidratarse, orientarse y descansar durante el recorrido.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Monitoreo del clima:</span> Se emiten alertas en tiempo real ante condiciones meteorológicas adversas.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Cobertura de red y asistencia:</span> En puntos clave de las rutas se dispone de conectividad para llamadas de emergencia o asistencia remota.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Recomendaciones */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center">
                  <span className="inline-block p-2 bg-emerald-100 rounded-full mr-3">
                    <MdTipsAndUpdates className="h-6 w-6 text-emerald-600" />
                  </span>
                  Recomendaciones para caminantes
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Usa ropa deportiva, calzado cómodo con buen agarre y protección solar.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Camina acompañado y dentro de los horarios establecidos.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>No abandones los senderos señalizados ni retires marcas o señales del camino.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Informa inmediatamente al guía si presentas malestar, fatiga o lesión.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Respeta la flora y fauna local: no alimentes ni molestes a los animales, ni arranques plantas.</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Lleva suficiente agua y snacks ligeros para mantenerte hidratado y con energía durante todo el recorrido.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-10">
                <p className="text-xl text-emerald-800 font-semibold italic px-4 py-3 border-t border-b border-emerald-100">
                  &ldquo;Caminamos contigo paso a paso. En ExploCocora, la seguridad es parte del paisaje.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de Seguridad en Cabalgatas */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            {/* Franja superior decorativa */}
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 h-3"></div>
            
            {/* Contenido principal */}
            <div className="p-6 md:p-10">
              <div className="flex items-center mb-8">
                <div className="mr-5 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-4 rounded-2xl shadow-lg">
                  <GiHorseshoe className="text-5xl md:text-6xl" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 border-b-2 border-emerald-200 pb-2">
                  Seguridad en Cabalgatas
                </h2>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Las cabalgatas permiten recorrer el Valle de Cocora de forma tradicional, serena y contemplativa. Nuestro compromiso es ofrecer una experiencia segura tanto para los visitantes como para los caballos, promoviendo el bienestar animal y la interacción respetuosa.
              </p>
              
              {/* Protocolos */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center">
                  <span className="inline-block p-2 bg-emerald-100 rounded-full mr-3">
                    <MdOutlineSecurity className="h-6 w-6 text-emerald-600" />
                  </span>
                  Protocolos y medidas de seguridad
                </h3>
                
                <div className="bg-emerald-50/60 rounded-2xl p-6 shadow-inner">
                  <ul className="space-y-4">
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Evaluación previa del jinete:</span> Se realiza una breve entrevista al visitante antes de iniciar el recorrido, para asignar un caballo y ruta según su experiencia y estado físico.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Caballos entrenados y saludables:</span> Los equinos reciben atención veterinaria periódica, tienen descansos programados y son entrenados para convivir con turistas en ambientes naturales.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Supervisión profesional:</span> Un guía montado acompaña cada grupo, preparado para brindar asistencia inmediata en caso de emergencia o contratiempo.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Control de uso responsable:</span> Se limita el peso por jinete, se rota el uso de los caballos y se restringe el número de recorridos diarios por animal.
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="flex-shrink-0 h-6 w-6 bg-emerald-200 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="h-3 w-3 bg-emerald-500 rounded-full"></span>
                      </span>
                      <div>
                        <span className="font-semibold text-emerald-800">Equipos revisados:</span> Todos los arreos y monturas son inspeccionados antes de cada salida para garantizar su buen estado y comodidad.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Recomendaciones */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center">
                  <span className="inline-block p-2 bg-emerald-100 rounded-full mr-3">
                    <MdTipsAndUpdates className="h-6 w-6 text-emerald-600" />
                  </span>
                  Recomendaciones para jinetes
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Utiliza el casco de protección proporcionado por el operador.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>No fuerces al animal ni lo hagas correr.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Mantén siempre una postura equilibrada y firme, sin soltar las riendas.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Evita movimientos bruscos, gritos o acciones que puedan asustar al caballo.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Respeta los descansos del animal y sigue todas las indicaciones del guía.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-50/40 p-4 rounded-xl shadow-sm flex items-start">
                    <span className="text-emerald-700 font-bold mr-2 text-xl">•</span>
                    <p>Si nunca has montado, solicita asistencia adicional al inicio del recorrido.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-10">
                <p className="text-xl text-emerald-800 font-semibold italic px-4 py-3 border-t border-b border-emerald-100">
                  &ldquo;Montar con respeto es honrar la tradición del Cocora. En ExploCocora, cuidamos cada detalle para que vivas una cabalgata inolvidable y segura.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Elemento decorativo final */}
        <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent opacity-70 mx-auto mb-6"></div>
      </div>
    </section>
  )
}
