require('dotenv').config();
const express = require('express');
const path = require('path');
const { endpoints } = require('./data');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = Number(process.env.PORT || 3000);
const BASE_URL = (process.env.BASE_URL || '').trim().replace(/\/+$/, '');
const INTERVAL = Math.max(5000, Number(process.env.POLL_INTERVAL_MS || 30000));
const TIMEOUT = Math.max(1000, Number(process.env.REQUEST_TIMEOUT_MS || 15000));


// Cache de tokens por endpoint (clave: loginUrl + JSON.stringify(loginBody))
const tokenCache = new Map();
let loginRequestCount = 0;

function expandEnv(value) {
  if (typeof value === 'string') {
    return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => process.env[key] || '');
  }
  if (Array.isArray(value)) return value.map(expandEnv);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, expandEnv(v)]));
  }
  return value;
}

function loadEndpoints() {
  if (!BASE_URL) throw new Error('Falta configurar BASE_URL en el archivo .env');
  if (!Array.isArray(endpoints) || endpoints.length === 0) throw new Error('El array de endpoints debe contener al menos un endpoint.');
  return endpoints.map((ep, i) => {
    if (!ep.path || !ep.method) throw new Error(`El endpoint en la posición ${i} necesita path y method.`);
    const method = String(ep.method).toUpperCase();
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) throw new Error(`Método no permitido en ${ep.id || i}: ${method}`);
    const useBaseUrl = ep.useBaseUrl !== false;
    const url = useBaseUrl
      ? new URL(String(ep.path).replace(/^\/+/ , ''), BASE_URL + '/').toString()
      : String(ep.path);
    
    // Procesar configuración de autenticación si existe
    let authConfig = null;
    if (ep.auth && ep.auth.loginBody) {
      // Usar AUTH_LOGIN_URL del .env o el loginUrl del endpoint si está definido
      const loginUrl = ep.auth.loginUrl || process.env.AUTH_LOGIN_URL;
      if (loginUrl) {
        authConfig = {
          loginUrl: expandEnv(loginUrl),
          loginBody: expandEnv(ep.auth.loginBody)
        };
      }
    }
    
    return {
      id: String(ep.id || `endpoint-${i + 1}`),
      description: String(ep.description || 'Sin descripción'),
      method,
      url,
      headers: expandEnv(ep.headers || {}),
      body: ep.body === undefined ? undefined : expandEnv(ep.body),
      expectedStatus: Array.isArray(ep.expectedStatus) ? ep.expectedStatus.map(Number) : [Number(ep.expectedStatus || 200)],
      auth: authConfig
    };
  });
}

function maskHeaders(headers) {
  // Solo enmascarar headers sensibles excepto Authorization (para debug)
  const sensitive = /token|api[-_]?key|secret|cookie/i;
  return Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [key, sensitive.test(key) ? (value ? '•••••••• (oculto)' : '') : String(value)]));
}

function getCacheKey(loginUrl, loginBody) {
  return `${loginUrl}::${JSON.stringify(loginBody)}`;
}

async function getAuthToken(loginUrl, loginBody) {
  const cacheKey = getCacheKey(loginUrl, loginBody);
  const cached = tokenCache.get(cacheKey);
  
  // Si hay tokens válidos en caché, usarlos
  if (cached && cached.accessToken && cached.redirectToken && cached.expiry && Date.now() < cached.expiry) {
    return { accessToken: cached.accessToken, redirectToken: cached.redirectToken };
  }

  try {
    loginRequestCount++;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginBody),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Error en login (${loginUrl}): ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Extraer access_token para el header Authorization
    const accessToken = data.token?.access_token || data.access_token || data.ACCESS_TOKEN;
    // Extraer redirectToken (UUID) para la cookie userToken
    const redirectToken = data.redirectToken;
    
    if (!accessToken || !redirectToken) {
      console.error('No se encontró access_token o redirectToken en la respuesta del login');
      return null;
    }

    // Guardar ambos tokens y calcular expiración
    const expiresIn = data.token?.expires_in || 25200; // segundos (7 horas)
    const expiry = Date.now() + (expiresIn * 1000) - 60000; // 1 minuto de margen
    
    // Guardar objeto con ambos tokens
    tokenCache.set(cacheKey, {
      accessToken,
      redirectToken,
      expiry
    });
    
    return { accessToken, redirectToken };
  } catch (error) {
    console.error('Error obteniendo token de autenticación:', error.message);
    return null;
  }
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return { body: '', truncated: false };
  const max = 20000;
  let body = text;
  try { body = JSON.stringify(JSON.parse(text), null, 2); } catch (_) {}
  return { body: body.length > max ? body.slice(0, max) + '\n… respuesta truncada …' : body, truncated: body.length > max };
}

async function checkEndpoint(ep) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);
  const requestHeaders = { ...ep.headers };
  
  // Si el endpoint tiene configuración de autenticación, obtener y agregar los tokens
  if (ep.auth) {
    const tokens = await getAuthToken(ep.auth.loginUrl, ep.auth.loginBody);
    if (tokens && tokens.accessToken && tokens.redirectToken) {
      requestHeaders['Authorization'] = `Bearer ${tokens.accessToken}`;
      // Agregar cookie userToken con el redirectToken (UUID)
      requestHeaders['Cookie'] = `userToken=${tokens.redirectToken}`;
    } else {
      return {
        id: ep.id, description: ep.description, method: ep.method, url: ep.url,
        status: null, statusText: 'Error de autenticación',
        ok: false, state: 'DOWN', durationMs: 0, checkedAt: new Date().toISOString(),
        error: `No se pudo obtener el token de autenticación desde ${ep.auth.loginUrl}. Verifique la configuración de auth en el endpoint.`,
        request: { headers: maskHeaders(requestHeaders), body: null },
        response: { headers: {}, body: '' }, expectedStatus: ep.expectedStatus
      };
    }
  }
  
  const options = { method: ep.method, headers: requestHeaders, signal: controller.signal };
  if (ep.body !== undefined && !['GET', 'HEAD'].includes(ep.method)) {
    options.body = typeof ep.body === 'string' ? ep.body : JSON.stringify(ep.body);
    if (!Object.keys(requestHeaders).some(k => k.toLowerCase() === 'content-type')) requestHeaders['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(ep.url, options);
    const responseData = await readResponse(response);
    const durationMs = Date.now() - started;
    const ok = ep.expectedStatus.includes(response.status);
    return {
      id: ep.id, description: ep.description, method: ep.method, url: ep.url,
      status: response.status, statusText: response.statusText, ok, state: ok ? 'UP' : 'DOWN',
      durationMs, checkedAt: new Date().toISOString(),
      request: { headers: maskHeaders(requestHeaders), body: options.body || null },
      response: { headers: Object.fromEntries(response.headers.entries()), body: responseData.body, truncated: responseData.truncated },
      expectedStatus: ep.expectedStatus
    };
  } catch (error) {
    const durationMs = Date.now() - started;
    return {
      id: ep.id, description: ep.description, method: ep.method, url: ep.url,
      status: null, statusText: error.name === 'AbortError' ? 'Timeout' : 'Error de conexión',
      ok: false, state: 'DOWN', durationMs, checkedAt: new Date().toISOString(),
      error: error.name === 'AbortError' ? `La petición superó el timeout de ${TIMEOUT} ms.` : error.message,
      request: { headers: maskHeaders(requestHeaders), body: options.body || null },
      response: { headers: {}, body: '' }, expectedStatus: ep.expectedStatus
    };
  } finally { clearTimeout(timeout); }
}

let latest = [];
let lastRun = null;
let running = false;
let configError = null;

async function runChecks() {
  if (running) return;
  running = true;
  try {
    const endpoints = loadEndpoints();
    latest = await Promise.all(endpoints.map(checkEndpoint));
    lastRun = new Date().toISOString();
    configError = null;
  } catch (error) { configError = error.message; }
  finally { running = false; }
}

app.get('/api/status', async (_req, res) => {
  if (!lastRun && !configError) await runChecks();
  res.json({ baseUrl: BASE_URL, intervalMs: INTERVAL, lastRun, running, configError, results: latest });
});

app.post('/api/check', async (_req, res) => {
  await runChecks();
  res.json({ lastRun, configError, results: latest });
});

app.listen(PORT, async () => {
  console.log(`API Endpoint Monitor disponible en http://localhost:${PORT}`);
  await runChecks();
  setInterval(runChecks, INTERVAL);
});
