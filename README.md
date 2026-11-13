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
| Buscar | Filtrar por fechas y texto, con resultados paginados y el total |
| Categorías | Crear, editar y borrar (pasando sus movimientos a otra categoría) |
| Importar CSV | Cargar el extracto del banco con vista previa antes de guardar |
| Presupuestos | Límite mensual por categoría, con aviso al acercarte o pasarte |
| Objetivos | Metas de ahorro con aportaciones, retiradas y cuánto ahorrar al mes |
| Mi perfil | Nombre, foto, contraseña, emails programados y borrar la cuenta |

Tiene tema claro, oscuro o según el sistema (en el menú de usuario) y se puede usar entera con el teclado.

## Tecnología

- React 19 + Vite, React Router 7
- Tailwind CSS 4 (tokens de diseño en `src/index.css`, tema oscuro en `src/dark.css`)
- Recharts para las gráficas, lucide-react para los iconos
- Axios con interceptores (token, sesión caducada, aviso de servidor despertando)
- Cloudinary para las fotos de perfil
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
npm run dev               # http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests de las utilidades (formatos, fechas, CSV, presupuestos…) |
| `npm run lint` | ESLint |
| `npm run build` | Compila a `dist/` |

## Variables de entorno

| Variable | Para qué |
|---|---|
| `VITE_API_BASE_URL` | URL de la API, con `/api/v1.0` al final. En producción: `https://money-manager-t0yw.onrender.com/api/v1.0` |

Vite las incluye al compilar: si la cambias en Netlify, vuelve a desplegar.

## Despliegue

Netlify compila y publica cada vez que se fusiona algo en `main`. Cada PR tiene su vista previa en `https://deploy-preview-<n>--money-manager-cristian.netlify.app`, y el backend acepta esas direcciones en CORS. `public/_redirects` envía todas las rutas a `index.html` para que funcionen al recargar.

GitHub Actions (`.github/workflows/ci.yml`) ejecuta lint, tests y build en cada PR.

## Notas

- El backend está en el plan gratuito de Render, que se duerme: la primera carga puede tardar hasta un minuto. La web lo avisa y lo despierta al abrirse.
- El tema y otros ajustes del navegador se guardan en `localStorage`; cerrar sesión solo borra el token.

## Sesión y proxy de la API

- La web llama siempre a `/api/v1.0` en su propio dominio. En desarrollo lo redirige Vite (`vite.config.js` → `localhost:8080`) y en producción Netlify (`netlify.toml` → Render). Así la cookie de sesión es de primera parte.
- El JWT de acceso (15 min) vive solo en memoria (`src/util/auth.js`). `src/util/session.js` lo renueva un minuto antes de que caduque, al volver a la pestaña y al recargar, con `POST /refresh-token` y la cookie HttpOnly `mm_session`.
- Si una petición recibe 401, se renueva la sesión y se repite una vez; si la renovación falla, se vuelve a `/login`.
- `VITE_API_BASE_URL` ya solo se usa para despertar el servidor de Render al abrir la página.
