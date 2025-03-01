import emailjs from "@emailjs/browser";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Swal from "sweetalert2";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

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

  // Validar campo actual
  const validateCurrentField = () => {
    const fields = ["nombre", "correo", "telefono", "razon", "mensaje"];
    const currentField = fields[currentStep];
    
    if (formData[currentField].trim() === "") {
      setErrorMessage(t('camposObligatorios'));
      return false;
    }
    
    if (currentField === "correo" && !formData.correo.includes("@")) {
      setErrorMessage("Por favor, ingresa un correo electrónico válido");
      return false;
    }
    
    setErrorMessage("");
    return true;
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (validateCurrentField()) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setAnimating(false);
      }, 500);
    }
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setAnimating(false);
    }, 500);
  };

  // Enviar los datos del formulario con EmailJS
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    emailjs
      .send(
        "service_ur5nbyc", // Tu Service iD
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
              padding: 15px;
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
                padding: 8px;
                width: 100%;
              ">
                <img src="https://i.pinimg.com/originals/bf/fc/c2/bffcc2de14a013a2e7a795668846cae5.gif" 
                  alt="Caballo corriendo" 
                  style="
                    max-width: 120px;
                    width: 100%;
                    height: auto;
                    margin-bottom: 8px;
                    border-radius: 8px;
                  ">
                <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                  alt="Logo ExploCocora" 
                  style="
                    max-width: 100px;
                    width: 100%;
                    height: auto;
                    border-radius: 8px;
                  ">
              </div>
              <h2 style="
                font-size: clamp(18px, 4vw, 28px);
                font-weight: bold; 
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                margin-top: 12px;
                text-align: center;
                word-wrap: break-word;
                width: 100%;
              ">
                Mensaje enviado correctamente
              </h2>
              <p style="
                font-size: clamp(14px, 3vw, 18px);
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                text-align: center; 
                margin-top: 8px;
                width: 100%;
              ">
                Nos pondremos en contacto contigo pronto
              </p>
              <button id="cerrarAlerta" style="
                margin-top: 12px;
                padding: 8px 16px;
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
          },
          customClass: {
            popup: 'swal-custom-popup'
          },
          width: 'auto',
          padding: '10px'
        });
        
        setFormData({ nombre: "", correo: "", telefono: "", razon: "", mensaje: "" }); // Limpiar los campos
        setCurrentStep(0); // Volver al primer paso
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

  // Obtener el mensaje para cada paso
  const getStepMessage = () => {
    switch (currentStep) {
      case 0:
        return "¡Bienvenido a nuestra aventura! ¿Cómo te llamas?";
      case 1:
        return `¡Hola ${formData.nombre}! ¿A qué correo podemos contactarte?`;
      case 2:
        return "¡Excelente! ¿Cuál es tu número de teléfono?";
      case 3:
        return "¿Cuál es el motivo de tu contacto?";
      case 4:
        return "¡Ya casi terminamos! Cuéntanos más detalles:";
      case 5:
        return `¡Perfecto ${formData.nombre}! Revisa tu información y envíala cuando estés listo.`;
      default:
        return "";
    }
  };

  // Renderizar el campo actual según el paso
  const renderCurrentField = () => {
    switch (currentStep) {
      case 0:
        return (
          <input
            type="text"
            name="nombre"
            placeholder={t('escribeTuNombre')}
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-teal-50 border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base sm:text-lg text-teal-900 placeholder-teal-400"
            autoFocus
          />
        );
      case 1:
        return (
          <input
            type="email"
            name="correo"
            placeholder={t('escribeTuCorreo')}
            value={formData.correo}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-teal-50 border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base sm:text-lg text-teal-900 placeholder-teal-400"
            autoFocus
          />
        );
      case 2:
        return (
          <input
            type="tel"
            name="telefono"
            placeholder={t('escribeTuTelefono')}
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-teal-50 border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base sm:text-lg text-teal-900 placeholder-teal-400"
            autoFocus
          />
        );
      case 3:
        return (
          <select
            name="razon"
            value={formData.razon}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-teal-50 border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base sm:text-lg text-teal-900"
            autoFocus
          >
            <option value="">{t('selecciona')}</option>
            <option value="Consulta">{t('consulta')}</option>
            <option value="Reserva">{t('reserva')}</option>
            <option value="Otro">{t('otro')}</option>
          </select>
        );
      case 4:
        return (
          <textarea
            name="mensaje"
            placeholder={t('escribeTuMensaje')}
            rows={4}
            value={formData.mensaje}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-3xl bg-teal-50 border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-base sm:text-lg text-teal-900 placeholder-teal-400"
            autoFocus
          ></textarea>
        );
      case 5:
        return (
          <div className="bg-teal-700 bg-opacity-10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border-2 border-teal-700 border-opacity-30">
            <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3 sm:mb-4">Resumen de tu información</h3>
            <div className="space-y-2 sm:space-y-3 text-teal-900 text-sm sm:text-base">
              <p><span className="font-semibold">Nombre:</span> {formData.nombre}</p>
              <p><span className="font-semibold">Correo:</span> {formData.correo}</p>
              <p><span className="font-semibold">Teléfono:</span> {formData.telefono}</p>
              <p><span className="font-semibold">Razón:</span> {formData.razon}</p>
              <p><span className="font-semibold">Mensaje:</span> {formData.mensaje}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Iconos para los pasos
  const stepIcons = [
    "👋", // Nombre
    "📧", // Correo
    "📱", // Teléfono
    "🔍", // Razón
    "💬", // Mensaje
    "✅", // Resumen
  ];

  // Colores para el fondo según el paso
  const backgroundColors = [
    "from-white to-teal-100", // Paso 1
    "from-white to-teal-50", // Paso 2
    "from-teal-50 to-white", // Paso 3
    "from-white to-emerald-50", // Paso 4
    "from-emerald-50 to-white", // Paso 5
    "from-white to-teal-50", // Paso 6
  ];

  return (
    <div className={`min-h-[80vh] bg-gradient-to-br ${backgroundColors[currentStep]} flex flex-col items-center justify-center p-3 md:p-6 transition-all duration-1000 ease-in-out relative overflow-hidden`}>
      {/* Patrón SVG de fondo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M100,600 C100,400 150,300 200,100 C220,300 240,400 260,600"
            fill="none"
            stroke="#047857"
            strokeWidth="8"
          />
          <path
            d="M400,600 C400,350 450,250 500,50 C520,250 540,350 560,600"
            fill="none"
            stroke="#047857"
            strokeWidth="8"
          />
          <path
            d="M700,600 C700,400 750,300 800,100 C820,300 840,400 860,600"
            fill="none"
            stroke="#047857"
            strokeWidth="8"
          />
          <path
            d="M1000,600 C1000,350 1050,250 1100,50 C1120,250 1140,350 1160,600"
            fill="none"
            stroke="#047857"
            strokeWidth="8"
          />
        </svg>
      </div>

      {/* Indicador de progreso */}
      <div className="mb-4 sm:mb-6 w-full max-w-[95vw] sm:max-w-xl mx-auto">
        <div className="bg-teal-700 bg-opacity-90 backdrop-blur-md rounded-full px-2 sm:px-6 py-1 sm:py-2 shadow-lg border border-teal-600">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-hidden">
            {stepIcons.map((icon, index) => (
              <div 
                key={index} 
                className={`w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-base sm:text-xl transition-all duration-300 ${
                  index === currentStep 
                    ? "bg-white text-teal-700 scale-125" 
                    : index < currentStep 
                      ? "bg-teal-100 text-teal-700" 
                      : "bg-teal-600 bg-opacity-50 text-white"
                }`}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-4xl px-2 sm:px-4">
        <div 
          className={`bg-white bg-opacity-80 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 border-2 border-teal-700 border-opacity-20 transition-all duration-500 ${
            animating ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
          }`}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-teal-800 text-center">
            {getStepMessage()}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              {renderCurrentField()}
            </div>

            {errorMessage && (
              <p className="text-red-600 text-xs sm:text-sm mt-2 bg-red-50 p-2 rounded-lg">{errorMessage}</p>
            )}

            <div className="flex flex-wrap sm:flex-nowrap justify-between mt-4 sm:mt-8 gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-2 sm:py-3 px-4 sm:px-6 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold text-gray-700 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center text-sm sm:text-base"
                >
                  <span className="mr-1 sm:mr-2">←</span> {t('anterior')}
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`py-2 sm:py-3 px-4 sm:px-6 bg-teal-600 hover:bg-teal-700 rounded-full font-semibold text-white transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center text-sm sm:text-base ${
                    currentStep === 0 ? "ml-auto" : ""
                  }`}
                >
                  {t('siguiente')} <span className="ml-1 sm:ml-2">→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="py-2 sm:py-3 px-5 sm:px-8 bg-teal-600 hover:bg-teal-700 rounded-full font-semibold text-white transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center text-sm sm:text-base"
                >
                  {t('enviar')} <span className="ml-1 sm:ml-2">✉️</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;