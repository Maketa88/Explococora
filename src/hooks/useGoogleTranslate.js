import { useState } from 'react';
import i18next from 'i18next';

const GOOGLE_TRANSLATE_API_KEY = 'TU_API_KEY_AQUI'; // Necesitarás una API key de Google Cloud
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

export const useGoogleTranslate = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translateText = async (text, targetLanguage = 'en') => {
    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: 'es'
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const translatedText = data.data.translations[0].translatedText;

      // Actualizar automáticamente las traducciones en i18next
      i18next.addResourceBundle(
        targetLanguage,
        'translation',
        { [generateKey(text)]: translatedText },
        true,
        true
      );

      return translatedText;
    } catch (err) {
      setError(err.message);
      console.error('Error en la traducción:', err);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  // Genera una clave única para el texto
  const generateKey = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 30);
  };

  // Función para traducir y agregar nuevo contenido
  const addNewContent = async (key, spanishText) => {
    try {
      // Agregar versión en español
      i18next.addResourceBundle('es', 'translation', { [key]: spanishText }, true, true);

      // Traducir automáticamente a inglés
      const englishText = await translateText(spanishText, 'en');
      if (englishText) {
        i18next.addResourceBundle('en', 'translation', { [key]: englishText }, true, true);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error al agregar nuevo contenido:', err);
    }
  };

  return {
    translateText,
    addNewContent,
    isTranslating,
    error
  };
}; 