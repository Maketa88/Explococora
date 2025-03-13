import { useTranslation } from 'react-i18next'
import { SearchForm } from './SearchForm'

export const TituloBuscador = ({ onSearch }) => {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="flex flex-col items-center text-center mb-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 text-white drop-shadow-lg" 
            style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {t('title', 'Explococora')}
        </h1>
        <h2 className="text-xl sm:text-2xl lg:text-3xl text-white mb-10 drop-shadow-lg" 
            style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {t('slogan', 'Disfruta de la naturaleza y la aventura')}
        </h2>
        <h3 className="text-lg sm:text-xl lg:text-2xl text-white mb-8 drop-shadow-lg mt-6" 
            style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
          {t('findRoute', 'Encuentra Tu Ruta Perfecta')}
        </h3>
        <SearchForm onSearch={onSearch} />
      </div>
    </div>
  )
} 