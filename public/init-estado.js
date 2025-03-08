/**
 * Script de inicialización que se ejecuta antes que cualquier componente React
 * para garantizar que el estado del operador y guías esté disponible inmediatamente
 */
(function() {
  // Verificar si estamos en la página correcta
  if (!window.location.href.includes('/VistaOperador')) return;
  
  // Función para garantizar que el estado no se pierda al navegar
  function protegerEstadoOperador() {
    // Obtener el estado actual
    const estadoActual = localStorage.getItem('ultimoEstadoOperador');
    
    if (estadoActual) {
      // Crear una copia de seguridad con timestamp
      const backup = {
        estado: estadoActual,
        timestamp: Date.now()
      };
      
      // Guardar en sessionStorage (persiste durante la sesión del navegador)
      sessionStorage.setItem('estadoOperadorBackup', JSON.stringify(backup));
      
      console.log(`Estado protegido: ${estadoActual}`);
    }
    
    // También proteger estados de guías
    const keysGuias = Object.keys(localStorage).filter(key => key.startsWith('estadoGuia_') && !key.includes('timestamp'));
    
    keysGuias.forEach(key => {
      const cedula = key.replace('estadoGuia_', '');
      const estado = localStorage.getItem(key);
      
      if (estado) {
        const backupGuia = {
          cedula,
          estado,
          timestamp: Date.now()
        };
        
        // Guardar backup en sessionStorage
        sessionStorage.setItem(`backupGuia_${cedula}`, JSON.stringify(backupGuia));
      }
    });
  }
  
  // Función para restaurar el estado si se ha perdido
  function restaurarEstadoOperador() {
    const estadoActual = localStorage.getItem('ultimoEstadoOperador');
    
    // Si no hay estado actual o es "disponible", intentar restaurar
    if (!estadoActual || estadoActual === 'disponible') {
      const backupStr = sessionStorage.getItem('estadoOperadorBackup');
      
      if (backupStr) {
        try {
          const backup = JSON.parse(backupStr);
          
          // Verificar que el backup sea reciente (menos de 1 hora)
          const ahora = Date.now();
          if (backup.timestamp && (ahora - backup.timestamp < 3600000)) {
            // Restaurar el estado
            localStorage.setItem('ultimoEstadoOperador', backup.estado);
            console.log(`Estado restaurado: ${backup.estado}`);
          }
        } catch (e) {
          console.error('Error al restaurar estado:', e);
        }
      }
    }
    
    // Restaurar estados de guías
    const backupGuias = Object.keys(sessionStorage).filter(key => key.startsWith('backupGuia_'));
    
    backupGuias.forEach(key => {
      try {
        const backupStr = sessionStorage.getItem(key);
        if (backupStr) {
          const backup = JSON.parse(backupStr);
          
          if (backup.cedula && backup.estado && backup.timestamp) {
            const estadoActual = localStorage.getItem(`estadoGuia_${backup.cedula}`);
            
            // Restaurar solo si no hay estado o es "disponible"
            if (!estadoActual || estadoActual === 'disponible') {
              // Verificar que el backup sea reciente (menos de 1 hora)
              const ahora = Date.now();
              if (ahora - backup.timestamp < 3600000) {
                localStorage.setItem(`estadoGuia_${backup.cedula}`, backup.estado);
                localStorage.setItem(`estadoGuia_${backup.cedula}_timestamp`, backup.timestamp);
                console.log(`Estado de guía ${backup.cedula} restaurado: ${backup.estado}`);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error al restaurar estado de guía:', e);
      }
    });
  }
  
  // Ejecutar al cargar la página
  restaurarEstadoOperador();
  
  // Proteger el estado periódicamente
  setInterval(protegerEstadoOperador, 10000);
  
  // Proteger el estado antes de navegar
  window.addEventListener('beforeunload', protegerEstadoOperador);
  
  console.log('Sistema de protección de estado inicializado');
})(); 