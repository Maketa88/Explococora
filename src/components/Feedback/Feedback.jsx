import React, { useState } from 'react';

const Feedback = () => {
  // Datos de feedback falsos con fechas actualizadas
  const feedbackData = [
    { id: 1, username: 'María López', rating: 5, guide: '@carlos_montaña', date: '2025-03-09', comment: '¡Excelente experiencia! Carlos conoce muy bien las rutas y fue muy paciente.' },
    { id: 2, username: 'Juan Pérez', rating: 4, guide: '@ana_senderista', date: '2025-03-09', comment: 'Ana nos mostró lugares increíbles que no hubiéramos encontrado solos.' },
    { id: 3, username: 'Laura Gómez', rating: 5, guide: '@carlos_montaña', date: '2025-03-08', comment: 'Totalmente recomendado para principiantes, Carlos adapta el ritmo a tus necesidades.' },
    { id: 4, username: 'Roberto Sánchez', rating: 3, guide: '@miguel_aventura', date: '2025-03-08', comment: 'Buen guía, aunque el ritmo fue un poco rápido para nuestro grupo.' },
    { id: 5, username: 'Elena Ruiz', rating: 5, guide: '@ana_senderista', date: '2025-03-07', comment: 'Ana conoce cada detalle de la flora local. ¡Aprendimos muchísimo!' },
    { id: 6, username: 'Daniel Torres', rating: 4, guide: '@miguel_aventura', date: '2025-03-06', comment: 'Recorrido desafiante pero gratificante. Miguel sabe cómo motivarte.' },
    { id: 7, username: 'Carmen Navarro', rating: 5, guide: '@carlos_montaña', date: '2025-03-05', comment: 'Tercera vez con Carlos como guía y siempre descubrimos algo nuevo.' },
    { id: 8, username: 'Pablo Martín', rating: 4, guide: '@ana_senderista', date: '2025-03-04', comment: 'Gran atención a la seguridad. Ana está pendiente de todo el grupo.' },
    { id: 9, username: 'Lucía Fernández', rating: 5, guide: '@carlos_montaña', date: '2025-03-03', comment: 'Una experiencia inolvidable. Senderos impresionantes y Carlos es un guía excepcional.' },
    { id: 10, username: 'Alberto Díaz', rating: 4, guide: '@miguel_aventura', date: '2025-03-02', comment: 'Miguel conoce rutas poco transitadas con vistas espectaculares.' },
    { id: 11, username: 'Sofia Moreno', rating: 5, guide: '@ana_senderista', date: '2025-03-01', comment: 'Ana hace que cada excursión sea educativa y divertida a la vez.' },
    { id: 12, username: 'Javier Romero', rating: 4, guide: '@carlos_montaña', date: '2025-02-28', comment: 'Carlos sabe adaptar la ruta según las condiciones climáticas. Muy profesional.' },
    { id: 13, username: 'Isabel Herrera', rating: 3, guide: '@miguel_aventura', date: '2025-02-26', comment: 'Buena experiencia aunque algunas partes fueron más difíciles de lo esperado.' },
    { id: 14, username: 'Diego Ortiz', rating: 5, guide: '@ana_senderista', date: '2025-02-24', comment: 'Ana nos llevó a un mirador secreto. ¡La vista valió cada paso del recorrido!' },
    { id: 15, username: 'Marta Delgado', rating: 4, guide: '@carlos_montaña', date: '2025-02-22', comment: 'Carlos compartió historias fascinantes sobre cada lugar que visitamos.' },
    { id: 16, username: 'Raúl Jiménez', rating: 5, guide: '@miguel_aventura', date: '2025-02-20', comment: 'Miguel es un guía excepcional. Conoce cada rincón de las montañas como su propia casa.' },
    { id: 17, username: 'Natalia Vega', rating: 4, guide: '@ana_senderista', date: '2025-02-18', comment: 'Ana adaptó la ruta perfectamente a nuestra condición física. Todo un acierto elegirla.' },
    { id: 18, username: 'Antonio Medina', rating: 5, guide: '@carlos_montaña', date: '2025-02-15', comment: 'La ruta con Carlos superó todas nuestras expectativas. Paisajes de ensueño.' },
    { id: 19, username: 'Cristina Torres', rating: 3, guide: '@miguel_aventura', date: '2025-02-12', comment: 'Experiencia interesante aunque el tiempo no acompañó. Miguel supo improvisar alternativas.' },
    { id: 20, username: 'Fernando Blanco', rating: 5, guide: '@ana_senderista', date: '2025-02-08', comment: 'Ana nos mostró flora y fauna que jamás habríamos identificado por nuestra cuenta.' },
    { id: 21, username: 'Alicia Ramírez', rating: 4, guide: '@carlos_montaña', date: '2025-02-05', comment: 'Carlos nos contó la historia de cada pueblo que atravesamos. Muy enriquecedor.' },
    { id: 22, username: 'Gabriel Castro', rating: 5, guide: '@miguel_aventura', date: '2025-01-30', comment: 'La experiencia con Miguel fue intensa y divertida. Perfecto para aventureros.' },
    { id: 23, username: 'Silvia Molina', rating: 4, guide: '@ana_senderista', date: '2025-01-25', comment: 'Ana creó un ambiente muy agradable en el grupo. Todos acabamos haciéndonos amigos.' },
    { id: 24, username: 'Héctor Vargas', rating: 5, guide: '@carlos_montaña', date: '2025-01-20', comment: 'Carlos nos llevó a un mirador secreto para ver el amanecer. Momento mágico.' },
    { id: 25, username: 'Patricia Mendoza', rating: 4, guide: '@miguel_aventura', date: '2025-01-15', comment: 'Miguel sabe exactamente cuándo descansar y cuándo apretar el ritmo. Muy profesional.' },
    { id: 26, username: 'Alejandro Ponce', rating: 5, guide: '@ana_senderista', date: '2025-01-10', comment: 'Gracias a Ana descubrimos plantas medicinales y aprendimos a identificarlas.' },
    { id: 27, username: 'Mónica Soto', rating: 3, guide: '@carlos_montaña', date: '2025-01-05', comment: 'Carlos adaptó el recorrido cuando empezó a llover. Supo gestionar bien el imprevisto.' },
    { id: 28, username: 'Jorge Aguilar', rating: 5, guide: '@miguel_aventura', date: '2024-12-28', comment: 'Miguel nos enseñó técnicas de orientación muy útiles. Aprendimos mientras disfrutábamos.' },
    { id: 29, username: 'Beatriz Luna', rating: 4, guide: '@ana_senderista', date: '2024-12-20', comment: 'Ana hizo que mi hija de 10 años se enamorara de la naturaleza. Gran mérito.' },
    { id: 30, username: 'Ricardo Fuentes', rating: 5, guide: '@carlos_montaña', date: '2024-12-12', comment: 'Increíble cómo Carlos conoce cada detalle del terreno. Nos sentimos muy seguros.' },
  ];

  // Estado para el filtro de guías
  const [selectedGuide, setSelectedGuide] = useState('');
  // Estado para controlar cuántos feedbacks mostrar
  const [visibleCount, setVisibleCount] = useState(5);

  // Obtener guías únicos para el filtro
  const uniqueGuides = [...new Set(feedbackData.map(item => item.guide))];

  // Función para manejar el cambio en el filtro
  const handleFilterChange = (e) => {
    setSelectedGuide(e.target.value);
    setVisibleCount(5); // Resetear el contador al cambiar el filtro
  };

  // Función para mostrar más feedbacks
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 5);
  };

  // Función para formatear la fecha en formato más legible
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Filtrar feedbacks según el guía seleccionado y mostrar solo el más reciente por día
  let filteredFeedbacks = [];
  
  if (selectedGuide) {
    // Si hay un guía seleccionado, mostrar todos sus feedbacks
    filteredFeedbacks = feedbackData
      .filter(item => item.guide === selectedGuide)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    // Si no hay guía seleccionado, mostrar solo el feedback más reciente por día
    const feedbacksByDate = {};
    
    // Agrupar feedbacks por fecha
    feedbackData.forEach(feedback => {
      if (!feedbacksByDate[feedback.date] || new Date(feedback.id) > new Date(feedbacksByDate[feedback.date].id)) {
        feedbacksByDate[feedback.date] = feedback;
      }
    });
    
    // Convertir el objeto a array y ordenar por fecha (más reciente primero)
    filteredFeedbacks = Object.values(feedbacksByDate).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Limitar el número de feedbacks visibles
  const visibleFeedbacks = filteredFeedbacks.slice(0, visibleCount);

  // Componente para mostrar las estrellas
  const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="max-w-6xl mx-auto p-5">
      <h2 className="text-2xl font-bold text-center mb-6">Opiniones de nuestros aventureros</h2>
      
      {/* Filtro por guía */}
      <div className="mb-6">
        <label htmlFor="guide-filter" className="mr-2 font-medium">Filtrar por guía: </label>
        <select 
          id="guide-filter" 
          value={selectedGuide} 
          onChange={handleFilterChange}
          className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Mostrar últimos feedbacks por día</option>
          {uniqueGuides.map(guide => (
            <option key={guide} value={guide}>
              Ver todos - {guide}
            </option>
          ))}
        </select>
      </div>
      
      {/* Lista de feedbacks */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {visibleFeedbacks.map(feedback => (
          <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold">{feedback.username}</div>
              <StarRating rating={feedback.rating} />
            </div>
            <div className="text-gray-600 italic mb-1">Guía: {feedback.guide}</div>
            <div className="text-gray-500 text-sm mb-2">{formatDate(feedback.date)}</div>
            <div className="text-gray-700 leading-relaxed text-sm">{feedback.comment}</div>
          </div>
        ))}
      </div>
      
      {/* Botón "Ver más" */}
      {visibleFeedbacks.length < filteredFeedbacks.length && (
        <div className="text-center mt-8">
          <button 
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Ver más opiniones
          </button>
        </div>
      )}
      
      {/* Mensaje informativo */}
      {!selectedGuide && (
        <p className="text-center mt-4 text-gray-500 italic">
          * Mostrando el feedback más reciente de cada día. Selecciona un guía para ver todos sus feedbacks.
        </p>
      )}
    </div>
  );
};

export default Feedback;
