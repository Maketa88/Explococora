export const IndicadorProgreso = ({ 
  icono, 
  titulo, 
  porcentaje = 100,
  animationDelay = "0s",
  compacto = false,
 
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Icono con efectos */}
      <div className={`relative ${compacto ? 'mb-0.5 md:mb-1' : 'mb-2 md:mb-3'}`}>
        <div className={`${compacto ? 'w-8 h-8 md:w-10 md:h-10' : 'w-11 h-11 md:w-14 md:h-14'} rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg relative z-10`}>
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-teal-500/80 to-teal-700/80 flex items-center justify-center">
            <div className="text-white text-xl">{icono}</div>
          </div>
          
          {/* Anillo giratorio exterior - reducido en modo compacto */}
          <div className={`absolute ${compacto ? '-inset-1' : '-inset-1.5'} rounded-full border-2 border-teal-400/30 animate-[spin_10s_linear_infinite]`}></div>
          
          {/* Puntos orbitando - reducidos en modo compacto */}
          {!compacto && (
            <>
              <div className="absolute inset-0 animate-[spin_8s_linear_infinite_reverse]" style={{ animationDelay }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-300 rounded-full shadow-[0_0_10px_2px_rgba(45,212,191,0.7)]"></div>
              </div>
              <div className="absolute inset-0 animate-[spin_12s_linear_infinite]" style={{ animationDelay: `calc(${animationDelay} + 0.5s)` }}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-300 rounded-full shadow-[0_0_10px_2px_rgba(45,212,191,0.7)]"></div>
              </div>
            </>
          )}
          
          {/* Efecto de pulso */}
          <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" style={{ animationDuration: compacto ? "1.5s" : "2s", animationDelay }}></div>
        </div>
        
        {/* Líneas de conexión animadas - reducidas en modo compacto */}
        <div className={`absolute top-full left-1/2 ${compacto ? 'h-1.5 md:h-2' : 'h-3 md:h-4'} w-px bg-gradient-to-b from-teal-400 to-transparent`}></div>
      </div>
      
      {/* Título - reducido en modo compacto */}
      <div className={`text-center ${compacto ? 'mb-0.5' : 'mb-1 md:mb-2'}`}>
        <h3 className={`${compacto ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'} font-bold text-teal-700 tracking-wider uppercase relative inline-block`}>
          {titulo}
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        </h3>
      </div>
      
      {/* Porcentaje con efecto de contador - reducido en modo compacto */}
      <div className={`relative ${compacto ? 'mb-0.5' : 'mb-1'}`}>
        <div className={`${compacto ? 'text-base md:text-lg' : 'text-lg md:text-xl'} font-bold text-teal-600 tabular-nums`}>
          {porcentaje}%
        </div>
        {!compacto && (
          <div className="absolute -inset-1 rounded-md border border-teal-200 opacity-0 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay }}></div>
        )}
      </div>
      
      {/* Barra de progreso avanzada - reducida en modo compacto */}
      <div className={`w-full ${compacto ? 'h-1.5 md:h-2' : 'h-2 md:h-2.5'} bg-gray-100 rounded-full overflow-hidden relative`}>
        {/* Marcas de porcentaje */}
        {!compacto && (
          <div className="absolute inset-0 flex justify-between px-1 items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-px h-1 md:h-1.5 bg-gray-300"></div>
            ))}
          </div>
        )}
        
        {/* Barra de progreso con efecto de brillo */}
        <div 
          className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
          style={{ width: `${porcentaje}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600"></div>
          
          {/* Efecto de brillo que se mueve */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            style={{
              animation: 'shimmerEffect 2s infinite',
              animationDelay
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}; 