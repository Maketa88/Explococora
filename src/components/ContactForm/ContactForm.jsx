import { useState } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

const ContactForm = () => {
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
        setErrorMessage("Todos los campos son obligatorios");
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
            title: "Mensaje enviado correctamente",
            text: "Nos pondremos en contacto contigo pronto.",
            confirmButtonColor: "#38a169", // Botón verde
          });
          setFormData({ nombre: "", correo: "", telefono: "", razon: "", mensaje: "" }); // Limpiar los campos
        },
        (err) => {
          console.error("Error al enviar el correo:", err);
          // Mostrar mensaje de error con SweetAlert2
          Swal.fire({
            icon: "error",
            title: "Error al enviar el mensaje",
            text: "Por favor, intenta de nuevo más tarde.",
            confirmButtonColor: "#e53e3e", // Botón rojo
          });
        }
      );
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('/assets/carrusel1.webp')" }}
    >
      <div className="bg-teal-600 bg-opacity-50 text-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Contacta con nosotros</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              placeholder="Escribe tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-teal-800 bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              placeholder="Escribe tu correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-teal-800 bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Teléfono</label>
            <input
              type="number"
              name="telefono"
              placeholder="Escribe tu teléfono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-teal-800 bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Razón</label>
            <select
              name="razon"
              value={formData.razon}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-teal-800 bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="" disabled>
                Selecciona
              </option>
              <option>Más Información</option>
              <option>Reclamo</option>
              <option>Ayuda</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Mensaje</label>
            <textarea
              name="mensaje"
              placeholder="Escribe tu mensaje"
              rows={4}
              value={formData.mensaje}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-teal-800 bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-teal-700 hover:bg-teal-600 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Enviar
          </button>
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
