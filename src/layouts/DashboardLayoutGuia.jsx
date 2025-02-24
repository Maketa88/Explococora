// Explococora/src/layouts/DashboardLayoutGuia.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart2, 
  FileText, 
  Users, 
  UserPlus,
  UserCheck,
  Package,
  PackagePlus,
  PackageSearch,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  Moon,
  Sun
} from 'lucide-react';

const DashboardLayoutGuia = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [estado, setEstado] = useState("Estado 1"); // Nuevo estado para gestionar el estado seleccionado
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/VistaGuia",
      section: "Dashboard"
    },
    {
      title: "VisualizarRutas",
      icon: <BarChart2 className="w-5 h-5" />,
      path: "/VistaGuia/VisualizarRutas",
      section: "Dashboard"
    },
    {
      title: "RutasAsignadas",
      icon: <FileText className="w-5 h-5" />,
      path: "/VistaGuia/RutasAsignadas",
      section: "Dashboard"
    },
    {
      title: "Customers",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaGuia/customers",
      section: "Customers"
    },
    {
      title: "New Customer",
      icon: <UserPlus className="w-5 h-5" />,
      path: "/VistaGuia/new-customer",
      section: "Customers"
    },
    {
      title: "Verified Customers",
      icon: <UserCheck className="w-5 h-5" />,
      path: "/VistaGuia/verified-customers",
      section: "Customers"
    },
    {
      title: "Products",
      icon: <Package className="w-5 h-5" />,
      path: "/VistaGuia/products",
      section: "Products"
    },
    {
      title: "New Product",
      icon: <PackagePlus className="w-5 h-5" />,
      path: "/VistaGuia/new-product",
      section: "Products"
    },
    {
      title: "Inventory",
      icon: <PackageSearch className="w-5 h-5" />,
      path: "/VistaGuia/inventory",
      section: "Products"
    },
    {
      title: "Perfil",
      icon: <Users className="w-5 h-5" />,
      path: "/VistaGuia/PerfilGuia",
      section: "Perfil"
    }
  ];

  const sections = ["Dashboard", "Customers", "Products"];

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={` 
        ${collapsed ? 'w-20' : 'w-64'} 
        ${darkMode ? 'bg-[#0f172a]' : 'bg-white'} 
        p-4 transition-all duration-300 flex flex-col
        ${darkMode ? 'text-gray-400' : 'text-gray-600'}
        border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}
        h-screen sticky top-0
      `}>
       <div className="mb-8 flex flex-col items-start">
          <div className="flex items-center">
            {!collapsed && <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Explococora</h1>} 
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-blue-600  text-white ml-2"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          {!collapsed && <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'} mt-1 text-center w-40`}>Guia</h1>}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              {!collapsed && <h2 className="text-gray-400 text-sm mb-2">{section}</h2>}
              {menuItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
                      location.pathname === item.path
                        ? "bg-blue-600 text-white"
                        : `text-gray-400 ${!darkMode && 'hover:bg-gray-100'}`
                    }`}
                    title={collapsed ? item.title : ""}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                ))}
            </div>
          ))} 
        </nav>

        <div className={`border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} pt-4 mt-4`}>
          <Link
            to="/VistaGuia/settings"
            className={`flex items-center gap-2 w-full p-2 mb-2 rounded-lg ${
              location.pathname === '/VistaGuia/settings'
                ? "bg-blue-600 text-white"
                : "text-gray-400"
            }`}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${darkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
        {/* Top Navigation */}
        <div className={`${darkMode ? 'bg-[#0f172a]' : 'bg-white'} sticky top-0 z-10`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 max-w-xl">
              <input
                type="search"
                placeholder="Buscar..."
                className={`w-full px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-900'
                }`}
              />
            </div>
            <div className="flex items-center gap-4">
              
              <select 
                value={estado} 
                onChange={(e) => setEstado(e.target.value)} // Manejar el cambio de estado
                className={`p-1 rounded-lg ${estado === "Disponible" ? 'bg-green-500 text-white' : estado === "Ocupado" ? 'bg-yellow-500 text-black' : estado === "Inactivo" ? 'bg-red-500 text-white' : darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-900'} hover:bg-gray-300`}
              >
                <option value="Disponible" className="bg-green-500 text-white">Disponible</option>
                <option value="Ocupado" className="bg-yellow-500 text-black">Ocupado</option>
                <option value="Inactivo" className="bg-red-500 text-white">Inactivo</option>
              </select>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Bell className="w-5 h-5" />
              </button>
               <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                 <Link to="/VistaGuia/Perfil">
                   <img 
                     src="https://ui-avatars.com/api/?name=User&background=random" 
                     alt="Profile"
                     className="w-full h-full object-cover"
                   />
                 </Link>
               </div>
            </div>
          </div>
        </div>

        {/* Content and Footer Container */}
        <div className={`flex-1 flex flex-col overflow-auto ${darkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
          {/* Page Content */}
          <div className="flex-1 p-4">
            {children}
          </div>

          {/* Footer */}
          <div className={`p-4 ${darkMode ? 'bg-[#0f172a] text-gray-400' : 'bg-white text-gray-600'} sticky bottom-0`}>
            <div className="flex justify-between items-center text-sm">
              <span>© 2025 ExploCocora. Todos los derechos reservados.</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutGuia;