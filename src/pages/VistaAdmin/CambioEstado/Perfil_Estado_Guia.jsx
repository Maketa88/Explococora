import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SelectorEstado from './SelectorEstado';

const PerfilGuia = () => {
  const [usuario, setUsuario] = useState({
    nombre: "",
    cedula: "",
    estado: "disponible"
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        // Obtener token del almacenamiento
        const token = localStorage.getItem('token');
        if (!token) {
          alert("No hay sesión activa");
          return;
        }
        
        // Obtener cédula del almacenamiento local
        const cedula = localStorage.getItem('cedula');
        if (!cedula) {
          alert("No se encontró la cédula del usuario");
          return;
        }
        
        // Obtener datos del perfil
        const perfilResponse = await axios.get(`https://servicio-explococora.onrender.com/guia/${cedula}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (perfilResponse.data && perfilResponse.data.data) {
          const perfil = perfilResponse.data.data;
          
          // Consultar estado actual con parámetros de consulta correctos
          const estadoResponse = await axios.get(`https://servicio-explococora.onrender.com/usuarios/consultar-estado/${cedula}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const estadoActual = estadoResponse.data?.data?.estado || "disponible";
          
          setUsuario({
            ...perfil,
            estado: estadoActual
          });
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        alert("Error al cargar el perfil: " + (error.response?.data?.message || error.message));
      } finally {
        setCargando(false);
      }
    };
    
    obtenerPerfil();
  }, []);

  const handleCambioEstado = (nuevoEstado) => {
    setUsuario({...usuario, estado: nuevoEstado});
  };

  if (cargando) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>Perfil de Guía</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <h5>Nombre: {usuario.nombre}</h5>
              <p>Cédula: {usuario.cedula}</p>
              {/* Otros datos del perfil */}
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <label className="me-2">Estado actual:</label>
                <SelectorEstado 
                  estadoActual={usuario.estado}
                  onCambioEstado={handleCambioEstado}
                  cedula={usuario.cedula}
                  esAdmin={false}
                  esPropio={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilGuia;