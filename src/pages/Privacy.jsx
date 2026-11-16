import { Link } from "react-router-dom";
import LegalLayout, { Section } from "./legal/LegalLayout";
import { CONTACT_EMAIL, DATA_CONTROLLER } from "../util/legal";

const Mail = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-800 underline break-all">
    {CONTACT_EMAIL}
  </a>
);

const Privacy = () => (
  <LegalLayout title="Política de privacidad">
    <p>
      Money Manager es una aplicación para apuntar tus ingresos y gastos. Aquí te contamos qué datos guarda, para qué,
      con quién se comparten y qué puedes hacer con ellos, conforme al Reglamento General de Protección de Datos (RGPD)
      y a la Ley Orgánica 3/2018 (LOPDGDD).
    </p>

    <Section title="1. Responsable">
      <p>
        El responsable de tus datos es <strong>{DATA_CONTROLLER}</strong>, que desarrolla y mantiene Money Manager como
        proyecto personal sin ánimo de lucro. Para cualquier cuestión sobre privacidad escribe a <Mail />.
      </p>
    </Section>

    <Section title="2. Qué datos guardamos">
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Cuenta:</strong> nombre, email, contraseña (cifrada con BCrypt; nadie puede leerla), foto de perfil si la subes y fecha en que aceptaste esta política.</li>
        <li><strong>Tus finanzas:</strong> categorías, ingresos, gastos, notas, archivos adjuntos (tickets o facturas), presupuestos, objetivos de ahorro y movimientos recurrentes que tú introduces.</li>
        <li><strong>Preferencias:</strong> qué emails quieres recibir y el tema de color (este último solo en tu navegador).</li>
        <li><strong>Datos técnicos:</strong> la dirección IP de cada petición, solo en memoria y durante unos minutos para limitar intentos de acceso, y registros técnicos del servidor que se borran solos.</li>
      </ul>
      <p>No pedimos datos de cuentas bancarias ni tarjetas, ni los necesitamos.</p>
    </Section>

    <Section title="3. Para qué y con qué base legal">
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Darte el servicio</strong> (guardar y mostrarte tus datos, calcular totales y presupuestos): ejecución del acuerdo que aceptas al registrarte (art. 6.1.b RGPD).</li>
        <li><strong>Emails de servicio</strong> (activación, recuperar contraseña, aviso de cambio de contraseña): también ejecución del acuerdo.</li>
        <li><strong>Emails opcionales</strong> (recordatorio diario, resumen diario e informe mensual): tu consentimiento, que das al activarlos y retiras desde tu perfil o con el enlace de cada email (art. 6.1.a).</li>
        <li><strong>Seguridad</strong> (límite de intentos, copias de seguridad cifradas): interés legítimo en proteger tu cuenta y tus datos (art. 6.1.f).</li>
      </ul>
      <p>No usamos tus datos para publicidad, no hacemos perfiles comerciales y no los vendemos ni los cedemos.</p>
    </Section>

    <Section title="4. Quién más los trata (encargados)">
      <p>Para funcionar, Money Manager usa estos proveedores, que solo tratan los datos siguiendo nuestras instrucciones:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Netlify</strong>: sirve la web.</li>
        <li><strong>Render</strong>: ejecuta el servidor de la aplicación.</li>
        <li><strong>Neon</strong>: base de datos PostgreSQL donde se guardan tus datos.</li>
        <li><strong>Brevo</strong>: envío de emails.</li>
        <li><strong>GitHub</strong>: guarda durante 30 días las copias de seguridad nocturnas, cifradas con AES-256.</li>
        <li><strong>Google Fonts</strong> y <strong>jsDelivr</strong>: sirven la tipografía y las imágenes de los emojis; reciben tu IP al cargar la página.</li>
      </ul>
      <p>
        Algunos de estos proveedores pueden tratar datos en Estados Unidos. En ese caso las transferencias se amparan en
        el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo de la Comisión Europea.
      </p>
    </Section>

    <Section title="5. Cuánto tiempo">
      <p>
        Guardamos tus datos mientras tengas la cuenta. Si la borras, se eliminan al momento de la base de datos; las copias
        de seguridad que aún los contengan desaparecen como máximo en 30 días. Las cuentas que nunca se activan pueden
        borrarse pasado un tiempo razonable.
      </p>
    </Section>

    <Section title="6. Tus derechos">
      <p>Puedes ejercerlos en cualquier momento, gratis:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Acceso y portabilidad:</strong> en <Link to="/profile" className="text-purple-800 underline">Mi perfil → Tus datos</Link> descargas todo lo que guardamos en un archivo JSON.</li>
        <li><strong>Rectificación:</strong> puedes editar tus datos y movimientos desde la propia aplicación.</li>
        <li><strong>Supresión:</strong> en Mi perfil → Borrar cuenta se elimina todo.</li>
        <li><strong>Oposición, limitación y retirar el consentimiento</strong> de los emails opcionales: desde Mi perfil o escribiendo a <Mail />.</li>
      </ul>
      <p>
        Si crees que no hemos tratado bien tus datos, puedes reclamar ante la{" "}
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-purple-800 underline">Agencia Española de Protección de Datos</a>.
      </p>
    </Section>

    <Section title="7. Seguridad">
      <p>
        Toda la comunicación va cifrada (HTTPS). La sesión usa una cookie protegida que el código de la página no puede
        leer, las contraseñas se guardan cifradas y cada usuario solo puede acceder a sus propios datos.
      </p>
    </Section>

    <Section title="8. Cookies y almacenamiento local">
      <p>
        Solo usamos lo estrictamente necesario: la cookie <code>mm_session</code> para mantener tu sesión iniciada y, en
        tu navegador, tu preferencia de tema. No hay cookies de analítica ni de publicidad, por eso no te pedimos
        consentimiento para ellas.
      </p>
    </Section>

    <Section title="9. Menores">
      <p>Money Manager no está dirigido a menores de 14 años, que no deben registrarse.</p>
    </Section>

    <Section title="10. Cambios">
      <p>
        Si cambiamos esta política de forma importante te avisaremos por email o en la aplicación. La fecha de arriba
        indica la última versión.
      </p>
    </Section>
  </LegalLayout>
);

export default Privacy;
