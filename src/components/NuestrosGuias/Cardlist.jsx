import React from 'react';
import { Card } from './Card';

const CardList = ({ guias }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guias.map((guia) => (
        <Card key={guia.id} guia={guia} />
      ))}
    </div>
  );
};

export { CardList };
