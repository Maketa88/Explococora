import React from 'react';

export const PaisajeFondo = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        opacity: 0.15,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '30%',
          transform: 'translate(-50%, -50%)',
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#0f766e',
          opacity: 0.3,
        }}
      >
        PAGO
      </div>
      
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          right: '30%',
          transform: 'translate(50%, 50%)',
          fontSize: '80px',
          fontWeight: 'bold',
          color: '#0f766e',
          opacity: 0.3,
        }}
      >
        EXPLOCOCORA
      </div>
      
      <div
        style={{
          height: '100%',
          width: '100%',
          background: '#e8f3f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 300 150" style={{ transform: 'scale(1.5)' }}>
          <defs>
            <linearGradient id="cielo" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e0f2f1" />
              <stop offset="100%" stopColor="#b2dfdb" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="300" height="70" fill="url(#cielo)" />
          
          <path d="M0,70 L40,30 L50,45 L70,25 L100,55 L130,35 L160,60 L190,20 L220,50 L250,25 L300,70" 
            fill="#115e59" opacity="0.5" />
          <path d="M0,70 L20,45 L60,55 L100,30 L140,60 L180,40 L210,55 L240,35 L270,50 L300,70" 
            fill="#0d9488" opacity="0.4" />
          
          <path d="M0,110 C50,95 70,105 100,90 C130,75 170,85 200,80 C230,75 260,90 300,85 L300,150 L0,150 Z" 
            fill="#0f766e" opacity="0.3" />
          
          <path d="M0,70 C30,65 60,75 90,68 C120,60 150,67 180,70 C210,73 240,65 300,70 L300,150 L0,150 Z" 
            fill="#2d6a4f" opacity="0.5" />
          
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={`tree-${i}`} transform={`translate(${25 + i * 35}, ${90 - (i % 3) * 5})`}>
              <rect x="-1.5" y="0" width="3" height="15" fill="#5f4339" />
              <path d={`M-12,0 L0,-${10 + (i % 3) * 5} L12,0 Z`} fill="#115e59" />
              <path d={`M-10,-7 L0,-${17 + (i % 3) * 5} L10,-7 Z`} fill="#0d9488" />
            </g>
          ))}
          
          <circle cx="260" cy="25" r="8" fill="#fbbf24" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}; 