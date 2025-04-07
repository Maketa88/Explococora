import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaIdCard, FaUser } from "react-icons/fa";
import Swal from "sweetalert2";
import Colombia from "../../assets/Images/Colombia.png";
import Usa from "../../assets/Images/Usa.png";
import { IconoExplo } from "../../components/InicioSesion/IconoExplo";
import { InputRegistro } from "../../components/InicioSesion/Input";
import { HookContrasenia } from "../../hooks/HookContrasenia";
import { RegistroCliente } from "../../services/RegistroCliente";

export const Registro = () => {
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    cedula: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    contrasenia: "",
  });

  const [errors, setErrors] = useState([]);
  const [leafPosition, setLeafPosition] = useState([]);

  useEffect(() => {
    setErrors([]);
    
    // Create random leaf positions para elementos decorativos
    const leaves = Array.from({ length: 15 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 30 + 10,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));
    setLeafPosition(leaves);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await RegistroCliente(formData);
      if (response) {
        Swal.fire({
          html: `
            <div style="
              display: flex; 
              flex-direction: column; 
              align-items: center;
              border: 4px solid #004d40;
              border-radius: 12px;
              padding: 20px;
              background-color: #ffffff;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            ">
              <div style="
                display: flex; 
                flex-direction: column; 
                align-items: center;
                border-radius: 8px;
                padding: 10px;
              ">
                <img src="https://i.pinimg.com/originals/bf/fc/c2/bffcc2de14a013a2e7a795668846cae5.gif" 
                    alt="Caballo corriendo" 
                    width="150" 
                    style="margin-bottom: 10px; border-radius: 8px;">
                <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                    alt="Logo ExploCocora" 
                    width="120" 
                    style="border-radius: 8px;">
              </div>
              <h2 style="
                font-size: 28px; 
                font-weight: bold; 
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                margin-top: 15px;
                text-align: center;
                white-space: nowrap;
              ">
                ${t('registroExitoso')}
              </h2>
              <p style="
                font-size: 18px; 
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                text-align: center; 
                margin-top: 10px;
              ">
                ${t('usuarioRegistrado')}
              </p>
              <button id="cerrarAlerta" style="
                margin-top: 15px;
                padding: 10px 20px;
                background-color: #38a169;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.3s ease;
              ">
                OK
              </button>
            </div>
          `,
          showConfirmButton: false,
          didOpen: () => {
            document.getElementById("cerrarAlerta").addEventListener("click", () => {
              Swal.close();
            });
          }
        });

        setFormData({
          cedula: "",
          primerNombre: "",
          segundoNombre: "",
          primerApellido: "",
          segundoApellido: "",
          email: "",
          contrasenia: "",
        });

        setErrors([]);
      }
    } catch (error) {
      // Manejar errores del backend
      const errorList = error.errors || [];
      setErrors([{ msg: error.message }, ...errorList]);
    }
  };

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevoIdioma);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-0 overflow-hidden relative font-nunito p-4">
      {/* Background decorative elements - pushed to back with z-index */}
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
       
        <div className="">
        <div className="transform transition-all duration-500 hover:scale-105 mb-2">
          <IconoExplo />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-800 text-center mb-1">
          {t('tituloRegistro')}
        </h1>
        <p className="text-emerald-700/90 text-center max-w-lg text-sm">
          {t('subtituloRegistro')}
        </p>
        </div>
      </div>

      {/* Main content - properly spaced from header */}
      <div className="w-full max-w-4xl z-10 px-4 py-2 flex-1 flex items-center justify-center">
        <div className="mx-auto max-w-2xl w-full">
          <div className="opacity-70 border-r-4 border-l-4 border-emerald-600 bg-white/80 backdrop-blur-md p-5 rounded-xl border shadow-lg overflow-hidden relative">
            <form onSubmit={handleRegister} className="space-y-3">
            <div className="absolute top-2 right-4 flex items-center space-x-2">
          <button 
            onClick={cambiarIdioma} 
            className={`transition-opacity ${i18n.language === 'es' ? 'opacity-100' : 'opacity-50'}`}
          >
            <img 
              src={Colombia} 
              alt="Bandera de Colombia"
              className="w-8 h-8 object-cover rounded"
            />
          </button>
          <span className="text-emerald-700">|</span>
          <button 
            onClick={cambiarIdioma}
            className={`transition-opacity ${i18n.language === 'en' ? 'opacity-100' : 'opacity-50'}`}
          >
            <img 
              src={Usa} 
              alt="USA Flag"
              className="w-8 h-8 object-cover rounded"
            />
          </button>
        </div>
              <div className="mb-3">
                <InputRegistro
                  label={t('nombre')}
                  id="cedula"
                  placeholder={t('cedulaPlaceholder')}
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                  icon={FaIdCard}
                  className="w-full p-2 pl-9 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <InputRegistro
                    label={t('primerNombre')}
                    id="primerNombre"
                    placeholder={t('primerNombrePlaceholder')}
                    value={formData.primerNombre}
                    onChange={handleChange}
                    required
                    icon={FaUser}
                    className="w-full p-2 pl-9 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300"
                  />
                </div>
                <div>
                  <InputRegistro
                    label={t('segundoNombre')}
                    id="segundoNombre"
                    placeholder={t('segundoNombrePlaceholder')}
                    value={formData.segundoNombre}
                    onChange={handleChange}
                    className="w-full p-2 pl-9 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <InputRegistro
                    label={t('primerApellido')}
                    id="primerApellido"
                    placeholder={t('primerApellidoPlaceholder')}
                    value={formData.primerApellido}
                    onChange={handleChange}
                    required
                    icon={FaUser}
                    className="w-full p-2 pl-9 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300"
                  />
                </div>
                <div>
                  <InputRegistro
                    label={t('segundoApellido')}
                    id="segundoApellido"
                    placeholder={t('segundoApellidoPlaceholder')}
                    value={formData.segundoApellido}
                    onChange={handleChange}
                    className="w-full p-2 pl-9 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="mb-3">
                <InputRegistro
                  label={t('email')}
                  type="email"
                  id="email"
                  placeholder={t('email')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon={FaEnvelope}
                  className="w-full p-2 pl-9 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300"
                />
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-emerald-700 text-base">
                    {t('Contraseña')}
                  </label>
                </div>
                <HookContrasenia
                  value={formData.contrasenia}
                  onChange={(e) =>
                    setFormData({ ...formData, contrasenia: e.target.value })
                  }
                  className="w-full p-3 pl-9 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-emerald-800 placeholder-emerald-300 transition-all duration-300"
                />
              </div>

              {errors.length > 0 && (
                <div className="p-3 mb-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm shake">
                  {errors.map((error, index) => (
                    <p key={index}>{error.msg}</p>
                  ))}
                </div>
              )}

              <div className="pb-3 flex items-center">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                  required 
                />
                <label className="ml-2 text-emerald-700">{t('terminos')}</label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg shadow-emerald-300/30 text-sm font-semibold"
              >
                {t('botonRegistro')}
              </button>
              
              <div className="mt-2 text-center">
                <p className="text-emerald-700 text-sm">
                  {t('yaTenesCuenta')} 
                  <a
                    href="/Ingreso"
                    className="text-emerald-800 hover:text-emerald-900 ml-1 font-bold transition-colors duration-300 hover:underline"
                  >
                    {t('iniciarSesionAqui')}
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Animations styles */}
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
