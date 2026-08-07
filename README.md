# Sweet Kitty Shop

Ese proyecto está a medias. Las instrucciones para crearlo fueron:
Actúa como un Desarrollador Frontend Senior y Diseñador UX/UI experto en  Next.js (App Router), TailwindCSS, Framer Motion y consumo de APIs REST.
Vas a construir la interfaz frontend responsive de una tienda en línea de repostería y chocolatería personalizada llamada "Black Cats" (con un gatito negro como mascota de la marca), diseñada bajo el patrón de Single Page Application (SPA). La aplicación consumirá una API REST existente en Node.js, Express, Sequelize y MySQL.
---
### 1. Arquitectura Técnica y Stack
- **Framework & Bundler:** React 18 + Vite (ES Modules JavaScript).
- **Ruteo & Layouts Persistentes:** React Router v6. Renderizado mediante `<Outlet />` para mantener componentes fijos (Navbar, Footer, Sidebar de Admin) evitando renderizados innecesarios del layout en cambios de ruta.
- **Cliente HTTP Centralizado:** Axios configurado en `src/api/axios.js` con `baseURL`, interceptores para inyección de JWT/Token y manejo global de errores. Servicios modularizados (`productService`, `orderService`, etc.).
- **Gestión de Estado Global:** Context API (o Zustand) para:
  1. `AuthContext`: Sesión, autenticación y rol de usuario (`admin` / `cliente`).
  2. `CartContext`: Carrito de compras con persistencia en `localStorage`.
- **Estructura Modular:**
  `src/api/`, `src/components/`, `src/pages/`, `src/layouts/`, `src/context/`, `src/hooks/`, `src/routes/`, `src/services/`.
---
### 2. Estilo Visual, Tokens y Estética "Kawaii Tech"
#### Paleta de Colores (Tokens Semánticos en Tailwind):
- **Primary / CTA (`#FF664B`):** Coral vívido para botones principales, ofertas e interacciones clave.
- **Secondary / Soft (`#FFC3C3`):** Rosa pastel suave para tarjetería, badges, modales y fondos secundarios.
- **Accent / Mint (`#64C0A6`):** Verde menta pastel para precios, badges positivos, confirmaciones y estados exitosos.
- **Dark / Text (`#08090A`):** Negro suave para tipografía, bordes e íconos de alto contraste.
- **Light / Canvas (`#F4F4F4`):** Gris/blanco cálido para el fondo base del sitio.
#### Lineamientos Estéticos y Mascot Branded:
- **Bordes y Sombras:** Botones y tarjetas súper redondeados (`rounded-2xl`, `rounded-4xl` o `rounded-full`), sombras suaves neumórficas pastel o bordes gruesos estilo "card-based".
- **Tipografía:** Amigable y redondeada (ej: Quicksand, Nunito o Baloo 2).
- **Animaciones (Framer Motion):** Microinteracciones de rebote ("bounce") al hacer hover/clic en botones, modales flotantes con escala suave, transiciones entre páginas, toasts animados al agregar al carrito y listas escalonadas.
- **Detalles UI / Branding:** Incorporación del gatito negro mascot en estados vacíos ("empty states"), ilustraciones cute y loaders personalizados.
---
### 3. Sistema de Roles, Rutas y Vistas
#### A. Vista Pública / Cliente:
1. **Layout Principal (`MainLayout.jsx`):**
   - **Header / Navbar:** Espacio para logo PNG, buscador de productos, selector de categorías, acceso a perfil, botón a "Mis Pedidos" y Drawer/Carrito flotante con badge animado de contador. Links fijos: *Inicio | Catálogo | Carrito | Mis Pedidos*.
   - **Home (`/`):**
     - Carrusel promocional/productos más vendidos.
     - Sección interactiva "¿Qué preferís hoy?": dos botones estilizados **"DULCE"** y **"SALADO"** que redirigen al catálogo filtrando por Categoría ID 1 o 2.
     - Sección de testimonios/opiniones de clientes con diseño de tarjetas Kawaii.
   - **Footer:** Links secundarios, redes sociales y branding.
2. **Catálogo & Filtros (`/catalogo`):**
   - Sidebar/Panel desplegable con filtros por Categoría, Subcategoría, Evento y Checkbox "Combos".
   - Banner promocional adaptable según el evento activo (ej. "San Valentín", "Halloween").
   - Grid de tarjetas de producto animadas (`ProductCard`) con imagen, título, precio, badge de evento y tag de combo.
3. **Modal / Detalle de Producto (`/producto/:id` o Modal):**
   - Vista detallada del producto (si es Combo, muestra los ítems que lo componen vía `ProductoCombo`).
   - Campo obligatorio u opcional: **`TextoPersonalizado`** (ej: dedicatorias, colores de chocolate).
   - Selector de cantidad y botón "Agregar al Carrito" con animación y feedback visual.
4. **Carrito & Checkout (`/carrito`):**
   - Soporte para múltiples renglones del mismo producto con distinto `TextoPersonalizado` (reflejando la PK subrogada `ProdPedidoID`).
   - Resumen de monto total, selector de fecha/hora de entrega (`PedidoFechaEntrega`) y formulario de datos del cliente para confirmar el pedido (`Pedido` + `ProductoPedido`).
5. **Mis Pedidos & Tracking (`/mis-pedidos`):**
   - Consulta de pedidos del cliente con fecha de compra (`createdAt`), detalle de ítems y timeline ilustrado en tiempo real según `PedidoEstado` (*Pendiente -> En Preparación -> Entregado*).
#### B. Vista Privada / Panel Administrador:
1. **Layout de Administración (`AdminLayout.jsx`):**
   - Sidebar de navegación fijo con acceso a las distintas áreas de gestión.
   - `ProtectedRoute` con verificación estricta de rol `admin`.
2. **Gestión de Pedidos / Order Board (`/admin/pedidos`):**
   - Vista interactiva (Tabla o Kanban) para filtrar pedidos por estado, cliente o fecha.
   - Desglose detallado de cada pedido mostrando sus renglones y las aclaraciones individuales de `TextoPersonalizado`.
   - Control rápido para cambiar el `PedidoEstado`.
3. **Módulos CRUD de Configuración (Tablas interactiva con Búsqueda, Paginación, Ordenamiento y Modales):**
   - **Productos:** Crear/Editar ficha completa (`ProdNombre`, `ProdPrecio`, `ProdImg`, asignación de subcategoría, `ProdEstado`, checkbox `EsCombo` y selección de productos componentes si es combo).
   - **Categorías y Subcategorías:** CRUD jerárquico (la subcategoría depende de una categoría padre).
   - **Estados:** Configuración de `ProdEstado` y `PedidoEstado`.
   - **Eventos:** Gestión y vinculación N:M de productos a eventos (`ProdEvento`).
   - **Clientes y Notificaciones:** Vista de lectura del registro de clientes y log de notificaciones (enviado, fallido, pendiente).
---
### 4. Entregables Requeridos en Código
Genera código modular, comentado y listo para producción que incluya:
1. **`tailwind.config.js`**: Extensión de la paleta de colores personalizada, sombras Kawaii y bordes redondeados.
2. **Estructura de Carpetas**: Representación visual en árbol de la organización del proyecto.
3. **`src/routes/AppRoutes.jsx`**: Configuración de React Router v6 usando layouts persistentes (`MainLayout`, `AdminLayout`) y componentes de rutas protegidas.
4. **`src/api/axios.js`**: Instancia centralizada de Axios con interceptores.
5. **Componentes Clave Codificados:**
   - **`Navbar.jsx`**: Responsive con animación en logo, links activos, buscador y badge de carrito.
   - **`ProductCard.jsx`**: Tarjeta de producto Kawaii con Framer Motion, badges de eventos/combos y micro-interacciones.
   - **`AddToCartModal.jsx`**: Modal animado que captura la cantidad y el `TextoPersonalizado`.

Si lo necesitas usa Datos mock + capa de servicios lista
El proyecto tiene dos sistemas grandes (tienda cliente + panel admin). Si puedes, con lo que ya está hecho y lo que falta, haz la entrega de ambos: tienda + panel admin
Mi backend actual solo tiene tabla Cliente (sin usuarios/login ni rol). Si puedes usa JWT contra mi API

Todavía le quedaba por crear:
Tienda cliente: home, catalogo con filtros, detalle de producto (combos + texto personalizado), carrito, checkout y mis pedidos

Panel admin: layout con sidebar, dashboard y DataTable generico con CRUD (categorias, subcategorias, estados, eventos)

Panel admin avanzado: productos (combos/eventos), clientes, pedidos con renglones y cambio de estado, notificaciones

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e26c5a67-0d1e-403a-ab2c-ea3dd91d2fe2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
