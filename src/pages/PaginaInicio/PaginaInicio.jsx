import NuestrasRutasInicio from "../../components/NuestrasRutas/NuestrasRutasInicio";
import { GuiasDestacados } from "../../components/NuestrosGuias/GuiasDestacados";
import { TituloBuscador } from "../../components/PaginaInicio/Body/Buscador/TituloBuscador";
import { Carrusel } from "../../components/PaginaInicio/Body/Carrusel";
import PaquetesInicio from "../../components/Paquetes/PaquetesInicio";

export const PaginaInicio = () => {
  const handleSearch = (searchData) => {
    "Datos de búsqueda:", searchData;
    // Aquí puedes implementar la lógica de búsqueda
  };

  return (
    <div className="relative">
      {/* Título y buscador encima del carrusel */}
      <div className="absolute top-0 left-0 w-full z-10 pt-8">
        <TituloBuscador onSearch={handleSearch} />
      </div>

      {/* Carrusel como fondo */}
      <Carrusel />

      {/* Resto del contenido */}
      <div className="container mx-auto  py-12">
        {/* Sección de guías destacados */}
        <GuiasDestacados />
        <NuestrasRutasInicio />
        <PaquetesInicio />
      </div>
    </div>
  );
};
