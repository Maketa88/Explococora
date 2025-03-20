import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white to-teal-100 z-50 overflow-hidden"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Patrón SVG de fondo */}
          <div className="absolute top-0 left-0 w-full h-full opacity-40">
            <svg
              viewBox="0 0 1200 600"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Título Explococora como marca de agua en el fondo */}
              <text
                x="600"
                y="300"
                textAnchor="middle"
                className="text-5xl font-bold"
                fill="#047857"
                fontSize="120"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
                opacity="0.15"
                letterSpacing="40"
              >
                EXPLOCOCORA
              </text>
              
              {/* Montañas en diferentes capas */}
              <path
                d="M0,600 L100,450 L200,500 L300,380 L400,450 L500,300 L600,420 L700,350 L800,480 L900,400 L1000,320 L1100,450 L1200,380 L1200,600 Z"
                fill="#047857"
                fillOpacity="0.2"
              />
              <path
                d="M0,600 L150,500 L250,550 L350,450 L450,520 L550,400 L650,480 L750,420 L850,500 L950,450 L1050,500 L1200,420 L1200,600 Z"
                fill="#047857"
                fillOpacity="0.15"
              />
              <path
                d="M0,600 L200,550 L300,520 L400,540 L500,480 L600,520 L700,500 L800,550 L900,530 L1000,560 L1100,530 L1200,550 L1200,600 Z"
                fill="#047857"
                fillOpacity="0.1"
              />
            </svg>
          </div>
          
          {/* Contenido principal - Ahora sin fondo blanco */}
          <div className="flex flex-col items-center z-10">
            {/* Logo */}
            <motion.img
              className="w-48 h-auto mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* GIF de caballo corriendo */}
            <motion.div
              className="relative w-48 h-48 mb-4"
              animate={{ 
                x: [0, 20, 0, -20, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
              }}
            >
              <img
                src="https://i.pinimg.com/originals/8b/2c/b8/8b2cb86d0325eaae5f68b99ffe68fd83.gif"
                alt="Cargando..."
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Barra de progreso */}
            <div className="w-64 h-2 bg-gray-200 rounded-full mt-2 mb-4">
              <motion.div 
                className="h-full bg-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Texto de carga */}
            <motion.h1 
              className="text-2xl font-semibold text-teal-800"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Preparando tu aventura...
            </motion.h1>
            
            <motion.p 
              className="text-sm text-teal-600 mt-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Cargando paisajes y senderos mágicos 🌿 {progress}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
