import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carga

  // ... existing code ...
 // ... existing code ...
 // ... existing code ...
 const login = async (credentials) => {
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:10101/iniciar-sesion', {
      email: credentials.email,
      contrasenia: credentials.contrasenia,
    });

    console.log('Respuesta del servidor:', response.data); // Verifica la respuesta
    console.log('Rol del usuario:', response.data.role); // Verifica el rol
    console.log('cedula:', response.data.cedula); // Verifica el rol

    if (response.data.requireOTP) {
      // Redirigir a la página de verificación OTP
      navigate('/verificar-otp', { 
        state: {
          userId: response.data.userId,
          role: response.data.role,
          verificationEndpoint: response.data.verificationEndpoint
        }
      });
    } else if (response.data.status === 'Autenticación exitosa') {
      localStorage.setItem('token', response.data.token); // Almacena el token
      setIsAuthenticated(true); // Actualiza el estado de autenticación
      localStorage.setItem('cedula', response.data.cedula); // Guarda la cédula
      
      // Nueva lógica para redirigir según el rol
      if (response.data.role === 'admin') {
        navigate('/VistaAdmin');
      } else if (response.data.role === 'guia') {
        navigate('/VistaGuia');
      } else if (response.data.role === 'operador') {
        navigate('/VistaOperador');
      } else if (response.data.role === 'Cliente') {
        navigate('/VistaCliente');
      } else {
        setErrorMessage('Rol no reconocido');
      }
    } else {
      setErrorMessage('Error en la autenticación');
    }
  } catch (error) {
    setErrorMessage('Error al iniciar sesión: ' + (error.response?.data?.message || error.message));
    console.error('Error al iniciar sesión:', error.response?.data || error);
  } finally {
    setLoading(false);
  }
};

// Nuevo método para verificar OTP
const verificarOTP = async ({ userId, otp, role }) => {
  setLoading(true);
  try {
    const response = await axios.post('http://localhost:10101/auth/verificar-otp', {
      userId,
      otp,
      role
    });

    console.log('Respuesta verificación OTP:', response.data);

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      
      if (response.data.cedula) {
        localStorage.setItem('cedula', response.data.cedula);
      }
      
      // Redirigir según el rol
      if (role === 'admin') {
        navigate('/VistaAdmin');
      } else if (role === 'guia') {
        navigate('/VistaGuia');
      } else if (role === 'operador') {
        navigate('/VistaOperador');
      } else if (role === 'Cliente') {
        navigate('/VistaCliente');
      } else {
        throw new Error('Rol no reconocido');
      }
    } else {
      throw new Error(response.data.message || 'Error al verificar código');
    }
  } catch (error) {
    console.error('Error en verificación OTP:', error);
    throw error.response?.data?.message || error.message || 'Error al verificar código';
  } finally {
    setLoading(false);
  }
};
// ... existing code ...

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      login, 
      verificarOTP, 
      errorMessage, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);