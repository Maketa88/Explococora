import axios from "axios";

export const RegistroCliente = async (formData) => {
  try {
    const response = await axios.post(
      "http://localhost:10101/registrar",
      formData
    );
    return response.data; // Devuelve los datos del backend en caso de éxito
  } catch (error) {
    if (error.response) {
      // Retorna un objeto con el mensaje de error y posibles errores adicionales
      throw {
        message: error.response.data.message,
        errors: error.response.data.errors || [],
      };
    }
    throw new Error("Hubo un problema con la solicitud");
  }
};
