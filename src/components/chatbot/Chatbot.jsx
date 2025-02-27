import { useState, useRef, useEffect } from "react";
import Condorito from "../../assets/Images/MascotExplococora.ico";

export const ChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (isChatOpen && history.length === 0) {
      setHistory([
        {
          role: "chatbot",
          parts:
            "¡Hola! 👋 Soy Condorito, tu asistente virtual de ExploCocora. \n\nEstoy aquí para ayudarte a planificar tu aventura en el Valle de Cocora. 🌳\n\nPuedo ayudarte con:\n- Información sobre nuestras rutas y senderos 🥾\n- Detalles de precios y servicios 💰\n- Recomendaciones personalizadas 🎯\n- Consejos de seguridad y preparación 🔒\n\n¿En qué puedo ayudarte hoy? 😊",
        },
      ]);
    }
  }, [isChatOpen]);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const enviarPregunta = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Añadir mensaje del usuario inmediatamente para mejor UX
    const userMessage = { role: "user", parts: question };
    setHistory((prev) => [...prev, userMessage]);

    // Guardar la pregunta y limpiar el input
    const currentQuestion = question;
    setQuestion("");
    setIsLoading(true);

    // Verificar si es un saludo simple para respuesta rápida
    const saludoCheck = isSaludo(currentQuestion);
    if (saludoCheck.esSaludo && saludoCheck.respuesta) {
      // Respuesta automática para saludos básicos
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          { role: "chatbot", parts: formatAnswer(saludoCheck.respuesta) },
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch(
        "https://bot-condorito-1.onrender.com/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: currentQuestion,
            history: history.map((msg) => ({
              role: msg.role === "chatbot" ? "model" : "user",
              parts: msg.parts,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del servidor: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data && data.answer) {
        setHistory((prev) => [
          ...prev,
          { role: "chatbot", parts: formatAnswer(data.answer) },
        ]);
      }
    } catch (error) {
      console.error("Error al enviar la pregunta:", error);
      setHistory((prev) => [
        ...prev,
        {
          role: "chatbot",
          parts:
            "Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías intentarlo de nuevo?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnswer = (answer) => {
    return answer
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convertir negritas
      .replace(/\*/g, "") // Eliminar asteriscos innecesarios
      .replace(/\n/g, "<br/>"); // Añadir saltos de línea
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Detectar saludos
  const isSaludo = (text) => {
    const saludos = [
      "hola",
      "buenos días",
      "buenas tardes",
      "buenas noches",
      "como estas",
      "que tal",
      "saludos",
      "como te encuentras",
      "como andas",
      "como va",
      "como te va",
      "como has estado",
    ];
    const respuestasComoEstas = [
      "¡Muy bien, gracias por preguntar! 😊 ¿En qué puedo ayudarte con tu visita al Valle de Cocora?",
      "¡Excelente! Listo para ayudarte con tu aventura. 🌟 ¿Qué te gustaría saber?",
      "¡Genial! ¿En qué puedo ayudarte hoy? 🌳",
      "¡De maravilla! Ansioso por ayudarte a explorar el Valle de Cocora 🌿 ¿Qué información necesitas?",
      "¡Fantástico! Listo para guiarte en tu próxima aventura 🏔️ ¿Qué te interesa saber?",
    ];

    const comoEstasVariants = [
      "como estas",
      "como te encuentras",
      "como andas",
      "como va",
      "como te va",
      "como has estado",
    ];

    if (
      comoEstasVariants.some((variant) => text.toLowerCase().includes(variant))
    ) {
      return {
        esSaludo: true,
        respuesta:
          respuestasComoEstas[
            Math.floor(Math.random() * respuestasComoEstas.length)
          ],
      };
    }

    return {
      esSaludo: saludos.some((saludo) => text.toLowerCase().includes(saludo)),
      respuesta: "",
    };
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <dyiv className="fixed bottom-5 right-5 flex items-center justify-center">
          <div className="relative">
            <button
              onClick={toggleChat}
              className="bg-transparent rounded-full shadow-lg hover:animate-pulse transition-transform duration-300"
            >
              <img
                src={Condorito}
                alt="Chatbot"
                className="w-16 h-16 object-contain rounded-full border-4 border-neonGreen shadow-neon"
              />
            </button>
          </div>
        </dyiv>

        {isChatOpen && (
          <div className="fixed bottom-24 right-5 w-[300px] h-[450px] border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden">
            <div className="bg-teal-800 p-3 flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <img
      src={Condorito}
      alt="Logo Explococora"
      className="w-8 h-8 rounded-full"
    />
    <span className="text-white font-bold text-base">Condorito</span>
  </div>
  <button 
    onClick={toggleChat} 
    className=" hover:text-teal-300 p-1 rounded-full border-2 border-transparent hover:border-white focus:outline-none bg-black bg-opacity-50 text-white hover:bg-opacity-80 transition-all duration-300"
    aria-label="Cerrar chat"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </button>
</div>

            <div className="h-[calc(100%-3rem)] flex flex-col">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-2 space-y-2"
              >
                {history.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-tl-3xl rounded-br-3xl max-w-[85%] text-sm leading-tight transition-all transform duration-300 ${
                      msg.role === "user"
                        ? "self-end text-right bg-gradient-to-r from-gray-400 to-gray-600 text-white ml-auto shadow-lg border-2 border-gray-900"
                        : "self-start text-left bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-lg border-2 border-teal-300"
                    }`}
                  >
                    <strong
                      className={
                        msg.role === "user"
                          ? "text-white font-bold"
                          : "text-white font-semibold"
                      }
                    >
                      {msg.role === "user" ? "🧑‍💻 Usuario:" : "🤖 Chatbot:"}
                    </strong>
                    <p
                      className="mt-2 text-gray-100"
                      dangerouslySetInnerHTML={{ __html: msg.parts }}
                    />
                  </div>
                ))}
                {isLoading && (
                  <div className="self-start text-left bg-gradient-to-r from-teal-600 to-teal-800 text-white p-4 rounded-tl-3xl rounded-br-3xl max-w-[85%] shadow-lg border-2 border-teal-300">
                    <strong className="text-white font-semibold">
                      🤖 Chatbot:
                    </strong>
                    <p className="mt-2 text-gray-100">Escribiendo...</p>
                  </div>
                )}
              </div>

              <form onSubmit={enviarPregunta} className="flex border-t">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="border-none p-2 flex-1 outline-none"
                />
                <button
                  type="submit"
                  className="bg-teal-700 text-white px-3 py-4 hover:bg-teal-900 transition-colors duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "➤"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
