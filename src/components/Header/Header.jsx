import { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { LanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext'; // Importar el contexto de autenticación
import './Header.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login as authLogin } from '../../services/authService'; // Importar el servicio de autenticación

const Header = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { isAuthenticated, userRole, logout } = useAuth(); // Obtener datos de autenticación
  const navigate = useNavigate(); // Inicializa useNavigate
  const { t } = useTranslation();

  const translations = {
    es: {
      inicio: "Inicio",
      historia: "Historia",
      nuestrasRutas: "Nuestras Rutas",
      nuestrosGuias: "Nuestros Guías",
      contactanos: "Contáctanos",
      ingresar: "Ingresar",
      crearCuenta: "Crear Cuenta",
      cerrarSesion: "Cerrar Sesión",
      iniciarSesion: "Iniciar Sesión",
      panelAdministrador: "Panel de Administrador",
      panelGuia: "Panel de Guía",
      panelOperador: "Panel de Operador"
    },
    en: {
      inicio: "Home",
      historia: "History",
      nuestrasRutas: "Our Routes",
      nuestrosGuias: "Our Guides",
      contactanos: "Contact Us",
      ingresar: "Login",
      crearCuenta: "Sign Up",
      cerrarSesion: "Logout",
      iniciarSesion: "Login",
      panelAdministrador: "Admin Dashboard",
      panelGuia: "Guide Dashboard",
      panelOperador: "Operator Dashboard"
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const data = await authLogin(credentials); // Llama al servicio de autenticación
      localStorage.setItem('token', data.token); // Guarda el token en el almacenamiento local
      navigate('/AdminDashboard'); // Redirige a AdminDashboard después de iniciar sesión
    } catch (error) {
      console.error("Error al iniciar sesión:", error); // Manejo de error
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token'); // Elimina el token del almacenamiento local
    navigate('/'); // Redirige a la página de inicio
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/src/assets/logo.png" alt="Logo" />
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/">{translations[language].inicio}</Link>
        <Link to="/historia">{translations[language].historia}</Link>
        <Link to="/nuestras-rutas">{translations[language].nuestrasRutas}</Link>
        <Link to="/nuestros-guias">{translations[language].nuestrosGuias}</Link>
        <Link to="/ContactForm">{translations[language].contactanos}</Link>
      </nav>
      <div className="auth-buttons">
        {isAuthenticated ? (
          <>
            {/* Mostrar elementos según el rol */}
            {userRole === 'Administrador' && (
              <Link to="/AdminDashboard">{translations[language].panelAdministrador}</Link>
            )}
            {userRole === 'Guía' && (
              <Link to="/GuiaDashboard">{translations[language].panelGuia}</Link>
            )}
            {userRole === 'Operador' && (
              <Link to="/OperadorDashboard">{translations[language].panelOperador}</Link>
            )}
            <button onClick={handleLogout}>{translations[language].cerrarSesion}</button>
          </>
        ) : (
          <button onClick={() => handleLogin({ username: 'user', password: 'pass' })}>
            {translations[language].iniciarSesion}
          </button>
        )}
        <div className="language-flags">
          <img 
            src={language === 'es' ? '/src/assets/colombia.png' : '/src/assets/usa.png'}
            alt={language === 'es' ? 'English' : 'Español'}
            onClick={toggleLanguage}
            style={{ 
              cursor: 'pointer', 
              width: '30px', 
              height: '20px',
              marginLeft: '10px'
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 