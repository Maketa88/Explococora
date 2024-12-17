import React from "react";

const Card = ({ image, title, text }) => {
  return (
    <div className="max-w-screen-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg">
      <img
        className="w-full h-96 object-cover"
        src={image}
        alt={title}
      />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 hover:text-indigo-600 transition-colors duration-200 text-center ">
          {title}
        </h2>
        <p className="text-gray-600 text-base text-justify">
          {text}
        </p>
      </div>
    </div>
  );
};

export default Card;
