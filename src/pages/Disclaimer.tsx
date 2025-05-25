import { type FC } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";

const Disclaimer: FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col mb-6">
      <Header />
      <main className="flex-1 marketplace-container pt-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            Aviso de Privacidad y Responsabilidad
          </h1>

          <div className="prose prose-gray">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                1. Función de la Plataforma
              </h2>
              <p className="mb-4">
                Los Prados Marketplace actúa exclusivamente como una plataforma
                de conexión entre residentes. Nuestro objetivo es facilitar la
                comunicación y el intercambio de información entre los miembros
                de la comunidad de Los Prados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                2. Manejo de Datos Personales
              </h2>
              <p className="mb-4">
                No almacenamos, procesamos ni utilizamos datos personales más
                allá de lo estrictamente necesario para el funcionamiento básico
                del servicio. La información proporcionada por los usuarios se
                utiliza únicamente para:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Facilitar la comunicación entre residentes</li>
                <li>Mantener la seguridad de la plataforma</li>
                <li>Proporcionar las funcionalidades básicas del servicio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                3. Responsabilidad en Transacciones
              </h2>
              <p className="mb-4">
                Toda interacción, transacción o acuerdo entre usuarios es
                responsabilidad exclusiva de las partes involucradas. La
                plataforma no asume responsabilidad por:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>El resultado de las transacciones realizadas</li>
                <li>La calidad de los productos o servicios ofrecidos</li>
                <li>Disputas entre usuarios</li>
                <li>Pérdidas económicas o materiales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                4. Recomendaciones de Uso
              </h2>
              <p className="mb-4">Recomendamos a todos los usuarios:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  Verificar la identidad de las personas con las que realizan
                  transacciones
                </li>
                <li>Acordar términos claros antes de cualquier transacción</li>
                <li>Reportar cualquier actividad sospechosa o inadecuada</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                5. Modificaciones al Aviso
              </h2>
              <p>
                Este aviso puede ser modificado en cualquier momento. Los
                cambios serán notificados a través de la plataforma y entrarán
                en vigor inmediatamente después de su publicación.
              </p>
            </section>
          </div>
        </div>
      </main>
      {isAuthenticated && <BottomNavigation />}
    </div>
  );
};

export default Disclaimer;
