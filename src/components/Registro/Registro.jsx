import React, { useState, useEffect } from "react";
import { InputRegistro } from "../../components/InicioSesion/Input";
import { HookContrasenia } from "../../hooks/HookContrasenia";
import { IconoExplo } from "../../components/InicioSesion/IconoExplo";
import { FaUser, FaIdCard, FaEnvelope } from "react-icons/fa";
import Swal from "sweetalert2";
import { RegistroCliente } from "../../services/RegistroCliente";
import { useTranslation } from 'react-i18next';
import Colombia from "../../assets/Images/Colombia.png";
import Usa from "../../assets/Images/Usa.png";

export const Registro = () => {
  const { t, i18n } = useTranslation();

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
        html: `
          <div style="
            display: flex; 
            flex-direction: column; 
            align-items: center;
            border: 4px solid #004d40;
            border-radius: 12px;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          ">
            <div style="
              display: flex; 
              flex-direction: column; 
              align-items: center;
              border-radius: 8px;
              padding: 10px;
            ">
              <img src="https://i.pinimg.com/originals/bf/fc/c2/bffcc2de14a013a2e7a795668846cae5.gif" 
                  alt="Caballo corriendo" 
                  width="150" 
                  style="margin-bottom: 10px; border-radius: 8px;">
              <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                  alt="Logo ExploCocora" 
                  width="120" 
                  style="border-radius: 8px;">
            </div>
            <h2 style="
              font-size: 28px; 
              font-weight: bold; 
              font-family: Arial, Helvetica, sans-serif; 
              color: #004d40; 
              margin-top: 15px;
              text-align: center;
              white-space: nowrap;
            ">
              ${t('registroExitoso')}
            </h2>
            <p style="
              font-size: 18px; 
              font-family: Arial, Helvetica, sans-serif; 
              color: #004d40; 
              text-align: center; 
              margin-top: 10px;
            ">
              ${t('usuarioRegistrado')}
            </p>
            <button id="cerrarAlerta" style="
              margin-top: 15px;
              padding: 10px 20px;
              background-color: #38a169;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              transition: background-color 0.3s ease;
            ">
              OK
            </button>
          </div>
        `,
        showConfirmButton: false,
        didOpen: () => {
          document.getElementById("cerrarAlerta").addEventListener("click", () => {
            Swal.close();
          });
        }
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

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevoIdioma);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito p-6">
      <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200">
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={cambiarIdioma} 
              className={`transition-opacity ${i18n.language === 'es' ? 'opacity-100' : 'opacity-50'}`}
            >
              <img 
                src={Colombia} 
                alt="Bandera de Colombia"
                className="w-8 h-8 object-cover rounded"
              />
            </button>
            <span className="text-gray-500">|</span>
            <button 
              onClick={cambiarIdioma}
              className={`transition-opacity ${i18n.language === 'en' ? 'opacity-100' : 'opacity-50'}`}
            >
              <img 
                src={Usa} 
                alt="USA Flag"
                className="w-8 h-8 object-cover rounded"
              />
            </button>
          </div>
        </div>
        <IconoExplo />
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-2">
          {t('tituloRegistro')}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          {t('subtituloRegistro')}
        </p>
        <form onSubmit={handleRegister}>
          <InputRegistro
            label={t('nombre')}
            id="cedula"
            placeholder={t('cedulaPlaceholder')}
            value={formData.cedula}
            onChange={handleChange}
            required
            icon={FaIdCard}
          />
          <InputRegistro
            label={t('primerNombre')}
            id="primerNombre"
            placeholder={t('primerNombrePlaceholder')}
            value={formData.primerNombre}
            onChange={handleChange}
            required
            icon={FaUser}
          />
          <InputRegistro
            label={t('segundoNombre')}
            id="segundoNombre"
            placeholder={t('segundoNombrePlaceholder')}
            value={formData.segundoNombre}
            onChange={handleChange}
          />
          <InputRegistro
            label={t('primerApellido')}
            id="primerApellido"
            placeholder={t('primerApellidoPlaceholder')}
            value={formData.primerApellido}
            onChange={handleChange}
            required
            icon={FaUser}
          />
          <InputRegistro
            label={t('segundoApellido')}
            id="segundoApellido"
            placeholder={t('segundoApellidoPlaceholder')}
            value={formData.segundoApellido}
            onChange={handleChange}
          />
          <InputRegistro
            label={t('email')}
            type="email"
            id="email"
            placeholder={t('email')}
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
          <div className="pb-3">
            <input type="checkbox" 
            className="w-6 h-6 "
            required />
            <label className="px-3">{t('terminos')}</label>
          </div>
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            {t('botonRegistro')}
          </button>
        </form>
        <p className="mt-3 text-center text-gray-600">
          {t('yaTenesCuenta')} <a
            href="/Ingreso"
            className="text-green-400 font-bold hover:underline"
          >
            {t('iniciarSesionAqui')}
          </a>
        </p>
      </div>
    </div>
  );
};
