import { useTranslation } from "react-i18next";
import { SearchForm } from "./SearchForm";

export const TituloBuscador = ({ onSearch }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-16 relative z-10">
      <div className="flex flex-col items-center text-center">
        {/* Título principal con efecto 3D y resplandor */}
        <div className="relative mb-2">
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter"
            style={{
              color: 'white',
              textShadow: `
                0 1px 0 #ccc,
                0 2px 0 #ccc,
                0 3px 0 #ccc,
                0 4px 0 #ccc,
                0 5px 0 #ccc,
                0 6px 0 transparent,
                0 7px 0 transparent,
                0 8px 0 transparent,
                0 9px 0 transparent,
                0 10px 30px rgba(0, 0, 0, 0.8)
              `,
              filter: 'drop-shadow(0 0 6px rgba(78, 204, 163, 0.6))',
              animation: "float 6s ease-in-out infinite"
            }}
          >
            {t("title", "Explococora")}
          </h1>
          
          
        </div>

        {/* Línea decorativa con efecto dinámico */}
        

        {/* Subtítulo con efecto de desplazamiento */}
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-light mb-16 max-w-3xl"
          style={{
            color: 'white',
            textShadow: "0 2px 15px rgba(0, 0, 0, 0.8)",
            
            filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.7))'
          }}
        >
          <span className="font-extrabold">
            {t("slogan", "Disfruta de la naturaleza y la aventura")}
          </span>
        </h2>

        {/* Tercer texto con efecto de resplandor */}
        <div className="relative mb-12 transform hover:scale-105 transition-transform duration-500">
          <h3
            className="text-xl sm:text-2xl lg:text-3xl text-white font-bold py-4 px-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.4) 0%, rgba(17, 94, 89, 0.5) 100%)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 30px rgba(56, 178, 172, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              textShadow: "0 0 15px rgba(255, 255, 255, 0.8), 0 0 5px rgba(255, 255, 255, 0.6)",
              animation: "pulse 2.5s infinite alternate"
            }}
          >
            {t("findRoute", "Encuentra Tu Ruta Perfecta")}
          </h3>
          
          {/* Efectos de luz en las esquinas */}
          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-teal-300 blur-md"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-300 blur-md"></div>
        </div>

        {/* Contenedor del buscador - se mantiene sin cambios */}
        <div
          className="w-full max-w-3xl transform hover:scale-[1.02] transition-all duration-300"
          style={{ filter: "drop-shadow(0 20px 30px rgba(8, 112, 112, 0.5))" }}
        >
          <SearchForm onSearch={onSearch} />
        </div>
      </div>

      {/* Estilos de animación */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.7; transform: scale(0.98); }
            100% { opacity: 1; transform: scale(1.02); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          @keyframes expandWidth {
            0% { width: 40%; opacity: 0.7; }
            100% { width: 80%; opacity: 1; }
          }
          @keyframes moveLight {
            0% { left: 0; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};
