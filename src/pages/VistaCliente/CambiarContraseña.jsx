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
            ¡Contraseña Actualizada!
          </h2>
          <p style="
            font-size: 18px; 
            font-family: Arial, Helvetica, sans-serif; 
            color: #004d40; 
            text-align: center; 
            margin-top: 10px;
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
    <div className="bg-teal-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
        <div className="bg-teal-800/70 rounded-xl shadow-xl p-4 sm:p-5 md:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 ml-2 sm:ml-4">Cambiar Contraseña</h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Columna izquierda - Icono */}
            <div className="w-full md:w-1/4 flex flex-col items-center mb-6 md:mb-0">
              <div className="relative mb-3">
                <div className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full bg-teal-700 flex items-center justify-center shadow-xl ring-4 ring-teal-500/30">
                  <FaLock className="h-16 w-16 sm:h-20 sm:w-20 text-white opacity-80" />
                </div>
              </div>
              <p className="text-white text-center font-medium text-base sm:text-lg">Seguridad de Cuenta</p>
            </div>
            
            {/* Columna derecha - Formulario */}
            <div className="w-full md:w-3/4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-teal-700/0 p-0 sm:p-0 col-span-1 sm:col-span-2">
                    <h3 className="text-xs sm:text-sm uppercase mb-2 text-teal-300 flex items-center">
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
                      className="w-full px-4 py-3 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 bg-teal-600/70 placeholder-teal-200/70"
                      placeholder="Ingrese su cédula"
                    />
                  </div>
                  
                  <div className="bg-teal-700/0 p-0 sm:p-0 col-span-1 sm:col-span-2 mt-4">
                    <h3 className="text-xs sm:text-sm uppercase mb-2 text-teal-300 flex items-center">
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
                      className={`w-full px-4 py-3 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 bg-teal-600/70 placeholder-teal-200/70 ${
                        erroresValidacion.length > 0 ? 'ring-2 ring-red-400' : ''
                      }`}
                      placeholder="Ingrese su nueva contraseña"
                    />
                  </div>
                  
                  {erroresValidacion.length > 0 && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300 col-span-1 sm:col-span-2">
                      <h3 className="font-medium text-red-800 mb-2">Requisitos de contraseña:</h3>
                      {erroresValidacion.map((error, index) => (
                        <p key={index} className="text-sm flex items-center mb-1 last:mb-0">
                          <span className="mr-2">•</span>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  <div className="bg-teal-700/0 p-0 sm:p-0 col-span-1 sm:col-span-2 mt-4">
                    <h3 className="text-xs sm:text-sm uppercase mb-2 text-teal-300 flex items-center">
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
                      className={`w-full px-4 py-3 border-0 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 bg-teal-600/70 placeholder-teal-200/70 ${
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
                  } shadow-md`}>
                    {mensaje.texto}
                  </div>
                )}

                <div className="flex justify-center sm:justify-end mt-6">
                  <button
                    type="submit"
                    disabled={cargando || erroresValidacion.length > 0}
                    className={`py-2 px-4 sm:px-6 rounded-lg ${
                      cargando || erroresValidacion.length > 0
                        ? 'bg-teal-500 cursor-not-allowed' 
                        : 'bg-teal-600 hover:bg-teal-500'
                    } text-white font-medium transition-colors duration-200 shadow-lg flex items-center`}
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
  );
};

export default CambiarContraseña;