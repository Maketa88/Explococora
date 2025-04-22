import React, { useState } from 'react';
import { FaEnvelope, FaIdCard, FaUser, FaLock } from "react-icons/fa";
import { X, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { RegistroCliente } from "../../../services/RegistroCliente";
import { toast } from 'react-toastify';

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
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [cedulaError, setCedulaError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [requisitosContrasena, setRequisitosContrasena] = useState({
    longitud: false,
    mayuscula: false,
    minuscula: false,
    especial: false
  });

  const verificarRequisitos = (contrasena) => {
    setRequisitosContrasena({
      longitud: contrasena.length >= 8,
      mayuscula: /[A-Z]/.test(contrasena),
      minuscula: /[a-z]/.test(contrasena),
      especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(contrasena)
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Validación específica para la cédula
    if (id === 'cedula') {
      // Permitir solo dígitos
      const onlyDigits = value.replace(/\D/g, '');
      
      // Actualizar el valor con solo dígitos
      setFormData(prev => ({
        ...prev,
        [id]: onlyDigits
      }));
      
      // Validar longitud
      if (onlyDigits.length > 0 && onlyDigits.length !== 10) {
        setCedulaError('La cédula debe tener exactamente 10 dígitos');
      } else {
        setCedulaError('');
      }
    } else if (id === 'contrasenia') {
      // Actualizar el valor de la contraseña
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
      
      // Verificar requisitos de la contraseña
      verificarRequisitos(value);
      
      // Validar la contraseña
      if (value.length > 0) {
        let errors = [];
        
        // Verificar longitud mínima
        if (value.length < 8) {
          errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        
        // Verificar si contiene al menos una letra mayúscula
        if (!/[A-Z]/.test(value)) {
          errors.push('La contraseña debe contener al menos una letra mayúscula');
        }
        
        // Verificar si contiene al menos una letra minúscula
        if (!/[a-z]/.test(value)) {
          errors.push('La contraseña debe contener al menos una letra minúscula');
        }
        
        // Verificar si contiene al menos un carácter especial (incluyendo el punto)
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
          errors.push('La contraseña debe contener al menos un carácter especial');
        }
        
        // Establecer el mensaje de error o limpiar si no hay errores
        if (errors.length > 0) {
          setPasswordError(errors.join('. '));
        } else {
          setPasswordError('');
        }
      } else {
        setPasswordError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar cédula antes de enviar
    if (formData.cedula.length !== 10) {
      setCedulaError('La cédula debe tener exactamente 10 dígitos');
      return;
    }
    
    // Validar que la contraseña cumpla con todos los requisitos
    let passwordValid = true;
    let passwordErrors = [];
    
    // Verificar longitud mínima
    if (formData.contrasenia.length < 8) {
      passwordValid = false;
      passwordErrors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    // Verificar si contiene al menos una letra mayúscula
    if (!/[A-Z]/.test(formData.contrasenia)) {
      passwordValid = false;
      passwordErrors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    // Verificar si contiene al menos una letra minúscula
    if (!/[a-z]/.test(formData.contrasenia)) {
      passwordValid = false;
      passwordErrors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    // Verificar si contiene al menos un carácter especial (incluyendo el punto)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(formData.contrasenia)) {
      passwordValid = false;
      passwordErrors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    if (!passwordValid) {
      setPasswordError(passwordErrors.join('. '));
      return;
    }
    
    setSubmitting(true);
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
      
      // Cerrar el modal inmediatamente
      onClose();
      
      // Mostrar notificación toast de éxito
      toast.success("¡Operador registrado exitosamente!");
      
      // Notificar al componente padre
      if (onOperadorCreated) {
        onOperadorCreated(response.data || operadorData);
      }
    } catch (error) {
      console.error('Error al registrar operador:', error);
      
      // Mostrar notificación toast de error
      toast.error(error.message || 'Error al registrar el operador. Por favor, intente nuevamente.');
      
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
                  placeholder="Ingrese la cédula (10 dígitos)"
                  value={formData.cedula}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border ${cedulaError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  required
                />
              </div>
              {cedulaError && (
                <p className="text-red-500 text-xs mt-1">{cedulaError}</p>
              )}
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
                  placeholder="Mín. 8 caracteres, mayúscula, minúscula y carácter especial"
                  value={formData.contrasenia}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 bg-gray-50 text-gray-800 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Requisitos de contraseña */}
              {formData.contrasenia.length > 0 && (
                <div className="bg-emerald-50 rounded-lg p-3 mt-2 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-medium text-emerald-700">
                      Requisitos de la contraseña
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 ${requisitosContrasena.longitud ? 'text-emerald-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${requisitosContrasena.longitud ? 'opacity-100' : 'opacity-50'}`} />
                      <span className="text-xs">8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-2 ${requisitosContrasena.mayuscula ? 'text-emerald-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${requisitosContrasena.mayuscula ? 'opacity-100' : 'opacity-50'}`} />
                      <span className="text-xs">Al menos una mayúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 ${requisitosContrasena.minuscula ? 'text-emerald-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${requisitosContrasena.minuscula ? 'opacity-100' : 'opacity-50'}`} />
                      <span className="text-xs">Al menos una minúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 ${requisitosContrasena.especial ? 'text-emerald-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${requisitosContrasena.especial ? 'opacity-100' : 'opacity-50'}`} />
                      <span className="text-xs">Al menos un carácter especial</span>
                    </div>
                  </div>
                </div>
              )}
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
                disabled={submitting || cedulaError || passwordError || 
                  !requisitosContrasena.longitud || 
                  !requisitosContrasena.mayuscula || 
                  !requisitosContrasena.minuscula || 
                  !requisitosContrasena.especial}
                className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-2 transition-colors duration-300 ${
                  (submitting || cedulaError || passwordError || 
                  !requisitosContrasena.longitud || 
                  !requisitosContrasena.mayuscula || 
                  !requisitosContrasena.minuscula || 
                  !requisitosContrasena.especial) ? 'opacity-70 cursor-not-allowed' : ''}`}
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
