import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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
          nuestrasRutas: "Nuestras Rutas",
          nuestrosGuias: "Nuestros Guías",
          contactanos: "Contáctanos",
          ingresar: "Iniciar Sesión",
          crearCuenta: "Crear Cuenta",
          
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
          email: "Explococora@gmail.com",
          
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
          card1Text: "El Valle del Cocora toma su nombre de una princesa indígena de la tribu Quimbaya. Según la leyenda, Cocora simbolizaba la estrella de agua, una representación de la pureza y la riqueza natural de la región. Este nombre ancestral nos recuerda el profundo respeto que los Quimbayas tenían por su tierra. Hoy, ese espíritu sigue vivo, iluminando uno de los destinos más mágicos de Colombia. Cada rincón del valle cuenta una historia, como si la princesa Cocora aún protegiera sus tierras. Este lugar es una conexión con nuestras raíces y la riqueza de la cultura indígena.",

          card2Title: "Palma de Cera: La Gigante que Toca el Cielo",
          card2Text: "La palma de cera del Quindío no solo es el árbol nacional de Colombia, sino un símbolo de resistencia y majestuosidad. Con más de 60 metros de altura, estas gigantes naturales han sido testigos silenciosos de siglos de historia. Protegidas desde 1985, estas palmas representan la unión entre el hombre y la naturaleza. Su conservación ha sido crucial para preservar el hábitat de especies únicas, como el loro orejiamarillo. Caminando entre ellas, uno siente una conexión espiritual, como si su altura nos acercara al cielo. Son, sin duda, un emblema de la biodiversidad y el orgullo colombiano.",

          card3Title: "Los Quimbayas: Maestros del Oro y la Naturaleza",
          card3Text: "Mucho antes de la llegada de los colonizadores, el Valle del Cocora era el hogar de los Quimbayas, un pueblo indígena reconocido por su impresionante arte orfebre. Estos maestros del oro dejaron un legado que aún asombra por su belleza y perfección. Para los Quimbayas, el valle no solo era un hogar, sino un templo sagrado donde las montañas y ríos eran sus dioses protectores. Su relación con la naturaleza nos enseña sobre sostenibilidad y respeto por el medio ambiente. Hoy, el Valle del Cocora sigue siendo un testimonio vivo de su sabiduría y conexión espiritual con la tierra.",

          card4Title: "Trucha y Patacón: Los Sabores del Valle",
          card4Text: "La gastronomía del Valle del Cocora es un deleite para el paladar. Platos como la trucha arcoíris, acompañada de un crujiente patacón, son un homenaje a las aguas cristalinas que cruzan la región. Cada receta cuenta una historia, transmitida por generaciones que han adaptado los sabores locales a la cocina contemporánea. Este manjar es una muestra del equilibrio entre lo tradicional y lo innovador. Además, los restaurantes locales ofrecen experiencias únicas, como degustar estos platos con vistas panorámicas del valle. Comer en el Valle del Cocora es saborear la esencia misma de su naturaleza y cultura.",

          card5Title: "Salento y Cocora: Una Alianza de Tradición y Modernidad",
          card5Text: "El encantador pueblo de Salento, puerta de entrada al Valle del Cocora, combina el colorido de la arquitectura paisa con un espíritu vibrante. Sus balcones adornados con flores y sus calles empedradas invitan a caminar sin prisa, respirando tradición. Aquí, cada rincón cuenta una historia y cada sonrisa refleja la calidez de su gente. En Salento, la modernidad no ha eclipsado las costumbres ancestrales, sino que las ha reforzado. Los visitantes encuentran artesanías únicas y una gastronomía que complementa la experiencia. Este mágico pueblo es un puente entre el pasado y el presente de la cultura cafetera.",

          card6Title: "Caballos y Senderos: Explorando el Valle como en el Pasado",
          card6Text: "Recorrer el Valle del Cocora a caballo no es solo una experiencia turística, sino una conexión con la forma tradicional de explorar estas tierras. Los arrieros de antaño utilizaban estos mismos senderos para transportar café y otros productos. Hoy, estos recorridos ofrecen una vista única de las montañas y las palmas de cera. Los guías locales narran historias fascinantes que hacen del viaje una inmersión en el pasado. Además, el contacto con la naturaleza y los animales crea una experiencia inolvidable. Explorar el valle a caballo es revivir la historia y sentir el latir de la tradición campesina.",

          card7Title: "El Loro Orejiamarillo: Un Tesoro Escondido",
          card7Text: "En las alturas del Valle del Cocora vive un habitante especial: el loro orejiamarillo. Esta colorida ave, en peligro de extinción, depende de la palma de cera para sobrevivir, ya que sus frutos son su principal alimento. Gracias a los esfuerzos de conservación, esta especie ha comenzado a recuperarse, convirtiéndose en un símbolo de esperanza. Avistar uno de estos loros es una experiencia única, que conecta a los visitantes con la biodiversidad del valle. Su presencia recuerda la importancia de cuidar la naturaleza para las generaciones futuras. El loro orejiamarillo es el verdadero guardián del Valle del Cocora.",

          card8Title: "Un Templo Natural en el Corazón de Colombia",
          card8Text: "Más allá de su belleza, el Valle del Cocora es un santuario para la biodiversidad. Este lugar mágico envuelve a los visitantes en un ambiente de paz, donde el aire puro y los sonidos de la naturaleza son la banda sonora perfecta. Sus paisajes son tan imponentes que invitan a la introspección y la conexión espiritual. Cada amanecer en el valle es un espectáculo de colores que transforma el alma. Este templo natural no solo es un regalo para los sentidos, sino una invitación a reflexionar sobre la importancia de preservar los tesoros naturales de nuestro planeta.",

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
          nuestrasRutas: "Our Routes",
          nuestrosGuias: "Our Guides",
          contactanos: "Contact Us",
          ingresar: "Sign In",
          crearCuenta: "Sign Up",
          
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
          email: "Explococora@gmail.com",
          
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
          card1Text: "The Cocora Valley takes its name from an indigenous princess of the Quimbaya tribe. According to legend, Cocora symbolized the water star, representing the purity and natural wealth of the region. This ancestral name reminds us of the deep respect that the Quimbayas had for their land. Today, that spirit lives on, illuminating one of Colombia's most magical destinations. Every corner of the valley tells a story, as if Princess Cocora still protects her lands. This place is a connection to our roots and the richness of indigenous culture.",

          card2Title: "Wax Palm: The Giant that Touches the Sky",
          card2Text: "The Quindío wax palm is not only Colombia's national tree but also a symbol of resistance and majesty. Standing over 60 meters tall, these natural giants have been silent witnesses to centuries of history. Protected since 1985, these palms represent the union between humans and nature. Their conservation has been crucial in preserving the habitat of unique species, like the yellow-eared parrot. Walking among them, one feels a spiritual connection, as if their height brings us closer to the sky. They are, without doubt, an emblem of biodiversity and Colombian pride.",

          card3Title: "The Quimbayas: Masters of Gold and Nature",
          card3Text: "Long before the arrival of colonizers, the Cocora Valley was home to the Quimbayas, an indigenous people renowned for their impressive goldsmith work. These gold masters left a legacy that still amazes with its beauty and perfection. For the Quimbayas, the valley was not just a home, but a sacred temple where mountains and rivers were their protective gods. Their relationship with nature teaches us about sustainability and respect for the environment. Today, the Cocora Valley remains a living testimony to their wisdom and spiritual connection with the land.",

          card4Title: "Trout and Patacón: The Flavors of the Valley",
          card4Text: "The gastronomy of the Cocora Valley is a delight for the palate. Dishes like rainbow trout, accompanied by a crispy patacón, are a tribute to the crystal-clear waters that cross the region. Each recipe tells a story, passed down through generations who have adapted local flavors to contemporary cuisine. This delicacy is a sample of the balance between traditional and innovative. Additionally, local restaurants offer unique experiences, such as tasting these dishes with panoramic views of the valley. Eating in the Cocora Valley is to savor the very essence of its nature and culture.",

          card5Title: "Salento and Cocora: An Alliance of Tradition and Modernity",
          card5Text: "The charming town of Salento, gateway to the Cocora Valley, combines the colorful paisa architecture with a vibrant spirit. Its flower-adorned balconies and cobblestone streets invite you to walk unhurriedly, breathing tradition. Here, every corner tells a story and every smile reflects the warmth of its people. In Salento, modernity hasn't eclipsed ancestral customs but has reinforced them. Visitors find unique crafts and a gastronomy that complements the experience. This magical town is a bridge between the past and present of coffee culture.",

          card6Title: "Horses and Trails: Exploring the Valley as in the Past",
          card6Text: "Touring the Cocora Valley on horseback is not just a tourist experience, but a connection with the traditional way of exploring these lands. The muleteers of yesteryear used these same trails to transport coffee and other products. Today, these routes offer a unique view of the mountains and wax palms. Local guides tell fascinating stories that make the journey an immersion into the past. Additionally, contact with nature and animals creates an unforgettable experience. Exploring the valley on horseback is to relive history and feel the beat of peasant tradition.",

          card7Title: "The Yellow-Eared Parrot: A Hidden Treasure",
          card7Text: "In the heights of the Cocora Valley lives a special inhabitant: the yellow-eared parrot. This colorful bird, endangered, depends on the wax palm to survive, as its fruits are its main food. Thanks to conservation efforts, this species has begun to recover, becoming a symbol of hope. Spotting one of these parrots is a unique experience that connects visitors with the valley's biodiversity. Its presence reminds us of the importance of caring for nature for future generations. The yellow-eared parrot is the true guardian of the Cocora Valley.",

          card8Title: "A Natural Temple in the Heart of Colombia",
          card8Text: "Beyond its beauty, the Cocora Valley is a sanctuary for biodiversity. This magical place envelops visitors in an atmosphere of peace, where pure air and nature sounds are the perfect soundtrack. Its landscapes are so imposing that they invite introspection and spiritual connection. Every sunrise in the valley is a spectacle of colors that transforms the soul. This natural temple is not only a gift for the senses but an invitation to reflect on the importance of preserving our planet's natural treasures.",

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