// src/components/Seccion/BotonNav.jsx
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import PropTypes from "prop-types";

export const BotonCarrusel = ({ direction, onClick }) => {
  const Icon = direction === "left" ? HiChevronLeft : HiChevronRight;

  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80"
      style={{ [direction]: "6px" }}
    >
      <Icon className="w-8 h-8" />
    </button>
  );
};

BotonCarrusel.propTypes = {
  direction: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
};