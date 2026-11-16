# Money Manager · Frontend

Web de **Money Manager**: lleva tus ingresos y gastos, mira en qué se va el dinero, pon presupuestos y ahorra para tus objetivos.

- Web: <https://money-manager-cristian.netlify.app>
- Backend (API): [Money-Manager-Back-End](https://github.com/CristianFiguerolaVicedo/Money-Manager-Back-End)

## Qué puedes hacer

| Página | Para qué |
|---|---|
| Inicio | Saldo, ingresos y gastos totales, los últimos 6 meses, los gastos del mes por categoría y avisos de presupuesto |
| Comparar meses | Dos meses lado a lado: totales y cambio por categoría |
| Ingresos / Gastos | Lista por mes con gráfica por día y desglose por categoría; añadir, editar y borrar (con «Deshacer»), notas, tickets adjuntos, movimientos recurrentes y exportar a Excel |
| Buscar | Ingresos, gastos o todos; por categoría (con sus subcategorías), importe mínimo y máximo, fechas y texto, con resultados paginados y el total (o el balance) |
| Categorías | Crear, editar y borrar (pasando sus movimientos a otra categoría), con subcategorías de un nivel |
| Importar CSV | Cargar el extracto del banco con vista previa antes de guardar |
| Presupuestos | Límite mensual por categoría, con aviso al acercarte o pasarte |
| Objetivos | Metas de ahorro con aportaciones, retiradas y cuánto ahorrar al mes |
| Mi perfil | Nombre, foto, contraseña, emails programados, descargar tus datos y borrar la cuenta |
| Privacidad / Términos | Páginas públicas `/privacy` y `/terms` |

Tiene tema claro, oscuro o según el sistema (en el menú de usuario) y se puede usar entera con el teclado.

## Tecnología

- React 19 + Vite, React Router 7
- Tailwind CSS 4 (tokens de diseño en `src/index.css`, tema oscuro en `src/dark.css`)
- Recharts para las gráficas, lucide-react para los iconos
- Axios con interceptores (token en memoria, renovación de sesión, reintentos mientras el servidor despierta)
- Cada página se carga por separado (`React.lazy`)
- Tests con el test runner que trae Node (`node --test`), sin dependencias extra

## Estructura

```
src/
├── pages/        Una por pantalla (Home, Income, Expense, Budgets, Goals, Import…)
├── components/   Piezas reutilizables (TransactionsPage, Modal, Input, gráficas…)
├── config/       Textos y endpoints de ingresos y gastos
├── context/      Usuario conectado
├── hooks/        useUser, useDarkTheme
├── util/         API, sesión, formatos (€, fechas), CSV, presupuestos, comparativa… y sus tests en __tests__/
├── index.css     Tokens de diseño y estilos de accesibilidad
└── dark.css      Tema oscuro
```

## Ejecutar en local

Necesitas Node 22 y el backend en marcha (ver su README).

```bash
npm ci
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:8080/api/v1.0
npm run dev               # http://localhost:5173 (Vite pasa /api a localhost:8080)
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests de las utilidades (formatos, fechas, CSV, presupuestos…) |
| `npm run lint` | ESLint |
| `npm run build` | Compila a `dist/` |
| `node scripts/smoke-test.mjs` | Abre la build en Chromium y falla si alguna página sale en blanco (necesita `playwright`; lo usa el CI) |

## Variables de entorno

| Variable | Para qué |
|---|---|
| `VITE_API_BASE_URL` | URL directa del backend, con `/api/v1.0` al final (en producción `https://money-manager-t0yw.onrender.com/api/v1.0`). Solo se usa para despertar Render al abrir la página: las llamadas a la API van por `/api/v1.0` en el propio dominio |
| `NETLIFY_PROXY_SECRET` | Solo en Netlify (alcance *Runtime*), con el mismo valor que en Render. Firma las peticiones del proxy `/api/*` para que el backend se fíe de la IP real |

Vite las incluye al compilar: si la cambias en Netlify, vuelve a desplegar.

## Despliegue

Netlify compila y publica cada vez que se fusiona algo en `main`. Cada PR tiene su vista previa en `https://deploy-preview-<n>--money-manager-cristian.netlify.app`, y el backend acepta esas direcciones en CORS. Las redirecciones están en `netlify.toml`: primero el proxy `/api/*` a Render y después las rutas de la app (ver *Cabeceras de seguridad y rutas*). No uses `public/_redirects`: sus reglas van antes que las de `netlify.toml` y taparían el proxy.

GitHub Actions (`.github/workflows/ci.yml`) ejecuta lint, tests, build y una prueba en navegador de la build en cada PR.

## Notas

- El backend está en el plan gratuito de Render, que se duerme: la primera carga puede tardar hasta un minuto. La web lo avisa y lo despierta al abrirse.
- El tema se guarda en `localStorage`; la sesión no (el token vive en memoria y la cookie es HttpOnly). Cerrar sesión revoca la cookie en el servidor.
- No uses `manualChunks` en `vite.config.js`: separar recharts y React en archivos propios dejó la web en blanco en producción.
- Abrir la web sin sesión muestra un 401 de `/refresh-token` en la consola: es normal (significa "no hay sesión").

## Sesión y proxy de la API

- La web llama siempre a `/api/v1.0` en su propio dominio. En desarrollo lo redirige Vite (`vite.config.js` → `localhost:8080`) y en producción Netlify (`netlify.toml` → Render). Así la cookie de sesión es de primera parte.
- El JWT de acceso (15 min) vive solo en memoria (`src/util/auth.js`). `src/util/session.js` lo renueva un minuto antes de que caduque, al volver a la pestaña y al recargar, con `POST /refresh-token` y la cookie HttpOnly `mm_session`.
- Si una petición recibe 401, se renueva la sesión y se repite una vez; si la renovación falla, se vuelve a `/login`.
- `VITE_API_BASE_URL` ya solo se usa para despertar el servidor de Render al abrir la página.

## Cabeceras de seguridad y rutas

- `public/_headers` añade a todas las páginas una Content-Security-Policy estricta (solo scripts propios), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`. Por eso el script que aplica el tema antes de pintar está en `public/theme-init.js` y no en línea.
- `netlify.toml` sirve las rutas conocidas con 200 y el resto con un **404 real** (la app muestra "Esta página no existe"). Si añades una ruta en `src/App.jsx`, añádela también ahí.
- `public/robots.txt` solo deja indexar la entrada, el login, el registro y las páginas legales.
- La foto de perfil se sube al backend (`PUT /profile/photo`); ya no se usa Cloudinary.

## Privacidad (RGPD)

- `/privacy` y `/terms` son públicas y están enlazadas desde el login, el registro y el menú lateral.
- Quién es el responsable y el email de contacto están en `src/util/legal.js`. `TERMS_VERSION` debe coincidir con `ProfileService.TERMS_VERSION` del backend.
- El registro exige marcar la casilla de consentimiento (el backend guarda cuándo y qué versión).
- En *Mi perfil → Tus datos* se descarga todo en JSON; en *Borrar cuenta* se elimina.

