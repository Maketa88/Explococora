

/**
 * Componente de indicador de carga circular
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element}
 */
export const CircularProgress = ({ 
  tamaño = 'md', 
  color = 'teal', 
  grosor = 'normal',
  className = ''
}) => {
  // Mapeo de tamaños
  const tamaños = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // Mapeo de colores
  const colores = {
    teal: 'border-teal-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500'
  };

  // Mapeo de grosores
  const grosores = {
    delgado: 'border-2',
    normal: 'border-4',
    grueso: 'border-8'
  };

  // Combinar clases según los valores proporcionados
  const clasesTamaño = tamaños[tamaño] || tamaños.md;
  const clasesColor = colores[color] || colores.teal;
  const clasesGrosor = grosores[grosor] || grosores.normal;

  return (
    <div className={`${clasesTamaño} ${className}`}>
      <div className={`animate-spin rounded-full ${clasesGrosor} ${clasesColor} border-t-transparent`} 
        style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}; 