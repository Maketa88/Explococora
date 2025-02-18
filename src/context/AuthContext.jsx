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

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:10101/iniciar-sesion', {
        email: credentials.email,
        contrasenia: credentials.contrasenia,
      });

      console.log('Respuesta del servidor:', response.data); // Verifica la respuesta

      if (response.data.status === 'Autenticación exitosa') {
        localStorage.setItem('token', response.data.token); // Almacena el token
        navigate('/AdminDashboard'); // Redirige a la página del panel de usuario
      } else {
        setErrorMessage('Error en la autenticación');
      }
    } catch (error) {
      setErrorMessage('Error al iniciar sesión: ' + error.response.data.message);
      console.error('Error al iniciar sesión:', error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, errorMessage, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);