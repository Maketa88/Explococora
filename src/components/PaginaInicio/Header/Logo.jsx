import React from "react";
import Explo from "../../../assets/Images/ejemplo.jpg";

export const Logo = () => {
  return (
    <div className="relative z-0">
      <img src={Explo} alt="Logo de Explococora" className="h-10 w-auto" />
    </div>
  );
};
