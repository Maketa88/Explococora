import { iaBuscadorService } from '../services/IABuscadorService';

// Pruebas para el servicio de IA del buscador
describe('IABuscadorService', () => {
  // Prueba para consultas simples
  test('Procesa correctamente una consulta simple de dificultad', () => {
    const resultado = iaBuscadorService.procesarConsulta('quiero una ruta fácil');
    
    expect(resultado.filtros).toHaveProperty('dificultad', 'Facil');
    expect(resultado.coincidencias).toContain('quiero una ruta fácil');
  });
  
  // Prueba para consultas con variaciones
  test('Reconoce variaciones de las consultas', () => {
    const resultado = iaBuscadorService.procesarConsulta('busco un sendero para principiantes');
    
    expect(resultado.filtros).toHaveProperty('dificultad', 'Facil');
  });
  
  // Prueba para consultas combinadas
  test('Combina correctamente múltiples filtros', () => {
    const resultado = iaBuscadorService.procesarConsulta('estoy embarazada y quiero ver el río');
    
    expect(resultado.filtros).toHaveProperty('dificultad', 'Facil');
    expect(resultado.filtros).toHaveProperty('duracion_maxima', '1 Hora');
    expect(resultado.filtros).toHaveProperty('nombre_contiene', 'Río');
  });
  
  // Prueba para recomendaciones
  test('Genera recomendaciones adecuadas', () => {
    const resultado = iaBuscadorService.procesarConsulta('quiero ver cóndores');
    
    expect(resultado.recomendaciones.length).toBeGreaterThan(0);
    expect(resultado.recomendaciones.some(r => r.includes('cóndores'))).toBeTruthy();
  });
  
  // Prueba para consultas sin coincidencias
  test('Maneja correctamente consultas sin coincidencias', () => {
    const resultado = iaBuscadorService.procesarConsulta('quiero ver elefantes');
    
    expect(Object.keys(resultado.filtros).length).toBe(0);
    expect(resultado.coincidencias.length).toBe(0);
  });
  
  // Prueba para normalización de texto
  test('Normaliza correctamente el texto (sin acentos, minúsculas)', () => {
    const resultado1 = iaBuscadorService.procesarConsulta('QUIERO UNA RUTA FÁCIL');
    const resultado2 = iaBuscadorService.procesarConsulta('quiero una ruta facil');
    
    expect(resultado1.filtros).toEqual(resultado2.filtros);
  });
  
  // Prueba para priorización de filtros
  test('Prioriza correctamente los filtros de seguridad', () => {
    const resultado = iaBuscadorService.procesarConsulta('soy atlético pero estoy embarazada');
    
    // Debe priorizar 'Facil' sobre 'Desafiante' por seguridad
    expect(resultado.filtros).toHaveProperty('dificultad', 'Facil');
  });
}); 