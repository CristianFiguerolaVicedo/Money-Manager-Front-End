import { Link } from "react-router-dom";
import LegalLayout, { Section } from "./legal/LegalLayout";
import { CONTACT_EMAIL, DATA_CONTROLLER } from "../util/legal";

const Terms = () => (
  <LegalLayout title="Términos de uso">
    <p>
      Estos términos regulan el uso de Money Manager, un servicio gratuito ofrecido por <strong>{DATA_CONTROLLER}</strong>{" "}
      (contacto: <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-800 underline break-all">{CONTACT_EMAIL}</a>).
      Al crear una cuenta los aceptas.
    </p>

    <Section title="1. El servicio">
      <p>
        Money Manager te permite apuntar ingresos y gastos, organizarlos por categorías, poner presupuestos y objetivos de
        ahorro y exportar o importar tus datos. Es una herramienta de organización personal: <strong>no es asesoramiento
        financiero, fiscal ni contable</strong>, y las decisiones que tomes con ella son tuyas.
      </p>
    </Section>

    <Section title="2. Tu cuenta">
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Debes tener al menos 14 años y dar un email real que sea tuyo.</li>
        <li>Eres responsable de mantener tu contraseña en secreto. Si crees que alguien ha entrado en tu cuenta, cámbiala: se cerrará la sesión en todos tus dispositivos.</li>
        <li>Una cuenta es personal; no la compartas.</li>
      </ul>
    </Section>

    <Section title="3. Uso aceptable">
      <p>
        No puedes usar Money Manager para actividades ilegales, para intentar acceder a datos de otras personas, para
        sobrecargar o atacar el servicio, ni para subir archivos con malware o contenido que no tengas derecho a guardar.
        Podemos suspender cuentas que incumplan estas normas.
      </p>
    </Section>

    <Section title="4. Tus datos son tuyos">
      <p>
        Todo lo que introduces te pertenece. Puedes descargarlo cuando quieras y borrar tu cuenta en cualquier momento. Cómo
        tratamos tus datos se explica en la <Link to="/privacy" className="text-purple-800 underline">política de privacidad</Link>.
      </p>
    </Section>

    <Section title="5. Disponibilidad">
      <p>
        El servicio es gratuito y se ofrece tal cual. Intentamos que funcione siempre y hacemos copias de seguridad cada
        noche, pero puede haber interrupciones (por ejemplo, el servidor tarda unos segundos en arrancar si nadie lo ha
        usado en un rato) y no podemos garantizar que nunca se pierda información. Te recomendamos exportar tus datos de
        vez en cuando.
      </p>
    </Section>

    <Section title="6. Responsabilidad">
      <p>
        En la medida en que la ley lo permite, no respondemos de daños indirectos derivados del uso del servicio ni de
        errores en los datos que introduzcas. Nada de esto limita los derechos que te reconoce la normativa de consumidores.
      </p>
    </Section>

    <Section title="7. Cambios y fin del servicio">
      <p>
        Podemos actualizar estos términos; si el cambio es importante te avisaremos antes. Si algún día el servicio deja de
        prestarse, avisaremos con antelación suficiente para que puedas descargar tus datos.
      </p>
    </Section>

    <Section title="8. Ley aplicable">
      <p>Estos términos se rigen por la ley española.</p>
    </Section>
  </LegalLayout>
);

export default Terms;
