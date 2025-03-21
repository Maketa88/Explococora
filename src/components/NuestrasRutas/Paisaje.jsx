export const Paisaje = ({className = ""}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="h-40 md:h-60 bg-[#e8f3f1] flex items-center justify-center overflow-hidden">
        {/* Ilustración de paisaje natural */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 300 150" className="overflow-visible">
            {/* Cielo con gradiente */}
            <defs>
              <linearGradient id="cieloGradiente" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2f1" />
                <stop offset="100%" stopColor="#b2dfdb" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="300" height="70" fill="url(#cieloGradiente)" />
            
            {/* Montañas al fondo */}
            <path d="M0,70 L40,30 L50,45 L70,25 L100,55 L130,35 L160,60 L190,20 L220,50 L250,25 L300,70" 
              fill="#115e59" opacity="0.5" />
            <path d="M0,70 L20,45 L60,55 L100,30 L140,60 L180,40 L210,55 L240,35 L270,50 L300,70" 
              fill="#0d9488" opacity="0.4" />
            
            {/* Lago/Río */}
            <path d="M0,110 C50,95 70,105 100,90 C130,75 170,85 200,80 C230,75 260,90 300,85 L300,150 L0,150 Z" 
              fill="#0f766e" opacity="0.3" />
            
            {/* Ondas de agua */}
            <path d="M20,95 Q35,90 50,95 T80,95" stroke="#0d9488" strokeWidth="1" fill="none" />
            <path d="M100,90 Q115,85 130,90 T160,90" stroke="#0d9488" strokeWidth="1" fill="none" />
            <path d="M180,85 Q195,80 210,85 T240,85" stroke="#0d9488" strokeWidth="1" fill="none" />
            <path d="M40,105 Q55,100 70,105 T100,105" stroke="#0d9488" strokeWidth="1" fill="none" />
            <path d="M150,100 Q165,95 180,100 T210,100" stroke="#0d9488" strokeWidth="1" fill="none" />
            
            {/* Terreno y colinas */}
            <path d="M0,70 C30,65 60,75 90,68 C120,60 150,67 180,70 C210,73 240,65 300,70 L300,150 L0,150 Z" 
              fill="#2d6a4f" opacity="0.5" />
            
            {/* Línea de horizonte con colinas */}
            <path d="M0,80 C15,75 30,78 45,80 S75,85 90,80 S120,75 150,78 S180,85 210,80 S240,75 270,80 S285,85 300,80" 
              stroke="none" fill="#115e59" opacity="0.6" />
            
            {/* Árboles de diferentes tamaños */}
            {[...Array(8)].map((_, i) => (
              <g key={`tree-${i}`} transform={`translate(${25 + i * 35}, ${90 - (i % 3) * 5})`}>
                {/* Tronco */}
                <rect x="-1.5" y="0" width="3" height="15" fill="#5f4339" />
                {/* Copa del árbol */}
                <path d={`M-12,0 L0,-${10 + (i % 3) * 5} L12,0 Z`} fill="#115e59" />
                <path d={`M-10,-7 L0,-${17 + (i % 3) * 5} L10,-7 Z`} fill="#0d9488" />
                <path d={`M-8,-14 L0,-${23 + (i % 3) * 5} L8,-14 Z`} fill="#0f766e" />
              </g>
            ))}
            
            {/* Arbustos y vegetación */}
            {[...Array(12)].map((_, i) => (
              <g key={`bush-${i}`} transform={`translate(${10 + i * 25}, ${110 + (i % 4) * 8})`}>
                <circle cx="0" cy="0" r={3 + (i % 3)} fill="#0d9488" opacity="0.7" />
                <circle cx="3" cy="-2" r={2 + (i % 2)} fill="#0f766e" opacity="0.8" />
                <circle cx="-2" cy="2" r={2.5 + (i % 2)} fill="#115e59" opacity="0.6" />
              </g>
            ))}
            
            {/* Flores pequeñas dispersas */}
            {[...Array(15)].map((_, i) => (
              <g key={`flower-${i}`} transform={`translate(${5 + i * 20 + (i % 5) * 5}, ${120 + (i % 5) * 6})`}>
                <circle cx="0" cy="0" r="1" fill="#f0f9ff" />
                <circle cx="0" cy="0" r="0.5" fill="#fbbf24" />
              </g>
            ))}
            
            {/* Aves volando */}
            <path d="M50,30 C52,28 54,29 56,30 C58,29 60,28 62,30" stroke="#134e4a" fill="none" strokeWidth="0.7" />
            <path d="M150,25 C152,23 154,24 156,25 C158,24 160,23 162,25" stroke="#134e4a" fill="none" strokeWidth="0.7" />
            <path d="M250,35 C252,33 254,34 256,35 C258,34 260,33 262,35" stroke="#134e4a" fill="none" strokeWidth="0.7" />
            
            {/* Sol o luna decorativo */}
            <circle cx="260" cy="25" r="8" fill="#fbbf24" opacity="0.6" />
            <circle cx="260" cy="25" r="12" stroke="#fbbf24" strokeWidth="0.5" fill="none" opacity="0.3" />
            
            {/* Puntos destacados del paisaje */}
            <g className="punto-cascada">
              <circle cx="80" cy="100" r="4" fill="#0f766e"/>
              <text x="65" y="115" fontSize="6" fill="#0f766e" className="font-medium">CASCADA</text>
            </g>
            
            <g className="punto-mirador">
              <circle cx="190" cy="65" r="4" fill="#0f766e"/>
              <text x="177" y="80" fontSize="6" fill="#0f766e" className="font-medium">MIRADOR</text>
            </g>
            
            <g className="punto-laguna">
              <circle cx="250" cy="90" r="4" fill="#0f766e"/>
              <text x="240" y="105" fontSize="6" fill="#0f766e" className="font-medium">LAGUNA</text>
            </g>
          </svg>
        </div>
        
        {/* Sello "Aventura Certificada" */}
        <div className="absolute bottom-3 right-3 w-20 h-20 rounded-full border-2 border-teal-700 flex items-center justify-center p-1 rotate-[20deg] opacity-80">
          <div className="w-full h-full rounded-full border border-teal-700 flex items-center justify-center text-center">
            <div>
              <p className="text-teal-800 text-[8px] font-bold tracking-tight">AVENTURA<br/>CERTIFICADA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

