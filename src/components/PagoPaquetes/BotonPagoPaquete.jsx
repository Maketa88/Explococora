import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const BotonPagoPaquete = ({ paquete, className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si el botón debería estar habilitado: solo verificamos que el paquete exista y tenga precio
  const estaHabilitado = paquete && paquete.idPaquete && paquete.precio > 0;

  const iniciarProcesoPago = async () => {
    // Verificar si hay un token (usuario autenticado)
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirigir a inicio de sesión si no hay token
      navigate('/Ingreso', { 
        state: { 
          mensaje: t('debesIniciarSesion', 'Debes iniciar sesión para reservar un paquete'),
          redireccion: `/Paquetes/${paquete.idPaquete}`
        } 
      });
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // Siempre usar la ruta absoluta para navegar al formulario de reserva
      navigate(`/VistaCliente/reserva-paquete/${paquete.idPaquete}`, { 
        state: { 
          paqueteInfo: paquete
        }
      });
    } catch (error) {
      console.error('Error al iniciar proceso de pago:', error);
      setError(t('errorProcesoPago', 'Ocurrió un error al iniciar el proceso de pago. Inténtalo de nuevo.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={iniciarProcesoPago}
        disabled={!estaHabilitado || cargando}
        className={`${className || 'py-3 px-6 rounded-xl'} 
          ${estaHabilitado 
            ? 'bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-300' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
          relative overflow-hidden group flex items-center justify-center`}
      >
        {/* Animación de carga */}
        {cargando && (
          <div className="absolute inset-0 flex items-center justify-center bg-teal-600 bg-opacity-90">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Contenido del botón */}
        <div className="relative z-10 flex items-center">
          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="font-medium tracking-wide">
            {t('reservarPaquete', 'Reservar Paquete')}
          </span>
        </div>

        {/* Efecto decorativo */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
            <div className="absolute -inset-[100%] bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-[shimmer_4s_ease_infinite]"></div>
          </div>
        </div>
      </button>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 text-red-500 text-sm bg-red-50 p-2 rounded shadow-sm border border-red-100">
          {error}
        </div>
      )}

      
    </div>
  );
};

export default BotonPagoPaquete; 