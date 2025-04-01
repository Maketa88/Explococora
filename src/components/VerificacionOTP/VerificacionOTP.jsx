import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { IconoExplo } from "../InicioSesion/IconoExplo";

export const VerificacionOTP = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { verificarOTP } = useAuth();
  
  // Extraer datos de la ubicación
  const { userId, role, verificationEndpoint } = location.state || {};
  
  // Animation state
  const [leafPosition, setLeafPosition] = useState([]);
  
  useEffect(() => {
    if (!userId || !role) {
      navigate("/");
      return;
    }

    // Create random leaf positions
    const leaves = Array.from({ length: 15 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 30 + 10,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));
    setLeafPosition(leaves);

    // Contador regresivo
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, role, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    if (timeLeft === 0) {
      setError("El código ha expirado. Por favor, inicie sesión nuevamente.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await verificarOTP({ userId, otp, role });
    } catch (err) {
      setError(err.message || "Error al verificar el código");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-0 overflow-hidden relative font-nunito">
      {/* Background decorative elements - pushed to back with z-index */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

        {/* Siluetas de palmeras de cera */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          {/* SVG background */}
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
              <circle cx="470" cy="505" r="20" fill="#047857" />
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
        
        {/* Animated leaves */}
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

      {/* Header section - positioned at top with higher z-index */}
      <div className="relative z-10 w-full bg-white/30 backdrop-blur-sm py-4 px-4 flex flex-col items-center">
        <div className="transform transition-all duration-500 hover:scale-105 mb-2">
          <IconoExplo />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-800 text-center mb-1">
          Verificación de Código
        </h1>
        <p className="text-emerald-700/90 text-center max-w-lg text-sm">
          Hemos enviado un código de verificación a tu correo electrónico
        </p>
      </div>

      {/* Main content - properly spaced from header */}
      <div className="w-full max-w-4xl z-10 px-4 py-2 -mt-32 flex-1 flex items-center justify-center">
        <div className="mx-auto max-w-md w-full">
          <div className="opacity-70 border-r-4 border-l-4 border-emerald-600 bg-white/80 backdrop-blur-md p-5 rounded-xl border shadow-lg overflow-hidden relative">
            {timeLeft > 0 ? (
              <div className="text-center mb-4">
                <p className="text-sm text-emerald-700">El código expira en:</p>
                <p className="text-xl font-bold text-emerald-500">{formatTime(timeLeft)}</p>
              </div>
            ) : (
              <p className="text-center text-red-500 mb-4">
                El código ha expirado. Por favor, inicie sesión nuevamente.
              </p>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-emerald-700 text-sm font-bold mb-2">
                  Código de verificación (6 dígitos)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleChange}
                  placeholder="Ingrese el código de 6 dígitos"
                  className="w-full p-3 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300 text-center text-2xl tracking-widest"
                  maxLength={6}
                  disabled={timeLeft === 0}
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg shadow-emerald-300/30 text-sm font-semibold"
                disabled={loading || timeLeft === 0 || otp.length !== 6}
              >
                {loading ? "Verificando..." : "Verificar código"}
              </button>
            </form>
            
            <p className="mt-4 text-center text-emerald-700">
              ¿No recibiste el código? <button
                onClick={() => navigate("/")}
                className="text-emerald-800 font-bold hover:text-emerald-900 transition-colors duration-300 hover:underline"
              >
                Volver a iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Responsive adjustments for different screen sizes */}
      <style>{`
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .min-h-screen {
            min-height: 100dvh; /* Use dynamic viewport height on mobile */
          }
        }

        /* Existing animations */
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
        
        @keyframes gallop {
          0% {
            transform: translateX(20px) translateY(0px);
          }
          25% {
            transform: translateX(0px) translateY(-15px);
          }
          50% {
            transform: translateX(-20px) translateY(0px);
          }
          75% {
            transform: translateX(0px) translateY(15px);
          }
          100% {
            transform: translateX(20px) translateY(0px);
          }
        }
        
        @keyframes draw {
          0% {
            stroke-dasharray: 1500;
            stroke-dashoffset: 1500;
          }
          100% {
            stroke-dasharray: 1500;
            stroke-dashoffset: 0;
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
        
        .animate-gallop {
          animation: gallop 6s ease-in-out infinite;
        }
        
        .animate-draw {
          animation: draw 3s ease-in-out forwards;
        }
        
        .animate-draw-delay {
          animation: draw 2s ease-in-out 1s forwards;
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
        }
        
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
          10%, 90% {
            transform: translateX(-1px);
          }
          20%, 80% {
            transform: translateX(2px);
          }
          30%, 50%, 70% {
            transform: translateX(-4px);
          }
          40%, 60% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </div>
  );
}; 