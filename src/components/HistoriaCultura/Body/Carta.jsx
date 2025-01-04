import React from "react";

export const Carta = ({ image, title, text }) => {
  return (
    <div className="max-w-screen-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer font-nunito">
      <img className="w-full h-96 object-cover" src={image} alt={title} />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-00 mb-2 hover:text-green-400 transition-colors duration-200 text-center ">
          {title}
        </h2>
        <p className="text-blue-gray-700 text-base text-justify lg:text-xl">{text}</p>
      </div>
    </div>
  );
};
