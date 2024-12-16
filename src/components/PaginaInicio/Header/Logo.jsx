import React from "react";
import Explo from "../../../assets/Images/ejemplo.jpg";

export const Logo = () => {
  return (
    <div className="flex items-center">
      <img
        src={Explo}
        alt="Logo de Explococora"
        className="h-10 w-auto"
      />
    </div>
  );
};
