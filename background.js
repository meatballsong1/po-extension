// background.js — SignalTrack Auto-Login Orchestrator
// Flow:
//   1. Watches all tabs for pocketoption.com
//   2. Once PO tab is found, injects a script to intercept WebSocket & grab 42["auth",...]
//   3. When token is captured, finds localhost:8080 tab and injects the auto-login

const ST_HOSTS = ['localhost', '127.0.0.1'];

function isPOTab(tab) {
  return tab && tab.url && tab.url.includes('pocketoption.com');
}

function isSTTab(tab) {
  if (!tab || !tab.url) return false;
  try { return ST_HOSTS.includes(new URL(tab.url).hostname); }
  catch(e) { return false; }
}

// ── Inject WS hook into PocketOption tab ────────────────────────────
// Returns token via callback once captured
function hookPOTab(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    world: 'MAIN', // runs in page context so it can intercept WebSocket
    func: function() {
      if (window.__st_ws_hooked) {
        // Already hooked — return existing token if we have one
        return window.__st_last_token || null;
      }
      window.__st_ws_hooked = true;
      window.__st_last_token = null;

      const OrigWS = window.WebSocket;
      function HookedWS(url, protocols) {
        const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
        const origSend = ws.send.bind(ws);
        ws.send = function(data) {
          if (typeof data === 'string' && data.indexOf('42["auth"') === 0) {
            window.__st_last_token = data;
            // Fire a custom event the content script can hear
            window.dispatchEvent(new CustomEvent('__st_token_captured', { detail: { token: data } }));
          }
          return origSend(data);
        };
        return ws;
      }
      HookedWS.prototype = OrigWS.prototype;
      Object.keys(OrigWS).forEach(function(k) { try { HookedWS[k] = OrigWS[k]; } catch(e) {} });
      window.WebSocket = HookedWS;

      return null; // hook installed, no token yet
    }
  }).then(results => {
    const token = results && results[0] && results[0].result;
    if (token) {
      // Already had a token from a previous WS send
      onTokenCaptured(token);
    }
    // Otherwise hook is now installed and will fire via message
  }).catch(() => {}); // tab may not be ready yet — that's fine
}

// ── Poll PO tab for the token (since we can't get async events from MAIN world easily) ──
let pollInterval = null;
let lastPOTabId = null;

function startPollingPOTab(tabId) {
  if (pollInterval) clearInterval(pollInterval);
  lastPOTabId = tabId;

  pollInterval = setInterval(function() {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: 'MAIN',
      func: function() { return window.__st_last_token || null; }
    }).then(results => {
      const token = results && results[0] && results[0].result;
      if (token) {
        clearInterval(pollInterval);
        pollInterval = null;
        onTokenCaptured(token);
      }
    }).catch(() => {
      clearInterval(pollInterval);
      pollInterval = null;
    });
  }, 1000); // check every second
}

// ── When we have a token, send it to SignalTrack ─────────────────────
function onTokenCaptured(token) {
  chrome.storage.local.set({ st_session_token: token, st_token_ts: Date.now() });

  // Respect user's auto-login preference
  chrome.storage.local.get({ st_autologin: true }, function(prefs) {
    if (!prefs.st_autologin) return; // user disabled it

    chrome.tabs.query({}, function(tabs) {
      const stTab = tabs.find(isSTTab);
      if (!stTab) return; // ST not open — token stored, used when ST opens
      injectAutoLogin(stTab.id, token, 6);
    });
  });
}

function injectAutoLogin(tabId, token, attempts) {
  if (attempts <= 0) return;

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    world: 'MAIN',
    func: function(tok) {
      const input = document.getElementById('ssidInput');
      if (!input) return false;

      input.value = tok;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      setTimeout(function() {
        const btn = document.querySelector('button.btn.pri');
        if (btn) btn.click();
        else if (typeof window.doConnect === 'function') window.doConnect();
      }, 300);

      return true;
    },
    args: [token]
  }).then(results => {
    const ok = results && results[0] && results[0].result;
    if (!ok) {
      // ssidInput not found yet — ST page still loading
      setTimeout(function() { injectAutoLogin(tabId, token, attempts - 1); }, 1500);
    }
  }).catch(() => {
    setTimeout(function() { injectAutoLogin(tabId, token, attempts - 1); }, 1500);
  });
}

// ── Also inject the extension-detected signal into SignalTrack ────────
function signalExtensionPresent(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    world: 'MAIN',
    func: function() {
      window.__st_extension_present = true;
      window.dispatchEvent(new CustomEvent('__st_extension_ready'));
    }
  }).catch(() => {});
}

// ── Watch all tab loads ───────────────────────────────────────────────
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status !== 'complete') return;

  if (isPOTab(tab)) {
    hookPOTab(tabId);
    startPollingPOTab(tabId);

    // If we already have a stored token, re-check if ST is open
    chrome.storage.local.get(['st_session_token', 'st_token_ts'], function(d) {
      if (!d.st_session_token) return;
      const age = Date.now() - (d.st_token_ts || 0);
      if (age > 8 * 60 * 60 * 1000) return; // ignore if older than 8h
      chrome.tabs.query({}, function(tabs) {
        const stTab = tabs.find(isSTTab);
        if (stTab) injectAutoLogin(stTab.id, d.st_session_token, 4);
      });
    });
  }

  if (isSTTab(tab)) {
    // ST just opened or refreshed
    signalExtensionPresent(tabId);

    // Do we have a token already?
    chrome.storage.local.get(['st_session_token', 'st_token_ts', 'st_autologin'], function(d) {
      if (!d.st_session_token) return;
      if (d.st_autologin === false) return; // user disabled auto-login
      const age = Date.now() - (d.st_token_ts || 0);
      if (age > 8 * 60 * 60 * 1000) return; // too old
      setTimeout(function() { injectAutoLogin(tabId, d.st_session_token, 6); }, 1200);
    });
  }
});

// ── Also hook any already-open PO tabs when extension first loads ─────
chrome.tabs.query({}, function(tabs) {
  tabs.forEach(function(tab) {
    if (isPOTab(tab) && tab.status === 'complete') {
      hookPOTab(tab.id);
      startPollingPOTab(tab.id);
    }
    if (isSTTab(tab) && tab.status === 'complete') {
      signalExtensionPresent(tab.id);
    }
  });
});

// ── Listen for messages from content script ───────────────────────────
chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.type === 'ST_TOKEN_READY' && msg.token) {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    onTokenCaptured(msg.token);
  }
  if (msg.type === 'ST_AUTOLOGIN_PREF') {
    chrome.storage.local.set({ st_autologin: !!msg.enabled });
  }

  if (msg.type === 'PO_OPEN_TAB' && msg.url) {
    chrome.tabs.create({ url: msg.url });
  }
});