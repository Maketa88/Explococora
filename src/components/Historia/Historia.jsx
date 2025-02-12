import { useTranslation } from 'react-i18next';
import Colombia from "../../assets/Images/Colombia.png";
import Usa from "../../assets/Images/Usa.png";
import { TituloExplo } from "../HistoriaCultura/Body/TituloExplo";
import { HistoriaCultura } from "../HistoriaCultura/Body/HistoriaCultura";

export const Historia = () => {
  const { t, i18n } = useTranslation();

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevoIdioma);
    console.log('Idioma cambiado a:', nuevoIdioma); // Para debug
  };

  return (
    <>
      <div className="flex justify-end p-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => i18n.changeLanguage('es')} 
            className={`transition-opacity ${i18n.language === 'es' ? 'opacity-100' : 'opacity-50'}`}
          >
            <img 
              src={Colombia} 
              alt="Bandera de Colombia"
              className="w-8 h-8 object-cover rounded"
            />
          </button>
          <span className="text-gray-500">|</span>
          <button 
            onClick={() => i18n.changeLanguage('en')}
            className={`transition-opacity ${i18n.language === 'en' ? 'opacity-100' : 'opacity-50'}`}
          >
            <img 
              src={Usa} 
              alt="USA Flag"
              className="w-8 h-8 object-cover rounded"
            />
          </button>
        </div>
      </div>

      <div>
        <TituloExplo />
      </div>

      <div>
        <HistoriaCultura />
      </div>
    </>
  );
}; 