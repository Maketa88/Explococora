import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true); // Cambiado a true para verificar token al inicio

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      // Configurar axios para incluir el token en todas las peticiones
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUserRole(role);
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://servicio-explococora.onrender.com/iniciar-sesion",
        {
          email: credentials.email,
          contrasenia: credentials.contrasenia,
        }
      );

      if (response.data.requireOTP) {
        // Redirigir a la página de verificación OTP
        navigate("/verificar-otp", {
          state: {
            userId: response.data.userId,
            role: response.data.role,
            verificationEndpoint: response.data.verificationEndpoint,
          },
        });
      } else if (response.data.status === "Autenticación exitosa") {
        // Flujo antiguo por si acaso
        const token = response.data.token;
        const role = response.data.role;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("cedula", response.data.cedula || "");

        setIsAuthenticated(true);
        setUserRole(role);

        // Configurar axios para incluir el token en todas las peticiones
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        if (role === "admin") {
          navigate("/VistaAdmin");
        } else if (role === "guia") {
          navigate("/VistaGuia");
        } else if (role === "operador") {
          navigate("/VistaOperador");
        } else if (role === "Cliente") {
          navigate("/VistaCliente");
        } else {
          setErrorMessage("Rol no reconocido");
        }
      } else {
        setErrorMessage("Error en la autenticación");
      }
    } catch (error) {
      setErrorMessage("Correo o contraseña inválidos");
      console.error("Error al iniciar sesión:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("cedula");

    delete axios.defaults.headers.common["Authorization"];

    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/");
  };

  // Método para verificar OTP
  const verificarOTP = async ({ userId, otp, role }) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://servicio-explococora.onrender.com/auth/verificar-otp",
        {
          userId,
          otp,
          role,
        }
      );

      if (response.data.success) {
        const token = response.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        if (response.data.cedula) {
          localStorage.setItem("cedula", response.data.cedula);
        }

        setIsAuthenticated(true);
        setUserRole(role);

        // Configurar axios para incluir el token en todas las peticiones
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Mostrar alerta de verificación exitosa
        await Swal.fire({
          html: `
            <div style="
              display: flex; 
              flex-direction: column; 
              align-items: center;
              border: 4px solid #004d40;
              border-radius: 12px;
              padding: 20px;
              background-color: #ffffff;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            ">
              <div style="
                display: flex; 
                flex-direction: column; 
                align-items: center;
                border-radius: 8px;
                padding: 10px;
              ">
                <img src="https://i.pinimg.com/originals/bf/fc/c2/bffcc2de14a013a2e7a795668846cae5.gif" 
                    alt="Caballo corriendo" 
                    width="150" 
                    style="margin-bottom: 10px; border-radius: 8px;">
                <img src="https://i.pinimg.com/736x/10/3e/44/103e4418d4a3675326fbc9273f9af62a.jpg" 
                    alt="Logo ExploCocora" 
                    width="120" 
                    style="border-radius: 8px;">
              </div>
              <div style="
                background-color: #4ade80;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="
                font-size: 28px; 
                font-weight: bold; 
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                margin-top: 15px;
                text-align: center;
                white-space: nowrap;
              ">
                ¡Verificación Exitosa!
              </h2>
              <p style="
                font-size: 18px; 
                font-family: Arial, Helvetica, sans-serif; 
                color: #004d40; 
                text-align: center; 
                margin-top: 10px;
              ">
                Has iniciado sesión correctamente
              </p>
            </div>
          `,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        // Redirigir según el rol
        if (role === "admin") {
          navigate("/VistaAdmin");
        } else if (role === "guia") {
          navigate("/VistaGuia");
        } else if (role === "operador") {
          navigate("/VistaOperador");
        } else if (role === "Cliente") {
          navigate("/VistaCliente");
        } else {
          throw new Error("Rol no reconocido");
        }
      } else {
        throw new Error(response.data.message || "Error al verificar código");
      }
    } catch (error) {
      console.error("Error en verificación OTP:", error);
      throw (
        error.response?.data?.message ||
        error.message ||
        "Error al verificar código"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        loading,
        login,
        logout,
        verificarOTP,
        errorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
