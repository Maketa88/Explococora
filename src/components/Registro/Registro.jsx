import React, { useState, useEffect } from "react";
import { InputRegistro } from "../../components/InicioSesion/Input";
import { HookContrasenia } from "../../hooks/HookContrasenia";
import { IconoExplo } from "../../components/InicioSesion/IconoExplo";
import { FaUser, FaIdCard, FaEnvelope } from "react-icons/fa";
import Swal from "sweetalert2";
import { RegistroCliente } from "../../services/RegistroCliente";

export const Registro = () => {
  const [formData, setFormData] = useState({
    cedula: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    contrasenia: "",
  });

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setErrors([]);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await RegistroCliente(formData);

      Swal.fire({
        title: "Registro exitoso",
        text: "Usuario registrado con éxito",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      setFormData({
        cedula: "",
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        email: "",
        contrasenia: "",
      });

      setErrors([]);
    } catch (error) {
      // Manejar errores del backend
      const errorList = error.errors || [];
      setErrors([{ msg: error.message }, ...errorList]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200">
        <IconoExplo />
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-2">
          Regístrate en Explococora
        </h2>
        <form onSubmit={handleRegister}>
          <InputRegistro
            label="Cédula"
            id="cedula"
            placeholder="Ingrese su cédula"
            value={formData.cedula}
            onChange={handleChange}
            required
            icon={FaIdCard}
          />
          <InputRegistro
            label="Primer Nombre"
            id="primerNombre"
            placeholder="Ingrese su primer nombre"
            value={formData.primerNombre}
            onChange={handleChange}
            required
            icon={FaUser}
          />
          <InputRegistro
            label="Segundo Nombre"
            id="segundoNombre"
            placeholder="Ingrese su segundo nombre ( Opcional )"
            value={formData.segundoNombre}
            onChange={handleChange}
          />
          <InputRegistro
            label="Primer Apellido"
            id="primerApellido"
            placeholder="Ingrese su primer apellido"
            value={formData.primerApellido}
            onChange={handleChange}
            required
            icon={FaUser}
          />
          <InputRegistro
            label="Segundo Apellido"
            id="segundoApellido"
            placeholder="Ingrese su segundo apellido ( Opcional )"
            value={formData.segundoApellido}
            onChange={handleChange}
          />
          <InputRegistro
            label="Correo Electrónico"
            type="email"
            id="email"
            placeholder="Ingrese su correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            icon={FaEnvelope}
          />
          <HookContrasenia
            value={formData.contrasenia}
            onChange={(e) =>
              setFormData({ ...formData, contrasenia: e.target.value })
            }
          />
          {errors.length > 0 && (
            <div className="text-red-500 mb-4">
              {errors.map((error, index) => (
                <p key={index}>{error.msg}</p>
              ))}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Registrarse
          </button>
        </form>
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
