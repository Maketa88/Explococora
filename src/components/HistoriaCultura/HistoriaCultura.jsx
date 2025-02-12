import { useTranslation } from 'react-i18next';
import Colombia from "../../assets/Images/Colombia.png";
import Usa from "../../assets/Images/Usa.png";

export const HistoriaCultura = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Selector de idioma */}
      <div className="flex justify-end mb-4">
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

      {/* Contenido */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">
          {t('tituloHistoriaCultural')}
        </h1>
        <h2 className="text-2xl text-gray-700 mb-8 text-center">
          {t('subtituloHistoriaCultural')}
        </h2>

        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            {t('parrafoHistoriaCultural1')}
          </p>
          <p className="text-lg leading-relaxed">
            {t('parrafoHistoriaCultural2')}
          </p>
          <p className="text-lg leading-relaxed">
            {t('parrafoHistoriaCultural3')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">{t('tradicionesTitulo')}</h3>
            {/* Contenido de tradiciones */}
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">{t('costumbresTitulo')}</h3>
            {/* Contenido de costumbres */}
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">{t('patrimonioTitulo')}</h3>
            {/* Contenido de patrimonio */}
          </div>
        </div>
      </div>
    </div>
  );
}; 