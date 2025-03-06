/**
 * Script de inicialización que se ejecuta antes que cualquier componente React
 * para garantizar que el estado del operador esté disponible inmediatamente
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
  }
  
  // Ejecutar al cargar la página
  restaurarEstadoOperador();
  
  // Proteger el estado periódicamente
  setInterval(protegerEstadoOperador, 10000);
  
  // Proteger el estado antes de navegar
  window.addEventListener('beforeunload', protegerEstadoOperador);
  
  console.log('Sistema de protección de estado inicializado');
})(); 