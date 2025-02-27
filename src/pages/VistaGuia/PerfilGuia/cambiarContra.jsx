import axios from 'axios';
import { useState } from 'react';
import { FaKey, FaLock, FaUserShield } from 'react-icons/fa';
import DashboardLayoutGuia from "../../../layouts/DashboardLayoutGuia"; // Importando el componente de layout


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

      await axios.patch(`http://localhost:10101/guia/cambiar-contrasenia/${cedula}`, 
        { contrasenia },
        { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setMensaje({ texto: 'Contraseña cambiada con éxito', tipo: 'exito' });
      setCedula('');
      setContrasenia('');
      setConfirmarContrasenia('');
      setErroresValidacion([]);
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
    <div className="min-h-screen bg-gradient-to-b from-teal-800/10 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-teal-800 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FaLock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Cambiar Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Protege tu cuenta con una contraseña segura
          </p>
          {/* Nueva guía añadida */}
          <p className="mt-2 text-sm text-gray-600">
            Asegúrate de que tu nueva contraseña tenga al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas, números y caracteres especiales.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserShield className="h-5 w-5 text-teal-800" />
              </div>
              <input
                id="cedula"
                name="cedula"
                type="text"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="Ingrese su cédula"
              />
              <label htmlFor="cedula" className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Cédula
              </label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="h-5 w-5 text-teal-800" />
              </div>
              <input
                id="contrasenia"
                name="contrasenia"
                type="password"
                required
                value={contrasenia}
                onChange={handleContraseniaChange}
                className={`pl-10 w-full px-4 py-3 border ${
                  erroresValidacion.length > 0 ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white`}
                placeholder="Ingrese su nueva contraseña"
              />
              <label htmlFor="contrasenia" className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Nueva Contraseña
              </label>
            </div>

            {erroresValidacion.length > 0 && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                {erroresValidacion.map((error, index) => (
                  <p key={index} className="text-sm flex items-center mb-1 last:mb-0">
                    <span className="mr-2">•</span>
                    {error}
                  </p>
                ))}
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="h-5 w-5 text-teal-800" />
              </div>
              <input
                id="confirmarContrasenia"
                name="confirmarContrasenia"
                type="password"
                required
                value={confirmarContrasenia}
                onChange={(e) => setConfirmarContrasenia(e.target.value)}
                className={`pl-10 w-full px-4 py-3 border ${
                  contrasenia !== confirmarContrasenia && confirmarContrasenia 
                    ? 'border-red-300' 
                    : 'border-gray-200'
                } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white`}
                placeholder="Confirme su nueva contraseña"
              />
              <label htmlFor="confirmarContrasenia" className="absolute left-10 -top-2 bg-white px-2 text-xs font-medium text-teal-800">
                Confirmar Contraseña
              </label>
            </div>
          </div>

          {mensaje.texto && (
            <div className={`rounded-xl p-4 ${
              mensaje.tipo === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-teal-50 text-teal-700 border border-teal-200'
            } shadow-sm`}>
              {mensaje.texto}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={cargando || erroresValidacion.length > 0}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white ${
                cargando || erroresValidacion.length > 0
                  ? 'bg-teal-400 cursor-not-allowed' 
                  : 'bg-teal-800 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl'
              }`}
            >
              {cargando ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-teal-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              <span className="flex items-center">
                {cargando ? 'Procesando...' : (
                  <>
                    <FaLock className="mr-2" />
                    Cambiar Contraseña
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CambiarContraseña;