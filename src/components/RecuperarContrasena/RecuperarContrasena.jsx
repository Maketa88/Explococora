import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IconoExplo } from '../InicioSesion/IconoExplo';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const RecuperarContrasena = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [contrasenia, setContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [tokenValido, setTokenValido] = useState(true);
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [leafPosition, setLeafPosition] = useState([]);

  useEffect(() => {
    // Create random leaf positions
    const leaves = Array.from({ length: 15 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 30 + 10,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));
    setLeafPosition(leaves);
  }, []);

  useEffect(() => {
    // Verificamos que exista un token
    if (!token) {
      setTokenValido(false);
      setError('El enlace de recuperación no es válido');
    }
    
    console.log("Token recibido:", token);
  }, [token]);

  const toggleMostrarContrasenia = () => {
    setMostrarContrasenia(!mostrarContrasenia);
  };

  const validarContrasenia = () => {
    if (contrasenia.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    if (contrasenia !== confirmarContrasenia) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarContrasenia()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // La URL ahora es más simple, solo necesitamos el token
      const url = `https://servicio-explococora.onrender.com/recuperar-contrasenia/${token}`;
      
      console.log("Enviando solicitud a:", url);
      console.log("Datos:", { nuevaContrasenia: contrasenia });
      
      const response = await axios.patch(
        url,
        { nuevaContrasenia: contrasenia }
      );
      
      console.log("Respuesta:", response.data);
      
      setExito(true);
      setTimeout(() => {
        navigate('/Ingreso');
      }, 3000);
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      setError(
        error.response?.data?.message || 
        'Error al actualizar la contraseña. Verifica el enlace o inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (exito || !tokenValido) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative font-nunito">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>
          
          {/* Siluetas de árboles y montañas */}
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
            </svg>
          </div>
          
          {/* Animated waves from the middle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div 
                key={i} 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-emerald-500/30"
                style={{
                  width: `${i * 15}%`,
                  height: `${i * 15}%`,
                  animationDelay: `${i * 0.4}s`,
                  animation: 'wave-expand 4s ease-out infinite',
                  opacity: 1 - i * 0.1
                }}
              ></div>
            ))}
          </div>
          
          {/* Animated elements */}
          {leafPosition.map((leaf, index) => (
            <div 
              key={index}
              className="absolute animate-float z-0 opacity-60"
              style={{
                left: leaf.left,
                // top: leaf.top,
                animationDelay: `${leaf.delay}s`,
                animationDuration: `${leaf.duration}s`
              }}
            >
              <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" 
                  stroke="rgba(4, 120, 87, 0.4)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>

        <div className="max-w-md w-full z-10">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl border border-emerald-200 shadow-lg">
            <div className="mb-4 text-center">
              <IconoExplo />
            </div>
            {exito ? (
              <>
                <h2 className="text-center text-2xl font-bold text-emerald-600 mb-3">
                  ¡Contraseña actualizada!
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  Tu contraseña ha sido actualizada correctamente. Serás redirigido a la página de inicio de sesión.
                </p>
                <button
                  onClick={() => navigate('/Ingreso')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg shadow-emerald-300/30 text-sm font-semibold"
                >
                  Ir al inicio de sesión
                </button>
              </>
            ) : (
              <>
                <h2 className="text-center text-2xl font-bold text-red-600 mb-3">
                  Enlace inválido
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  El enlace para recuperar la contraseña no es válido o ha expirado.
                </p>
                <button
                  onClick={() => navigate('/Ingreso')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg shadow-emerald-300/30 text-sm font-semibold"
                >
                  Volver al inicio de sesión
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Animations */}
        <style>{`
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
            }
            50% {
              transform: translateY(-30px) translateX(20px) rotate(10deg);
            }
            100% {
              transform: translateY(0) translateX(0) rotate(0deg);
            }
          }
          
          @keyframes wave-expand {
            0% {
              transform: translate(-50%, -50%) scale(0.2);
              opacity: 0.9;
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0;
            }
          }
          
          .animate-float {
            animation: float 15s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start -mt-0 overflow-hidden relative font-nunito">
      {/* Background decorative elements */}
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
          </svg>
        </div>
        
        {/* Animated waves from the middle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div 
              key={i} 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-emerald-500/30"
              style={{
                width: `${i * 15}%`,
                height: `${i * 15}%`,
                animationDelay: `${i * 0.4}s`,
                animation: 'wave-expand 4s ease-out infinite',
                opacity: 1 - i * 0.1
              }}
            ></div>
          ))}
        </div>
        
        {/* Animated elements */}
        {leafPosition.map((leaf, index) => (
          <div 
            key={index}
            className="absolute animate-float z-0 opacity-60"
            style={{
              left: leaf.left,
              top: leaf.top,
              animationDelay: `${leaf.delay}s`,
              animationDuration: `${leaf.duration}s`
            }}
          >
            <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" 
                stroke="rgba(4, 120, 87, 0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </div>

      {/* Imagen central y título */}
      <div className="relative z-10 pt-10 mb-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-4">
            <IconoExplo />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-emerald-700 text-sm max-w-md">
            Ingresa tu nueva contraseña para continuar
          </p>
        </div>
      </div>
      
      {/* Formulario */}
      <div className="mx-auto max-w-md w-full px-4 relative z-10">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl border border-emerald-200 shadow-lg">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-emerald-700 text-sm font-medium mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-emerald-400">
                  <FaLock />
                </span>
                <input
                  type={mostrarContrasenia ? "text" : "password"}
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                  className="pl-10 w-full p-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-800 placeholder-emerald-300"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={toggleMostrarContrasenia}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {mostrarContrasenia ? 
                    <FaEyeSlash className="text-emerald-400" /> : 
                    <FaEye className="text-emerald-400" />
                  }
                </button>
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                La contraseña debe tener al menos 8 caracteres
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-emerald-700 text-sm font-medium mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-emerald-400">
                  <FaLock />
                </span>
                <input
                  type={mostrarContrasenia ? "text" : "password"}
                  value={confirmarContrasenia}
                  onChange={(e) => setConfirmarContrasenia(e.target.value)}
                  className="pl-10 w-full p-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-800 placeholder-emerald-300"
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg shadow-emerald-300/30 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/Ingreso')}
                className="text-emerald-600 hover:text-emerald-800 transition-colors duration-300 text-sm"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) translateX(20px) rotate(10deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        @keyframes wave-expand {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        @media (max-width: 640px) {
          .min-h-screen {
            min-height: 100dvh;
          }
        }
      `}</style>
    </div>
  );
};

export default RecuperarContrasena; 