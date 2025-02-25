import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fetchInitialState = async (setEstado) => {
    try {
        const token = localStorage.getItem('token');
        const cedula = localStorage.getItem('cedula');

        const response = await axios.get('/usuarios/consultar-estado', {
            params: { cedula },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Respuesta de la API:', response.data);

        if (response.data && response.data.estado) {
            const estadoFromDB = response.data.estado.charAt(0).toUpperCase() + response.data.estado.slice(1).toLowerCase();
            setEstado(estadoFromDB);
        } else {
            console.error('El estado no está definido en la respuesta de la API', response.data);
            toast.error('No se pudo obtener el estado desde la API.');
        }
    } catch (error) {
        console.error('Error al obtener el estado:', error);
        toast.error('Error al obtener el estado.');
    }
};

const handleEstadoChange = async (e, setEstado) => {
    const nuevoEstado = e.target.value;
    setEstado(nuevoEstado);

    try {
        const cedula = localStorage.getItem('cedula'); // Asegúrate de que la cédula se obtenga correctamente
        const token = localStorage.getItem('token'); // Asegúrate de que el token se obtenga correctamente
        const id = localStorage.getItem('id'); // Asegúrate de que el ID se obtenga correctamente
        const rol = localStorage.getItem('rol'); // Asegúrate de que el rol se obtenga correctamente

        await axios.patch('/usuarios/cambiar-estado', {
            nuevoEstado,
            cedula,
            id,
            rol
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Agregar el token en los headers
            }
        });
        toast.success('Estado actualizado correctamente en la base de datos.');

        fetchInitialState(setEstado);
    } catch (error) {
        console.error('Error al cambiar el estado:', error.response?.data || error.message);
        toast.error('Error al actualizar el estado.');
    }
};

const EstadoSelector = ({ estado, setEstado }) => {
    useEffect(() => {
        fetchInitialState(setEstado);
    }, [setEstado]);

    return (
        <select value={estado} onChange={(e) => handleEstadoChange(e, setEstado)}>
            <option value="Disponible">Disponible</option>
            <option value="Ocupado">Ocupado</option>
            <option value="Inactivo">Inactivo</option>
        </select>
    );
};

export default EstadoSelector;