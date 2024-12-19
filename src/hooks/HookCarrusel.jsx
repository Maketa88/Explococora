import { useState } from "react";
import Cocora from "../assets/Images/carrusel1.webp";
import Cocora1 from "../assets/Images/carrusel2.webp";
import Cocora3 from "../assets/Images/carrusel3.webp";

export const HooksCarrusel = () => {
  const images = [Cocora, Cocora1, Cocora3];
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () => {
    setCurrentImage((prevImage) =>
      prevImage === 0 ? images.length - 1 : prevImage - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prevImage) =>
      prevImage === images.length - 1 ? 0 : prevImage + 1
    );
  };

  return { images, currentImage, prevImage, nextImage };
};
