import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { ArrowLeft, CheckCircle, Pencil, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { RegistroCliente } from "../../../services/RegistroCliente";

const NuevoGuia = () => {
  const navigate = useNavigate();
  const [darkMode] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    contrasenia: '',
    cedula: ''
  });
  
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert({ show: false, message: '', type: '' });
    
    try {
      const guiaData = {
        cedula: formData.cedula,
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        email: formData.email,
        contrasenia: formData.contrasenia
      };
      
      const response = await RegistroCliente(guiaData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Guía registrado exitosamente',
      }).then(() => {
        navigate('/VistaOperador/guias');
      });
    } catch (error) {
      console.error('Error al registrar guía:', error);
      setAlert({
        show: true,
        message: error.message || 'Error al registrar el guía. Por favor, intente nuevamente.',
        type: 'error'
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const AlertComponent = () => {
    if (!alert.show) return null;
    
    return (
      <div className={`p-4 rounded-lg mb-6 flex items-center ${
        alert.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
      }`}>
        {alert.type === 'error' ? (
          <AlertCircle className="w-5 h-5 mr-2" />
        ) : (
          <CheckCircle className="w-5 h-5 mr-2" />
        )}
        {alert.message}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Registrar Nuevo Guía
        </h2>
        
        <AlertComponent />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos de información personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Primer Nombre *
              </label>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
                placeholder="Ingrese el primer nombre"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                placeholder="Ingrese el segundo nombre (opcional)"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Primer Apellido *
              </label>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
                placeholder="Ingrese el primer apellido"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                placeholder="Ingrese el segundo apellido (opcional)"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cédula *
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
                placeholder="Ingrese el número de cédula"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email * (debe contener "guia")
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
                placeholder="ejemplo.guia@explococora.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="contrasenia"
                  value={formData.contrasenia}
                  onChange={handleInputChange}
                  className={`w-full p-2 pr-10 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                  } border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  required
                  placeholder="Ingrese la contraseña"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-600/20`}
                >
                  {passwordVisible ? (
                    <Eye className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate("/VistaOperador/guias")}
              className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className={`py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Registrar Guía
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NuevoGuia; 