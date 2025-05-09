/**
 * Servicio de fondo para mantener el estado del operador y guías sincronizado
 * Este script se ejecutará independientemente de las rutas de React
 */
(function() {
  // Verificar si estamos en la página correcta
  if (!window.location.href.includes('/VistaOperador')) return;
  
  // Configuración
  const SYNC_INTERVAL = 30000; // 30 segundos
  const API_URL = 'https://servicio-explococora.onrender.com';
  
  // Función para sincronizar el estado del operador
  async function sincronizarEstadoOperador() {
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
  
  // Función para sincronizar estados de guías
  async function sincronizarEstadosGuias() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Obtener lista de todos los estados
      const response = await fetch(`${API_URL}/usuarios/listar-estados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error al obtener estados');
      
      const data = await response.json();
      
      // Procesar guías si existen
      if (data && data.data && data.data.guias && Array.isArray(data.data.guias)) {
        data.data.guias.forEach(guia => {
          if (guia.cedula && guia.estado) {
            const estadoGuardado = localStorage.getItem(`estadoGuia_${guia.cedula}`);
            
            // Solo actualizar si el estado ha cambiado
            if (estadoGuardado !== guia.estado) {
              localStorage.setItem(`estadoGuia_${guia.cedula}`, guia.estado);
              localStorage.setItem(`estadoGuia_${guia.cedula}_timestamp`, Date.now().toString());
              
              // Disparar evento global
              window.dispatchEvent(new CustomEvent('estadoGuiaCambiado', { 
                detail: { cedula: guia.cedula, estado: guia.estado } 
              }));
              
              console.log(`Actualizado estado del guía ${guia.cedula} a ${guia.estado}`);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error al sincronizar estados de guías:', error);
    }
  }
  
  // Función principal de sincronización
  async function sincronizarTodo() {
    await sincronizarEstadoOperador();
    await sincronizarEstadosGuias();
  }
  
  // Sincronizar al inicio
  sincronizarTodo();
  
  // Configurar sincronización periódica
  setInterval(sincronizarTodo, SYNC_INTERVAL);
  
  // Sincronizar cuando la ventana recupere el foco
  window.addEventListener('focus', sincronizarTodo);
  
  // Sincronizar al cambiar de visibilidad
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sincronizarTodo();
    }
  });
  
  // Interceptar cambios de ruta
  let lastUrl = location.href; 
  const observer = new MutationObserver(() => {
    if (lastUrl !== location.href) {
      lastUrl = location.href;
      sincronizarTodo();
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });
  
  // Registrar el servicio en la consola
  console.log('Servicio de sincronización de estado iniciado');
})(); 