import React from 'react'
import Inicio from "../../assets/Images/inicio.png";

export const IconoExplo = () => {
  return (
    
        <div className="flex justify-center mb-0">
          <img
            src={Inicio}// Aquí puedes colocar la URL de la imagen del Valle del Cocora
            alt="Valle del Cocora"
            className="w-24 h-24 rounded-sm object-cover"
          />
        </div>
   
  )
}
