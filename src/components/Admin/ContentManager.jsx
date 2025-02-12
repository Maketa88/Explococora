import { useState } from 'react';
import { useGoogleTranslate } from '../../hooks/useGoogleTranslate';

export const ContentManager = () => {
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');
  const { addNewContent, isTranslating, error } = useGoogleTranslate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addNewContent(key, content);
    setKey('');
    setContent('');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Agregar Nuevo Contenido</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Clave de traducción:</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Contenido en español:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <button
          type="submit"
          disabled={isTranslating}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isTranslating ? 'Traduciendo...' : 'Agregar y Traducir'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}; 