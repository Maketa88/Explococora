import React from "react";
import error from "../../../../assets/Images/paisaje.svg";

export const PaginaNoEncontrada = () => {
  return (
    <section className="relative overflow-hidden">
        {/* Fondo decorativo inspirado en el Valle del Cocora */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

          {/* Siluetas de palmeras de cera */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg
              viewBox="0 0 1200 600"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Silueta de montaña con árboles */}
              <path
                d="M0,600 L300,200 L400,300 L500,150 L600,250 L800,100 L1000,300 L1200,200 L1200,600 Z"
                fill="#047857"
                opacity="0.3"
              />
              
              {/* Arroyo serpenteante */}
              <path
                d="M0,450 C100,430 150,470 250,440 C350,410 400,450 500,430 C600,410 650,450 750,430 C850,410 900,450 1000,430 C1100,410 1150,450 1200,430 L1200,500 C1100,520 1050,480 950,500 C850,520 800,480 700,500 C600,520 550,480 450,500 C350,520 300,480 200,500 C100,520 50,480 0,500 Z"
                fill="#047857"
                opacity="0.4"
              />
              
              {/* Silueta de árbol 1 - pino */}
              <path
                d="M200,600 L200,400 L150,400 L200,350 L170,350 L220,300 L190,300 L240,250 L210,250 L250,200 L230,200 L270,150 L250,150 L280,100 L310,150 L290,150 L330,200 L310,200 L350,250 L320,250 L370,300 L340,300 L390,350 L360,350 L410,400 L360,400 L360,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Silueta de árbol 2 - frondoso */}
              <path
                d="M600,600 L600,350 C600,350 550,300 570,250 C590,200 630,220 650,180 C670,140 700,160 720,130 C740,100 780,120 800,150 C820,180 850,160 870,200 C890,240 930,220 950,270 C970,320 920,350 920,350 L920,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Silueta de árbol 3 - roble */}
              <path
                d="M1000,600 L1000,400 C1000,400 950,380 960,340 C970,300 1000,320 1010,280 C1020,240 1050,260 1060,220 C1070,180 1100,200 1110,240 C1120,280 1150,260 1160,300 C1170,340 1200,320 1200,360 C1200,400 1150,400 1150,400 L1150,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Flores en el campo - grupo 1 */}
              <g opacity="0.6">
                <circle cx="150" cy="500" r="15" fill="#047857" />
                <circle cx="170" cy="485" r="15" fill="#047857" />
                <circle cx="190" cy="500" r="15" fill="#047857" />
                <circle cx="170" cy="515" r="15" fill="#047857" />
                <circle cx="170" cy="500" r="10" fill="#047857" />
              </g>
              
              {/* Flores en el campo - grupo 2 */}
              <g opacity="0.6">
                <circle cx="450" cy="520" r="15" fill="#047857" />
                <circle cx="470" cy="505" r="15" fill="#047857" />
                <circle cx="490" cy="520" r="15" fill="#047857" />
                <circle cx="470" cy="535" r="15" fill="#047857" />
                <circle cx="470" cy="520" r="10" fill="#047857" />
              </g>
              
              {/* Flores en el campo - grupo 3 */}
              <g opacity="0.6">
                <circle cx="750" cy="500" r="15" fill="#047857" />
                <circle cx="770" cy="485" r="15" fill="#047857" />
                <circle cx="790" cy="500" r="15" fill="#047857" />
                <circle cx="770" cy="515" r="15" fill="#047857" />
                <circle cx="770" cy="500" r="10" fill="#047857" />
              </g>
              
              {/* Mariposas */}
              <g opacity="0.7">
                {/* Mariposa 1 */}
                <path
                  d="M300,200 C320,180 340,190 330,210 C340,230 320,240 300,220 C280,240 260,230 270,210 C260,190 280,180 300,200 Z"
                  fill="#047857"
                />
                {/* Mariposa 2 */}
                <path
                  d="M700,150 C720,130 740,140 730,160 C740,180 720,190 700,170 C680,190 660,180 670,160 C660,140 680,130 700,150 Z"
                  fill="#047857"
                />
                {/* Mariposa 3 */}
                <path
                  d="M900,250 C920,230 940,240 930,260 C940,280 920,290 900,270 C880,290 860,280 870,260 C860,240 880,230 900,250 Z"
                  fill="#047857"
                />
              </g>
            </svg>
          </div>
        </div>
    <div className="flex justify-center items-center min-h-full">
      <div className=" max-w-2xl">
        <img
          src={error} // Reemplaza con tu imagen
          alt="Página no encontrada"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
    </section>
  );
};
