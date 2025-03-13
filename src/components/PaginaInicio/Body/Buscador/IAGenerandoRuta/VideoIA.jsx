export function VideoIA() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-500 bg-black/95">
        <video
          src="/videos/ia_generando.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Partículas animadas flotantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Partículas brillantes */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `float ${Math.random() * 10 + 15}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

          {/* Burbujas de colores */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i + 20}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 15 + 5}px`,
                height: `${Math.random() * 15 + 5}px`,
                background: `rgba(${Math.random() * 100 + 20}, ${Math.random() * 200 + 55}, ${Math.random() * 150 + 105}, ${Math.random() * 0.3 + 0.1})`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: "blur(1px)",
                animation: `floatSlow ${Math.random() * 20 + 20}s ease-in-out infinite`,
                animationDelay: `${-Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Efectos de IA trabajando - versión mejorada */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-28 h-28 md:w-36 md:h-36">
            {/* Círculos concéntricos con estilos mejorados */}
            <div className="absolute inset-0 border-4 border-teal-500/60 rounded-full opacity-40 animate-[ping_2.5s_ease-in-out_infinite]"></div>
            <div
              className="absolute inset-2 border-4 border-teal-400/70 rounded-full opacity-60 animate-[ping_2.8s_ease-in-out_infinite]"
              style={{ animationDelay: "0.3s" }}
            ></div>
            <div
              className="absolute inset-4 border-4 border-teal-300/80 rounded-full opacity-80 animate-[ping_3.2s_ease-in-out_infinite]"
              style={{ animationDelay: "0.6s" }}
            ></div>
            <div
              className="absolute inset-6 border-4 border-white/90 rounded-full opacity-90 animate-[ping_3.5s_ease-in-out_infinite]"
              style={{ animationDelay: "0.9s" }}
            ></div>

            {/* Elemento central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-teal-500/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/90 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 