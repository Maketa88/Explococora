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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-2">
          {t('reservarRuta', 'Reservar Ruta')}
        </h1>
        {rutaInfo && (
          <p className="text-xl text-teal-600">
            {rutaInfo.nombreRuta}
          </p>
        )}
      </div>

      {/* Información de la ruta */}
      {rutaInfo && (
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-6 rounded-t-xl">
          <div className="flex flex-wrap items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">{rutaInfo.nombreRuta}</h2>
              <p className="text-teal-100">{rutaInfo.tipo} • {rutaInfo.dificultad}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold">
                ${Number(rutaInfo.precio).toLocaleString('es-CO')} <span className="text-sm font-normal">COP</span>
              </div>
              <div className="text-sm text-teal-100">{t('porPersona', 'por persona')}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-b-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Autorización y Cumplimiento de Políticas de Seguridad para Menores de Edad
        </h2>
        
        <div className="text-gray-700 space-y-4 mb-6">
          <p>
            Como padre, madre o representante legal, autorizo la participación de mi hijo o menor a cargo 
            en las actividades de cabalgata o caminata organizadas en el Valle del Cocora, Salento, Quindío, 
            a través del sistema web ExploCocora. Declaro que he leído, comprendido y acepto las políticas 
            de seguridad y restricciones de edad establecidas, las cuales indican que solo pueden participar 
            menores entre los 4 y 17 años.
          </p>
          
          <p>
            Entiendo que estas actividades pueden implicar ciertos riesgos naturales, como senderos irregulares 
            o resbaladizos, cambios en las condiciones climáticas y el contacto con caballos u otras especies 
            presentes en la zona. Acepto que es mi responsabilidad asegurarme de que el menor cumpla con las 
            normas de seguridad establecidas, siga las instrucciones del personal autorizado y se encuentre 
            en condiciones óptimas de salud para participar.
          </p>
          
          <p>
            Al marcar esta casilla, confirmo que acepto todas las condiciones y términos aquí establecidos. 
            Asumo la total responsabilidad sobre la participación del menor, sin necesidad de presentar una 
            firma física o documento adicional.
          </p>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resumen de la reserva */}
        {formData.cantidadPersonas > 0 && rutaInfo?.precio && (
          <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-100">
            <h3 className="text-lg font-semibold text-teal-800 mb-2">{t('resumenReserva', 'Resumen de la reserva')}</h3>
            
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('precioUnitario', 'Precio unitario')}:</span>
                <span className="font-medium">${Number(rutaInfo.precio).toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cantidadPersonas', 'Cantidad de personas')}:</span>
                <span className="font-medium">{formData.cantidadPersonas}</span>
              </div>
              <div className="border-t border-teal-200 my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-teal-800">{t('total', 'Total')}:</span>
                <span className="text-teal-800">${(formData.cantidadPersonas * Number(rutaInfo.precio)).toLocaleString('es-CO')} COP</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center mt-6 mb-6">
          <input
            type="checkbox"
            id="aceptaTerminos"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
          />
          <label htmlFor="aceptaTerminos" className="ml-2 text-gray-700">
            {t('aceptoTerminos', 'Acepto los términos y condiciones')}
          </label>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={handleCancelar}
            className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('cancelar', 'Cancelar')}
          </button>
          
          <button
            onClick={handleReservarAhora}
            disabled={!aceptaTerminos || cargando}
            className={`py-4 px-8 rounded-xl ${
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
  );
};

export default AutorizacionMenores; 