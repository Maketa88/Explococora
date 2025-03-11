/**
 * Servicio para manejar el estado del guía de manera centralizada
 */
class EstadoServiceGuia {
  constructor() {
    this.ESTADOS_VALIDOS = ['disponible', 'ocupado', 'inactivo'];
    this.PERIODO_VERIFICACION = 10000; // 10 segundos
    
    // Iniciar verificación periódica
    if (typeof window !== 'undefined') {
      this.iniciarVerificacionPeriodica();
    }
  }
  
  // Establecer el estado actual del guía principal
  setEstado(estado) {
    if (!this.ESTADOS_VALIDOS.includes(estado)) {
      console.error(`Estado no válido: ${estado}`);
      return false;
    }
    
    try {
      // Guardar en localStorage
      localStorage.setItem('ultimoEstadoGuia', estado);
      localStorage.setItem('ultimoEstadoGuiaTimestamp', Date.now().toString());
      
      // Backup en sessionStorage
      sessionStorage.setItem('estadoGuiaBackup', JSON.stringify({
        estado: estado,
        timestamp: Date.now()
      }));
      
      // Emitir evento global
      window.dispatchEvent(new CustomEvent('estadoGuiaCambiado', { 
        detail: { estado: estado } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error al guardar estado:', error);
      return false;
    }
  }
  
  // Establecer estado de un operador específico (NO afecta al guía principal)
  setEstadoOperador(idOperador, estado) {
    if (!this.ESTADOS_VALIDOS.includes(estado)) {
      console.error(`Estado no válido: ${estado}`);
      return false;
    }
    
    try {
      // Guardar en localStorage con clave específica para este operador
      localStorage.setItem(`estadoOperador_${idOperador}`, estado);
      return true;
    } catch (error) {
      console.error('Error al guardar estado del operador:', error);
      return false;
    }
  }
  
  // Obtener el estado actual del guía principal
  getEstado() {
    try {
      // Intentar obtener de localStorage
      const estado = localStorage.getItem('ultimoEstadoGuia');
      
      if (estado && this.ESTADOS_VALIDOS.includes(estado)) {
        return estado;
      }
      
      // Si no está en localStorage, intentar obtener del backup
      const backupStr = sessionStorage.getItem('estadoGuiaBackup');
      if (backupStr) {
        try {
          const backup = JSON.parse(backupStr);
          if (backup.estado && this.ESTADOS_VALIDOS.includes(backup.estado)) {
            // Restaurar desde backup
            this.setEstado(backup.estado);
            return backup.estado;
          }
        } catch (e) {
          console.error('Error al parsear backup:', e);
        }
      }
      
      // Si todo falla, devolver estado por defecto
      return 'disponible';
    } catch (error) {
      console.error('Error al obtener estado:', error);
      return 'disponible';
    }
  }
  
  // Verificar y restaurar estado periódicamente
  iniciarVerificacionPeriodica() {
    setInterval(() => {
      const estado = this.getEstado();
      const estadoActual = localStorage.getItem('ultimoEstadoGuia');
      
      // Si no coincide, restaurar
      if (estado !== estadoActual && estado !== 'disponible') {
        console.log(`Restaurando estado a ${estado} desde verificación periódica`);
        this.setEstado(estado);
      }
    }, this.PERIODO_VERIFICACION);
    
    // También verificar cuando la ventana recupere el foco
    window.addEventListener('focus', () => {
      this.getEstado(); // Esto verifica y restaura si es necesario
    });
    
    // Y cuando el documento se vuelva visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.getEstado();
      }
    });
  }
}

// Exportar una instancia singleton
export default new EstadoServiceGuia();
