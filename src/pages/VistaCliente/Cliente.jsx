import { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Key, Trash2, ChevronDown, Moon, Sun } from 'lucide-react';

const UserProfile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Datos de ejemplo del usuario
  const [userData, setUserData] = useState({
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    phone: "+34 612 345 678",
    location: "Madrid, España",
    bio: "Desarrollador web con experiencia en React y diseño UI/UX. Apasionado por crear experiencias digitales intuitivas y accesibles.",
    avatar: "/api/placeholder/150/150"
  });

  // Cambiar entre modo claro y oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Renderizar la sección activa
  const renderActiveSection = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Información Personal</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre completo</label>
                  <input 
                    type="text" 
                    value={userData.name}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correo electrónico</label>
                  <input 
                    type="email" 
                    value={userData.email}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <input 
                    type="tel" 
                    value={userData.phone}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ubicación</label>
                  <input 
                    type="text" 
                    value={userData.location}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Biografía</label>
              <textarea
                rows="4"
                value={userData.bio}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <button className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Guardar cambios
              </button>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña actual</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nueva contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar nueva contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="pt-4">
              <button className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Actualizar contraseña
              </button>
            </div>
          </div>
        );
      case 'delete':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-500">Eliminar Cuenta</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos y contenido.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Escribe "ELIMINAR" para confirmar</label>
                <input 
                  type="text" 
                  placeholder="ELIMINAR"
                  className="w-full p-2 border border-red-300 rounded-md dark:bg-gray-800 dark:border-red-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña actual</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-2 border border-red-300 rounded-md dark:bg-gray-800 dark:border-red-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="pt-4">
              <button className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Eliminar cuenta permanentemente
              </button>
            </div>
          </div>
        );
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        {/* Cabecera */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Sidebar - Información del usuario */}
          <div className="md:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 transition-all duration-200 hover:shadow-lg">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4 group">
                  <img
                    src={userData.avatar}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Edit2 size={20} className="text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold">{userData.name}</h2>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <Mail size={18} />
                  <span className="truncate">{userData.email}</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <Phone size={18} />
                  <span>{userData.phone}</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <MapPin size={18} />
                  <span>{userData.location}</span>
                </li>
              </ul>

              <div className="relative mt-8">
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <span>Opciones de cuenta</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${showOptions ? 'transform rotate-180' : ''}`} />
                </button>
                
                {showOptions && (
                  <div className="absolute left-0 right-0 z-10 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-800 animate-fadeIn">
                    <ul className="py-1">
                      <li>
                        <button 
                          onClick={() => { setActiveTab('password'); setShowOptions(false); }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <Key size={16} className="mr-2" />
                          <span>Cambiar contraseña</span>
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => { setActiveTab('delete'); setShowOptions(false); }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700"
                        >
                          <Trash2 size={16} className="mr-2" />
                          <span>Eliminar cuenta</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 transition-all duration-200">
              {/* Pestañas de navegación */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
                    activeTab === 'profile' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>Perfil</span>
                  </div>
                </button>
              </div>

              {/* Contenido de la pestaña seleccionada */}
              <div className="animate-fadeIn">
                {renderActiveSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;