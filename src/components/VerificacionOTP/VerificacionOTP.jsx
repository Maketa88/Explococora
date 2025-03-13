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

  useEffect(() => {
    if (!userId || !role) {
      navigate("/");
      return;
    }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200">
        <IconoExplo />
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-2">
          Verificación de código
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Hemos enviado un código de verificación a tu correo electrónico
        </p>
        
        {timeLeft > 0 ? (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">El código expira en:</p>
            <p className="text-xl font-bold text-green-500">{formatTime(timeLeft)}</p>
          </div>
        ) : (
          <p className="text-center text-red-500 mb-4">
            El código ha expirado. Por favor, inicie sesión nuevamente.
          </p>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Código de verificación (6 dígitos)
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleChange}
              placeholder="Ingrese el código de 6 dígitos"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-center text-2xl tracking-widest"
              maxLength={6}
              disabled={timeLeft === 0}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || timeLeft === 0 || otp.length !== 6}
          >
            {loading ? "Verificando..." : "Verificar código"}
          </button>
        </form>
        
        <p className="mt-3 text-center text-gray-600">
          ¿No recibiste el código? <button
            onClick={() => navigate("/")}
            className="text-green-400 font-bold hover:underline"
          >
            Volver a iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}; 