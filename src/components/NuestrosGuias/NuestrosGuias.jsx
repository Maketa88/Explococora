import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from './Card'; // Asegúrate de tener el componente Card y CardList ya implementados
import { CardList } from './Cardlist'; // Asegúrate de tener el componente Card y CardList ya implementados


const NuestrosGuias = () => {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerGuias = async () => {
      try {
        const response = await axios.get('http://localhost:10101/guia/obtener'); // Asegúrate de que esta URL sea correcta
        setGuias(response.data);
      } catch (error) {
        console.error("Hubo un error al obtener los guías", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerGuias();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Nuestros Guías</h2>
      <CardList guias={guias} />
    </div>
  );
};

export { NuestrosGuias };
