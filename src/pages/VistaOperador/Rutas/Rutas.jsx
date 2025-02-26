import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import axios from 'axios';
import { Pencil, Trash, Plus, CheckCircle, AlertCircle, X, AlertTriangle } from 'lucide-react';

const Rutas = () => {
  const [rutas, setRutas] = useState([]);
  const [error, setError] = useState(null);
  const [rutaActual, setRutaActual] = useState({
    id: null,
    nombreRuta: '',
    duracion: '',
    descripcion: '',
    dificultad: '',
    capacidadMaxima: '',
    distancia: '',
    tipo: '',
    estado: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: '', // 'success', 'error', 'warning', 'info', 'confirm'
    onConfirm: null
  });
  const rutaToDeleteRef = useRef(null);

  const fetchRutas = async () => {
    try {
      const response = await axios.get('http://localhost:10101/rutas');
      if (Array.isArray(response.data)) {
        setRutas(response.data);
      } else {
        throw new Error("La respuesta no es un array");
      }
    } catch (error) {
      showAlert("No se pudieron cargar las rutas. Por favor, intente nuevamente.", "error");
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  // Mostrar alerta
  const showAlert = (message, type = 'info', onConfirm = null) => {
    setAlert({
      show: true,
      message,
      type,
      onConfirm
    });
    
    // Auto-cerrar después de 3 segundos para alertas de éxito
    if (type === 'success') {
      setTimeout(() => {
        setAlert(prev => ({...prev, show: false}));
      }, 3000);
    }
  };

  // Cerrar alerta
  const closeAlert = () => {
    setAlert(prev => ({...prev, show: false, onConfirm: null}));
  };

  // Función para confirmar acción
  const confirmAction = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    closeAlert();
  };

  const validarImagen = (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
            reject('Solo se permiten imágenes JPG/JPEG');
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            resolve(true);
        };

        img.onerror = () => {
            reject('Error al cargar la imagen');
        };
    });
  };

  const handleCreate = async () => {
    try {
        // Validar que todos los campos requeridos estén presentes
        if (!rutaActual.nombreRuta || !rutaActual.duracion || !rutaActual.descripcion || 
            !rutaActual.dificultad || !rutaActual.capacidadMaxima || !rutaActual.distancia || 
            !rutaActual.tipo || !rutaActual.estado) {
            showAlert("Todos los campos son obligatorios", "error");
            return;
        }

        // Validar el formato de los datos según tus requisitos
        if (!["Facil", "Moderada", "Desafiante"].includes(rutaActual.dificultad)) {
            showAlert("La dificultad debe ser: Facil, Moderada o Desafiante", "error");
            return;
        }

        if (!["Cabalgata", "Caminata", "Cabalgata y Caminata"].includes(rutaActual.tipo)) {
            showAlert("El tipo debe ser: Cabalgata, Caminata o Cabalgata y Caminata", "error");
            return;
        }

        if (!["Activa", "Inactiva"].includes(rutaActual.estado)) {
            showAlert("El estado debe ser: Activa o Inactiva", "error");
            return;
        }

        const dataToCreate = {
            nombreRuta: rutaActual.nombreRuta.trim(),
            duracion: rutaActual.duracion.trim(),
            descripcion: rutaActual.descripcion.trim(),
            dificultad: rutaActual.dificultad.trim(),
            capacidadMaxima: rutaActual.capacidadMaxima,
            distancia: rutaActual.distancia,
            tipo: rutaActual.tipo.trim(),
            estado: rutaActual.estado.trim()
        };

        await axios.post('http://localhost:10101/rutas', dataToCreate, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        await fetchRutas();
        showAlert("¡Ruta creada exitosamente!", "success");
    } catch (error) {
        if (error.response && error.response.status === 422) {
            showAlert("Datos inválidos. Por favor, verifique la información ingresada.", "error");
        } else {
            showAlert("No se pudo crear la ruta. Por favor, intente nuevamente.", "error");
        }
    }
};

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!rutaActual.nombreRuta || !rutaActual.duracion) {
        showAlert("Por favor, completa todos los campos requeridos.", "error");
        return;
    }

    if (isEditing) {
        await handleUpdate();
    } else {
        await handleCreate();
    }

    setModalOpen(false);
    setIsEditing(false);
    setRutaActual({
        id: null,
        nombreRuta: '',
        duracion: '',
        descripcion: '',
        dificultad: '',
        capacidadMaxima: '',
        distancia: '',
        tipo: '',
        estado: ''
    });
  };

  const handleDelete = async (id) => {
    rutaToDeleteRef.current = id;
    showAlert(
      '¿Estás seguro de que deseas eliminar esta ruta? Esta acción no se puede deshacer.',
      'confirm',
      () => deleteRuta(rutaToDeleteRef.current)
    );
  };

  const deleteRuta = async (id) => {
    try {
      if (!id) {
        showAlert("No se pudo identificar la ruta a eliminar.", "error");
        return;
      }
      
      const rutaId = id.idRuta || id;
      
      await axios.delete(`http://localhost:10101/rutas/${rutaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await fetchRutas();
      showAlert("Ruta eliminada exitosamente", "success");
    } catch (error) {
      showAlert("No se pudo eliminar la ruta. Por favor, intente nuevamente.", "error");
    }
  };

  const handleOpenModal = (ruta = null) => {
    setAlert({show: false, message: '', type: ''}); // Limpiar alertas previas
    if (ruta) {
        setRutaActual({
            id: ruta.idRuta || ruta.id,
            nombreRuta: ruta.nombreRuta,
            duracion: ruta.duracion,
            descripcion: ruta.descripcion,
            dificultad: ruta.dificultad,
            capacidadMaxima: ruta.capacidadMaxima,
            distancia: ruta.distancia,
            tipo: ruta.tipo,
            estado: ruta.estado
        });
        setIsEditing(true);
    } else {
        setRutaActual({
            id: null,
            nombreRuta: '',
            duracion: '',
            descripcion: '',
            dificultad: '',
            capacidadMaxima: '',
            distancia: '',
            tipo: '',
            estado: ''
        });
        setIsEditing(false);
    }
    setModalOpen(true);
  };

  const login = async (credentials) => {
    try {
        const response = await axios.post('http://localhost:10101/login', credentials);
        const { token } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
    } catch (error) {
        showAlert("Error al iniciar sesión. Verifique sus credenciales.", "error");
    }
  };

  const handleUpdate = async () => {
    try {
        if (!rutaActual.id && rutaActual.id !== 0) {
            showAlert("No se pudo identificar la ruta a actualizar.", "error");
            return;
        }

        // Crear un objeto con solo los campos que han cambiado
        const dataToUpdate = {};
        
        // Obtener la ruta original
        const rutaOriginal = rutas.find(r => (r.id === rutaActual.id || r.idRuta === rutaActual.id));
        
        if (!rutaOriginal) {
            showAlert("No se pudo encontrar la información original de la ruta.", "error");
            return;
        }
        
        // Solo incluir campos que han cambiado
        if (rutaActual.nombreRuta !== rutaOriginal.nombreRuta) 
            dataToUpdate.nombreRuta = rutaActual.nombreRuta;
        if (rutaActual.duracion !== rutaOriginal.duracion) 
            dataToUpdate.duracion = rutaActual.duracion;
        if (rutaActual.descripcion !== rutaOriginal.descripcion) 
            dataToUpdate.descripcion = rutaActual.descripcion;
        if (rutaActual.dificultad !== rutaOriginal.dificultad) 
            dataToUpdate.dificultad = rutaActual.dificultad;
        if (rutaActual.capacidadMaxima !== rutaOriginal.capacidadMaxima) 
            dataToUpdate.capacidadMaxima = rutaActual.capacidadMaxima;
        if (rutaActual.distancia !== rutaOriginal.distancia) 
            dataToUpdate.distancia = rutaActual.distancia;
        if (rutaActual.tipo !== rutaOriginal.tipo) 
            dataToUpdate.tipo = rutaActual.tipo;
        if (rutaActual.estado !== rutaOriginal.estado) 
            dataToUpdate.estado = rutaActual.estado;

        // Si no hay cambios, mostrar mensaje y salir
        if (Object.keys(dataToUpdate).length === 0) {
            showAlert("No se detectaron cambios para actualizar.", "warning");
            return;
        }

        await axios.patch(
            `http://localhost:10101/rutas/${rutaActual.id}`,
            dataToUpdate,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        await fetchRutas();
        showAlert("¡Ruta actualizada exitosamente!", "success");
        setModalOpen(false);
        setIsEditing(false);
        setRutaActual({
            id: null,
            nombreRuta: '',
            duracion: '',
            descripcion: '',
            dificultad: '',
            capacidadMaxima: '',
            distancia: '',
            tipo: '',
            estado: ''
        });
    } catch (error) {
        if (error.response && error.response.status === 422) {
            showAlert("Datos inválidos. Por favor, verifique la información ingresada.", "error");
        } else {
            showAlert("No se pudo actualizar la ruta. Por favor, intente nuevamente.", "error");
        }
    }
};

  // Componente de Alerta
  const AlertModal = () => {
    if (!alert.show) return null;
    
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      confirm: 'bg-gray-800'
    }[alert.type];
    
    const icon = {
      success: <CheckCircle className="h-8 w-8 text-white" />,
      error: <AlertCircle className="h-8 w-8 text-white" />,
      warning: <AlertTriangle className="h-8 w-8 text-white" />,
      info: <AlertCircle className="h-8 w-8 text-white" />,
      confirm: <AlertTriangle className="h-8 w-8 text-yellow-500" />
    }[alert.type];
    
    const title = {
      success: '¡Éxito!',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      confirm: 'Confirmar acción'
    }[alert.type];
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className={`${bgColor} rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative`}>
          <button 
            onClick={closeAlert}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {title}
            </h3>
            <p className="text-white text-lg">{alert.message}</p>
            
            {alert.type === 'confirm' ? (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={closeAlert}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAction}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600"
                >
                  Aceptar
                </button>
              </div>
            ) : (
              <button
                onClick={closeAlert}
                className="mt-6 bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-100"
              >
                Aceptar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Rutas</h1>
        
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nueva Ruta
        </button>
        <ul className="overflow-y-auto max-h-[calc(100vh-250px)]">
          {rutas.length > 0 ? (
            rutas.map(ruta => {
                return (
                    <li key={ruta.id || ruta.idRuta} className="text-white flex flex-col bg-gray-800 p-4 rounded-lg mb-2">
                        {ruta.imagen && (
                            <img
                                src={`http://localhost:10101/uploads/${ruta.imagen}`}
                                alt={ruta.nombreRuta}
                                className="w-full h-48 object-cover rounded mb-4"
                            />
                        )}
                        <h2 className="font-semibold">{ruta.nombreRuta}</h2>
                        <p>Duración: {ruta.duracion} </p>
                        <p>Descripción: {ruta.descripcion}</p>
                        <p>Dificultad: {ruta.dificultad}</p>
                        <p>Capacidad Máxima: {ruta.capacidadMaxima}</p>
                        <p>Distancia: {ruta.distancia} km</p>
                        <p>Tipo: {ruta.tipo}</p>
                        <p>Estado: {ruta.estado}</p>
                        <div className="flex justify-between mt-2">
                            <button
                                onClick={() => handleOpenModal(ruta)}
                                className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg"
                            >
                                <Pencil className="h-5 w-5 text-white" />
                            </button>
                            <button
                                onClick={() => handleDelete(ruta.idRuta || ruta.id)}
                                className="bg-red-500 hover:bg-red-600 p-2 rounded-lg"
                            >
                                <Trash className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </li>
                );
            })
          ) : (
            <p className="text-white">No hay rutas disponibles.</p>
          )}
        </ul>

        {/* Modal para crear/editar ruta */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-40">
            <div className="bg-gray-800 rounded-lg w-full max-w-md mx-auto mt-20">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {isEditing ? 'Modificar Ruta' : 'Nueva Ruta'}
                </h2>
                <form onSubmit={handleCreateOrUpdate} className="space-y-4 overflow-y-auto max-h-[60vh]">
                  <input
                    type="text"
                    placeholder="Nombre de la ruta"
                    value={rutaActual.nombreRuta}
                    onChange={(e) => setRutaActual({ ...rutaActual, nombreRuta: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Duración (ejemplo: 1-2 horas)"
                    value={rutaActual.duracion}
                    onChange={(e) => setRutaActual({ ...rutaActual, duracion: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                  />
                  <textarea
                    placeholder="Descripción"
                    value={rutaActual.descripcion}
                    onChange={(e) => setRutaActual({ ...rutaActual, descripcion: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white min-h-[100px]"
                    required
                  />
                  <select
                    value={rutaActual.dificultad}
                    onChange={(e) => setRutaActual({ ...rutaActual, dificultad: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                  >
                    <option value="">Seleccione la dificultad</option>
                    <option value="Facil">Fácil</option>
                    <option value="Moderada">Moderada</option>
                    <option value="Desafiante">Desafiante</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Capacidad Máxima"
                    value={rutaActual.capacidadMaxima}
                    onChange={(e) => setRutaActual({ ...rutaActual, capacidadMaxima: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                    min="1"
                    max="99"
                  />
                  <input
                    type="number"
                    placeholder="Distancia (km)"
                    value={rutaActual.distancia}
                    onChange={(e) => setRutaActual({ ...rutaActual, distancia: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                  />
                  <select
                    value={rutaActual.tipo}
                    onChange={(e) => setRutaActual({ ...rutaActual, tipo: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                  >
                    <option value="">Seleccione el tipo</option>
                    <option value="Cabalgata">Cabalgata</option>
                    <option value="Caminata">Caminata</option>
                    <option value="Cabalgata y Caminata">Cabalgata y Caminata</option>
                  </select>
                  <select
                    value={rutaActual.estado}
                    onChange={(e) => setRutaActual({ ...rutaActual, estado: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    required
                  >
                    <option value="">Seleccione el estado</option>
                    <option value="Activa">Activa</option>
                    <option value="Inactiva">Inactiva</option>
                  </select>
                  <div className="flex justify-end gap-2 pt-4 bg-gray-800 sticky bottom-0">
                    <button
                        type="button"
                        onClick={() => {
                            setModalOpen(false);
                            setIsEditing(false);
                            setAlert({show: false, message: '', type: ''});
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {isEditing ? 'Guardar Cambios' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Componente de Alerta */}
        <AlertModal />
      </div>
    </DashboardLayout>
  );
};

export default Rutas;
