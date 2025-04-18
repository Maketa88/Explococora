import { useTranslation } from "react-i18next";
import { SearchForm } from "./SearchForm";

export const TituloBuscador = ({ onSearch }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-2 sm:px-4 py-24 sm:py-8 md:py-12 lg:py-16 relative z-10 ">
      <div className="flex flex-col items-center text-center mt-12 sm:mt-32 md:mt-32 lg:mt-32 xl:mt-40">
        <div className="relative mb-2">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tighter"
            style={{
              color: "white",
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

              animation: "float 6s ease-in-out infinite",
            }}
          >
            {t("title", "Explococora")}
          </h1>
        </div>

        {/* Línea decorativa con efecto dinámico */}

        {/* Subtítulo con efecto 3D espectacular */}
        <div className="relative mb-4 mt-1 sm:mb-6 sm:mt-2 md:mb-8 md:mt-3 lg:mb-10">
          <h2
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl"
            style={{
              color: "#ffffff",
              background: "linear-gradient(to bottom, #ffffff, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `
                0 0 8px rgba(255,255,255,0.8),
                0 1px 0 rgba(255,255,255,0.9),
                0 2px 0 rgba(255,255,255,0.8),
                0 3px 0 rgba(255,255,255,0.7),
                0 4px 0 rgba(255,255,255,0.6),
                0 5px 0 rgba(255,255,255,0.5),
                0 6px 5px rgba(0,0,0,0.5),
                0 7px 10px rgba(0,0,0,0.25),
                0 8px 15px rgba(0,0,0,0.2),
                0 20px 20px rgba(0,0,0,0.15)
              `,
            }}
          >
            {t("slogan", "Disfruta de la naturaleza y la aventura")}
          </h2>

          {/* Efectos de resplandor detrás del texto */}

          {/* Línea decorativa debajo del texto */}
        </div>

        {/* Tercer texto con estilo más limpio y elegante */}
        <div className="relative mb-10">
          <h3
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium tracking-wide"
            style={{
              color: "#ffffff",
              background: "linear-gradient(to bottom, #ffffff, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `
                0 0 8px rgba(255,255,255,0.8),
                0 1px 0 rgba(255,255,255,0.9),
                0 2px 0 rgba(255,255,255,0.8),
                0 3px 0 rgba(255,255,255,0.7),
                0 4px 0 rgba(255,255,255,0.6),
                0 5px 0 rgba(255,255,255,0.5),
                0 6px 5px rgba(0,0,0,0.5),
                0 7px 10px rgba(0,0,0,0.25),
                0 8px 15px rgba(0,0,0,0.2),
                0 20px 20px rgba(0,0,0,0.15)
              `,
            }}
          >
            {t("findRoute", "Encuentra Tu Ruta Perfecta")}
          </h3>

          {/* Línea decorativa que apunta hacia el buscador */}
        </div>

        {/* Contenedor del buscador - se mantiene sin cambios */}
        <div
          className="w-full max-w-3xl transform transition-all duration-300 px-2 sm:px-4"
          style={{ filter: "drop-shadow(0 10px 20px rgba(8, 112, 112, 0.4)) drop-shadow(0 6px 10px rgba(8, 112, 112, 0.3))" }}
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
