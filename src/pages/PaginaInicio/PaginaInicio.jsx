import { GuiasDestacados } from "../../components/NuestrosGuias/GuiasDestacados";
import { Carrusel } from "../../components/PaginaInicio/Body/Carrusel";

export const PaginaInicio = () => {
  return (
    <div>
      <Carrusel />
      {/* Resto del contenido */}
      
      {/* Sección de guías destacados */}
      <GuiasDestacados />
    </div>
  );
};
