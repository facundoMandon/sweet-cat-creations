# Ubicación de entrega con Google Maps

Sí, es totalmente posible. El cliente elige su ubicación en un mapa al hacer el pedido, y vos la ves en el panel admin con un botón para abrir Google Maps y navegar hasta ahí.

## Qué se construye

### 1. Conector de Google Maps
Se conecta el conector Google Maps del workspace (aparece una tarjeta para aprobarlo). Da:
- clave de navegador para mostrar el mapa y el autocompletado de direcciones
- acceso servidor para geocodificar direcciones escritas a mano

### 2. Checkout: selector de ubicación
En el paso de dirección se agrega:
- Buscador de dirección con autocompletado (Places API New)
- Mapa con un marcador arrastrable para ajustar el punto exacto
- Botón "Usar mi ubicación actual" (geolocalización del navegador)
- Campo libre para referencias ("timbre 3B, portón negro")
- Se sigue pudiendo usar la dirección guardada del perfil; si esa no tiene coordenadas, se geocodifica al confirmar

### 3. Guardar la ubicación en el pedido
El pedido pasa a guardar su propia dirección de entrega, no solo la del cliente:
- dirección formateada, latitud, longitud, place_id y referencias

También se guardan las coordenadas en el perfil del cliente para que la próxima compra ya venga cargada.

### 4. Panel admin: consultar y navegar
En el detalle del pedido (y en la fila de la tabla):
- Dirección completa + referencias
- Mini-mapa embebido con el marcador
- Botón "Abrir en Google Maps" / "Cómo llegar" que abre la app de Maps en el celular con la ruta hasta el punto

### 5. WhatsApp y calendario
- El mensaje de WhatsApp del pedido incluye el link corto de Maps a la ubicación
- El evento de Google Calendar del recordatorio incluye la ubicación (campo `location`), así se puede tocar y navegar desde el calendario

## Detalles técnicos

- **Backend (`Backend/src`)**: nuevas columnas en el modelo `Pedido`: `PedidoDireccion` (string), `PedidoLat` / `PedidoLng` (decimal, nullable), `PedidoPlaceID` (string, nullable), `PedidoReferencias` (text, nullable). En `Cliente`: `ClienteLat`, `ClienteLng`, `ClientePlaceID`. Se validan en `pedido.service.ts` al crear/actualizar (lat -90..90, lng -180..180) y se devuelven en el `include`. Sincronización de esquema por el `sequelize.sync`/script existente.
- **Geocodificación**: se hace vía el gateway del conector desde una server function de TanStack (`src/lib/maps.functions.ts`), nunca con la clave de navegador. Se cachea por dirección para no repetir llamadas.
- **Frontend**: componente `src/components/store/location-picker.tsx` que carga la Maps JS API con `loading=async` + callback, usa `google.maps.Marker` (sin `mapId`) y `AutocompleteSuggestion` de Places API (New). Se carga con `React.lazy` detrás de `ClientOnly` para no romper el SSR.
- **Tipos**: se extienden `Pedido` y `Cliente` en `src/lib/types.ts`; el picker se configura desde `src/config/` (centro y zoom por defecto, país de sesgo) para mantener el sitio white-label.
- **Admin**: `admin.pedidos.tsx` muestra el mapa embebido (`maps/embed/v1/place`) y el link `https://www.google.com/maps/dir/?api=1&destination=lat,lng`.
- **Costos**: el autocompletado se hace con debounce y session token, y la geocodificación solo corre al confirmar un pedido, para mantener bajo el uso de la API.

## Fuera de alcance por ahora
- Cálculo de costo de envío por distancia
- Optimización de ruta con varios pedidos del día
