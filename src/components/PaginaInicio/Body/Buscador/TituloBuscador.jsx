import { useTranslation } from "react-i18next";
import { SearchForm } from "./SearchForm";

export const TituloBuscador = ({ onSearch }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-16 relative z-10">
      <div className="flex flex-col items-center text-center">
        {/* Título principal con efecto de neón y glow futurista */}
        <div className="relative ">
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-black mb-2 tracking-tighter"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffffff 40%, #ffffff 60%, #ffffff 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",

              animation:
                "pulseTitle 3s infinite alternate, gradientFlow 6s linear infinite",
            }}
          >
            {t("title", "Explococora")}
          </h1>
          {/* Efecto de glow detrás del texto */}
          <div
            className="absolute -inset-2 blur-3xl bg-teal-500/20 rounded-full -z-10"
            style={{ animation: "glowPulse 3s infinite alternate" }}
          ></div>
        </div>

        {/* Línea decorativa con efecto de brillo */}
        <div
          className="w-36 h-1 bg-gradient-to-r from-teal-400 via-white to-teal-600 rounded-full mb-8 
                        hover:scale-150 transition-all duration-500"
          style={{ boxShadow: "0 0 15px rgba(56, 178, 172, 0.8)" }}
        ></div>

        {/* Subtítulo con efecto de desvanecimiento */}
        <h2
          className="text-xl sm:text-2xl lg:text-4xl text-white font-light mb-12 max-w-3xl leading-relaxed"
          style={{
           
            animation: "fadeIn 1.5s ease-out",
          }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white font-extrabold">
            {t("slogan", "Disfruta de la naturaleza y la aventura")}
          </span>
        </h2>

        {/* Tercer texto con efecto de brillo y borde brillante */}
        <h3
          className="text-xl sm:text-2xl lg:text-3xl text-white font-semibold mb-12
                      px-8 py-4 rounded-lg backdrop-filter backdrop-blur-sm bg-teal-800/20
                      border-2 border-teal-400/40"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.6)",
            animation: "shimmer 2.5s infinite",
            boxShadow:
              "0 0 25px rgba(56, 178, 172, 0.4), inset 0 0 15px rgba(56, 178, 172, 0.2)",
          }}
        >
          {t("findRoute", "Encuentra Tu Ruta Perfecta")}
        </h3>

        {/* Contenedor del buscador con efecto 3D */}
        <div
          className="w-full max-w-3xl transform hover:scale-[1.02] transition-all duration-300"
          style={{ filter: "drop-shadow(0 20px 30px rgba(8, 112, 112, 0.5))" }}
        >
          <SearchForm onSearch={onSearch} />
        </div>
      </div>

      {/* Estilos de animación con style normal */}
      <style>
        {`
          @keyframes pulseTitle {
            0% { opacity: 0.9; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.03); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { box-shadow: 0 0 15px rgba(56, 178, 172, 0.3), inset 0 0 15px rgba(56, 178, 172, 0.2); }
            50% { box-shadow: 0 0 30px rgba(56, 178, 172, 0.8), inset 0 0 25px rgba(56, 178, 172, 0.4); }
            100% { box-shadow: 0 0 15px rgba(56, 178, 172, 0.3), inset 0 0 15px rgba(56, 178, 172, 0.2); }
          }
          @keyframes gradientFlow {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
          @keyframes glowPulse {
            0% { opacity: 0.3; transform: scale(0.95); }
            100% { opacity: 0.5; transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};
