import React, { useEffect } from 'react';
import EstadoOperador from './EstadoOperador';

const PerfilGuia = () => {
  // Efecto para establecer estado disponible al iniciar sesión
  useEffect(() => {
    // Establecer estado como disponible al cargar el componente
    localStorage.setItem('estadoOperador', 'disponible');
  }, []);

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>Perfil de Guía</h3>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Información del perfil */}
            <div className="col-md-6 mb-4">
              <h5>Información Personal</h5>
              <div className="p-4 bg-light rounded">
                <p><strong>Nombre:</strong> {localStorage.getItem('nombre') || 'Operador'}</p>
                <p><strong>Cédula:</strong> {localStorage.getItem('cedula') || 'No disponible'}</p>
                {/* Otros datos del perfil */}
              </div>
            </div>
            
            {/* Control de estado - Nuevo componente */}
            <div className="col-md-6">
              <h5>Control de Estado</h5>
              <EstadoOperador />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilGuia;