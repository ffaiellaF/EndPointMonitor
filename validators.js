// Catálogo de funciones de validación reutilizables para los endpoints.
//
// Cada función recibe un único argumento llamado `respuesta`, que es un objeto
// preparado por server.js con esta forma:
//
// {
//   statusCode: 200,            // número: código de estado HTTP
//   statusText: 'OK',           // texto: mensaje del estado HTTP
//   headers: { ... },           // objeto: headers de la respuesta
//   bodyTexto: '...',           // texto: body formateado para mostrar
//   bodyJson: { ... } | null,   // objeto/array: body parseado como JSON (o null)
//   bodyCrudo: '...'            // texto: body exacto tal como vino
// }
//
// Cada función debe devolver:
//   - { valid: true|false, message: '...', actual: valorOpcional }
//   - true o false
//   - un array con varias de las opciones anteriores

function jsonValido(respuesta) {
  if (respuesta.bodyJson == null) {
    return { valid: false, message: 'La respuesta no es un JSON válido.' };
  }
  return { valid: true, message: 'La respuesta es un JSON válido.' };
}

function respuestaConDatos(respuesta) {
  const json = jsonValido(respuesta);
  if (!json.valid) return json;

  if (Array.isArray(respuesta.bodyJson) && respuesta.bodyJson.length === 0) {
    return { valid: false, message: 'La respuesta no debe ser un array vacío.' };
  }

  if (respuesta.bodyJson && typeof respuesta.bodyJson === 'object' && Object.keys(respuesta.bodyJson).length === 0) {
    return { valid: false, message: 'La respuesta no debe ser un objeto vacío.' };
  }

  return { valid: true, message: 'La respuesta contiene datos.' };
}

function campoPresente(campo) {
  return (respuesta) => {
    if (!respuesta.bodyJson || !(campo in respuesta.bodyJson)) {
      return { valid: false, message: `La respuesta debe incluir el campo "${campo}".` };
    }
    return { valid: true, message: `El campo "${campo}" está presente.` };
  };
}

function estadoEsperado(...estados) {
  return (respuesta) => {
    const ok = estados.includes(respuesta.statusCode);
    return {
      valid: ok,
      message: ok
        ? `El status ${respuesta.statusCode} es válido.`
        : `Se esperaba ${estados.join(' o ')} y se recibió ${respuesta.statusCode}.`
    };
  };
}

function estado200(respuesta) {
  const ok = respuesta.statusCode === 200;
  return {
    valid: ok,
    message: ok
      ? 'El status code es 200.'
      : `Se esperaba 200 y se recibió ${respuesta.statusCode}.`
  };
}

function noArrayVacio(respuesta) {
  if (Array.isArray(respuesta.bodyJson) && respuesta.bodyJson.length === 0) {
    return { valid: false, message: 'La respuesta no debe ser un array vacío.' };
  }
  return { valid: true, message: 'La respuesta no es un array vacío.' };
}

module.exports = {
  jsonValido,
  respuestaConDatos,
  campoPresente,
  estadoEsperado,
  estado200,
  noArrayVacio
};