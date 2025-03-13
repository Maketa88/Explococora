import { useEffect, useState } from 'react'
import { buscarRutas, obtenerRutas } from '../../../../services/rutasService'
// Mantenemos la importación del JSON como fallback en caso de error con la API
import rutasDataFallback from '../../../../data/rutas.json'

export const EntrenamientoIa = () => {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [todasLasRutas, setTodasLasRutas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Cargar todas las rutas al iniciar el componente
  useEffect(() => {
    const cargarRutas = async () => {
      try {
        setCargando(true)
        const data = await obtenerRutas()
        setTodasLasRutas(data)
        setCargando(false)
      } catch (err) {
        console.error('Error al cargar las rutas desde la API:', err)
        // Usar datos locales como fallback
        setTodasLasRutas(rutasDataFallback)
        setError('No se pudieron cargar los datos desde el servidor. Mostrando datos locales.')
        setCargando(false)
      }
    }

    cargarRutas()
  }, [])

  // Función para realizar la búsqueda
  const buscarRutasLocales = (termino) => {
    if (!termino.trim()) {
      setResultados([])
      return
    }

    const terminoLower = termino.toLowerCase()
    
    // Búsqueda simple por nombre, descripción y dificultad
    const resultadosFiltrados = todasLasRutas.filter(ruta => 
      ruta.nombre.toLowerCase().includes(terminoLower) ||
      ruta.descripcion.toLowerCase().includes(terminoLower) ||
      ruta.dificultad.toLowerCase().includes(terminoLower)
    )
    
    setResultados(resultadosFiltrados)
  }

  // Función para realizar la búsqueda usando la API
  const buscarRutasAPI = async (termino) => {
    if (!termino.trim()) {
      setResultados([])
      return
    }

    try {
      setCargando(true)
      const data = await buscarRutas(termino)
      setResultados(data)
      setCargando(false)
    } catch (err) {
      console.error('Error al buscar rutas desde la API:', err)
      // Fallback a búsqueda local
      buscarRutasLocales(termino)
      setError('Error al buscar en el servidor. Realizando búsqueda local.')
      setCargando(false)
    }
  }

  // Efecto para realizar la búsqueda cuando cambia el término
  useEffect(() => {
    // Intentamos primero con la API, y si falla usamos la búsqueda local
    buscarRutasAPI(busqueda)
  }, [busqueda])

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Buscador Inteligente de Rutas</h2>
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar rutas por nombre, descripción o dificultad..."
          className="w-full p-2 border border-gray-300 rounded"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div>
        {cargando ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : resultados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultados.map((ruta, index) => (
              <div key={index} className="border rounded p-4 shadow-sm">
                <h3 className="text-xl font-semibold">{ruta.nombre}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Duración:</span> {ruta.duracion} | 
                  <span className="font-medium"> Dificultad:</span> {ruta.dificultad} | 
                  <span className="font-medium"> Distancia:</span> {ruta.distancia} km
                </p>
                <p className="text-sm mb-2">{ruta.descripcion}</p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Tipo:</span> {ruta.tipoActividad} | 
                  <span className="font-medium"> Estado:</span> {ruta.estado}
                </p>
              </div>
            ))}
          </div>
        ) : busqueda ? (
          <p className="text-center text-gray-500">No se encontraron resultados para &quot;{busqueda}&quot;</p>
        ) : (
          <p className="text-center text-gray-500">Ingresa un término de búsqueda para ver resultados</p>
        )}
      </div>
    </div>
  )
}
