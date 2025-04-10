import { useTranslation } from "react-i18next";

export const TituloSlider = () => {
  const { t } = useTranslation();

  return (
    <div className="relative py-8 mb-6">
      {/* Bolitas decorativas a los lados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Bolitas lado izquierdo */}
        <div className="absolute top-1/4 left-4 w-6 h-6 bg-teal-600 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute top-1/2 left-12 w-4 h-4 bg-teal-700 rounded-full opacity-30 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-8 w-5 h-5 bg-teal-500 rounded-full opacity-25 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Bolitas lado derecho */}
        <div
          className="absolute top-1/3 right-10 w-5 h-5 bg-teal-600 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "0.7s" }}
        ></div>
        <div
          className="absolute top-2/3 right-6 w-7 h-7 bg-teal-700 rounded-full opacity-15 animate-pulse"
          style={{ animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-16 w-4 h-4 bg-teal-500 rounded-full opacity-25 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Líneas decorativas */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>

      {/* Título principal con efectos */}
      <div className="relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight relative inline-block">
          <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 drop-shadow-sm">
            {t("historiasAsombrosas", "Historias Asombrosas del Valle del Cocora")}
          </span>
        </h1>

        {/* Subtítulo o decoración */}
        <div className="mt-2 text-xs font-medium uppercase tracking-widest text-teal-600 opacity-80">
          <span className="inline-block mx-2">✦</span>
          <span>{t("culturayPatrimonio", "Cultura y Patrimonio")}</span>
          <span className="inline-block mx-2">✦</span>
        </div>
      </div>
    </div>
  );
};

export default TituloSlider;
