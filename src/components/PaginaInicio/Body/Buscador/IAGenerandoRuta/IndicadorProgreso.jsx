export const IndicadorProgreso = ({ 
  icono, 
  titulo, 
  porcentaje = 100,
  animationDelay = "0s"
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Icono con efectos */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg relative z-10">
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-teal-500/80 to-teal-700/80 flex items-center justify-center">
            <div className="text-white text-xl">{icono}</div>
          </div>
          
          {/* Anillo giratorio exterior */}
          <div className="absolute -inset-2 rounded-full border-2 border-teal-400/30 animate-[spin_10s_linear_infinite]"></div>
          
          {/* Puntos orbitando */}
          <div className="absolute inset-0 animate-[spin_8s_linear_infinite_reverse]" style={{ animationDelay }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-teal-300 rounded-full shadow-[0_0_10px_2px_rgba(45,212,191,0.7)]"></div>
          </div>
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite]" style={{ animationDelay: `calc(${animationDelay} + 0.5s)` }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-teal-300 rounded-full shadow-[0_0_10px_2px_rgba(45,212,191,0.7)]"></div>
          </div>
          
          {/* Efecto de pulso */}
          <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" style={{ animationDuration: "2s", animationDelay }}></div>
        </div>
        
        {/* Líneas de conexión animadas */}
        <div className="absolute top-full left-1/2 h-6 w-px bg-gradient-to-b from-teal-400 to-transparent"></div>
      </div>
      
      {/* Título */}
      <div className="text-center mb-3">
        <h3 className="text-sm font-bold text-teal-700 tracking-wider uppercase relative inline-block">
          {titulo}
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        </h3>
      </div>
      
      {/* Porcentaje con efecto de contador */}
      <div className="relative mb-2">
        <div className="text-2xl font-bold text-teal-600 tabular-nums">
          {porcentaje}%
        </div>
        <div className="absolute -inset-1 rounded-md border border-teal-200 opacity-0 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay }}></div>
      </div>
      
      {/* Barra de progreso avanzada */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
        {/* Marcas de porcentaje */}
        <div className="absolute inset-0 flex justify-between px-1 items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-px h-1.5 bg-gray-300"></div>
          ))}
        </div>
        
        {/* Barra de progreso con efecto de brillo */}
        <div 
          className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
          style={{ width: `${porcentaje}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-400"></div>
          
          {/* Efecto de brillo que se mueve */}
          <div 
            className="absolute inset-0 opacity-70"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              transform: "translateX(-100%)",
              animation: "shimmerEffect 2s infinite",
              animationDelay
            }}
          ></div>
          
          {/* Burbujas subiendo */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="absolute bottom-0 rounded-full bg-white/30 w-1.5 h-1.5"
                style={{
                  left: `${15 + i * 30}%`,
                  animation: "bubbleRise 3s ease-in infinite",
                  animationDelay: `${i * 0.5 + 0.2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 