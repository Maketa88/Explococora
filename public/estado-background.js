/**
 * Servicio de fondo para mantener el estado del operador sincronizado
 * Este script se ejecutará independientemente de las rutas de React
 */
(function() {
  // Verificar si estamos en la página correcta
  if (!window.location.href.includes('/VistaOperador')) return;
  
  // Configuración
  const SYNC_INTERVAL = 30000; // 30 segundos
  const API_URL = 'http://localhost:10101';
  
  // Función para sincronizar el estado
  async function sincronizarEstado() {
    try {
      // Obtener datos de la sesión
      const token = localStorage.getItem('token');
      const cedula = localStorage.getItem('cedula');
      
      if (!token || !cedula) return;
      
      // Obtener el estado actual guardado
      const estadoActual = localStorage.getItem('ultimoEstadoOperador');
      
      // Consultar estado actual del servidor
      const response = await fetch(`${API_URL}/usuarios/consultar-estado/${cedula}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error al obtener estado');
      
      const data = await response.json();
      
      if (data && data.data && data.data.estado) {
        const estadoServidor = data.data.estado;
        
        // Solo actualizar si el estado ha cambiado
        if (estadoActual !== estadoServidor) {
          console.log(`Actualizando estado de ${estadoActual} a ${estadoServidor}`);
          
          // Actualizar almacenamiento local
          localStorage.setItem('ultimoEstadoOperador', estadoServidor);
          localStorage.setItem('ultimoEstadoTimestamp', Date.now().toString());
          
          // Disparar evento global para notificar a los componentes
          window.dispatchEvent(new CustomEvent('estadoOperadorActualizado', { 
            detail: { estado: estadoServidor } 
          }));
        }
      }
    } catch (error) {
      console.error('Error al sincronizar estado:', error);
    }
  }
  
  // Sincronizar al inicio
  sincronizarEstado();
  
  // Configurar sincronización periódica
  setInterval(sincronizarEstado, SYNC_INTERVAL);
  
  // Sincronizar cuando la ventana recupere el foco
  window.addEventListener('focus', sincronizarEstado);
  
  // Sincronizar al cambiar de visibilidad
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sincronizarEstado();
    }
  });
  
  // Interceptar cambios de ruta
  let lastUrl = location.href; 
  const observer = new MutationObserver(() => {
    if (lastUrl !== location.href) {
      lastUrl = location.href;
      sincronizarEstado();
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });
  
  // Registrar el servicio en la consola
  console.log('Servicio de sincronización de estado iniciado');
})(); 