import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DashboardLayoutAdmin from "../../../layouts/DashboardLayoutAdmin";
import { Mail, ArrowLeft } from "lucide-react";

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
      <div className="p-3 sm:p-6">
        <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto">
          {/* Header con estilo moderno */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 right-20 w-20 h-20 rounded-full bg-teal-500 opacity-20 blur-xl"></div>
              <div className="absolute bottom-0 right-10 w-30 h-30 rounded-full bg-teal-400 opacity-10 blur-2xl"></div>
              <div className="absolute top-5 left-1/2 w-10 h-10 rounded-full bg-teal-300 opacity-20 blur-md"></div>
            </div>

            <div className="flex items-center relative">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4 text-teal-600">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Actualizar Correo
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nuevo Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="nuevo@ejemplo.com"
                required
              />
              <p className="mt-2 text-sm text-teal-600">
                Ingresa tu nuevo correo electrónico. Recibirás notificaciones del sistema en esta dirección.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate("/VistaAdmin/Settings")}
                className="py-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>

              <button
                type="submit"
                disabled={updating}
                className={`py-2 px-6 rounded-lg flex items-center gap-2 transition-all duration-300 
                  ${updating ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                  'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-200/50'}`}
              >
                {updating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Correo"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayoutAdmin>
  );
};

export default ActualizarCorreoAdmin;