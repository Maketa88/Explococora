import React from 'react';

const QuienesSomos = () => {
  return (
    <div className="bg-teal-700 text-white min-h-screen">

      <main className="p-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Quiénes Somos</h2>
          <p className="text-lg max-w-2xl mx-auto">
            En Explococora, nos dedicamos a brindar experiencias únicas y memorables en el corazón del Valle de Cocora. Nuestro equipo apasionado y experimentado se esfuerza por conectar a nuestros visitantes con la naturaleza y la cultura local.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white text-teal-800 p-6 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold mb-2">Nuestra Misión</h3>
            <p>
              Promover el turismo sostenible y responsable, brindando servicios de calidad y generando un impacto positivo en la comunidad local.
            </p>
          </div>
          <div className="bg-white text-teal-800 p-6 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold mb-2">Nuestra Visión</h3>
            <p>
              Ser un referente en el ecoturismo en Colombia, reconocidos por nuestro compromiso con la naturaleza y la satisfacción de nuestros visitantes.
            </p>
          </div>
          <div className="bg-white text-teal-800 p-6 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold mb-2">Nuestros Valores</h3>
            <p>
              Respeto, integridad, compromiso y pasión por lo que hacemos.
            </p>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-teal-800 p-4 text-center">
        <p>&copy; 2024 Explococora. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default QuienesSomos;
