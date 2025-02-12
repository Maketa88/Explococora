import ChatBot from "./components/chatbot/Chatbot";
import { RutasExplococora } from "./routes/RutasExplococora/RutasExplococora";
import { LanguageProvider } from './context/LanguageProvider';

function App() {
  return (
    <LanguageProvider>
      <RutasExplococora />
      <ChatBot />
    </LanguageProvider>
  );
}

export default App;
