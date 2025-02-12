import { useState } from "react";
import Condorito from "../../assets/Images/MascotExplococora.ico";
import AyudaImg from "../../assets/Images/En_que_te_ayuda-removebg-preview.png"; // Imagen que dice "¿En qué te ayudamos?"

export const ChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Contenedor del botón del chatbot */}
        <div className="fixed bottom-5 right-5 flex items-center justify-center">
          <div className="relative">
            {/* Mensaje de "¿En qué te ayudamos?" */}
            <img
              src={AyudaImg}
              alt="¿En qué te ayudamos?"
              className={`absolute -top-12 left-1/5 transform -translate-x-1/2 transition-opacity duration-300 w-16 ${
                isChatOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            {/* Botón del chatbot */}
            <button
              onClick={toggleChat}
              className="bg-transparent rounded-full shadow-lg hover:animate-bounce"
            >
              <img
                src={Condorito}
                alt="Cóndor animado"
                className="w-16 h-16 object-contain rounded-full"
              />
            </button>
          </div>
        </div>

        {/* Ventana del chatbot */}
        {isChatOpen && (
          <div className="fixed bottom-24 right-5 w-[280px] h-[400px] border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden">
            {/* Header del chat */}
            <div className="bg-green-700 p-3 flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <img 
                  src={Condorito} 
                  alt="Logo Explococora" 
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-bold text-base">Condorito</span>
              </div>
            </div>
            
            {/* Contenido del chat */}
            <div className="h-[calc(100%-3rem)]">
              <iframe
                src="https://webchat.botframework.com/embed/Condorito-bot?s=AUqUFRQ7pGIkvaZTMqTvHFDX0RWqqvNBfo2z3aqQtyALiqbbwGMnJQQJ99BAAC24pbEAArohAAABAZBS2WK8.E3vig2M9QVdSgrze0xslaOUANaC770DBX0TpphILwZHkBmWLeT0OJQQJ99BAAC24pbEAArohAAABAZBS1PIm"
                className="w-full h-full"
                frameBorder="0"
                title="Condorito Bot"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
