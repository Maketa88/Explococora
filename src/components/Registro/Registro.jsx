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
        title: t('registroExitoso'),
        text: t('usuarioRegistrado'),
        icon: "success",
        confirmButtonText: t('aceptar'),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
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
            placeholder={t('emailPlaceholder')}
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
            className="w-6 h-6 "/>
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
