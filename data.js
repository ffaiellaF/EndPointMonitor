// Configuración de endpoints para monitoreo
// Este archivo contiene la definición de todos los endpoints a monitorear
// Las URLs base, credenciales y rutas se configuran en el archivo .env

// Usar variables de entorno para credenciales
const IDUSUARIO_ADMIN_ART = process.env.IDUSUARIO_ADMIN_ART || '572817';
const CONTRATO_ADMIN_ART = process.env.CONTRATO_ADMIN_ART || '8064';
const EMAIL_ADMIN_ART = process.env.EMAIL_ADMIN_ART || 'ffaiella@provart.com.ar';
const CUIT_ADMIN_ART = process.env.CUIT_ADMIN_ART || '20389461915';

const IDUSUARIO_ADMIN_WEB = process.env.IDUSUARIO_ADMIN_WEB || '923664';
const CONTRATO_ADMIN_WEB = process.env.CONTRATO_ADMIN_WEB || '242383';
const EMAIL_ADMIN_WEB = process.env.EMAIL_ADMIN_WEB || 'msprovart8@gmail.com';
const CUIT_ADMIN_WEB = process.env.CUIT_ADMIN_WEB || '20389467575';

const IDUSUARIO_A = process.env.IDUSUARIO_A || '923664';
const CONTRATO_USUARIO_A = process.env.CONTRATO_USUARIO_A || '242383';
const EMAIL_A = process.env.EMAIL_A || 'msprovart8@gmail.com';
const CUIT_A = process.env.CUIT_A || '20389467575';

// Usar variables de entorno para rutas de endpoints
const ENDPOINT_CARGO_PATH = process.env.ENDPOINT_CARGO_PATH || '/core/organization/v1/parametros/cargo';
const ENDPOINT_AREA_PATH = process.env.ENDPOINT_AREA_PATH || '/core/organization/v1/parametros/area';
const ENDPOINT_USUARIOS_PATH = process.env.ENDPOINT_USUARIOS_PATH || '/atencion-al-cliente/administracion-usuario/v2/usuarios';
const ENDPOINT_SOLICITUDES_PATH = process.env.ENDPOINT_SOLICITUDES_PATH || '/atencion-al-cliente/administracion-usuario/v2/solicitudes';
const ENDPOINT_MOTIVOS_RECHAZO_PATH = process.env.ENDPOINT_MOTIVOS_RECHAZO_PATH || '/atencion-al-cliente/administracion-usuario/v2/solicitudes/motivos-rechazo';
const ENDPOINT_FUNCIONALIDADES_PATH = process.env.ENDPOINT_FUNCIONALIDADES_PATH || '/atencion-al-cliente/administracion-usuario/v2/funcionalidades';

const endpoints = [
  {
    "id": "Consulta los cargos disponibles",
    "description": "Cargos disponibles",
    "method": "GET",
    "path": ENDPOINT_CARGO_PATH,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json"
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta las áreas disponibles",
    "description": "Consulta las áreas disponibles",
    "method": "GET",
    "path": ENDPOINT_AREA_PATH,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json"
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta usuarios - Usuario logueado ADMIN ART",
    "description": "Consulta usuarios - Usuario logueado ADMIN ART",
    "method": "GET",
    "path": `${ENDPOINT_USUARIOS_PATH}?idUsuario=${IDUSUARIO_ADMIN_ART}`,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "auth": {
      // loginUrl se construye usando AUTH_LOGIN_URL del .env
      "loginBody": {
        "idUsuario": Number(IDUSUARIO_ADMIN_ART),
        "contrato": Number(CONTRATO_ADMIN_ART),
        "email": String(EMAIL_ADMIN_ART),
        "cuit": String(CUIT_ADMIN_ART)
      }
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta usuarios - Usuario logueado ADMIN WEB",
    "description": "Consulta usuarios - Usuario logueado ADMIN WEB",
    "method": "GET",
    "path": `${ENDPOINT_USUARIOS_PATH}?idUsuario=${IDUSUARIO_ADMIN_WEB}`,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "auth": {
      // loginUrl se construye usando AUTH_LOGIN_URL del .env
      "loginBody": {
        "idUsuario": Number(IDUSUARIO_ADMIN_WEB),
        "contrato": Number(CONTRATO_ADMIN_WEB),
        "email": String(EMAIL_ADMIN_WEB),
        "cuit": String(CUIT_ADMIN_WEB)
      }
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta solicitudes - Usuario logueado ADMIN ART",
    "description": "Consulta solicitudes - Usuario logueado ADMIN ART",
    "method": "GET",
    "path": `${ENDPOINT_SOLICITUDES_PATH}?idUsuario=${IDUSUARIO_ADMIN_ART}`,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "auth": {
      // loginUrl se construye usando AUTH_LOGIN_URL del .env
      "loginBody": {
        "idUsuario": Number(IDUSUARIO_ADMIN_ART),
        "contrato": Number(CONTRATO_ADMIN_ART),
        "email": String(EMAIL_ADMIN_ART),
        "cuit": String(CUIT_ADMIN_ART)
      }
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta solicitudes - Usuario logueado ADMIN WEB",
    "description": "Consulta solicitudes - Usuario logueado ADMIN WEB",
    "method": "GET",
    "path": `${ENDPOINT_SOLICITUDES_PATH}?idUsuario=${IDUSUARIO_ADMIN_WEB}`,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "auth": {
      // loginUrl se construye usando AUTH_LOGIN_URL del .env
      "loginBody": {
        "idUsuario": Number(IDUSUARIO_ADMIN_WEB),
        "contrato": Number(CONTRATO_ADMIN_WEB),
        "email": String(EMAIL_ADMIN_WEB),
        "cuit": String(CUIT_ADMIN_WEB)
      }
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta motivos de rechazo - Usuario logueado ADMIN ART",
    "description": "Consulta motivos de rechazo - Usuario logueado ADMIN ART",
    "method": "GET",
    "path": ENDPOINT_MOTIVOS_RECHAZO_PATH,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "auth": {
      "loginBody": {
        "idUsuario": Number(IDUSUARIO_ADMIN_ART),
        "contrato": Number(CONTRATO_ADMIN_ART),
        "email": String(EMAIL_ADMIN_ART),
        "cuit": String(CUIT_ADMIN_ART)
      }
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta motivos de rechazo - Usuario logueado ADMIN WEB",
    "description": "Consulta motivos de rechazo - Usuario logueado ADMIN WEB",
    "method": "GET",
    "path": ENDPOINT_MOTIVOS_RECHAZO_PATH,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "auth": {
      "loginBody": {
        "idUsuario": Number(IDUSUARIO_ADMIN_WEB),
        "contrato": Number(CONTRATO_ADMIN_WEB),
        "email": String(EMAIL_ADMIN_WEB),
        "cuit": String(CUIT_ADMIN_WEB)
      }
    },
    "expectedStatus": [200]
  },
  {
    "id": "Consulta funcionalidades[Solapa Usuarios] - Usuario logueado ADMIN ART",
    "description": "Consulta funcionalidades - Usuario logueado ADMIN ART",
    "method": "GET",
    "path": `${ENDPOINT_FUNCIONALIDADES_PATH}?contrato=${CONTRATO_USUARIO_A}&idUsuario=${IDUSUARIO_A}`,
    "useBaseUrl": true,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "auth": {
      "loginBody": {
        "idUsuario": Number(IDUSUARIO_ADMIN_ART),
        "contrato": Number(CONTRATO_ADMIN_ART),
        "email": String(EMAIL_ADMIN_ART),
        "cuit": String(CUIT_ADMIN_ART)
      }
    },
    "expectedStatus": [200]
  },
  {
    "id": "SERVIDOR FEDE",
    "description": "Consulta solicitudes - Usuario logueado ADMIN WEB",
    "method": "GET",
    "path": `http://localhost:3001/hora`,
    "useBaseUrl": false,
    "headers": {
      "Accept": "application/json",
      "Consumidor": "CLIENTES"
    },
    "expectedStatus": [200]
  }
];

module.exports = { endpoints };
