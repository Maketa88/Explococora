// Explococora/src/App.jsx
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { RutasExplococora } from "./routes/RutasExplococora/RutasExplococora";

const App = () => {
  return (
    <>
      <AuthProvider>
        <RutasExplococora />
      </AuthProvider>
    </>
  );
};

export default App;