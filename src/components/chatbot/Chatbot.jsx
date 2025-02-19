import { useState, useRef, useEffect } from "react";
import Condorito from "../../assets/Images/MascotExplococora.ico";


export const ChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const chatContainerRef = useRef(null);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const enviarPregunta = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
        const response = await fetch('https://bot-condorito-1.onrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, history }),
        });

        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
        }

        const data = await response.json();
        if (data && data.answer) {
            setHistory((prev) => [
                ...prev,
                { role: "user", parts: question },
                { role: "chatbot", parts: formatAnswer(data.answer) },
            ]);
        }
        setQuestion('');
    } catch (error) {
        console.error('Error al enviar la pregunta:', error);
    }
  };

  const formatAnswer = (answer) => {
    return answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convertir negritas
      .replace(/\*/g, '') // Eliminar asteriscos innecesarios
      .replace(/\n/g, '<br/>'); // Añadir saltos de línea
  };
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [history]);


  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <div className="fixed bottom-5 right-5 flex items-center justify-center">
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
        </div>

        {isChatOpen && (
          <div className="fixed bottom-24 right-5 w-[300px] h-[450px] border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden">
            <div className="bg-teal-800 p-3 flex items-center space-x-2">
              <img
                src={Condorito}
                alt="Logo Explococora"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white font-bold text-base">Condorito</span>
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
              </div>

              <form onSubmit={enviarPregunta} className="flex border-t">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="border-none p-2 flex-1 outline-none "
                />
                <button
                  type="submit"
                  className="bg-teal-700 text-white px-3 py-4  hover:bg-teal-900 transition-colors duration-300 "
                >
                  ➤
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
