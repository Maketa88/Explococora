import { useTranslation } from 'react-i18next';

export const NuestrasRutas = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-600">
        {t('tituloRutas')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-500">
            {t('ruta1Titulo')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('ruta1Descripcion')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-500">
            {t('ruta2Titulo')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('ruta2Descripcion')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-500">
            {t('ruta3Titulo')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('ruta3Descripcion')}
          </p>
        </div>
      </div>
    </div>
  );
}; 