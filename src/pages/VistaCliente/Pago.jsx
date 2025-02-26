import React from "react";
import axios from "axios";

const Pago = () => {
  const handlePago = async () => {
    try {
      const token = localStorage.getItem("token"); // Obtén el token de autenticación

      const { data } = await axios.post(
        "http://localhost:10101/api/pagar",
        {
            rutaId: "12345",
            precio: 1000,
          transaction_amount: 100,
          token: "1bb712281c5a17cb60487a5bb026ea4", // Token generado con /card_tokens
          description: "Compra de prueba",
          installments: 1,
          payment_method_id: "visa",
          payer: { email: "test_user_123456@testuser.com" }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Enviar el token en los headers
            "Content-Type": "application/json",
          },
        }
      );

      // Redirigir a la URL de pago de MercadoPago
      if (data.pago_url) {
        window.location.href = data.pago_url;
      } else {
        alert("Error al generar el pago");
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      alert("Error al procesar el pago");
    }
  };

  return (
    <div>
      <button onClick={handlePago}>Pagar</button>
    </div>
  );
};

export default Pago;
