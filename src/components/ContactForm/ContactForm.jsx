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
      .then((response) => {
        console.log("Correo enviado exitosamente", response.status, response.text);
      
        // Mostrar mensaje de éxito con SweetAlert2
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
              max-width: 100%;
              width: 100%;
            ">
              <div style="
                display: flex; 
                flex-direction: column; 
                align-items: center;
                border-radius: 8px;
                padding: 10px;
                width: 100%;
              ">
                <img src="https://i.pinimg.com/originals/bf/fc/c2/bffcc2de14a013a2e7a795668846cae5.gif" 
                  alt="Caballo corriendo" 
                  style="
                    max-width: 150px;
                    width: 100%;
                    height: auto;
                    margin-bottom: 10px;
                    border-radius: 8px;
                  ">
                <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                  alt="Logo ExploCocora" 
                  style="
                    max-width: 120px;
                    width: 100%;
                    height: auto;
                    border-radius: 8px;
                  ">
              </div>
              <h2 style="
                font-size: clamp(20px, 5vw, 28px);
                font-weight: bold; 
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                margin-top: 15px;
                text-align: center;
                word-wrap: break-word;
                width: 100%;
              ">
                Mensaje enviado correctamente
              </h2>
              <p style="
                font-size: clamp(16px, 4vw, 18px);
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                text-align: center; 
                margin-top: 10px;
                width: 100%;
              ">
                Nos pondremos en contacto contigo pronto
              </p>
              <button id="cerrarAlerta" style="
                margin-top: 15px;
                padding: 10px 20px;
                background-color: #38a169;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: clamp(14px, 3vw, 16px);
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
      style={{ backgroundImage: "linear-gradient(500deg, #0f767b, #ffffff)" }}
    >
      <div className="bg-teal-700 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">
          {t('contactaConNosotros')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="bg-white bg-opacity-5 border-2 border-white rounded-lg p-4">
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

            <div className="bg-white bg-opacity-5 border-2 border-white rounded-lg p-4">
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

            <div className="bg-white bg-opacity-5 border-2 border-white rounded-lg p-4">
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

            <div className="bg-white bg-opacity-5 border-2 border-white rounded-lg p-4">
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
                <option value="Consulta">{t('consulta')}</option>
                <option value="Reserva">{t('reserva')}</option>
                <option value="Otro">{t('otro')}</option>
              </select>
            </div>

            <div className="bg-white bg-opacity-5 border-2 border-white rounded-lg p-4">
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
            className="w-full py-3 px-6 bg-teal-700 border-2 border-white hover:bg-teal-600 rounded-lg font-semibold text-white transition-colors duration-300 shadow-lg hover:shadow-xl"
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
