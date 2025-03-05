import axios from 'axios';
import { useState } from 'react';
import { FaKey, FaLock, FaUserShield } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CambiarContraseña = () => {
  const [cedula, setCedula] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState([]);

  const validarContrasenia = (password) => {
    const errores = [];
    
    if (!password) {
      errores.push("La contraseña no puede ser vacía");
      return errores;
    }

    if (password.length < 8) {
      errores.push("La contraseña debe tener al menos 8 caracteres.");
    }

    if (!/[A-Z]/.test(password)) {
      errores.push("La contraseña debe incluir al menos una letra mayúscula.");
    }

    if (!/[a-z]/.test(password)) {
      errores.push("La contraseña debe incluir al menos una letra minúscula.");
    }

    if (!/[0-9]/.test(password)) {
      errores.push("La contraseña debe incluir al menos un número.");
    }

    if (!/[\W_]/.test(password)) {
      errores.push("La contraseña debe incluir al menos un carácter especial.");
    }

    return errores;
  };

  const handleContraseniaChange = (e) => {
    const nuevaContrasenia = e.target.value;
    setContrasenia(nuevaContrasenia);
    setErroresValidacion(validarContrasenia(nuevaContrasenia));
  };

  const mostrarAlertaExito = () => {
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
          max-width: 100%;
        ">
          <div style="
            display: flex; 
            flex-direction: column; 
            align-items: center;
            border-radius: 8px;
            padding: 10px;
            width: 100%;
          ">
            <img src="https://i.pinimg.com/originals/bf/fc/c2/bffcc2de14a013a2e7a795668846cae5.gif" 
                alt="Caballo corriendo" 
                width="150" 
                style="margin-bottom: 10px; border-radius: 8px; max-width: 100%;">
            <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                alt="Logo ExploCocora" 
                width="120" 
                style="border-radius: 8px; max-width: 100%;">
          </div>
          <h2 style="
            font-size: clamp(20px, 5vw, 28px); 
            font-weight: bold; 
            font-family: Arial, Helvetica, sans-serif; 
            color: #004d40; 
            margin-top: 15px;
            text-align: center;
            width: 100%;
          ">
            ¡Contraseña Actualizada!
          </h2>
          <p style="
            font-size: clamp(14px, 4vw, 18px); 
            font-family: Arial, Helvetica, sans-serif; 
            color: #004d40; 
            text-align: center; 
            margin-top: 10px;
            width: 100%;
          ">
            Tu contraseña ha sido cambiada exitosamente
          </p>
          <button id="cerrarAlerta" style="
            margin-top: 15px;
            padding: 10px 20px;
            background-color: #38a169;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: clamp(14px, 4vw, 16px);
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s ease;
          ">
            OK
          </button>
        </div>
      `,
      showConfirmButton: false,
      width: 'auto',
      didOpen: () => {
        document.getElementById("cerrarAlerta").addEventListener("click", () => {
          Swal.close();
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errores = validarContrasenia(contrasenia);
    setErroresValidacion(errores);
    
    if (errores.length > 0) {
      setMensaje({ 
        texto: 'Por favor, corrige los errores de validación', 
        tipo: 'error' 
      });
      return;
    }
    
    if (contrasenia !== confirmarContrasenia) {
      setMensaje({ texto: 'Datos Incorrectos', tipo: 'error' });
      return;
    }

    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMensaje({ texto: 'No hay sesión activa', tipo: 'error' });
        return;
      }

      await axios.patch(`http://localhost:10101/cliente/cambiar-contrasenia/${cedula}`, 
        { contrasenia },
        { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      mostrarAlertaExito();
      
      setCedula('');
      setContrasenia('');
      setConfirmarContrasenia('');
      setErroresValidacion([]);
      setMensaje({ texto: '', tipo: '' });
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        setMensaje({ texto: 'Datos incorrectos', tipo: 'error' });
      } else {
        setMensaje({ 
          texto: 'Error al cambiar la contraseña', 
          tipo: 'error' 
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="relative py-16 px-4 overflow-hidden">
        {/* Fondo decorativo inspirado en el Valle del Cocora */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

          {/* Siluetas de palmeras de cera - Estilo espectacular */}
          <div className="absolute top-0 left-0 w-full h-full opacity-15">
            <svg
              viewBox="0 0 1200 600"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Fondo de montañas */}
              <path
                d="M0,600 L0,400 Q150,300 300,350 Q450,400 600,300 Q750,200 900,350 Q1050,450 1200,400 L1200,600 Z"
                fill="#047857"
                fillOpacity="0.05"
                stroke="none"
              />
              
              {/* Grupo de palmas principales */}
              <g>
                {/* Palma central majestuosa */}
                <path
                  d="M600,600 C600,500 590,400 580,300 C570,200 560,100 550,50 C600,30 650,100 660,200 C670,300 680,400 680,600"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                
                {/* Hojas de la palma central */}
                <path
                  d="M550,100 C520,80 490,90 470,110 M550,100 C580,80 610,90 630,110"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M560,150 C530,120 500,130 480,160 M560,150 C590,120 620,130 640,160"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M570,200 C540,170 510,180 490,210 M570,200 C600,170 630,180 650,210"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Grupo de palmas izquierda */}
              <g>
                {/* Palma izquierda estilizada */}
                <path
                  d="M200,600 C200,450 210,350 220,250 C230,150 240,80 250,40 C260,80 270,150 280,250 C290,350 300,450 300,600"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Hojas de la palma izquierda */}
                <path
                  d="M250,80 C230,60 210,65 190,85 M250,80 C270,60 290,65 310,85"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M250,130 C230,110 210,115 190,135 M250,130 C270,110 290,115 310,135"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Grupo de palmas derecha */}
              <g>
                {/* Palma derecha estilizada */}
                <path
                  d="M900,600 C900,450 910,350 920,250 C930,150 940,80 950,40 C960,80 970,150 980,250 C990,350 1000,450 1000,600"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Hojas de la palma derecha */}
                <path
                  d="M950,80 C930,60 910,65 890,85 M950,80 C970,60 990,65 1010,85"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M950,130 C930,110 910,115 890,135 M950,130 C970,110 990,115 1010,135"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Palmas pequeñas adicionales */}
              <g>
                {/* Palma pequeña 1 */}
                <path
                  d="M100,600 C100,500 110,450 120,400 C125,350 130,320 135,300 C140,320 145,350 150,400 C160,450 170,500 170,600"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {/* Palma pequeña 2 */}
                <path
                  d="M400,600 C400,500 410,450 420,400 C425,350 430,320 435,300 C440,320 445,350 450,400 C460,450 470,500 470,600"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {/* Palma pequeña 3 */}
                <path
                  d="M730,600 C730,500 740,450 750,400 C755,350 760,320 765,300 C770,320 775,350 780,400 C790,450 800,500 800,600"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {/* Palma pequeña 4 */}
                <path
                  d="M1030,600 C1030,500 1040,450 1050,400 C1055,350 1060,320 1065,300 C1070,320 1075,350 1080,400 C1090,450 1100,500 1100,600"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Elementos decorativos */}
              <g>
                {/* Nubes estilizadas */}
                <path
                  d="M150,100 Q180,80 210,100 Q240,120 270,100 Q300,80 330,100 Q300,130 270,120 Q240,140 210,120 Q180,130 150,100"
                  fill="#047857"
                  fillOpacity="0.07"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
                
                <path
                  d="M850,150 Q880,130 910,150 Q940,170 970,150 Q1000,130 1030,150 Q1000,180 970,170 Q940,190 910,170 Q880,180 850,150"
                  fill="#047857"
                  fillOpacity="0.07"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
                
                {/* Sol estilizado */}
                <circle
                  cx="600"
                  cy="100"
                  r="40"
                  fill="#047857"
                  fillOpacity="0.1"
                  stroke="#047857"
                  strokeWidth="3"
                  strokeOpacity="0.2"
                />
                
                {/* Rayos de sol */}
                <path
                  d="M600,40 L600,10 M560,60 L540,40 M640,60 L660,40 M560,140 L540,160 M640,140 L660,160 M540,100 L510,100 M660,100 L690,100"
                  stroke="#047857"
                  strokeWidth="3"
                  strokeOpacity="0.2"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
        </div>
    <div className="min-h-screen  flex items-center justify-center w-full py-6 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-teal-800/70 rounded-xl shadow-xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center sm:text-left">
            Cambiar Contraseña
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Columna izquierda - Icono */}
            <div className="w-full lg:w-1/3 flex flex-col items-center mb-6 lg:mb-0">
              <div className="relative mb-4">
                <div className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full bg-teal-700 flex items-center justify-center shadow-xl ring-4 ring-teal-500/30 mx-auto transform transition-transform hover:scale-105 duration-300">
                  <FaLock className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 text-white opacity-80" />
                </div>
              </div>
              <p className="text-white text-center font-medium text-base sm:text-lg">Seguridad de Cuenta</p>
            </div>
            
            {/* Columna derecha - Formulario */}
            <div className="w-full lg:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="bg-teal-700/0 p-0">
                    <h3 className="text-xs sm:text-sm uppercase mb-2 text-white flex items-center">
                      <FaUserShield className="mr-2" />
                      CÉDULA
                    </h3>
                    <input
                      id="cedula"
                      name="cedula"
                      type="text"
                      required
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full px-4 py-3 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 bg-teal-800 placeholder-teal-200/70"
                      placeholder="Ingrese su cédula"
                    />
                  </div>
                  
                  <div className="bg-teal-700/0 p-0 mt-4">
                    <h3 className="text-xs sm:text-sm uppercase mb-2 text-white flex items-center">
                      <FaKey className="mr-2" />
                      NUEVA CONTRASEÑA
                    </h3>
                    <input
                      id="contrasenia"
                      name="contrasenia"
                      type="password"
                      required
                      value={contrasenia}
                      onChange={handleContraseniaChange}
                      className={`w-full px-4 py-3 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 bg-teal-800 placeholder-teal-200/70 ${
                        erroresValidacion.length > 0 ? 'ring-2 ring-red-400' : ''
                      }`}
                      placeholder="Ingrese su nueva contraseña"
                    />
                  </div>
                  
                  {erroresValidacion.length > 0 && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300 shadow-md">
                      <h3 className="font-medium text-red-800 mb-2">Requisitos de contraseña:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {erroresValidacion.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="bg-teal-700/0 p-0 mt-4">
                    <h3 className="text-xs sm:text-sm uppercase mb-2 text-white flex items-center">
                      <FaKey className="mr-2" />
                      CONFIRMAR CONTRASEÑA
                    </h3>
                    <input
                      id="confirmarContrasenia"
                      name="confirmarContrasenia"
                      type="password"
                      required
                      value={confirmarContrasenia}
                      onChange={(e) => setConfirmarContrasenia(e.target.value)}
                      className={`w-full px-4 py-3 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 bg-teal-800 placeholder-teal-200/70 ${
                        contrasenia !== confirmarContrasenia && confirmarContrasenia 
                          ? 'ring-2 ring-red-400' 
                          : ''
                      }`}
                      placeholder="Confirme su nueva contraseña"
                    />
                  </div>
                </div>

                {mensaje.texto && (
                  <div className={`rounded-lg p-4 ${
                    mensaje.tipo === 'error' 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-teal-100 text-teal-700 border border-teal-300'
                  } shadow-md mt-4 animate-fadeIn`}>
                    {mensaje.texto}
                  </div>
                )}

                <div className="flex justify-center sm:justify-end mt-6">
                  <button
                    type="submit"
                    disabled={cargando || erroresValidacion.length > 0}
                    className={`py-3 px-6 rounded-lg ${
                      cargando || erroresValidacion.length > 0
                        ? 'bg-teal-500 cursor-not-allowed opacity-70' 
                        : 'bg-teal-600 hover:bg-teal-500 hover:shadow-lg active:bg-teal-700'
                    } text-white font-medium transition-all duration-200 shadow-lg flex items-center justify-center w-full sm:w-auto min-w-[180px]`}
                  >
                    {cargando ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2" />
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default CambiarContraseña;