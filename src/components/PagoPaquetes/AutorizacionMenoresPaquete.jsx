import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChild } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

export const AutorizacionMenoresPaquetes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener datos de la reserva desde el estado de navegación
  const { formData, paqueteInfo, idPaquete } = location.state || {};
  
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState(null);

  // Si no hay datos suficientes, redirigir al formulario de reserva
  if (!formData || !paqueteInfo || !idPaquete) {
    navigate('/VistaCliente/reserva-paquete');
    return null;
  }

  // Función que se ejecuta cuando el usuario hace clic en "Continuar"
  const handleReservarAhora = async () => {
    if (!aceptaTerminos) {
      setError(t('debesAceptarTerminos', 'Debes aceptar los términos y condiciones para continuar'));
      return;
    }

    // Redirigir al componente de aceptación de riesgos
    navigate('/VistaCliente/reserva/aceptacion-riesgos-paquete', {
      state: {
        formData,
        paqueteInfo,
        idPaquete
      }
    });
  };
  
  const handleCancelar = () => {
    navigate(`/VistaCliente/reserva-paquete/${idPaquete}`, { state: { paqueteInfo } });
  };

  return (
    <section className="relative py-10 px-4 overflow-hidden">
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
      
      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto">
        {/* Encabezado con fondo decorativo */}
        <div className="relative mb-10 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-50 to-transparent opacity-70 rounded-3xl"></div>
          </div>
          <h1 className="text-4xl font-bold text-teal-800 mb-3">
            {t('reservarRuta', 'Reservar Ruta')}
          </h1>
          {paqueteInfo && (
            <p className="text-2xl text-teal-600 font-semibold">
              {paqueteInfo.nombrePaquete}
            </p>
          )}
        </div>

        {/* Información de la ruta */}
        {paqueteInfo && (
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-6 rounded-t-xl shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex flex-wrap items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">{paqueteInfo.nombrePaquete}</h2>
                <p className="text-teal-100">{paqueteInfo.tipo} • {paqueteInfo.dificultad}</p>
              </div>
              
              <div className="transform rotate-12">
                <div className="w-24 h-24 relative">
                  <div className="rounded-full bg-teal-50 border-2 border-teal-600 flex items-center justify-center w-full h-full">
                    <FaChild className="h-12 w-12 text-teal-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative bg-white rounded-b-xl shadow-lg p-8 border-t-4 border-teal-500">
          {/* Líneas decorativas laterales */}
          <div className="absolute left-0 top-10 bottom-10 w-1 bg-gradient-to-b from-teal-500 via-teal-300 to-teal-500 rounded-r-full"></div>
          <div className="absolute right-0 top-10 bottom-10 w-1 bg-gradient-to-b from-teal-500 via-teal-300 to-teal-500 rounded-l-full"></div>

          {/* Título con icono */}
          <div className="flex items-center justify-center gap-3 mb-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-2xl font-bold text-teal-800">
              Autorización y Cumplimiento de Políticas de Seguridad para Menores de Edad
            </h2>
          </div>
          
          {/* Contenido con diseño mejorado */}
          <div className="text-gray-700 space-y-6 mb-8 px-4 py-6 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100 shadow-sm text-justify">
            <p className="leading-relaxed">
              <span className="text-teal-700 font-semibold">Como padre, madre o representante legal</span>, autorizo la participación de mi hijo/a o menor a cargo en la actividad de cabalgata o caminata organizada en el Valle del Cocora, Salento, Quindío, a través de la Pagina Web Explococora Declaro que he sido informado/a sobre los riesgos inherentes a esta actividad y acepto las normas de seguridad establecidas, incluyendo las restricciones de edad aplicables a menores entre 12 y 18 años, según la Norma Técnica Sectorial AV 014.
            </p>
            
            <div className="flex items-start gap-2">
              <p className="leading-relaxed">
                Entiendo que la cabalgata o caminata puede implicar ciertos riesgos naturales, como terrenos irregulares, cambios climáticos inesperados y la interacción con caballos u otros animales presentes en la zona. La operadora turística ha explicado de manera clara y suficiente las medidas de seguridad implementadas, incluyendo su plan de prevención, atención y respuesta ante emergencias.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <p className="leading-relaxed">
                Declaro que el menor se encuentra en condiciones óptimas de salud y no presenta contraindicaciones médicas para participar en la actividad. Asimismo, comprendo y acepto las normas reguladoras de la cabalgata o caminata, y asumo la total responsabilidad por cualquier eventualidad que pueda ocurrirle al menor durante el recorrido, exceptuando aquellas derivadas de negligencia por parte de la organización.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <p className="leading-relaxed">
                Confirmo que la operadora turística no proporciona alimentos y no se hace responsable por los alimentos consumidos durante la actividad.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <p className="leading-relaxed">
                La actividad cuenta con cobertura de seguro de accidentes personales a través de la Compañía Suramericana de Seguros, bajo las pólizas N° 0844000581780 y 90000647859.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <p className="leading-relaxed">
                Autorizo el uso de imágenes capturadas durante la cabalgata o caminata para su posible publicación en la página web, redes sociales o boletín informativo de Explococora.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <p className="leading-relaxed">
                Al marcar esta casilla, autorizo la participación del menor en el recorrido y confirmo que acepto todas las condiciones y términos aquí establecidos. Asumo la total responsabilidad sobre la participación del menor, sin necesidad de presentar una firma física o documento adicional.
              </p>
            </div>
          </div>
          
          {/* Mensaje de error */}
          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Aceptación de términos */}
          <div className="mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="aceptarTerminos"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="aceptarTerminos" className="ml-3 block text-sm text-gray-700">
                  <span className="font-medium">He leído y comprendo todas las condiciones establecidas para la participación de menores de edad.</span> Como representante legal del menor, autorizo su participación y asumo la responsabilidad que esto conlleva, eximiendo a Explococora y sus guías de cualquier responsabilidad, salvo en casos de negligencia por parte de la organización.
                </label>
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={handleCancelar}
              className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-300"
            >
              {t('volver', 'Volver')}
            </button>
            
            <button
              type="button"
              onClick={handleReservarAhora}
              disabled={!aceptaTerminos}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                aceptaTerminos
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('continuar', 'Continuar')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutorizacionMenoresPaquetes; 