import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaHiking, FaTshirt } from "react-icons/fa";
import { GiHorseHead } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";

export const RecomendacionesVestimentaPaquete = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos de la reserva desde el estado de navegación
  const {
    formData,
    paqueteInfo,
    idPaquete,
    radicado,
    serviciosAdicionales = [],
  } = location.state || {};

  // Añadir log para depuración

  const [aceptaRecomendaciones, setAceptaRecomendaciones] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Usar useEffect para la redirección si faltan datos
  useEffect(() => {
    // Si no hay datos suficientes, redirigir al formulario de reserva
    if (!formData || !paqueteInfo || !idPaquete) {
      navigate("/VistaCliente/reserva-paquete");
    }
  }, [formData, paqueteInfo, idPaquete, navigate]);

  // Si no hay datos suficientes, no renderizar nada mientras se redirige
  if (!formData || !paqueteInfo || !idPaquete) {
    return null;
  }

  // Función para redirigir directamente a la pasarela de pago
  const redirigirAPago = (radicadoReserva) => {
    navigate("/VistaCliente/reserva/mercado-libre-paquete", {
      state: {
        radicado: radicadoReserva,
        paqueteInfo: {
          nombrePaquete: paqueteInfo.nombrePaquete,
          descripcion: paqueteInfo.descripcion,
          precio: paqueteInfo.precio,
          cantidadPersonas: formData.cantidadPersonas,
          fechaInicio: formData.fechaInicioISO,
          fechaFin: formData.fechaFinISO,
          horaInicio: formData.horaInicio,
          fechaReserva: formData.fechaReservaMySQL,
        },
        idPaquete,
        serviciosAdicionales,
      },
    });
  };

  // Función que se ejecuta cuando el usuario hace clic en "Reservar Ahora"
  const handleReservarAhora = async () => {
    if (!aceptaRecomendaciones) {
      setError(
        t(
          "debesAceptarRecomendaciones",
          "Debes aceptar las recomendaciones de vestimenta para continuar"
        )
      );
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // Verificar si ya tenemos un radicado (pasado desde el componente anterior)
      if (radicado) {
        // Si ya tenemos un radicado, redirigimos directamente a la pasarela de pago
        redirigirAPago(radicado);
        return;
      }

      // Si no hay radicado, realizamos la petición para crear la reserva
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/Ingreso", {
          state: {
            mensaje: t(
              "debesIniciarSesion",
              "Debes iniciar sesión para reservar un paquete"
            ),
            redireccion: `/Paquetes/${idPaquete}`,
          },
        });
        return;
      }

      // Asegurarnos de que serviciosAdicionales tenga el formato correcto
      const serviciosFormateados = serviciosAdicionales.map((item) => ({
        idServicio: item.servicio.id || item.servicio.idServicio,
        cantidad: item.cantidad,
        precioUnitario: item.servicio.precio,
      }));

      const response = await axios.post(
        "http://localhost:10101/pago-paquetes/crear",
        {
          idPaquete: parseInt(idPaquete),
          cantidadPersonas: parseInt(formData.cantidadPersonas),
          fechaInicio: formData.fechaInicioISO,
          fechaFin: formData.fechaFinISO,
          horaInicio: formData.horaInicio,
          fechaReserva: formData.fechaReservaMySQL,
          estado: "pendiente",
          serviciosAdicionales: serviciosFormateados, // Usar el formato correcto para el backend
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Si la respuesta es exitosa, guardamos la información en localStorage y redirigimos
      if (response.data && response.data.radicado) {
        // Verificar y procesar la información del guía asignado
        let guiaAsignadoInfo = null;

        if (response.data.guiaAsignado) {
          // Si el backend devuelve un objeto con la información del guía
          if (typeof response.data.guiaAsignado === "object") {
            guiaAsignadoInfo = { ...response.data.guiaAsignado };
            // Limpiar espacios en blanco en el nombre si existe
            if (guiaAsignadoInfo.nombre) {
              guiaAsignadoInfo.nombre = guiaAsignadoInfo.nombre.trim();
            }
          }
          // Si el backend devuelve solo el nombre del guía como string
          else if (typeof response.data.guiaAsignado === "string") {
            guiaAsignadoInfo = { nombre: response.data.guiaAsignado.trim() };
          }
        }

        localStorage.setItem(
          "reserva_pendiente",
          JSON.stringify({
            radicado: response.data.radicado,
            fechaCreacion: formData.fechaReservaMySQL,
            fechaInicio: formData.fechaInicioISO,
            guiaAsignado: guiaAsignadoInfo,
            serviciosAdicionales: Array.isArray(serviciosAdicionales)
              ? serviciosAdicionales
              : [],
          })
        );

        // Redirigir directamente a la página de pago
        redirigirAPago(response.data.radicado);
      } else {
        throw new Error(
          t("respuestaInvalida", "La respuesta del servidor no es válida")
        );
      }
    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          t("errorProcesandoReserva", "Error al procesar la reserva")
      );
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = () => {
    navigate("/VistaCliente/reserva/aceptacion-riesgos-paquete", {
      state: {
        formData,
        paqueteInfo,
        idPaquete,
        radicado,
        serviciosAdicionales,
      },
    });
  };

  return (
    <section className="relative py-10 px-4 overflow-hidden">
      {/* Fondo decorativo inspirado en el Valle del Cocora */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

        {/* Siluetas de montañas y vegetación */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg
            viewBox="0 0 1200 600"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Silueta de montaña con árboles */}
            <path
              d="M0,600 L300,200 L400,300 L500,150 L600,250 L800,100 L1000,300 L1200,200 L1200,600 Z"
              fill="#047857"
              opacity="0.3"
            />

            {/* Arroyo serpenteante */}
            <path
              d="M0,450 C100,430 150,470 250,440 C350,410 400,450 500,430 C600,410 650,450 750,430 C850,410 900,450 1000,430 C1100,410 1150,450 1200,430 L1200,500 C1100,520 1050,480 950,500 C850,520 800,480 700,500 C600,520 550,480 450,500 C350,520 300,480 200,500 C100,520 50,480 0,500 Z"
              fill="#047857"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto">
        {/* Encabezado con fondo decorativo */}
        <div className="relative mb-10 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-50 to-transparent opacity-70 rounded-3xl"></div>
          </div>
          <h1 className="text-4xl font-bold text-teal-800 mb-3">
            {t("recomendacionesVestimenta", "Recomendaciones de Vestimenta")}
          </h1>
          {paqueteInfo && (
            <p className="text-2xl text-teal-600 font-semibold">
              {paqueteInfo.nombrePaquete}
            </p>
          )}
        </div>

        {/* Información del paquete */}
        {paqueteInfo && (
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-6 rounded-t-xl shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex flex-wrap items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">
                  {paqueteInfo.nombrePaquete}
                </h2>
                <p className="mt-2 text-teal-200 font-semibold">
                  $
                  {(
                    paqueteInfo.precio * (formData?.cantidadPersonas || 1) +
                    (serviciosAdicionales?.reduce(
                      (total, item) =>
                        total + item.servicio.precio * item.cantidad,
                      0
                    ) || 0)
                  ).toLocaleString("es-CO")}{" "}
                  COP
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                  <FaHiking className="h-6 w-6 text-teal-600" />
                </div>
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                  <GiHorseHead className="h-7 w-7 text-teal-600" />
                </div>
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                  <FaTshirt className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative bg-white rounded-b-xl shadow-lg p-8 border-t-4 border-teal-500">
          {/* Líneas decorativas laterales */}
          <div className="absolute left-0 top-10 bottom-10 w-1 bg-gradient-to-b from-teal-500 via-teal-300 to-teal-500 rounded-r-full"></div>
          <div className="absolute right-0 top-10 bottom-10 w-1 bg-gradient-to-b from-teal-500 via-teal-300 to-teal-500 rounded-l-full"></div>

          {/* Título con icono */}
          <div className="flex items-center justify-center gap-3 mb-6 text-center">
            <FaTshirt className="h-8 w-8 text-teal-600" />
            <h2 className="text-2xl font-bold text-teal-800">
              Ropa Ideal para Explorar el Valle del Cocora
            </h2>
          </div>

          {/* Introducción */}
          <div className="text-gray-700 mb-8 px-4 py-4 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100 shadow-sm">
            <p className="leading-relaxed">
              Para garantizar una experiencia segura y cómoda en las actividades
              de caminata y cabalgata en el Valle del Cocora, es fundamental
              llevar la vestimenta adecuada. Debido a que el clima en la zona es
              frío y puede presentar lluvias ocasionales, estas recomendaciones
              están diseñadas para adaptarse a las condiciones climáticas y del
              terreno, asegurando la protección y bienestar de los
              participantes.
            </p>
          </div>

          {/* Recomendaciones de vestimenta para caminatas */}
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-t-lg">
              <FaHiking className="h-6 w-6" />
              <h3 className="text-xl font-bold">
                1. Vestimenta Recomendada para Caminatas
              </h3>
            </div>
            <div className="border border-t-0 border-teal-200 rounded-b-lg p-4 bg-white">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Ropa:
                  </span>
                  <p>
                    Se recomienda usar varias prendas en lugar de una sola
                    gruesa para mantenerse abrigado y cómodo. Primero, una
                    camiseta que ayude a mantener la piel seca; encima, un
                    suéter o chaqueta que conserve el calor; y, por último, una
                    chaqueta impermeable para protegerse de la lluvia.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Calzado:
                  </span>
                  <p>
                    Es esencial usar botas de montaña o zapatillas de trekking
                    con suelas que ofrezcan buen agarre. El terreno puede estar
                    resbaladizo y fangoso, por lo que se necesita un calzado que
                    brinde estabilidad y protección.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Pantalones:
                  </span>
                  <p>
                    Optar por pantalones largos, preferiblemente de materiales
                    ligeros pero resistentes, que protejan las piernas de
                    posibles rozaduras con la vegetación, picaduras de insectos
                    o cambios bruscos de temperatura.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Accesorios:
                  </span>
                  <p>
                    Se sugiere llevar un gorro para protegerse del sol o la
                    lluvia, gafas de sol para días despejados y protector solar,
                    independientemente del clima. También es aconsejable llevar
                    un pequeño botiquín de primeros auxilios.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Recomendaciones de vestimenta para cabalgatas */}
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-t-lg">
              <GiHorseHead className="h-6 w-6" />
              <h3 className="text-xl font-bold">
                2. Vestimenta Recomendada para Cabalgatas
              </h3>
            </div>
            <div className="border border-t-0 border-teal-200 rounded-b-lg p-4 bg-white">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Pantalones:
                  </span>
                  <p>
                    Usar pantalones largos, preferentemente de algodón o
                    materiales elásticos, que permitan libertad de movimiento
                    sin causar rozaduras en las piernas. Evitar pantalones con
                    costuras internas gruesas que puedan resultar incómodas
                    durante la cabalgata.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Calzado:
                  </span>
                  <p>
                    Zapatos cerrados con un pequeño tacón (no más de 1-2 cm)
                    para evitar que el pie se deslice demasiado hacia adelante
                    en el estribo. Evitar sandalias o zapatos con cordones
                    largos que puedan enredarse.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Protección:
                  </span>
                  <p>
                    Se proporcionará un casco por seguridad. Además, se
                    recomienda usar guantes de equitación para proteger las
                    manos y mejorar el agarre de las riendas.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Clima:
                  </span>
                  <p>
                    Igual que para las caminatas, vestirse en capas y llevar un
                    impermeable si hay probabilidad de lluvia. Incluso en días
                    soleados, la temperatura puede variar, especialmente en
                    zonas de mayor altitud.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Elementos adicionales recomendados */}
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-t-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-xl font-bold">
                3. Elementos Adicionales Recomendados
              </h3>
            </div>
            <div className="border border-t-0 border-teal-200 rounded-b-lg p-4 bg-white">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Mochila:
                  </span>
                  <p>
                    Una mochila pequeña y cómoda para llevar agua, snacks,
                    protector solar y otros elementos personales esenciales.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Hidratación:
                  </span>
                  <p>
                    Botella de agua o cantimplora para mantenerse hidratado
                    durante el recorrido. En altitudes elevadas, es
                    especialmente importante beber agua regularmente.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Cámara:
                  </span>
                  <p>
                    Para capturar los increíbles paisajes del Valle del Cocora.
                    Recomendamos protegerla en caso de lluvia.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold min-w-[80px]">
                    Repelente:
                  </span>
                  <p>
                    Repelente de insectos, especialmente en temporadas húmedas
                    cuando hay mayor presencia de mosquitos.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Notas importantes */}

          {/* Mensaje de error */}
          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Checkbox con estilo mejorado */}
          <div className="flex items-center mt-6 mb-8 p-4 bg-teal-50 rounded-lg border border-teal-200 transition-all duration-200 hover:shadow-md">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="aceptarRecomendaciones"
                checked={aceptaRecomendaciones}
                onChange={(e) => setAceptaRecomendaciones(e.target.checked)}
                className="opacity-0 absolute h-6 w-6 cursor-pointer"
              />
              <div
                className={`bg-white border-2 rounded-md w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-teal-500 transition-colors duration-200 ${
                  aceptaRecomendaciones
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-300"
                }`}
              >
                <svg
                  className={`fill-current w-3 h-3 text-teal-600 pointer-events-none ${
                    aceptaRecomendaciones ? "opacity-100" : "opacity-0"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              </div>
            </div>
            <label
              htmlFor="aceptarRecomendaciones"
              className="ml-2 text-gray-700 font-medium select-none cursor-pointer"
            >
              He leído y comprendido las recomendaciones de vestimenta para
              caminatas y cabalgatas en el Valle del Cocora, y me comprometo a
              seguirlas para garantizar mi seguridad y comodidad durante la
              actividad.
            </label>
          </div>

          {/* Botones con estilo mejorado */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
            <button
              onClick={handleCancelar}
              className="order-2 sm:order-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-gray-300 hover:shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t("volver", "Cancelar")}
            </button>

            <button
              onClick={handleReservarAhora}
              disabled={!aceptaRecomendaciones || cargando}
              className={`order-1 sm:order-2 py-4 px-8 rounded-xl ${
                aceptaRecomendaciones && !cargando
                  ? "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center`}
            >
              {cargando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("procesando", "Procesando...")}
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {t("continuarPago", "Reservar ahora")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecomendacionesVestimentaPaquete;
