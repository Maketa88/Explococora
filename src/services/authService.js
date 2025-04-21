import axios from 'axios';

const API_URL = 'https://servicio-explococora.onrender.com/'; // Cambia esto por la URL de tu backend

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/iniciar-sesion`, credentials);
    return response.data; // Asegúrate de que esto contenga el token y el rol
  } catch (error) {
    throw error.response.data; // Lanza el error para manejarlo en el componente
  }
};