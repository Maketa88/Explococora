import { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import './Header.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const translations = {
    es: {
      inicio: "Inicio",
      historia: "Historia",
      nuestrasRutas: "Nuestras Rutas",
      nuestrosGuias: "Nuestros Guías",
      contactanos: "Contáctanos",
      ingresar: "Ingresar",
      crearCuenta: "Crear Cuenta"
    },
    en: {
      inicio: "Home",
      historia: "History",
      nuestrasRutas: "Our Routes",
      nuestrosGuias: "Our Guides",
      contactanos: "Contact Us",
      ingresar: "Login",
      crearCuenta: "Sign Up"
    }
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
        <button className="login-btn">{translations[language].ingresar}</button>
        <button className="signup-btn">{translations[language].crearCuenta}</button>
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