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

          {/* Siluetas de palmeras de cera - Valle del Cocora */}
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
              
              {/* Palmera grande central */}
              <g>
                {/* Tronco de la palmera */}
                <path
                  d="M600,600 L600,300 C600,280 605,260 610,240"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                
                {/* Hojas de la palmera */}
                <path
                  d="M610,240 C650,220 680,230 700,250 M610,240 C570,220 540,230 520,250"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M610,240 C640,210 670,200 700,210 M610,240 C580,210 550,200 520,210"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M610,240 C630,200 650,180 670,170 M610,240 C590,200 570,180 550,170"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M610,240 C620,190 625,160 630,140 M610,240 C600,190 595,160 590,140"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Palmera izquierda */}
              <g>
                {/* Tronco de la palmera */}
                <path
                  d="M300,600 L300,350 C295,330 290,310 285,290"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Hojas de la palmera */}
                <path
                  d="M285,290 C320,270 350,280 370,300 M285,290 C250,270 220,280 200,300"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M285,290 C310,260 335,250 360,260 M285,290 C260,260 235,250 210,260"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M285,290 C300,250 315,230 330,220 M285,290 C270,250 255,230 240,220"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Palmera derecha */}
              <g>
                {/* Tronco de la palmera */}
                <path
                  d="M900,600 L900,350 C905,330 910,310 915,290"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Hojas de la palmera */}
                <path
                  d="M915,290 C880,270 850,280 830,300 M915,290 C950,270 980,280 1000,300"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M915,290 C890,260 865,250 840,260 M915,290 C940,260 965,250 990,260"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M915,290 C900,250 885,230 870,220 M915,290 C930,250 945,230 960,220"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Palmeras pequeñas */}
              <g>
                {/* Palmera pequeña 1 */}
                <path
                  d="M150,600 L150,450 C150,440 152,430 155,420"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M155,420 C175,410 190,415 200,425 M155,420 C135,410 120,415 110,425"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M155,420 C165,400 170,390 175,380 M155,420 C145,400 140,390 135,380"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                
                {/* Palmera pequeña 2 */}
                <path
                  d="M450,600 L450,450 C450,440 452,430 455,420"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M455,420 C475,410 490,415 500,425 M455,420 C435,410 420,415 410,425"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M455,420 C465,400 470,390 475,380 M455,420 C445,400 440,390 435,380"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                
                {/* Palmera pequeña 3 */}
                <path
                  d="M750,600 L750,450 C750,440 752,430 755,420"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M755,420 C775,410 790,415 800,425 M755,420 C735,410 720,415 710,425"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M755,420 C765,400 770,390 775,380 M755,420 C745,400 740,390 735,380"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                
                {/* Palmera pequeña 4 */}
                <path
                  d="M1050,600 L1050,450 C1050,440 1052,430 1055,420"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M1055,420 C1075,410 1090,415 1100,425 M1055,420 C1035,410 1020,415 1010,425"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M1055,420 C1065,400 1070,390 1075,380 M1055,420 C1045,400 1040,390 1035,380"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Elementos adicionales */}
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