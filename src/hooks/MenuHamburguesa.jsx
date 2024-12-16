import { useState } from "react";

export const useAlternarMenu = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const alternarMenu = () => {
    setMenuAbierto((anterior) => !anterior);
  };

  return { menuAbierto, alternarMenu };
};
