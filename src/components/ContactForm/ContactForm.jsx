import { useState } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    razon: "",
    mensaje: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validar que todos los campos estén completos
  const validateForm = () => {
    for (const key in formData) {
      if (formData[key].trim() === "") {
        setErrorMessage(t('camposObligatorios'));
        return false;
      }
    }
    setErrorMessage("");
    return true;
  };

  // Enviar los datos del formulario con EmailJS
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    emailjs
      .send(
        "service_ur5nbyc", // Tu Service ID
        "template_pz6zib4", // Tu Template ID
        {
          nombre: formData.nombre,
          correo: formData.correo,
          telefono: formData.telefono,
          razon: formData.razon,
          mensaje: formData.mensaje,
        },
        "U9gZjMo6b1XTuBzbd" // Tu Public Key
      )
      .then(
        (response) => {
          console.log("Correo enviado exitosamente", response.status, response.text);
          // Mostrar mensaje de éxito con SweetAlert2
          Swal.fire({
            icon: "success",
            title: t('mensajeEnviado'),
            text: t('contactaremosProonto'),
            confirmButtonColor: "#38a169", // Botón verde
          });
          setFormData({ nombre: "", correo: "", telefono: "", razon: "", mensaje: "" }); // Limpiar los campos
        },
        (err) => {
          console.error("Error al enviar el correo:", err);
          // Mostrar mensaje de error con SweetAlert2
          Swal.fire({
            icon: "error",
            title: t('errorEnvio'),
            text: t('intentarNuevamente'),
            confirmButtonColor: "#e53e3e", // Botón rojo
          });
        }
      );
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-8"
      style={{ backgroundImage: "url('/assets/carrusel1.webp')" }}
    >
      <div className="bg-teal-600 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">
          {t('contactaConNosotros')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <label className="block text-white font-semibold mb-2">
                {t('nombreCompleto')}
              </label>
              <input
                type="text"
                name="nombre"
                placeholder={t('escribeTuNombre')}
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <label className="block text-white font-semibold mb-2">
                {t('correoElectronico')}
              </label>
              <input
                type="email"
                name="correo"
                placeholder={t('escribeTuCorreo')}
                value={formData.correo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <label className="block text-white font-semibold mb-2">
                {t('telefono')}
              </label>
              <input
                type="tel"
                name="telefono"
                placeholder={t('escribeTuTelefono')}
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <label className="block text-white font-semibold mb-2">
                {t('razon')}
              </label>
              <select
                name="razon"
                value={formData.razon}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="">{t('selecciona')}</option>
                <option value="consulta">{t('consulta')}</option>
                <option value="reserva">{t('reserva')}</option>
                <option value="otro">{t('otro')}</option>
              </select>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <label className="block text-white font-semibold mb-2">
                {t('mensaje')}
              </label>
              <textarea
                name="mensaje"
                placeholder={t('escribeTuMensaje')}
                rows={4}
                value={formData.mensaje}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-teal-700 hover:bg-teal-600 rounded-lg font-semibold text-white transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            {t('enviar')}
          </button>

          {errorMessage && (
            <p className="text-red-200 text-sm mt-2">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
