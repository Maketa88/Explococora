import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { RutasExplococora } from "./routes/RutasExplococora/RutasExplococora";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  }, []);

  return (
    <AuthProvider>
      <LoadingScreen isLoading={loading} />
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <RutasExplococora />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  );
};

export default App;
