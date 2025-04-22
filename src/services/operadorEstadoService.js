/**
 * Servicio para gestionar los estados de los operadores
 */
class OperadorEstadoService {
  constructor() {
    this.estados = new Map(); // Mapa para almacenar estados por cédula
    this.callbacks = new Map(); // Callbacks de actualización
    this.API_URL = 'https://servicio-explococora.onrender.com/usuarios'; // Base URL para las rutas de estados
    
    // Inicializar escucha de eventos
    this.inicializarEventos();
    

  }
  
  // Obtener estado de un operador específico
  getEstado(cedula) {
    if (!cedula) return 'disponible';
    
    // Intentar obtener desde el Map en memoria
    if (this.estados.has(cedula)) {
      return this.estados.get(cedula);
    }
    
    // Intentar obtener desde localStorage
    const estadoGuardado = localStorage.getItem(`estadoOperador_${cedula}`);
    if (estadoGuardado) {
      this.estados.set(cedula, estadoGuardado);
      return estadoGuardado;
    }
    
    // Si no tenemos estado guardado, iniciar una sincronización asíncrona
    this.obtenerEstadoDesdeServidor(cedula).catch(console.error);
    
    return 'disponible'; // Estado por defecto mientras se sincroniza
  }
  
  // Establecer estado de un operador
  setEstado(cedula, estado) {
    if (!cedula) return false;
    
    // Guardar en memoria
    this.estados.set(cedula, estado);
    
    // Guardar en localStorage
    localStorage.setItem(`estadoOperador_${cedula}`, estado);
    localStorage.setItem(`estadoOperador_${cedula}_timestamp`, Date.now().toString());
    
    // Notificar a los componentes suscritos
    this.notificarCambio(cedula, estado);
    
    // Notificar mediante evento global
    window.dispatchEvent(new CustomEvent('estadoOperadorCambiado', { 
      detail: { cedula, estado } 
    }));
    
    return true;
  }
  
  // Sincronizar con el servidor (obtener todos los estados)
  async sincronizarEstados() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Silenciosamente fallar sin mostrar mensaje en la consola
        return false;
      }
          
      // Usar la ruta específica para listar estados (requiere rol admin u operador)
      const response = await fetch(`${this.API_URL}/listar-estados`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`Error al obtener estados (${response.status}): ${response.statusText}`);
        
        // Si es un error de autorización, podemos intentar obtener estados individuales
        if (response.status === 401 || response.status === 403) {
          console.log('Intentando obtener estados de operadores individuales...');
          // Aquí podríamos implementar una estrategia alternativa si es necesario
        }
        
        return false;
      }
      
      const data = await response.json();
      
      // Procesar operadores - asumimos que el backend devuelve {data: {operadores: [...]}}
      if (data && data.data && data.data.operadores && Array.isArray(data.data.operadores)) {
        console.log(`Recibidos ${data.data.operadores.length} estados de operadores del servidor`);
        
        data.data.operadores.forEach(operador => {
          if (operador.cedula && operador.estado) {
            const estadoActual = this.getEstado(operador.cedula);
            
            // Solo actualizar si hay cambio
            if (estadoActual !== operador.estado) {
              console.log(`Actualizando operador ${operador.cedula}: ${estadoActual} → ${operador.estado}`);
              this.setEstado(operador.cedula, operador.estado);
            }
          }
        });
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  
  // Inicializar escucha de eventos
  inicializarEventos() {
    // Escuchar eventos globales de cambio de estado
    window.addEventListener('estadoOperadorCambiado', (event) => {
      const { cedula, estado } = event.detail;
      
      // Actualizar estado en memoria
      this.estados.set(cedula, estado);
    });
    

    
    // Sincronizar cuando la ventana recupere el foco
    window.addEventListener('focus', () => {
      this.sincronizarEstados().catch(console.error);
    });
    
    // Sincronizar al cambiar de visibilidad
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sincronizarEstados().catch(console.error);
      }
    });
  }
  
  // Suscribir componente a actualizaciones de un operador específico
  suscribirActualizacion(cedula, callback) {
    if (!this.callbacks.has(cedula)) {
      this.callbacks.set(cedula, new Set());
    }
    
    this.callbacks.get(cedula).add(callback);
    
    // Devolver función para cancelar suscripción
    return () => {
      if (this.callbacks.has(cedula)) {
        this.callbacks.get(cedula).delete(callback);
      }
    };
  }
  
  // Notificar cambio a los componentes suscritos
  notificarCambio(cedula, estado) {
    if (this.callbacks.has(cedula)) {
      this.callbacks.get(cedula).forEach(callback => {
        try {
          callback(estado);
        } catch (error) {
          console.error('Error en callback de estado:', error);
        }
      });
    }
  }
  
  // Obtener el estado desde el servidor para un operador específico
  async obtenerEstadoDesdeServidor(cedula) {
    try {
      const token = localStorage.getItem('token');
      if (!token || !cedula) return null;
      
      // Usar la ruta específica para consultar estado por cédula
      const response = await fetch(`${this.API_URL}/consultar-estado/cedula/${cedula}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`Error al obtener estado del operador ${cedula} (${response.status})`);
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.data && data.data.estado) {
        const nuevoEstado = data.data.estado;
        
        // Actualizar estado local
        this.setEstado(cedula, nuevoEstado);
        
        return nuevoEstado;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error al obtener estado del operador ${cedula}:`, error);
      return null;
    }
  }
  
  // Cambiar estado de un operador
  async cambiarEstado(cedula, nuevoEstado) {
    try {
      const token = localStorage.getItem('token');
      if (!token || !cedula) return false;
      
      // Actualizar primero localmente para una respuesta inmediata
      this.setEstado(cedula, nuevoEstado);
      
      // Usar la ruta específica para cambiar estado por cédula
      const response = await fetch(`${this.API_URL}/cambiar-estado/cedula/${cedula}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nuevoEstado
        })
      });
      
      if (!response.ok) {
        console.warn(`Error al cambiar estado del operador ${cedula} en el servidor (${response.status})`);
        
        // Aquí podrías optar por revertir el cambio local si el servidor lo rechaza
        // this.obtenerEstadoDesdeServidor(cedula).catch(console.error);
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error al cambiar estado del operador ${cedula}:`, error);
      return false;
    }
  }
}

// Exportar instancia única
const operadorEstadoService = new OperadorEstadoService();
export default operadorEstadoService;
