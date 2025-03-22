import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DashboardLayoutAdmin from "../../../layouts/DashboardLayoutAdmin";

const ActualizarCorreoAdmin = () => {
  const [formData, setFormData] = useState({
    email: ""
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró el token de autenticación");
      setUpdating(false);
      return;
    }

    try {
      const response = await axios.patch(
        'http://localhost:10101/administrador/cambiar-correo',
        { email: formData.email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "¡Correo actualizado!",
          text: "Tu correo ha sido actualizado correctamente",
          confirmButtonColor: "#3085d6"
        });
        navigate("/VistaAdmin/PerfilAdmin");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError(`Error al actualizar: ${error.response?.data?.message || error.message}`);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo actualizar el correo: ${error.response?.data?.message || error.message}`,
        confirmButtonColor: "#3085d6"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardLayoutAdmin>
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Actualizar Correo</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nuevo Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/VistaAdmin/PerfilAdmin")}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {updating ? "Actualizando..." : "Actualizar Correo"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayoutAdmin>
  );
};

export default ActualizarCorreoAdmin;