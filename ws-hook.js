(function() {
  if (window.__st_ws_hooked) return;
  window.__st_ws_hooked = true;
  window.__st_last_token = null;

  const OrigWS = window.WebSocket;
  function HookedWS(url, protocols) {
    const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
    const origSend = ws.send.bind(ws);
    ws.send = function(data) {
      if (typeof data === 'string' && data.indexOf('42["auth"') === 0) {
        window.__st_last_token = data;
        window.dispatchEvent(new CustomEvent('__st_token_captured', { detail: { token: data } }));
      }
      return origSend(data);
    };
    return ws;
  }
  HookedWS.prototype = OrigWS.prototype;
  Object.keys(OrigWS).forEach(function(k) { try { HookedWS[k] = OrigWS[k]; } catch(e) {} });
  window.WebSocket = HookedWS;
})();