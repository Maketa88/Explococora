import PropTypes from "prop-types";

export const Indicadores = ({ images, currentImage, goToImage }) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      {images.map((_, index) => (
        <button
          key={index}
          onClick={() => goToImage(index)}
          className={`block w-3 h-3 rounded-full transition-all duration-300 ${
            index === currentImage ? "bg-gray-950" : "bg-white bg-opacity-50 hover:bg-opacity-70"
          }`}
          aria-label={`Ir a imagen ${index + 1}`}
        ></button>
      ))}
    </div>
  );
};

Indicadores.propTypes = {
  images: PropTypes.array.isRequired,
  currentImage: PropTypes.number.isRequired,
  goToImage: PropTypes.func.isRequired,
};