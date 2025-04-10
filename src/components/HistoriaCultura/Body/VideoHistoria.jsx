import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const VideoHistoria = () => {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRef = useRef(null);

  // Datos de los videos
  const videosData = [
    {
      id: 1,
      title: t("videoTitle1", "La Danza de la Palma de Cera"),
      description: t("videoDesc1", "Descubre la majestuosidad de las palmas de cera, el árbol nacional de Colombia, que desde hace siglos ha sido testigo de la evolución histórica y cultural del Valle del Cocora."),
      src: "/videos/ia_generando.mp4",
      thumbnail: "/images/carrusel4.jpg"
    },
    {
      id: 2,
      title: t("videoTitle2", "Tradiciones Ancestrales"),
      description: t("videoDesc2", "Conoce las tradiciones que han pasado de generación en generación en esta región, preservando la riqueza cultural de sus habitantes y su conexión con la naturaleza."),
      src: "/videos/cocora-video2.mp4",
      thumbnail: "/images/thumb-video2.jpg"
    },
    {
      id: 3,
      title: t("videoTitle3", "Leyendas del Valle"),
      description: t("videoDesc3", "Sumérgete en las fascinantes leyendas que rodean al Valle del Cocora, historias místicas que han dado forma a la identidad cultural de este paraíso natural."),
      src: "/videos/cocora-video3.mp4",
      thumbnail: "/images/thumb-video3.jpg"
    }
  ];

  // Cambiar video activo
  const handleVideoChange = (index) => {
    setActiveVideo(index);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-teal-50 to-white flex flex-col items-center justify-start p-3 md:p-6 transition-all duration-1000 ease-in-out relative overflow-hidden">
      {/* Patrón SVG de fondo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Montañas en diferentes capas */}
          <path
            d="M0,600 L100,450 L200,500 L300,380 L400,450 L500,300 L600,420 L700,350 L800,480 L900,400 L1000,320 L1100,450 L1200,380 L1200,600 Z"
            fill="#047857"
            fillOpacity="0.15"
          />
          <path
            d="M0,600 L150,500 L250,550 L350,450 L450,520 L550,400 L650,480 L750,420 L850,500 L950,450 L1050,500 L1200,420 L1200,600 Z"
            fill="#047857"
            fillOpacity="0.1"
          />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 z-10 py-6">
        {/* Título de la sección */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight relative inline-block mb-3">
            <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 drop-shadow-sm">
              {t("videoSectionTitle", "Historias Audiovisuales del Cocora")}
            </span>
          </h2>
          <div className="w-full max-w-3xl mx-auto h-1 bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>
        </div>

        {/* Sección de Video Principal */}
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border-2 border-teal-600/30 mb-6">
          <div className="p-3 sm:p-4 md:p-6">
            {/* Reproductor de video */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-md mb-4">
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                poster={videosData[activeVideo].thumbnail}
              >
                <source src={videosData[activeVideo].src} type="video/mp4" />
                {t("videoNotSupported", "Tu navegador no soporta la reproducción de videos.")}
              </video>
            </div>
            
            {/* Título y descripción del video */}
            <div className="p-4">
              <h3 className="text-xl sm:text-2xl font-bold text-teal-800 mb-2">
                {videosData[activeVideo].title}
              </h3>
              <p className="text-sm sm:text-base text-teal-700">
                {videosData[activeVideo].description}
              </p>
            </div>
          </div>
        </div>

        {/* Miniaturas de videos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
          {videosData.map((video, index) => (
            <div 
              key={video.id}
              className={`cursor-pointer rounded-lg overflow-hidden shadow-md border-2 transition-all duration-300 ${
                index === activeVideo 
                  ? "border-teal-600 scale-105 shadow-lg" 
                  : "border-transparent hover:border-teal-400 hover:scale-102"
              }`}
              onClick={() => handleVideoChange(index)}
            >
              <div className="relative aspect-video w-full">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === activeVideo ? "bg-teal-600" : "bg-teal-600/70"
                  }`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-white">
                <h4 className="text-sm font-medium text-teal-800 truncate">
                  {video.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elementos decorativos animados */}
      <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div 
            key={i}
            className="absolute animate-float opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`
            }}
          >
            <svg width={Math.random() * 20 + 15} height={Math.random() * 20 + 15} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" 
                stroke="rgba(4, 120, 87, 0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </div>

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-20px) translateX(15px) rotate(8deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
          50% { box-shadow: 0 0 20px 5px rgba(13, 148, 136, 0.3); }
        }

        video:hover {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Mejoras responsive */
        @media (min-width: 640px) {
          .hover\\:scale-102:hover {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoHistoria;
