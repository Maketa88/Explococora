import api from './api';

const recuperacionService = {
  // Enviar solicitud de recuperación
  solicitarRecuperacion: async (email, cedula) => {
    const response = await api.post('/solicitar-recuperacion', { email, cedula });
    return response.data;
  },
  
  // Verificar si un token es válido
  verificarToken: async (token) => {
    const response = await api.get(`/verificar-token-recuperacion/${token}`);
    return response.data;
  },
  
  // Restablecer contraseña
  restablecerContrasenia: async (token, nuevaContrasenia) => {
    const response = await api.patch(`/recuperar-contrasenia/${token}`, { nuevaContrasenia });
    return response.data;
  }
};

export default recuperacionService; 