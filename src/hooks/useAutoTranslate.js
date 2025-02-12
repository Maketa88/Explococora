import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export const useAutoTranslate = () => {
  const { t, i18n } = useTranslation();

  const addTranslation = (key, translations) => {
    // Añade nuevas traducciones dinámicamente
    Object.keys(translations).forEach(lang => {
      i18next.addResourceBundle(lang, 'translation', {
        [key]: translations[lang]
      }, true, true);
    });
  };

  return {
    t,
    i18n,
    addTranslation
  };
}; 