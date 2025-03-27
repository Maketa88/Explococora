// src/components/Seccion/BotonNav.jsx
import PropTypes from "prop-types";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export const BotonCarrusel = ({ direction, onClick }) => {
  const Icon = direction === "left" ? HiChevronLeft : HiChevronRight;

  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 transform -translate-y-1/2 bg-teal-700 bg-opacity-70 text-white p-0 sm:p-2 rounded-full hover:bg-opacity-80 z-[20] ${
        direction === "left" 
          ? "left-1 sm:left-2 md:left-4 lg:left-6" 
          : "right-1 sm:right-2 md:right-4 lg:right-6"
      }`}
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
    </button>
  );
};

BotonCarrusel.propTypes = {
  direction: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
};