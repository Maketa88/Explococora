import React from "react";
import { useTranslation } from 'react-i18next';

export const TituloExplo = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex items-center justify-center p-10 bg-gray-200 px-4 text-center">
      <div className="max-w-4xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center">
          {i18n.language === 'es' ? (
            <>
              <span className="text-red-500">D</span>
              <span className="text-orange-300">e</span>
              <span className="text-yellow-500">s</span>
              <span className="text-green-500">c</span>
              <span className="text-sky-400">u</span>
              <span className="text-indigo-500">b</span>
              <span className="text-pink-400">r</span>
              <span className="text-pink-300">e</span>
              <span className="text-gray-600"> </span>
              <span className="text-teal-400">l</span>
              <span className="text-yellow-500">a</span>
              <span className="text-green-500"> </span>
              <span className="text-blue-500">M</span>
              <span className="text-indigo-500">a</span>
              <span className="text-purple-500">g</span>
              <span className="text-cyan-500">i</span>
              <span className="text-red-500">a</span>
              <span className="text-orange-400"> </span>
              <span className="text-teal-400">d</span>
              <span className="text-gray-700">e</span>
              <span className="text-indigo-500">l</span>
              <span className="text-gray-600"> </span>
              <span className="text-cyan-400">V</span>
              <span className="text-green-500">a</span>
              <span className="text-orange-500">l</span>
              <span className="text-yellow-500">l</span>
              <span className="text-sky-400">e</span>
              <span className="text-teal-400"> </span>
              <span className="text-indigo-500">d</span>
              <span className="text-gray-700">e</span>
              <span className="text-sky-500">l</span>
              <span className="text-gray-500"> </span>
              <span className="text-cyan-500">C</span>
              <span className="text-teal-400">o</span>
              <span className="text-blue-500">c</span>
              <span className="text-indigo-500">o</span>
              <span className="text-purple-500">r</span>
              <span className="text-pink-400">a</span>
            </>
          ) : (
            <>
              <span className="text-red-500">D</span>
              <span className="text-orange-300">i</span>
              <span className="text-yellow-500">s</span>
              <span className="text-green-500">c</span>
              <span className="text-sky-400">o</span>
              <span className="text-indigo-500">v</span>
              <span className="text-pink-400">e</span>
              <span className="text-pink-300">r</span>
              <span className="text-gray-600"> </span>
              <span className="text-teal-400">t</span>
              <span className="text-yellow-500">h</span>
              <span className="text-green-500">e</span>
              <span className="text-gray-600"> </span>
              <span className="text-blue-500">M</span>
              <span className="text-indigo-500">a</span>
              <span className="text-purple-500">g</span>
              <span className="text-cyan-500">i</span>
              <span className="text-red-500">c</span>
              <span className="text-orange-400"> </span>
              <span className="text-teal-400">o</span>
              <span className="text-gray-700">f</span>
              <span className="text-gray-600"> </span>
              <span className="text-cyan-400">C</span>
              <span className="text-green-500">o</span>
              <span className="text-orange-500">c</span>
              <span className="text-yellow-500">o</span>
              <span className="text-sky-400">r</span>
              <span className="text-teal-400">a</span>
              <span className="text-gray-600"> </span>
              <span className="text-indigo-500">V</span>
              <span className="text-gray-700">a</span>
              <span className="text-sky-500">l</span>
              <span className="text-gray-700">l</span>
              <span className="text-cyan-500">e</span>
              <span className="text-teal-400">y</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg lg:text-2xl leading-relaxed text-justify font-nunito text-blue-gray-700">
          {t('descripcionValle')}
        </p>
      </div>
    </div>
  );
};

// Este es un comentari de prueba
