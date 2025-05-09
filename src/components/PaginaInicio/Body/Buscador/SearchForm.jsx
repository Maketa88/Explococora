import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { VistaIAGenerandoRuta } from './IAGenerandoRuta/VistaIAGenerandoRuta'

export const SearchForm = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [mostrarIA, setMostrarIA] = useState(false)
  const [consultaActual, setConsultaActual] = useState('')
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
      setConsultaActual(searchQuery)
      setMostrarIA(true)
      if (onSearch) {
        onSearch(searchQuery)
      }
    }
  }

  // Modal component with improved responsive design
  const Modal = () => {
    if (!mostrarIA) return null
    
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto py-3 px-2 sm:px-4">
        <div className="relative w-full max-w-4xl mx-auto mt-12 sm:mt-8 md:mt-4 lg:mt-2 mb-2 bg-white rounded-2xl shadow-2xl">
          {/* Botón para cerrar - ahora con posicionamiento responsivo */}
          <button 
            onClick={() => setMostrarIA(false)}
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 sm:p-3 z-[10000] transition-colors duration-300 shadow-lg"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6 sm:p-8 md:p-10 pt-10 sm:pt-12">
            <VistaIAGenerandoRuta consulta={consultaActual} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex items-center w-full max-w-3xl overflow-hidden group">
        {/* Contenedor principal con efectos visuales y mejor responsive */}
        <div className="flex w-full bg-white/15 backdrop-blur-lg rounded-full border-2 overflow-hidden transition-all duration-500">
          
          {/* Icono de búsqueda con animación */}
          <div className="pl-4 sm:pl-6 flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Input de búsqueda con efectos */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', '¿Qué tipo de aventura buscas hoy?')}
            className="w-full py-4 sm:py-5 px-3 sm:px-4 outline-none text-white text-sm sm:text-base font-bold placeholder-white/70 bg-transparent backdrop-blur-lg"
          />
          
          {/* Botón de búsqueda con efectos y texto responsivo */}
          <button 
            type="submit" 
            className="bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-medium py-4 sm:py-5 px-4 sm:px-8 transition-all duration-300 flex items-center shadow-inner min-w-[120px] sm:min-w-[180px] justify-center group-hover:scale-105"
          >
            <span className="hidden xs:inline">{t('searchButton', 'BUSCAR AVENTURA')}</span>
            <span className="xs:hidden">BUSCAR</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>

      {/* Renderizar el modal en un portal */}
      {mostrarIA && createPortal(<Modal />, document.body)}
    </>
  )
}
