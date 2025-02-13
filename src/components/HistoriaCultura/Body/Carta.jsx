import React from "react";

export const Carta = ({ image, title, text }) => {
  return (
    <div 
      className="max-w-screen-sm mx-auto bg-white shadow-lg transform transition duration-300 hover:scale-105 cursor-pointer font-nunito p-6"
      style={{
        clipPath: "polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)"
      }}
    >
      <img
        className="w-full h-96 object-cover transition-transform duration-500 "
        src={image}
        alt={title}
      />
      <h2 className="text-2xl font-bold text-gray-800 mt-4 text-center">{title}</h2>
      <p className="text-gray-700 text-base mt-2 text-justify">{text}</p>
    </div>
  );
};
