import axios from "axios";

const obtenerGuias = async () => {
  try {
    const token = localStorage.getItem("token"); // Recuperar el token guardado
    const response = await axios.get("http://localhost:10101/todos", {
      headers: {
        Authorization: `Bearer ${token}`, // Agregar token en el encabezado
      },
    });
    console.log("Guías obtenidos:", response.data);
    return response.data;
  } catch (error) {
    console.error("Hubo un error al obtener los guías", error.response || error);
  }
};

export default obtenerGuias;
