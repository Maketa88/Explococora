/**
 * Servicio para manejar el estado del operador de manera centralizada
 */
class EstadoService {
  constructor() {
    this.ESTADOS_VALIDOS = ['disponible', 'ocupado', 'inactivo'];
    this.PERIODO_VERIFICACION = 10000; // 10 segundos
    
    // Iniciar verificación periódica
    if (typeof window !== 'undefined') {
      this.iniciarVerificacionPeriodica();
    }
  }
  
  // Establecer el estado actual solo del operador principal
  setEstado(estado) {
    if (!this.ESTADOS_VALIDOS.includes(estado)) {
      console.error(`Estado no válido: ${estado}`);
      return false;
    }
    
    try {
      // Guardar en localStorage
      localStorage.setItem('ultimoEstadoOperador', estado);
      localStorage.setItem('ultimoEstadoTimestamp', Date.now().toString());
      
      // Backup en sessionStorage
      sessionStorage.setItem('estadoOperadorBackup', JSON.stringify({
        estado: estado,
        timestamp: Date.now()
      }));
      
      // Emitir evento global
      window.dispatchEvent(new CustomEvent('estadoOperadorCambiado', { 
        detail: { estado: estado } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error al guardar estado:', error);
      return false;
    }
  }
  
  // Establecer estado de un guía específico (NO afecta al operador principal)
  setEstadoGuia(idGuia, estado) {
    if (!this.ESTADOS_VALIDOS.includes(estado)) {
      console.error(`Estado no válido: ${estado}`);
      return false;
    }
    
    try {
      // Guardar en localStorage con clave específica para este guía
      localStorage.setItem(`estadoGuia_${idGuia}`, estado);
      return true;
    } catch (error) {
      console.error('Error al guardar estado del guía:', error);
      return false;
    }
  }
  
  // Obtener el estado actual del operador principal
  getEstado() {
    try {
      // Intentar obtener de localStorage
      const estado = localStorage.getItem('ultimoEstadoOperador');
      
      if (estado && this.ESTADOS_VALIDOS.includes(estado)) {
        return estado;
      }
      
      // Si no está en localStorage, intentar obtener del backup
      const backupStr = sessionStorage.getItem('estadoOperadorBackup');
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
      const estadoActual = localStorage.getItem('ultimoEstadoOperador');
      
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
export default new EstadoService(); 