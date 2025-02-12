import { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';

export const TuComponente = () => {
  const { language } = useContext(LanguageContext);
  
  return (
    <div>
      <h1>{translations[language].welcome}</h1>
    </div>
  );
}; 