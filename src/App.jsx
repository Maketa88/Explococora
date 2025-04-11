import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { RutasExplococora } from "./routes/RutasExplococora/RutasExplococora";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";


const App = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Función para detectar si es un refresh genuino de página
    const isRefresh = () => {
      // Comprobar si el performance navigation type está disponible
      if (performance && performance.navigation) {
        return performance.navigation.type === 1; // 1 indica refresh
      }
      
      // Método alternativo usando localStorage
      const needsLoading = localStorage.getItem("needsLoading") === "true";
      // Limpiar el flag inmediatamente para evitar falsos positivos en navegación interna
      if (needsLoading) {
        localStorage.removeItem("needsLoading");
      }
      return needsLoading;
    };
    
    // Configurar el flag justo antes de un refresh
    const handleBeforeUnload = () => {
      localStorage.setItem("needsLoading", "true");
    };
    
    // Solo mostrar loading si detectamos un refresh real
    if (isRefresh()) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
    
    // Listener para cuando el usuario refresca o cierra
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Añadir un listener para interceptar clics en enlaces internos
  useEffect(() => {
    const handleLinkClick = (e) => {
      // Si es un enlace interno, asegurarse de que no se active la pantalla de carga
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('/')) {
        localStorage.removeItem("needsLoading");
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return (
    <>
      <style>{`
        ::-webkit-scrollbar {
          width: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #fff 50%, rgba(17, 94, 89, 0.5) 50%);
          border-radius: 6px;
          border: 2px solid white;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fff 50%, rgba(17, 94, 89, 0.7) 50%);
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #fff rgba(17, 94, 89, 0.5);
        }
      `}</style>
      <AuthProvider>
        {loading ? (
          <LoadingScreen isLoading={loading} />
        ) : (
          <RutasExplococora />
        )}
      </AuthProvider>
    </>
  );
};

export default App;
