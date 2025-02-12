import { useTranslation } from 'react-i18next';

export const Contact = () => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica del formulario
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="bg-teal-200 rounded-lg p-8 max-w-md w-full shadow-xl">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          {t('contactaConNosotros')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">
              {t('nombreCompleto')}
            </label>
            <input
              type="text"
              required
              placeholder={t('escribeTuNombre')}
              className="w-full p-3 rounded bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              {t('correoElectronico')}
            </label>
            <input
              type="email"
              required
              placeholder={t('escribeTuCorreo')}
              className="w-full p-3 rounded bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              {t('telefono')}
            </label>
            <input
              type="tel"
              required
              placeholder={t('escribeTuTelefono')}
              className="w-full p-3 rounded bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              {t('mensaje')}
            </label>
            <textarea
              required
              placeholder={t('escribeTuMensaje')}
              rows="4"
              className="w-full p-3 rounded bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-400"
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-teal-600 py-3 rounded font-bold hover:bg-teal-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            {t('enviar')}
          </button>
        </form>
      </div>
    </div>
  );
}; 