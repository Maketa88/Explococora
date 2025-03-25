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
      const url = `http://localhost:10101/recuperar-contrasenia/${token}`;
      
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

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
        <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200 text-center">
          <IconoExplo />
          <h2 className="text-center text-2xl font-bold text-green-600 mb-2">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu contraseña ha sido actualizada correctamente. Serás redirigido a la página de inicio de sesión.
          </p>
          <button
            onClick={() => navigate('/Ingreso')}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
        <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200 text-center">
          <IconoExplo />
          <h2 className="text-center text-2xl font-bold text-red-600 mb-2">
            Enlace inválido
          </h2>
          <p className="text-gray-600 mb-6">
            El enlace para recuperar la contraseña no es válido o ha expirado.
          </p>
          <button
            onClick={() => navigate('/Ingreso')}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200">
        <IconoExplo />
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-2">
          Crea una nueva contraseña
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Ingresa tu nueva contraseña para tu cuenta.
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">
                <FaLock />
              </span>
              <input
                type={mostrarContrasenia ? "text" : "password"}
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ingresa tu nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={toggleMostrarContrasenia}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {mostrarContrasenia ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              La contraseña debe tener al menos 8 caracteres
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">
                <FaLock />
              </span>
              <input
                type={mostrarContrasenia ? "text" : "password"}
                value={confirmarContrasenia}
                onChange={(e) => setConfirmarContrasenia(e.target.value)}
                className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Confirma tu nueva contraseña"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecuperarContrasena; 