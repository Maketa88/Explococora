import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true); // Cambiado a true para verificar token al inicio

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
      // Configurar axios para incluir el token en todas las peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUserRole(role);
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:10101/iniciar-sesion', {
        email: credentials.email,
        contrasenia: credentials.contrasenia,
      });

      console.log('Respuesta del servidor:', response.data);

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
        // Flujo antiguo por si acaso
        const token = response.data.token;
        const role = response.data.role;
        
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('cedula', response.data.cedula || '');
        
        setIsAuthenticated(true);
        setUserRole(role);
        
        // Configurar axios para incluir el token en todas las peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        if (role === 'admin') {
          navigate('/VistaAdmin');
        } else if (role === 'guia') {
          navigate('/VistaGuia');
        } else if (role === 'operador') {
          navigate('/VistaOperador');
        } else if (role === 'Cliente') {
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('cedula');
    
    delete axios.defaults.headers.common['Authorization'];
    
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  // Método para verificar OTP
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
        const token = response.data.token;
        
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        
        if (response.data.cedula) {
          localStorage.setItem('cedula', response.data.cedula);
        }
        
        setIsAuthenticated(true);
        setUserRole(role);
        
        // Configurar axios para incluir el token en todas las peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
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

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole,
      loading,
      login,
      logout, 
      verificarOTP, 
      errorMessage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);