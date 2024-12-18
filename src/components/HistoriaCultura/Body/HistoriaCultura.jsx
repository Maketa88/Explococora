import React from "react";
import {Card} from "./Carta";
import Carta1 from "../../../assets/Images/historia1.webp";
import Carta2 from "../../../assets/Images/carrusel2.webp";
import Carta3 from "../../../assets/Images/historia3.webp";
import Carta4 from "../../../assets/Images/historia4.webp";
import Carta5 from "../../../assets/Images/historia5.webp";
import Carta6 from "../../../assets/Images/historia6.webp";
import Carta7 from "../../../assets/Images/historia7.webp";
import Carta8 from "../../../assets/Images/historia8.webp";

export const Carta = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-20">
        <Card
          image={Carta1}
          title="Cocora: La Princesa que Dio Nombre al Valle"
          text="El Valle del Cocora toma su nombre de una princesa indígena de la tribu Quimbaya.
           Según la leyenda, Cocora simbolizaba la “estrella de agua”, una representación de la pureza
            y la riqueza natural de la región. Este nombre ancestral nos recuerda el profundo respeto
             que los Quimbayas tenían por su tierra. Hoy, ese espíritu sigue vivo, iluminando uno de los
              destinos más mágicos de Colombia. Cada rincón del valle cuenta una historia, como si la
               princesa Cocora aún protegiera sus tierras. Este lugar es una conexión con nuestras raíces
                y la riqueza de la cultura indígena."
        />
        <Card
          image={Carta2}
          title="Palma de Cera: La Gigante que Toca el Cielo"
          text="La palma de cera del Quindío no solo es el árbol nacional de Colombia, sino un símbolo de resistencia y majestuosidad.
           Con más de 60 metros de altura, estas gigantes naturales han sido testigos silenciosos de siglos de historia.
            Protegidas desde 1985, estas palmas representan la unión entre el hombre y la naturaleza. Su conservación ha
             sido crucial para preservar el hábitat de especies únicas, como el loro orejiamarillo. Caminando entre ellas,
              uno siente una conexión espiritual, como si su altura nos acercara al cielo. Son, sin duda, un emblema de la
               biodiversidad y el orgullo colombiano."
        />
        <Card
          image={Carta3}
          title="Los Quimbayas: Maestros del Oro y la Naturaleza"
          text="Mucho antes de la llegada de los colonizadores, el Valle del Cocora era el hogar de los Quimbayas,
           un pueblo indígena reconocido por su impresionante arte orfebre. Estos maestros del oro dejaron un legado
            que aún asombra por su belleza y perfección. Para los Quimbayas, el valle no solo era un hogar, sino un templo
             sagrado donde las montañas y ríos eran sus dioses protectores. Su relación con la naturaleza nos enseña sobre
              sostenibilidad y respeto por el medio ambiente. Hoy, el Valle del Cocora sigue siendo un testimonio vivo de su
               sabiduría y conexión espiritual con la tierra."
        />
        <Card
          image={Carta4}
          title="Salento y Cocora: Una Alianza de Tradición y Modernidad"
          text="El encantador pueblo de Salento, puerta de entrada al Valle del Cocora, combina el colorido
           de la arquitectura paisa con un espíritu vibrante. Sus balcones adornados con flores y sus calles
            empedradas invitan a caminar sin prisa, respirando tradición. Aquí, cada rincón cuenta una historia
             y cada sonrisa refleja la calidez de su gente. En Salento, la modernidad no ha eclipsado las costumbres
              ancestrales, sino que las ha reforzado. Los visitantes encuentran artesanías únicas y una gastronomía
               que complementa la experiencia. Este mágico pueblo es un puente entre el pasado y el presente de la cultura cafetera."
        />
        <Card
          image={Carta5}
          title="Trucha y Patacón: Los Sabores del Valle"
          text="La gastronomía del Valle del Cocora es un deleite para el paladar. Platos como la trucha arcoíris,
           acompañada de un crujiente patacón, son un homenaje a las aguas cristalinas que cruzan la región. Cada receta
            cuenta una historia, transmitida por generaciones que han adaptado los sabores locales a la cocina contemporánea.
             Este manjar es una muestra del equilibrio entre lo tradicional y lo innovador. Además, los restaurantes locales
              ofrecen experiencias únicas, como degustar estos platos con vistas panorámicas del valle. Comer en el Valle del
               Cocora es saborear la esencia misma de su naturaleza y cultura."
        />
        <Card
          image={Carta6}
          title="Caballos y Senderos: Explorando el Valle como en el Pasado"
          text="Recorrer el Valle del Cocora a caballo no es solo una experiencia turística,
           sino una conexión con la forma tradicional de explorar estas tierras. Los arrieros
            de antaño utilizaban estos mismos senderos para transportar café y otros productos.
             Hoy, estos recorridos ofrecen una vista única de las montañas y las palmas de cera.
              Los guías locales narran historias fascinantes que hacen del viaje una inmersión en el pasado.
               Además, el contacto con la naturaleza y los animales crea una experiencia inolvidable.
                Explorar el valle a caballo es revivir la historia y sentir el latir de la tradición campesina."
        />
        <Card
          image={Carta7}
          title=" El Loro Orejiamarillo: Un Tesoro Escondido"
          text="En las alturas del Valle del Cocora vive un habitante especial: el loro orejiamarillo.
           Esta colorida ave, en peligro de extinción, depende de la palma de cera para sobrevivir, ya que sus frutos
            son su principal alimento. Gracias a los esfuerzos de conservación, esta especie ha comenzado a recuperarse,
             convirtiéndose en un símbolo de esperanza. Avistar uno de estos loros es una experiencia única, que conecta
              a los visitantes con la biodiversidad del valle. Su presencia recuerda la importancia de cuidar la naturaleza
               para las generaciones futuras. El loro orejiamarillo es el verdadero guardián del Valle del Cocora."
        />
        <Card
          image={Carta8}
          title="Un Templo Natural en el Corazón de Colombia"
          text="Más allá de su belleza, el Valle del Cocora es un santuario para la biodiversidad.
           Este lugar mágico envuelve a los visitantes en un ambiente de paz, donde el aire puro y los sonidos
            de la naturaleza son la banda sonora perfecta. Sus paisajes son tan imponentes que invitan a la introspección
             y la conexión espiritual. Cada amanecer en el valle es un espectáculo de colores que transforma el alma.
              Este templo natural no solo es un regalo para los sentidos, sino una invitación a reflexionar sobre la importancia
               de preservar los tesoros naturales de nuestro planeta."
        />
      </div>
    </div>
  );
};


