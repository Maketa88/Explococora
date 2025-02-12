import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from './Card'; // Asegúrate de tener el componente Card y CardList ya implementados
import { CardList } from './Cardlist'; // Asegúrate de tener el componente Card y CardList ya implementados
import { useTranslation } from 'react-i18next';

const NuestrosGuias = () => {
  const { t } = useTranslation();
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
    <div className="guias-container">
      <h1>{t('tituloGuias')}</h1>
      <p>{t('descripcionGuias')}</p>
      <CardList guias={guias} />
    </div>
  );
};

export { NuestrosGuias };
