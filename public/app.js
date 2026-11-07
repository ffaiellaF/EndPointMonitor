const $ = id => document.getElementById(id);
let intervalMs = 30000;
let countdown = 0;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pretty = value => value == null ? '—' : (typeof value === 'string' ? value : JSON.stringify(value, null, 2));
function fmtDate(value){if(!value)return '—';return new Date(value).toLocaleString('es-AR');}
function render(data){
  // Guardar qué detalles están abiertos antes de renderizar
  const openDetails = new Set();
  document.querySelectorAll('.details:not([hidden])').forEach(el => {
    openDetails.add(el.id);
  });
  
  intervalMs = data.intervalMs || intervalMs;
  $('baseUrl').textContent = `URL base: ${data.baseUrl || 'No configurada'}`;
  const results = data.results || [];
  $('total').textContent = results.length;
  $('up').textContent = results.filter(x=>x.state==='UP').length;
  $('down').textContent = results.filter(x=>x.state==='DOWN').length;
  $('lastRun').textContent = fmtDate(data.lastRun);
  $('configError').textContent = data.configError || '';
  $('configError').classList.toggle('hidden', !data.configError);
  $('nextRun').textContent = `Actualización automática cada ${Math.round(intervalMs/1000)} segundos`;
  if(!results.length){$('endpointList').innerHTML = '<div class="loading">No hay resultados para mostrar. Revisá la configuración del .env.</div>';return;}
  $('endpointList').innerHTML = results.map((r,i)=>{
    const detailsId = `details-${i}`;
    const reqHeaders = pretty(r.request?.headers || {});
    const resHeaders = pretty(r.response?.headers || {});
    const reqBody = pretty(r.request?.body);
    const resBody = pretty(r.response?.body || 'Sin contenido');
    return `<article class="endpoint"><div class="endpoint-head" role="button" tabindex="0" aria-expanded="false" aria-controls="${detailsId}" onclick="toggleDetails('${detailsId}',this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleDetails('${detailsId}',this)}"><span class="method ${esc(r.method.toLowerCase())}">${esc(r.method)}</span><div class="summary"><strong>${esc(r.id)}</strong><code>${esc(r.url)}</code><div class="description">${esc(r.description)}</div></div><span class="pill ${r.state==='UP'?'up':'down'}">${r.state==='UP'?'OPERATIVO':'ERROR'}${r.status?` · ${r.status}`:''}</span><span class="timing">${r.durationMs} ms</span><span class="chevron">⌄</span></div><div class="details" id="${detailsId}" hidden><div class="detail-block full"><h3>URL completa de la petición</h3><div class="url">${esc(r.url)}</div></div><div class="detail-block"><h3>Request · Headers</h3><pre>${esc(reqHeaders)}</pre></div><div class="detail-block"><h3>Request · Body</h3><pre>${esc(reqBody)}</pre></div><div class="detail-block"><h3>Response · Headers</h3><pre>${esc(resHeaders)}</pre></div><div class="detail-block"><h3>Response · Body</h3><pre>${esc(resBody)}</pre></div>${r.error?`<div class="detail-block full"><h3>Error</h3><div class="error-text">${esc(r.error)}</div></div>`:''}<div class="detail-block full"><h3>Resultado</h3><div class="muted">Esperado: HTTP ${esc((r.expectedStatus||[]).join(', '))} · Recibido: ${esc(r.status ?? r.statusText)} · Tiempo: ${r.durationMs} ms · Fecha: ${esc(fmtDate(r.checkedAt))}</div></div></div></article>`;
  }).join('');
  
  // Restaurar los detalles que estaban abiertos
  openDetails.forEach(id => {
    const el = $(id);
    const head = document.querySelector(`[aria-controls="${id}"]`);
    if (el && head) {
      el.hidden = false;
      head.setAttribute('aria-expanded', 'true');
    }
  });
}
function toggleDetails(id, head){const el=$(id);el.hidden=!el.hidden;head.setAttribute('aria-expanded',String(!el.hidden));}
async function load(){try{const res=await fetch('/api/status');render(await res.json());}catch(e){$('configError').textContent='No se pudo conectar con el servidor del monitor.';$('configError').classList.remove('hidden');}}
$('refresh').addEventListener('click',async()=>{const b=$('refresh');b.disabled=true;b.textContent='Consultando…';try{const res=await fetch('/api/check',{method:'POST'});render(await res.json());}finally{b.disabled=false;b.textContent='↻ Ejecutar ahora';}});
load();setInterval(load,5000);
