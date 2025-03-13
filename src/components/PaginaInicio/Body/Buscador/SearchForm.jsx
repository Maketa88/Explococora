import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { VistaIAGenerandoRuta } from './IAGenerandoRuta'

export const SearchForm = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [mostrarIA, setMostrarIA] = useState(false)
  const { t } = useTranslation()

  // Efecto para controlar el scroll del body cuando la modal está abierta
  useEffect(() => {
    const header = document.querySelector('header')
    
    if (mostrarIA) {
      // Deshabilitar scroll en el body cuando la modal está abierta
      document.body.style.overflow = 'hidden'
      
      // Ocultar el header cuando el modal está abierto
      if (header) {
        // Guardar el z-index original
        header.dataset.originalZIndex = header.style.zIndex || ''
        header.dataset.originalPosition = header.style.position || ''
        
        // Aplicar nuevos estilos para ocultar el header
        header.style.zIndex = '-1'
        header.style.position = 'relative'
      }
    } else {
      // Restaurar scroll cuando se cierra
      document.body.style.overflow = 'auto'
      
      // Restaurar el header
      if (header) {
        // Restaurar los estilos originales
        header.style.zIndex = header.dataset.originalZIndex || ''
        header.style.position = header.dataset.originalPosition || ''
      }
    }
    
    // Limpieza al desmontar
    return () => {
      document.body.style.overflow = 'auto'
      
      // Restaurar el header
      if (header) {
        header.style.zIndex = header.dataset.originalZIndex || ''
        header.style.position = header.dataset.originalPosition || ''
      }
    }
  }, [mostrarIA])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setMostrarIA(true)
      if (onSearch) {
        onSearch(searchQuery)
      }
    }
  }

  // Componente Modal que se renderizará en el portal
  const Modal = () => {
    if (!mostrarIA) return null
    
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto py-3 px-4">
        <div className="relative w-full max-w-4xl mx-auto mt-2 mb-2 bg-white rounded-2xl shadow-2xl">
          {/* Botón para cerrar - ahora fuera del contenedor principal para asegurar visibilidad */}
          <button 
            onClick={() => setMostrarIA(false)}
            className="absolute -top-4 -right-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 z-[10000] transition-colors duration-300 shadow-lg"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-8 md:p-10 pt-12">
            <VistaIAGenerandoRuta />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex items-center w-full max-w-3xl bg-white rounded-full overflow-hidden shadow-lg">
        <div className="flex-grow flex items-center pl-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', '¿Qué tipo de aventura buscas hoy?')}
            className="w-full py-3 px-4 outline-none text-gray-700"
          />
        </div>
        <button 
          type="submit" 
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 transition-colors duration-300 flex items-center"
        >
          {t('searchButton', 'BUSCAR AVENTURA')}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>

      {/* Renderizar el modal en un portal */}
      {mostrarIA && createPortal(<Modal />, document.body)}
    </>
  )
}
