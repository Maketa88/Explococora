import { IndicadorProgreso } from "./IndicadorProgreso";

// Iconos para los indicadores con tamaño más grande
const iconos = {
  busqueda: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 md:h-8 md:w-8 text-white"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  ubicacion: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 md:h-8 md:w-8 text-white"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  configuracion: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 md:h-8 md:w-8 text-white"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Componente de líneas de conexión
const LineasConexion = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Líneas horizontales */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-teal-500/20"></div>

      {/* Líneas verticales */}
      <div className="absolute top-0 bottom-0 left-1/4 w-px bg-teal-500/20"></div>
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-teal-500/20"></div>
      <div className="absolute top-0 bottom-0 left-3/4 w-px bg-teal-500/20"></div>

      {/* Puntos de intersección */}
      <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-500/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-500/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-500/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );
};

export function PanelProcesamiento() {
  return (
    <div className="w-full bg-white rounded-xl p-3 md:p-4 lg:p-6 shadow-lg border border-gray-100 relative overflow-hidden">
      {/* Fondo con patrón de cuadrícula */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBkOWY4OCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>

      {/* Efecto de brillo en las esquinas */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl"></div>

      {/* Líneas de conexión */}
      <LineasConexion />

      {/* Título de la sección */}
      <div className="relative z-10 mb-4 md:mb-6 text-center">
        <h2 className="text-lg md:text-xl font-bold text-teal-700 inline-block relative">
          IA BUSCANDO TU AVENTURA PERSONALIZADA
        </h2>
      </div>

      {/* Componentes de análisis - en disposición horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 relative z-10">
        <IndicadorProgreso
          icono={iconos.busqueda}
          titulo="ANALIZANDO PREFERENCIAS"
          porcentaje={100}
        />

        <IndicadorProgreso
          icono={iconos.ubicacion}
          titulo="IDENTIFICANDO PUNTOS"
          porcentaje={75}
          animationDelay="0.3s"
        />

        <IndicadorProgreso
          icono={iconos.configuracion}
          titulo="OPTIMIZANDO RUTA"
          porcentaje={45}
          animationDelay="0.6s"
        />
      </div>

      {/* Mensaje de estado */}
      <div className="mt-4 md:mt-6 text-center relative z-10">
        <p className="text-teal-600 text-xs md:text-sm animate-pulse">
          Procesando datos... Por favor espera un momento
        </p>
      </div>
    </div>
  );
}
