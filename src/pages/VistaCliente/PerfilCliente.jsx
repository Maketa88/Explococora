import { useEffect, useState } from "react";
import axios from "axios";

const PerfilCliente = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula) {
      setError("No se encontró la cédula del cliente.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:10101/cliente/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos del cliente recibidos:", response.data);
        // Evitar duplicados en el estado
        setClientes(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error completo:", error);
        console.error("Status:", error.response?.status);
        console.error("Respuesta del servidor:", error.response?.data);
        setError(`Error: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      });
  }, []); // useEffect se ejecuta solo una vez

  const separarNombre = (nombreCompleto) => {
    const partes = nombreCompleto.split(" ");
    const nombres = partes.slice(0, 2).join(" ");
    const apellidos = partes.slice(2).join(" ");
    return { nombres, apellidos };
  };

  if (loading)
    return (
      <div className="text-center text-gray-500 mt-10">Cargando perfil...</div>
    );
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1>Datos del Cliente</h1>
      {clientes.length > 0 ? (
        clientes.map((cliente) => {
          const { nombres, apellidos } = separarNombre(
            cliente.nombre_del_cliente
          );
          return (
            <div key={cliente.cedula} className="mb-4">
              <p>Cédula: {cliente.cedula || "No disponible"}</p>
              <p>Nombres: {nombres || "No disponible"}</p>
              <p>Apellidos: {apellidos || "No disponible"}</p>
              <p>Email: {cliente.email || "No disponible"}</p>
            </div>
          );
        })
      ) : (
        <p>No se encontraron datos del cliente.</p>
      )}
    </div>
  );
};

export default PerfilCliente;
