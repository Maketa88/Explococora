import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Pago from "../../assets/Images/Pago.png";

export const AutorizacionMenores = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener datos de la reserva desde el estado de navegación
  const { formData, rutaInfo, idRuta } = location.state || {};
  
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Si no hay datos suficientes, redirigir al formulario de reserva
  if (!formData || !rutaInfo || !idRuta) {
    navigate('/VistaCliente/reserva-ruta');
    return null;
  }

  // Función para mostrar la alerta de confirmación y luego redirigir al pago
  const mostrarConfirmacionYRedirigir = (radicado) => {
    // Agregar estilos personalizados para el botón de Mercado Pago
    Swal.fire({
      icon: 'success',
      title: t('reservaExitosa', 'Reserva Exitosa'),
      html: `
        <p>${t('reservaCreada', 'Reserva creada con éxito. Radicado:')} <strong>${radicado}</strong></p>
        <p class="mt-3">${t('continuarMercadoPago', 'A continuación debes continuar con el pago a través de Mercado Pago.')}</p>
      `,
      background: '#f5f5f5',
      confirmButtonText: `<div style="display: flex; align-items: center; justify-content: center;">
        <img src="${Pago}" alt="Mercado Pago" style="height: 25px; margin-right: 10px;">
        <span>${t('continuarPago', 'Continuar al Pago')}</span>
      </div>`,
      confirmButtonColor: '#009ee3', // Color azul de Mercado Pago
      allowOutsideClick: false,
      allowEscapeKey: false,
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal-mercadopago-button'
      },
      didOpen: () => {
        // Agregar estilos personalizados para el botón
        const style = document.createElement('style');
        style.innerHTML = `
          .swal-mercadopago-button {
            border-radius: 6px !important;
            font-weight: 600 !important;
            padding: 12px 24px !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          }
        `;
        document.head.appendChild(style);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Cuando el usuario hace clic en el botón, redirigir a la página de pago
        navigate('/VistaCliente/reserva/mercado-libre', {
          state: {
            radicado: radicado,
            rutaInfo: {
              nombreRuta: rutaInfo.nombreRuta,
              precio: rutaInfo.precio,
              cantidadPersonas: formData.cantidadPersonas
            }
          }
        });
      }
    });
  };

  // Función que se ejecuta cuando el usuario hace clic en "Reservar Ahora"
  const handleReservarAhora = async () => {
    if (!aceptaTerminos) {
      setError(t('debesAceptarTerminos', 'Debes aceptar los términos y condiciones para continuar'));
      return;
    }

    setCargando(true);
    setError(null);
    
    try {
      // Enviar los mismos datos que se habrían enviado en el FormularioReservaRuta
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Ingreso', { 
          state: { 
            mensaje: t('debesIniciarSesion', 'Debes iniciar sesión para reservar una ruta'),
            redireccion: `/NuestrasRutas/${idRuta}`
          } 
        });
        return;
      }

      // Realizar la misma petición que haría el formulario original
      const response = await axios.post('http://localhost:10101/pagos-rutas/crear', 
        {
          idRuta: parseInt(idRuta),
          cantidadPersonas: parseInt(formData.cantidadPersonas),
          fechaInicio: formData.fechaInicioISO,
          fechaFin: formData.fechaFinISO,
          horaInicio: formData.horaInicio,
          fechaReserva: formData.fechaReservaMySQL,
          estado: 'pendiente'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Si la respuesta es exitosa, mostrar confirmación con SweetAlert
      if (response.data && response.data.radicado) {
        localStorage.setItem('reserva_pendiente', JSON.stringify({
          radicado: response.data.radicado,
          fechaCreacion: formData.fechaReservaMySQL,
          guiaAsignado: response.data.guiaAsignado || null
        }));
        
        // Mostrar alerta con SweetAlert y luego redirigir
        mostrarConfirmacionYRedirigir(response.data.radicado);
      } else {
        throw new Error(t('respuestaInvalida', 'La respuesta del servidor no es válida'));
      }
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      setError(error.response?.data?.message || error.message || t('errorProcesandoReserva', 'Error al procesar la reserva'));
    } finally {
      setCargando(false);
    }
  };
  
  const handleCancelar = () => {
    navigate(`/VistaCliente/reserva-ruta/${idRuta}`, { state: { rutaInfo } });
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
          {rutaInfo && (
            <p className="text-2xl text-teal-600 font-semibold">
              {rutaInfo.nombreRuta}
            </p>
          )}
        </div>

        {/* Información de la ruta */}
        {rutaInfo && (
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-6 rounded-t-xl shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex flex-wrap items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">{rutaInfo.nombreRuta}</h2>
                <p className="text-teal-100">{rutaInfo.tipo} • {rutaInfo.dificultad}</p>
              </div>
              
              <div className="transform rotate-12">
                <div className="w-24 h-24 relative">
                  <div className="rounded-full bg-teal-50 border-2 border-teal-600 flex items-center justify-center w-full h-full">
                    <span className="text-xs text-teal-800 font-bold text-center">SEGURIDAD VERIFICADA</span>
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
              <span className="text-teal-700 font-semibold">Como padre, madre o representante legal</span>, autorizo la participación de mi hijo o menor a cargo 
              en las actividades de cabalgata o caminata organizadas en el Valle del Cocora, Salento, Quindío, 
              a través del sistema web ExploCocora. Declaro que he leído, comprendido y acepto las políticas 
              de seguridad y restricciones de edad establecidas, las cuales indican que solo pueden participar 
              menores entre los <span className="text-teal-700 font-semibold">4 y 17 años</span>.
            </p>
            
            <div className="flex items-start gap-2">
              
              <p className="leading-relaxed">
                Entiendo que estas actividades pueden implicar ciertos riesgos naturales, como senderos irregulares 
                o resbaladizos, cambios en las condiciones climáticas y el contacto con caballos u otras especies 
                presentes en la zona. Acepto que es mi responsabilidad asegurarme de que el menor cumpla con las 
                normas de seguridad establecidas, siga las instrucciones del personal autorizado y se encuentre 
                en condiciones óptimas de salud para participar.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              
              <p className="leading-relaxed">
                Al marcar esta casilla, confirmo que acepto todas las condiciones y términos aquí establecidos. 
                Asumo la total responsabilidad sobre la participación del menor, sin necesidad de presentar una 
                firma física o documento adicional.
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
          
          {/* Checkbox con estilo mejorado */}
          <div className="flex items-center mt-6 mb-8 p-4 bg-teal-50 rounded-lg border border-teal-200 transition-all duration-200 hover:shadow-md">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="aceptaTerminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="opacity-0 absolute h-6 w-6 cursor-pointer"
              />
              <div className={`bg-white border-2 rounded-md w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-teal-500 transition-colors duration-200 ${aceptaTerminos ? 'border-teal-600 bg-teal-50' : 'border-gray-300'}`}>
                <svg className={`fill-current w-3 h-3 text-teal-600 pointer-events-none ${aceptaTerminos ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              </div>
            </div>
            <label htmlFor="aceptaTerminos" className="ml-2 text-gray-700 font-medium select-none cursor-pointer">
              {t('aceptoTerminos', 'Acepto los términos y condiciones')}
            </label>
          </div>
          
          {/* Botones con estilo mejorado */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
            <button
              onClick={handleCancelar}
              className="order-2 sm:order-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 border border-gray-300 hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('cancelar', 'Cancelar')}
            </button>
            
            <button
              onClick={handleReservarAhora}
              disabled={!aceptaTerminos || cargando}
              className={`order-1 sm:order-2 py-4 px-8 rounded-xl ${
                aceptaTerminos && !cargando
                  ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center`}
            >
              {cargando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('procesando', 'Procesando...')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {t('reservarAhora', 'Reservar Ahora')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutorizacionMenores; 