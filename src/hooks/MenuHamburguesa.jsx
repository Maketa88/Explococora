import { useState, useEffect } from "react";

export const useAlternarMenu = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const alternarMenu = () => {
    setMenuAbierto((anterior) => !anterior);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  // Escucha clics en todo el documento
  useEffect(() => {
    if (!menuAbierto) return; // Solo si el menú está abierto

    const handleClick = (event) => {
      // Verificar si el clic fue en un enlace o dentro de un nav
      const esEnlace = event.target.tagName === 'A' || 
                       event.target.closest('a') || 
                       event.target.closest('nav a') ||
                       event.target.closest('button') ||
                       event.target.closest('[role="menuitem"]') ||
                       event.target.getAttribute('href');
      
      if (esEnlace) {
        setMenuAbierto(false);
      }
    };

    // Usar captura para que este evento se procese antes que otros
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [menuAbierto]);

  return { menuAbierto, alternarMenu, cerrarMenu };
};
