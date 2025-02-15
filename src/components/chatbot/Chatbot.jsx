import { useState } from "react";
import Condorito from "../../assets/Images/MascotExplococora.ico";
import AyudaImg from "../../assets/Images/En_que_te_ayuda-removebg-preview.png";

export const ChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <div className="fixed bottom-5 right-5 flex items-center justify-center">
          <div className="relative">
            <img
              src={AyudaImg}
              alt="¿En qué te ayudamos?"
              className={`absolute -top-12 left-1/5 transform -translate-x-1/2 transition-opacity duration-300 w-16 ${isChatOpen ? "opacity-0" : "opacity-100"}`}
            />
            <button onClick={toggleChat} className="bg-transparent rounded-full shadow-lg hover:animate-bounce">
              <img src={Condorito} alt="Cóndor animado" className="w-16 h-16 object-contain rounded-full" />
            </button>
          </div>
        </div>

        {isChatOpen && (
          <div className="fixed bottom-24 right-5 w-[300px] h-[450px] border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden">
            <div className="bg-green-700 p-3 flex items-center space-x-2">
              <img src={Condorito} alt="Logo Explococora" className="w-6 h-6 rounded-full" />
              <span className="text-white font-bold text-base">Condorito</span>
            </div>
            <div className="h-[calc(100%-3rem)] flex flex-col">
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {history.map((msg, index) => (
                  <div key={index} className={`p-2 rounded-lg text-white max-w-[85%] text-sm leading-tight ${msg.role === 'user' ? "bg-blue-500 self-end text-right px-3 py-1" : "bg-green-500 self-start text-left px-3 py-2"}`}>
                    <strong>{msg.role === 'user' ? '🧑‍💻 Usuario:' : '🤖 Chatbot:'}</strong>
                    <p className="mt-1" dangerouslySetInnerHTML={{ __html: msg.parts }} />
                  </div>
                ))}
              </div>

              <form onSubmit={enviarPregunta} className="flex border-t">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="border-none p-2 flex-1 outline-none"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">➤</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;