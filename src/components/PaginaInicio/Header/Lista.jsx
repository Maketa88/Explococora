import { NavLink } from "react-router-dom";

export const NavItem = ({
  tipo,
  contenido,
  to,
  onClick,
  estilos,
  imgSrc,
  alt,
}) => {
  if (tipo === "enlace") {
    return (
      <li>
        <NavLink
          to={to}
          className={({ isActive }) =>
            `text-white font-extrabold hover:underline hover:text-black text-lg font-nunito ${
              isActive ? "text-blue-600" : ""
            } ${estilos}`
          }
        >
          {contenido}
        </NavLink>
      </li>
    );
  }

  if (tipo === "boton") {
    return (
      <li>
        <NavLink to={to}>
          <button onClick={onClick} className={`px-4 py-1 rounded ${estilos}`}>
            {contenido}
          </button>
        </NavLink>
      </li>
    );
  }

  if (tipo === "imagen") {
    return (
      <NavLink to={to}>
      <li className="flex justify-center gap-2">
        <img
          src={imgSrc}
          alt={alt}
          className={`h-8 w-8 rounded-md ${estilos}`}
        />
      </li>
      </NavLink>
    );
  }

  return null;
};
