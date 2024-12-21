import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputField } from "../../components/InicioSesion/Input";
import { PasswordField } from "../../hooks/HooksPassword";
import { IconoExplo } from "../../components/InicioSesion/IconoExplo";
import { FaUser, FaIdCard, FaEnvelope } from "react-icons/fa";
import Swal from "sweetalert2"; // Importa SweetAlert2

export const Register = () => {
  const [formData, setFormData] = useState({
    cedula: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    contrasenia: "",
  });

  const [errors, setErrors] = useState([]); // Para manejar errores del formulario

  // Usamos useEffect para limpiar el formulario o hacer cualquier otro efecto al montar el componente
  useEffect(() => {
    // Limpia los datos de registro si es necesario, o carga datos previos
    // Ejemplo de limpiar errores cuando se monta el componente
    setErrors([]);
  }, []); // Solo se ejecuta al montar el componente

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:10101/cliente/registrar", formData);
      console.log("Datos registrados:", response.data);
  
      // Mostrar alerta de éxito con SweetAlert2
      Swal.fire({
        title: "Registro exitoso",
        text: "Usuario registrado con éxito",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
  
      // Limpiar los campos del formulario
      setFormData({
        cedula: "",
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        email: "",
        contrasenia: "",
      });
  
      // Limpiar los errores
      setErrors([]);
  
    } catch (error) {
      if (error.response) {
        // Verificar si el backend devuelve un mensaje específico para el correo electrónico duplicado
        const errorMessage = error.response.data.message;
        
        // Si el mensaje es sobre correo electrónico duplicado, agregamos el error al estado
        if (errorMessage === "El correo electrónico ya está registrado") {
          setErrors([{ msg: "El correo electrónico ya está registrado. Por favor, usa otro." }]);
        } else {
          const errors = error.response.data.errors || [];
          setErrors(errors); // Guardar otros errores
        }
      } else {
        console.error("Error en el registro:", error.message);
        Swal.fire({
          title: "Error",
          text: "Hubo un error en la solicitud",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    }
  };
  
  
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200">
        {/* Icono Explococora */}
        <IconoExplo />

        {/* Título */}
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-2">
          Regístrate en Explococora
        </h2>
        

        {/* Formulario */}
        <form onSubmit={handleRegister}>
          <InputField
            label="Cédula"
            id="cedula"
            placeholder="Ingrese su cédula"
            value={formData.cedula}
            onChange={handleChange}
            required
            icon={FaIdCard}
          />
          <InputField
            label="Primer Nombre"
            id="primerNombre"
            placeholder="Ingrese su primer nombre"
            value={formData.primerNombre}
            onChange={handleChange}
            required
            icon={FaUser}
          />
          <InputField
            label="Segundo Nombre"
            id="segundoNombre"
            placeholder="Ingrese su segundo nombre"
            value={formData.segundoNombre}
            onChange={handleChange}
          />
          <InputField
            label="Primer Apellido"
            id="primerApellido"
            placeholder="Ingrese su primer apellido"
            value={formData.primerApellido}
            onChange={handleChange}
            required
            icon={FaUser}
          />
          <InputField
            label="Segundo Apellido"
            id="segundoApellido"
            placeholder="Ingrese su segundo apellido"
            value={formData.segundoApellido}
            onChange={handleChange}
          />
          <InputField
            label="Correo Electrónico"
            type="email"
            id="email"
            placeholder="Ingrese su correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            icon={FaEnvelope}
          />
          <PasswordField
            value={formData.contrasenia}
            onChange={(e) =>
              setFormData({ ...formData, contrasenia: e.target.value })
            }
          />

          {/* Mostrar mensajes de error */}
          {errors.length > 0 && (
            <div className="text-red-500 mb-4">
              {errors.map((error, index) => (
                <p key={index}>{error.msg}</p>
              ))}
            </div>
          )}

          {/* Botón de acción */}
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Registrarse
          </button>
        </form>

        {/* Enlace para iniciar sesión */}
        <p className="mt-3 text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/Ingreso"
            className="text-green-400 font-bold hover:underline"
          >
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
};
