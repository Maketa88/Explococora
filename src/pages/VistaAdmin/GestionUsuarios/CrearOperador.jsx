import React, { useState } from 'react';
import { FaEnvelope, FaIdCard, FaUser, FaLock } from "react-icons/fa";
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { RegistroCliente } from "../../../services/RegistroCliente";

const CrearOperador = ({ onClose, onOperadorCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Función para mostrar alertas (solo la flotante)
  const showAlert = (message, type) => {
    setAlert({
      show: true,
      message,
      type
    });
    
    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Componente de alerta flotante
  const AlertComponent = () => {
    if (!alert.show) return null;
    
    return (
      <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 ${
        alert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}>
        {alert.type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span>{alert.message}</span>
        <button 
          onClick={() => setAlert(prev => ({ ...prev, show: false }))}
          className="ml-2 text-white hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert({ show: false, message: '', type: '' });
    setErrors([]);
    
    try {
      const operadorData = {
        cedula: formData.cedula,
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        email: formData.email,
        contrasenia: formData.contrasenia,
        rol: 'operador'
      };
      
      const response = await RegistroCliente(operadorData);
      
      // Mostrar alerta flotante de éxito
      showAlert("¡Operador registrado exitosamente!", "success");
      
      // Notificar al componente padre
      if (onOperadorCreated) {
        onOperadorCreated(response.data || operadorData);
      }
      
      // Cerrar el modal después de un breve retraso
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error al registrar operador:', error);
      
      // Mostrar la alerta flotante de error
      showAlert(error.message || 'Error al registrar el operador. Por favor, intente nuevamente.', "error");
      
      // Mostrar errores en el formulario si es necesario
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header with emerald-500 background */}
        <div className="bg-emerald-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">
              Crear Nuevo Operador
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Alerta flotante */}
          <AlertComponent />
          
          {errors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.map((error, index) => (
                <p key={index}>{error.msg}</p>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="cedula" className="block text-gray-700 text-sm font-medium mb-1">
                Cédula <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="cedula"
                  placeholder="Ingrese la cédula o documento de identidad"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="primerNombre" className="block text-gray-700 text-sm font-medium mb-1">
                Primer Nombre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="primerNombre"
                  placeholder="Ingrese el primer nombre"
                  value={formData.primerNombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="segundoNombre" className="block text-gray-700 text-sm font-medium mb-1">
                Segundo Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="segundoNombre"
                  placeholder="Ingrese el segundo nombre"
                  value={formData.segundoNombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="primerApellido" className="block text-gray-700 text-sm font-medium mb-1">
                Primer Apellido <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="primerApellido"
                  placeholder="Ingrese el primer apellido"
                  value={formData.primerApellido}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="segundoApellido" className="block text-gray-700 text-sm font-medium mb-1">
                Segundo Apellido
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="segundoApellido"
                  placeholder="Ingrese el segundo apellido"
                  value={formData.segundoApellido}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="contrasenia" className="block text-gray-700 text-sm font-medium mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="contrasenia"
                  placeholder="Ingrese una contraseña segura"
                  value={formData.contrasenia}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="col-span-2 flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-2 transition-colors duration-300 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                  'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearOperador;
