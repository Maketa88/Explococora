import { useState, useEffect } from 'react';
import axios from 'axios';

// Hook personalizado para consultar estado
export const useEstadoUsuario = (cedula, id) => {
  const [estado, setEstado] = useState("disponible");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const consultarEstado = async () => {
      try {
        setCargando(true);
        setError(null);
        
        let url = '/usuarios/consultar-estado';
        const config = {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        };
        
        if (cedula) {
          url = `/usuarios/consultar-estado/cedula/${cedula}`;
        } else if (id) {
          url = `/usuarios/consultar-estado/id/${id}`;
        } else {
          // Consulta del propio estado (se usa el token)
          config.data = { cedula: cedula };
        }
        
        const response = await axios.get(url, config);
        
        if (response.data && response.data.data) {
          setEstado(response.data.data.estado);
        }
      } catch (err) {
        console.error("Error al consultar estado:", err);
        setError(err);
      } finally {
        setCargando(false);
      }
    };
    
    consultarEstado();
  }, [cedula, id]);

  return { estado, setEstado, cargando, error };
};