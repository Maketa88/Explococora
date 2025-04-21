import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          // Menú principal
          inicio: "Inicio",
          historia: "Historia",
          nuestrasRutas: "Rutas",
          nuestrosGuias: "Guías",
          contactanos: "Contáctanos",
          ingresar: "Iniciar Sesión",
          crearCuenta: "Crear Cuenta",
          paquetesTuristicos: "Paquetes Turísticos",
          
          // Footer
          valleCocora: "Valle del Cocora Logo",
          footerDescripcion: "Descubre la magia del Valle del Cocora, hogar de las majestuosas palmas de cera y experiencias únicas en la naturaleza.",
          acercaDeNosotros: "Acerca de Nosotros",
          quienesSomos: "Quiénes Somos",
          contacto: "Contacto",
          politicas: "Políticas",
          politicasPrivacidad: "Políticas de Privacidad",
          seguridadCaminatas: "Seguridad en Caminatas y Cabalgatas",
          terminosCondiciones: "Términos y Condiciones",
          siguenos: "Síguenos",
          sigueFacebook: "Síguenos en Facebook",
          sigueInstagram: "Síguenos en Instagram",
          sigueTiktok: "Síguenos en TikTok",
          mantenteConectado: "Mantente conectado con nuestras últimas aventuras y novedades",
          
          // Página de Nuestros Guías
          tituloGuias: "Nuestros Guías",
          descripcionGuias: "Conoce a nuestro equipo de expertos guías",
          experiencia: "Experiencia",
          especialidad: "Especialidad",
          años: "años",
          
          // Página de Registro
          tituloRegistro: "Crear una cuenta",
          subtituloRegistro: "Únete a nuestra comunidad de viajeros",
          nombre: "Identificacion",
          email: "Correo electrónico",
          password: "Contraseña",
          confirmarPassword: "Confirmar contraseña",
          terminos: "Acepto los términos y condiciones",
          botonRegistro: "Registrarse",
          yaTenesCuenta: "¿Ya tienes una cuenta?",
          iniciarSesionAqui: "Inicia sesión aquí",
          
          // Página de Contacto
          tituloContacto: "Contáctanos",
          descripcionContacto: "Estamos aquí para ayudarte",
          nombreContacto: "Nombre",
          emailContacto: "Correo electrónico",
          mensaje: "Tu mensaje",
          enviar: "Enviar mensaje",
          
          // Formularios comunes
          correoElectronico: "Correo Electrónico",
          contrasena: "Contraseña",
          iniciarSesion: "Iniciar Sesión",
          bienvenidoExplococora: "Bienvenido a Explococora",
          iniciaSesion: "Inicia sesión para explorar las maravillas del Valle del Cocora",
          noTienesCuenta: "¿No tienes cuenta? Regístrate aquí",
          aqui: "Aquí",
          
          // Otros textos
          programaTuRuta: "¡Programa tu ruta hoy!",
          ubicacion: "Colombia",
          telefono: "+57 1234567890",
          email: "Correo Electrónico",
          
          // Página de Historia
          tituloHistoria: "Descubre la Magia del Valle del Cocora",
          descripcionHistoria: `El Valle del Cocora es mucho más que un destino turístico; es un lugar donde la historia, la cultura y la naturaleza se entrelazan para crear un escenario único en el corazón de Colombia. Cada rincón de este valle mágico está cargado de leyendas ancestrales, tradiciones vivas y paisajes que quitan el aliento. Aquí, las imponentes palmas de cera tocan el cielo mientras susurran historias del pasado, los pueblos cercanos como Salento invitan a revivir las costumbres cafetaleras, y la biodiversidad florece como un testimonio de la riqueza de nuestra tierra. Prepárate para un recorrido inolvidable que despertará tus sentidos y te conectará con las raíces más profundas de nuestra historia. ¡Adéntrate en el Valle del Cocora y deja que su encanto te envuelva!`,
          
          // Formularios de registro
          cedulaPlaceholder: "Ingrese su cédula",
          primerNombre: "Primer Nombre",
          primerNombrePlaceholder: "Ingrese su primer nombre",
          segundoNombre: "Segundo Nombre",
          segundoNombrePlaceholder: "Ingrese su segundo nombre (Opcional)",
          primerApellido: "Primer Apellido",
          primerApellidoPlaceholder: "Ingrese su primer apellido",
          segundoApellido: "Segundo Apellido",
          segundoApellidoPlaceholder: "Ingrese su segundo apellido (Opcional)",
          registroExitoso: "Registro exitoso",
          usuarioRegistrado: "Usuario registrado con éxito",
          aceptar: "Aceptar",
          mostrarContrasena: "Mostrar contraseña",
          ocultarContrasena: "Ocultar contraseña",

          // Formulario de Contacto
          contactaConNosotros: "Contacta con nosotros",
          nombreCompleto: "Nombre Completo",
          escribeTuNombre: "Escribe tu nombre",
          correoElectronico: "Correo Electrónico",
          escribeTuCorreo: "Escribe tu correo",
          telefono: "Teléfono",
          escribeTuTelefono: "Escribe tu teléfono",
          mensaje: "Mensaje",
          escribeTuMensaje: "Escribe tu mensaje",
          enviar: "Enviar mensaje",

          // Placeholders y mensajes comunes
          escribeTuNombreCompleto: "Escribe tu nombre completo",
          escribeTuCorreoElectronico: "Escribe tu correo electrónico",
          escribeTuTelefonoContacto: "Escribe tu teléfono de contacto",
          seleccionaUnaOpcion: "Selecciona una opción",
          escribeTuMensajeAqui: "Escribe tu mensaje aquí",

          // Mensajes de éxito y error
          mensajeEnviado: "Mensaje enviado correctamente",
          contactaremosProonto: "Nos pondremos en contacto contigo pronto",
          errorEnvio: "Error al enviar el mensaje",
          intentarNuevamente: "Por favor, intenta de nuevo más tarde",
          camposObligatorios: "Todos los campos son obligatorios",
          
          // Validaciones de formulario
          emailInvalido: "Por favor, ingresa un email válido",
          telefonoInvalido: "Por favor, ingresa un teléfono válido",
          seleccionaOpcion: "Por favor, selecciona una opción",
          mensajeCorto: "El mensaje debe tener al menos 10 caracteres",

          // Historia Cultural
          tituloHistoriaCultural: "Historia Cultural del Valle del Cocora",
          subtituloHistoriaCultural: "Descubre nuestras raíces y tradiciones",
          parrafoHistoriaCultural1: "El Valle del Cocora no es solo un paisaje hermoso, sino también un tesoro cultural vivo. Las tradiciones de nuestros ancestros siguen vivas en cada rincón de este mágico lugar.",
          parrafoHistoriaCultural2: "Los pueblos indígenas que habitaron estas tierras nos dejaron un rico legado de costumbres y conocimientos que aún hoy preservamos.",
          parrafoHistoriaCultural3: "La palma de cera, nuestro árbol nacional, es testigo de siglos de historia y cultura en esta región.",
          tradicionesTitulo: "Nuestras Tradiciones",
          costumbresTitulo: "Costumbres Locales",
          patrimonioTitulo: "Patrimonio Cultural",

          // Tarjetas de Historia Cultural
          card1Title: "Cocora: La Princesa que Dio Nombre al Valle",
          card1Text: "El Valle del Cocora debe su nombre a una princesa Quimbaya, símbolo de pureza y riqueza natural. Según la leyenda, su espíritu sigue vivo en este mágico destino de Colombia, donde cada rincón cuenta una historia y refleja el respeto ancestral por la tierra y la cultura indígena.",

          card2Title: "Palma de Cera: La Gigante que Toca el Cielo",
          card2Text: "La palma de cera, árbol nacional de Colombia, simboliza resistencia y majestuosidad. Con más de 60 metros de altura, ha sido testigo de siglos de historia. Protegida desde 1985, su conservación es clave para el hábitat del loro orejiamarillo y representa el orgullo colombiano.",

          card3Title: "Los Quimbayas: Maestros del Oro y la Naturaleza",
          card3Text: "Mucho antes de la colonia, el Valle del Cocora era hogar de los Quimbayas, maestros del oro. Para ellos, no era un hogar, sino un templo sagrado donde montañas y ríos eran dioses. Su legado inspira sostenibilidad y respeto por la naturaleza, valores presentes en el valle.",

          card4Title: "Trucha y Patacón: Los Sabores del Valle",
          card4Text: "La gastronomía del Valle del Cocora es un deleite, con platos como la trucha arcoíris y patacón, reflejo de sus aguas cristalinas. Sus recetas, transmitidas, equilibran tradición e innovación. Degustarlas con vistas al valle es una experiencia que conecta con su cultura y naturaleza.",

          card5Title: "Salento y Cocora: Tradición y Modernidad",
          card5Text: "Puerta al Valle del Cocora, combina arquitectura colorida y espíritu vibrante. Sus balcones floridos y calles empedradas invitan a recorrer historia. Aquí, la modernidad refuerza las tradiciones, con artesanías únicas y gastronomía típica. Es un puente entre el pasado y el presente cafetero.",

          card6Title: "Caballos y Senderos: Explorando el Valle",
          card6Text: "Recorrer el Valle del Cocora a caballo es más que turismo; es revivir la tradición arriera. Antiguos senderos, usados para el comercio, hoy ofrecen vistas únicas de montañas y palmas de cera. Guiados por relatos locales, es una experiencia que fusiona historia, naturaleza y cultura campesina.",

          card7Title: "El Loro Orejiamarillo: Un Tesoro Escondido",
          card7Text: "En el Valle del Cocora vive el loro orejiamarillo, dependiente de la palma de cera. Gracias a esfuerzos constantes, la especie se recupera y se convierte en un símbolo de esperanza. Su presencia realmente conecta a numerosos visitantes con la biodiversidad y resalta la importancia de cuidar la naturaleza",

          card8Title: "Un Templo Natural en el Corazón de Colombia",
          card8Text: "El Valle del Cocora, más que hermoso, es un santuario de biodiversidad. Su ambiente de paz, aire puro y sonidos naturales invitan a la introspección y conexión espiritual. Cada amanecer transforma el alma, recordándonos la importancia de preservar los tesoros naturales del planeta.",

          // Título y descripción principal
          tituloValle: "Descubre la Magia del Valle del Cocora",
          descripcionValle: "El Valle del Cocora es un destino donde historia, cultura y naturaleza se fusionan en un paisaje único de Colombia. Sus majestuosas palmas de cera se alzan hacia el cielo, mientras los pueblos cercanos, como Salento, mantienen vivas las tradiciones cafetaleras. Con una biodiversidad impresionante y paisajes de ensueño, este valle te invita a una experiencia inolvidable que despertará tus sentidos. ¡Descúbrelo y déjate cautivar por su magia!",

          // Nuestras Rutas
          tituloRutas: "Nuestras Rutas",
          ruta1Titulo: "Sendero de las Palmas",
          ruta1Descripcion: "Un recorrido mágico entre las majestuosas palmas de cera, el árbol nacional de Colombia. Esta ruta te llevará a través de verdes praderas y te permitirá admirar estas gigantes que pueden alcanzar los 60 metros de altura.",
          
          ruta2Titulo: "Valle del Río Quindío",
          ruta2Descripcion: "Sigue el curso del río Quindío en esta aventura que combina naturaleza y historia. Descubre la rica biodiversidad de la región mientras aprendes sobre las antiguas culturas que habitaron estas tierras.",
          
          ruta3Titulo: "Mirador del Cóndor",
          ruta3Descripcion: "Asciende hasta el punto más alto del valle para disfrutar de vistas panorámicas impresionantes. En días despejados, podrías avistar cóndores andinos sobrevolando el majestuoso paisaje.",
          
            title: "Explococora",
            slogan: "Disfruta de la naturaleza y la aventura"
          
          
        }
      },
      en: {
        translation: {
          // Main menu
          inicio: "Home",
          historia: "History",
          nuestrasRutas: "Routes",
          nuestrosGuias: "Guides",
          contactanos: "Contact Us",
          ingresar: "Sign In",
          crearCuenta: "Sign Up",
          paquetesTuristicos: "Tourist Packages",
          
          // Footer
          valleCocora: "Cocora Valley Logo",
          footerDescripcion: "Discover the magic of Cocora Valley, home to majestic wax palms and unique nature experiences.",
          acercaDeNosotros: "About Us",
          quienesSomos: "Who We Are",
          contacto: "Contact",
          politicas: "Policies",
          politicasPrivacidad: "Privacy Policy",
          seguridadCaminatas: "Safety in Hiking and Horseback Riding",
          terminosCondiciones: "Terms and Conditions",
          siguenos: "Follow Us",
          sigueFacebook: "Follow us on Facebook",
          sigueInstagram: "Follow us on Instagram",
          sigueTiktok: "Follow us on TikTok",
          mantenteConectado: "Stay connected with our latest adventures and news",
          
          // Our Guides Page
          tituloGuias: "Our Guides",
          descripcionGuias: "Meet our expert guide team",
          experiencia: "Experience",
          especialidad: "Specialty",
          años: "years",
          
          // Registration Page
          tituloRegistro: "Create an Account",
          subtituloRegistro: "Join our travel community",
          nombre: "Id",
          email: "Email",
          password: "Password",
          confirmarPassword: "Confirm password",
          terminos: "I accept the terms and conditions",
          botonRegistro: "Register",
          yaTenesCuenta: "Already have an account?",
          iniciarSesionAqui: "Sign in here",
          
          // Contact Page
          tituloContacto: "Contact Us",
          descripcionContacto: "We're here to help",
          nombreContacto: "Name",
          emailContacto: "Email",
          mensaje: "Your message",
          enviar: "Send message",
          
          // Common forms
          correoElectronico: "Email",
          contrasena: "Password",
          iniciarSesion: "Sign In",
          bienvenidoExplococora: "Welcome to Explococora",
          iniciaSesion: "Sign in to explore the wonders of Cocora Valley",
          noTienesCuenta: "Don't have an account? Register here",
          aqui: "Here",
          
          // Other texts
          programaTuRuta: "Schedule your route today!",
          ubicacion: "Colombia",
          telefono: "+57 1234567890",
          email: "Email",
          
          // History page
          tituloHistoria: "Discover the Magic of Cocora Valley",
          descripcionHistoria: `The Cocora Valley is much more than a tourist destination; it is a place where history, culture, and nature intertwine to create a unique setting in the heart of Colombia. Every corner of this magical valley is filled with ancestral legends, living traditions, and breathtaking landscapes. Here, the majestic wax palms touch the sky while whispering stories of the past, nearby towns like Salento invite you to relive coffee-growing traditions, and biodiversity flourishes as a testament to the richness of our land. Get ready for an unforgettable journey that will awaken your senses and connect you with the deepest roots of our history. Step into the Cocora Valley and let its charm embrace you!`,
          
          // Registration forms
          cedulaPlaceholder: "Enter your ID number",
          primerNombre: "First Name",
          primerNombrePlaceholder: "Enter your first name",
          segundoNombre: "Middle Name",
          segundoNombrePlaceholder: "Enter your middle name (Optional)",
          primerApellido: "Last Name",
          primerApellidoPlaceholder: "Enter your last name",
          segundoApellido: "Second Last Name",
          segundoApellidoPlaceholder: "Enter your second last name (Optional)",
          registroExitoso: "Registration successful",
          usuarioRegistrado: "User successfully registered",
          aceptar: "Accept",
          mostrarContrasena: "Show password",
          ocultarContrasena: "Hide password",

          // Contact Form
          contactaConNosotros: "Contact us",
          nombreCompleto: "Full Name",
          escribeTuNombre: "Enter your name",
          correoElectronico: "Email",
          escribeTuCorreo: "Enter your email",
          telefono: "Phone",
          escribeTuTelefono: "Enter your phone number",
          mensaje: "Message",
          escribeTuMensaje: "Write your message",
          enviar: "Send message",

          // Placeholders and common messages
          escribeTuNombreCompleto: "Enter your full name",
          escribeTuCorreoElectronico: "Enter your email address",
          escribeTuTelefonoContacto: "Enter your contact phone",
          seleccionaUnaOpcion: "Select an option",
          escribeTuMensajeAqui: "Write your message here",

          // Success and error messages
          mensajeEnviado: "Message sent successfully",
          contactaremosProonto: "We will contact you soon",
          errorEnvio: "Error sending message",
          intentarNuevamente: "Please try again later",
          camposObligatorios: "All fields are required",
          
          // Form validations
          emailInvalido: "Please enter a valid email",
          telefonoInvalido: "Please enter a valid phone number",
          seleccionaOpcion: "Please select an option",
          mensajeCorto: "Message must be at least 10 characters long",

          // Cultural History
          tituloHistoriaCultural: "Cultural History of Cocora Valley",
          subtituloHistoriaCultural: "Discover our roots and traditions",
          parrafoHistoriaCultural1: "The Cocora Valley is not just a beautiful landscape, but also a living cultural treasure. The traditions of our ancestors remain alive in every corner of this magical place.",
          parrafoHistoriaCultural2: "The indigenous peoples who inhabited these lands left us a rich legacy of customs and knowledge that we still preserve today.",
          parrafoHistoriaCultural3: "The wax palm, our national tree, has witnessed centuries of history and culture in this region.",
          tradicionesTitulo: "Our Traditions",
          costumbresTitulo: "Local Customs",
          patrimonioTitulo: "Cultural Heritage",

          // Cultural History Cards
          card1Title: "Cocora: The Princess Who Named the Valley",
          card1Text: "The Cocora Valley owes its name to a Quimbaya princess, a symbol of purity and natural wealth. According to legend, her spirit lives on in this magical destination in Colombia, where every corner tells a story and reflects the ancestral respect for the land and indigenous culture.",

          card2Title: "Wax Palm: The Giant that Touches the Sky",
          card2Text: "The wax palm of Quindío, Colombia's national tree, symbolizes resilience and majesty. With over 60 meters in height, it has witnessed centuries of history. Protected since 1985, its conservation is key to the habitat of the yellow-eared parrot and represents Colombian pride.",

          card3Title: "The Quimbayas: Masters of Gold and Nature",
          card3Text: "Long before colonization, the Cocora Valley was home to the Quimbayas, masters of gold. For them, it was not just a home, but a sacred temple where mountains and rivers were gods. Their legacy inspires sustainability and respect for nature, values present in the valley.",

          card4Title: "Trout and Patacón: The Flavors of the Valley",
          card4Text: "The cuisine of Cocora Valley is a delight, with dishes such as rainbow trout and patacón, reflecting its crystal-clear waters. Its recipes, passed down, balance tradition and innovation. Enjoying them with views of the valley is an experience that connects you with its culture and nature.",

          card5Title: "Salento and Cocora: Tradition and Modernity",
          card5Text: "The gateway to Cocora Valley, it combines colorful architecture and a vibrant spirit. Its flower-adorned balconies and cobblestone streets invite you to explore history. Here, modernity reinforces traditions, with unique crafts and typical cuisine. It is a bridge between the past and present of coffee culture.",

          card6Title: "Horses and Trails: Exploring the Valley",
          card6Text: "Exploring the Cocora Valley on horseback is more than tourism; it is a way to revive the tradition of the muleteer. Ancient trails, once used for trade, now offer unique views of mountains and wax palms. Guided by local stories, it is an experience that blends history, nature, and rural culture.",

          card7Title: "The Yellow-Eared Parrot: A Hidden Treasure",
          card7Text: "In the Cocora Valley lives the yellow-eared parrot, dependent on the wax palm. Thanks to constant efforts, the species is recovering and becoming a symbol of hope. Its presence truly connects numerous visitors with the biodiversity and highlights the importance of preserving nature.",

          card8Title: "A Natural Temple in the Heart of Colombia",
          card8Text: "The Cocora Valley, more than beautiful, is a sanctuary of biodiversity. Its peaceful atmosphere, fresh air, and natural sounds invite introspection and spiritual connection. Each sunrise transforms the soul, reminding us of the importance of preserving the planet's natural treasures.",

          // Main title and description
          tituloValle: "Discover the Magic of Cocora Valley",
          descripcionValle: "The Cocora Valley is a place where history, culture, and nature come together in a unique Colombian landscape. Its towering wax palms reach for the sky, while nearby towns like Salento keep coffee traditions alive. With stunning biodiversity and breathtaking views, this valley offers an unforgettable experience that will awaken your senses. Discover it and let its magic captivate you!",

          // Our Routes
          tituloRutas: "Our Routes",
          ruta1Titulo: "Palm Tree Trail",
          ruta1Descripcion: "A magical journey among the majestic wax palms, Colombia's national tree. This route will take you through green meadows and allow you to admire these giants that can reach 60 meters in height.",
          
          ruta2Titulo: "Quindío River Valley",
          ruta2Descripcion: "Follow the course of the Quindío River in this adventure that combines nature and history. Discover the region's rich biodiversity while learning about the ancient cultures that inhabited these lands.",
          
          ruta3Titulo: "Condor Viewpoint",
          ruta3Descripcion: "Climb to the highest point of the valley to enjoy impressive panoramic views. On clear days, you might spot Andean condors soaring over the majestic landscape.",
          
          title: "Explococora",
          slogan: "Enjoy nature and adventure"
          
        }
      }
    },
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 