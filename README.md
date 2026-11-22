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
- `validate`: función opcional `(respuesta) => resultado` que se ejecuta después de recibir la respuesta. Recibe un objeto con `statusCode`, `statusText`, `headers`, `bodyTexto` (texto formateado), `bodyJson` (JSON parseado o `null`) y `bodyCrudo` (texto crudo). Puede devolver:
  - `{ valid: true|false, message: '...', actual: valor }`
  - `true` / `false`
  - un array con varias de las opciones anteriores.

Ejemplo de validación de estructura:

```js
"validate": (respuesta) => {
  if (!respuesta.bodyJson) {
    return { valid: false, message: 'La respuesta no es un JSON válido.' };
  }
  if (!Array.isArray(respuesta.bodyJson.data)) {
    return { valid: false, message: 'Falta el array data.' };
  }
  return { valid: true, message: 'Estructura correcta.' };
}
```

Las validaciones pueden centralizarse en [`validators.js`](validators.js) e importarse en `data.js`:

```js
const { respuestaConDatos, campoPresente } = require('./validators');

// ...
"validate": respuestaConDatos,
"validate": campoPresente('hora')
```

Se pueden interpolar variables de entorno en headers y body, por ejemplo `${API_TOKEN}`. Los headers con nombres sensibles (Authorization, token, API key, secret, cookie) se enmascaran en la interfaz. El monitor no guarda historial: muestra el último resultado de cada endpoint.

## Seguridad y alcance
- Las peticiones se ejecutan desde el servidor Node, no desde el navegador; así se evita CORS y no se exponen credenciales al frontend.
- `.env` está excluido de Git mediante `.gitignore`. No compartas tokens ni subas el `.env` al repositorio.
- El panel muestra URL, método, headers visibles, body enviado, headers y body de respuesta.
- El monitor valida disponibilidad/estado HTTP y, si el endpoint define `validate`, también reglas de negocio sobre la respuesta.
