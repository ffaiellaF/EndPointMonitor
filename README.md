# API Endpoint Monitor

Panel web local para consultar periódicamente endpoints HTTP configurados en `.env`.

## Requisitos
- Node.js 18 o superior (usa `fetch` nativo).

## Instalación
1. Copiar `.env.example` como `.env`.
2. Editar `BASE_URL` y `ENDPOINTS_JSON`.
3. Instalar dependencias: `npm install`.
4. Iniciar: `npm start`.
5. Abrir `http://localhost:3000`.

## Configuración de endpoints
`ENDPOINTS_JSON` es un array JSON. Cada elemento admite:
- `id`: identificador visible.
- `description`: descripción breve del endpoint.
- `method`: GET, POST, PUT, PATCH, DELETE, HEAD u OPTIONS.
- `path`: ruta relativa a `BASE_URL`.
- `headers`: objeto de headers HTTP.
- `body`: body opcional (no se envía en GET/HEAD).
- `expectedStatus`: código esperado o array de códigos válidos.

Se pueden interpolar variables de entorno en headers y body, por ejemplo `${API_TOKEN}`. Los headers con nombres sensibles (Authorization, token, API key, secret, cookie) se enmascaran en la interfaz. El monitor no guarda historial: muestra el último resultado de cada endpoint.

## Seguridad y alcance
- Las peticiones se ejecutan desde el servidor Node, no desde el navegador; así se evita CORS y no se exponen credenciales al frontend.
- `.env` está excluido de Git mediante `.gitignore`. No compartas tokens ni subas el `.env` al repositorio.
- El panel muestra URL, método, headers visibles, body enviado, headers y body de respuesta.
- Es un monitor de disponibilidad/estado HTTP; no valida reglas de negocio del JSON.
