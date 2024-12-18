// src/components/Seccion/BotonNav.jsx
import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

export const BotonNav = ({ direction, onClick }) => {
  const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80"
      style={{ [direction]: "4px" }}
    >
      <Icon className="w-8 h-8" />
    </button>
  );
};
