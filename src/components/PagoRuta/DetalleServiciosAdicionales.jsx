import React from 'react';

export const DetalleServiciosAdicionales = ({ servicios }) => {
  // Agregar log para depuración - ver qué está llegando exactamente
  console.log("SERVICIOS RECIBIDOS EN DETALLE:", servicios); 

  // Si no hay servicios o el array está vacío, no mostramos nada
  if (!servicios || !Array.isArray(servicios) || servicios.length === 0) {
    console.log("No hay servicios para mostrar");
    return null;
  }

  // Calcular el total
  const totalServicios = servicios.reduce((total, item) => {
    if (!item.servicio || !item.servicio.precio) {
      console.log("Servicio inválido:", item);
      return total;
    }
    return total + (item.servicio.precio * item.cantidad);
  }, 0);

  return (
    <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="font-semibold text-lg mb-2">Servicios adicionales:</h3>
      
      {servicios.map((item, index) => (
        <div key={index} className="flex justify-between py-1 text-gray-700">
          <span>{item.servicio.nombre} x {item.cantidad}</span>
          <span className="font-medium">${parseInt(item.servicio.precio * item.cantidad).toLocaleString('es-CO')}</span>
        </div>
      ))}
      
      <div className="border-t border-gray-200 mt-2 pt-2">
        <div className="flex justify-between font-semibold text-teal-700">
          <span>Subtotal servicios:</span>
          <span>${parseInt(totalServicios).toLocaleString('es-CO')} COP</span>
        </div>
      </div>
    </div>
  );
};

export default DetalleServiciosAdicionales; 