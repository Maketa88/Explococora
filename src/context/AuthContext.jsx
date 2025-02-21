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

    if (response.data.status === 'Autenticación exitosa') {
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
    setErrorMessage('Error al iniciar sesión: ' + error.response.data.message);
    console.error('Error al iniciar sesión:', error.response.data);
  } finally {
    setLoading(false);
  }
};
// ... existing code ...

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, errorMessage, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);