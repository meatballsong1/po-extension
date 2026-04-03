// 1. CSS Masking & Overrides
const style = document.createElement('style');
style.innerHTML = `
    /* Anti-Flicker */
    .balance-info-block__label, .balance-item__label, .balance-item__bottom { visibility: hidden !important; }
    .ready .balance-info-block__label, .ready .balance-item__label, .ready .balance-item__bottom { visibility: visible !important; }
    
    /* Force the real-account bottom visible */
    .ready .balance-item[data-type="demo"] .balance-item__bottom,
    .ready .balance-item[data-type="demo"] .balance-item__bottom.hidden {
        display: grid !important;
        visibility: visible !important;
    }
    .ready .balance-item[data-type="real"] .balance-item__bottom {
        display: none !important;
    }

    a[href*="trading-profile"].btn-success { display: none !important; }
    body.is-verified-active .statuses p a { color: #24B15B !important; }
    body.is-guru-active .user-avatar, body.is-guru-active .profile-level, body.is-guru-active .profile-level__icon, body.is-guru-active .user-avatar.user-avatar--level-0 { color: #DE9C2B !important; }
    body.is-guru-active .your-level-badge { background-color: rgba(222, 156, 43, 0.1) !important; border: 1px solid #DE9C2B !important; }
    body.is-guru-active .your-level-badge a { color: #DE9C2B !important; font-weight: bold !important; }

    /* Hide "Trading on demo account" banner */
    .demo-account-banner, .demo-banner, .js-demo-banner,
    .trading-on-demo, .alert--demo, .demo-alert,
    [class*="demo-account-banner"], [class*="demo-warning"],
    .notification--demo, .header-demo-notice { display: none !important; }
`;
document.documentElement.appendChild(style);

const SVG_REAL = `<svg class="svg-icon qt-real" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M7.832 1.858C8.822 1.308 10.12 1 11.5 1c1.38 0 2.678.309 3.668.858C16.123 2.388 17 3.282 17 4.5v16.11c0 1.207-.901 2.069-1.842 2.57-.984.525-2.278.82-3.658.82s-2.673-.295-3.658-.82C6.901 22.68 6 21.818 6 20.61V4.5c0-1.218.877-2.111 1.832-2.642Z" clip-rule="evenodd"></path></svg>`;
const SVG_DEMO = `<svg class="svg-icon qt-demo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M12.034 3.115a1 1 0 0 1 .932 0l10.5 5.526a1 1 0 0 1 0 1.77l-3.887 2.046v5.47a1 1 0 0 1-.18.572l-.006.009.006-.008h-.001l-.002.003-.003.005-.01.012a2.324 2.324 0 0 1-.115.15 5.772 5.772 0 0 1-.324.365c-.282.292-.7.672-1.263 1.05-1.135.758-2.846 1.494-5.186 1.494s-4.05-.736-5.182-1.495a7.671 7.671 0 0 1-1.26-1.05 5.74 5.74 0 0 1-.438-.516l-.01-.012-.003-.006-.001-.002H5.6s.006.008.002.002l-.003-.003a1 1 0 0 1-.178-.57v-5.47L3 11.183v2.764a1 1 0 1 1-2 0v-4.42a1 1 0 0 1 .534-.886l10.5-5.526ZM7.421 13.51v4.059l.075.08c.197.204.504.487.93.773.847.567 2.174 1.157 4.07 1.157 1.894 0 3.224-.59 4.073-1.157a5.716 5.716 0 0 0 1.01-.855V13.51l-4.613 2.428a1 1 0 0 1-.932 0L7.421 13.51Z" clip-rule="evenodd"></path></svg>`;

// -- CONFIG
let CONFIG = {
    isEnabled: true, isGuruEnabled: false, isSpoofEnabled: false,
    isVerifiedEnabled: false, isStreamModeEnabled: false,
    streamMaskBalance: true, streamMaskId: true, streamMaskIp: true, streamMaskEmail: true,
    streamEmailAlias: 'diddy@rjktrades.com', customName: 'QT Real',
    spBranch: '13', spLevel: '87', spExp: '20,000', spTrades: '113',
    spTurnover: '$21,300.00', spProfit: '$4,225.00'
};

// ── Debounce helper — prevents observer thrashing ──────────────────────
let _swapTimeout = null;
function scheduleSwap() {
    if (_swapTimeout) return;
    _swapTimeout = setTimeout(() => { _swapTimeout = null; performInstantSwap(); }, 30);
}

const observer = new MutationObserver(scheduleSwap);

chrome.storage.local.get(null, (data) => {
    Object.assign(CONFIG, data);
    observer.disconnect();
    performInstantSwap();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
});

chrome.storage.onChanged.addListener((changes) => {
    for (let key in changes) CONFIG[key] = changes[key].newValue;
    observer.disconnect();
    performInstantSwap();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
});

function performInstantSwap() {
    try {
        // ── Body classes ───────────────────────────────────────────────
        if (document.body) {
            document.body.classList.toggle('is-guru-active',     !!(CONFIG.isEnabled && CONFIG.isGuruEnabled));
            document.body.classList.toggle('is-verified-active', !!(CONFIG.isEnabled && CONFIG.isVerifiedEnabled));
            document.body.classList.add('ready');
        }

        if (CONFIG.isEnabled === false) return;

        // ── Custom name swap ───────────────────────────────────────────
        // Replaces the account label text with CONFIG.customName
        if (CONFIG.customName) {
            const nameCandidates = document.querySelectorAll(
                '.balance-info-block__label, .js-balance-name, .user-name, .profile__name, .header__name'
            );
            nameCandidates.forEach(el => {
                if (el.dataset.qtOriginal === undefined) {
                    el.dataset.qtOriginal = el.textContent.trim();
                }
                if (el.textContent.trim() !== CONFIG.customName) {
                    el.textContent = CONFIG.customName;
                }
            });
        }

        // ── Real/Demo icon swap ────────────────────────────────────────
        // Swaps the account type SVG icon in the balance block
        const isDemoActive = window.location.href.includes('demo');
        const svgContainers = document.querySelectorAll(
            '.balance-info-block__icon, .balance-item__icon, .js-account-type-icon'
        );
        svgContainers.forEach(el => {
            const current = el.innerHTML.trim();
            const targetSVG = isDemoActive ? SVG_DEMO : SVG_REAL;
            // Only update if the SVG has actually changed
            if (!current.includes(isDemoActive ? 'qt-demo' : 'qt-real')) {
                el.innerHTML = targetSVG;
            }
        });

        // ── Spoof stats ────────────────────────────────────────────────
        if (CONFIG.isSpoofEnabled) {
            const spoof = [
                ['.your-level-badge a, .profile-level__name, .js-level-name',  CONFIG.spBranch],
                ['.profile-level__number, .js-level, .user-level',              CONFIG.spLevel],
                ['.profile-level__exp .js-hd, .js-exp-value',                  CONFIG.spExp],
                ['.trading-info__trades .js-hd, .js-trades-count',             CONFIG.spTrades],
                ['.trading-info__turnover .js-hd, .js-turnover',               CONFIG.spTurnover],
                ['.trading-info__profit .js-hd, .js-profit',                   CONFIG.spProfit],
            ];
            spoof.forEach(([sel, val]) => {
                document.querySelectorAll(sel).forEach(el => {
                    if (el.textContent.trim() !== val) el.textContent = val;
                });
            });
        }

    } catch (e) {
        if (document.body) document.body.classList.add('ready');
    }
}

setTimeout(() => { if (document.body) document.body.classList.add('ready'); }, 1000);

// ── Stream mode masking (50ms interval) ──────────────────────────────
const BAL_MASK = '*******';
const ID_MASK  = 'id *********';
const IP_MASK  = '***.***.***.***';

setInterval(function() {
    if (!CONFIG.isStreamModeEnabled) return;

    if (CONFIG.streamMaskBalance) {
        document.querySelectorAll(
            '.js-balance-real-USD, .js-balance-demo-USD, .js-balance-demo, .balance_current .js-hd, ' +
            '.balance-info-block__value, .js-balance-value'
        ).forEach(el => {
            if (el.textContent !== BAL_MASK) el.textContent = BAL_MASK;
        });
    }

    if (CONFIG.streamMaskId) {
        document.querySelectorAll(
            '.info__id .js-hd, .js-user-id, .user-id, .profile-id, .js-uid'
        ).forEach(el => {
            if (el.textContent.trim() !== ID_MASK) el.textContent = ID_MASK;
        });
    }

    if (CONFIG.streamMaskIp) {
        document.querySelectorAll(
            '.info__last-login .js-hd, .js-user-ip, .user-ip'
        ).forEach(el => {
            if (!el.textContent.includes(IP_MASK)) {
                const img = el.querySelector('img');
                el.innerHTML = IP_MASK + (img ? ' ' + img.outerHTML : '');
            }
        });
    }

    if (CONFIG.streamMaskEmail) {
        const alias = CONFIG.streamEmailAlias || 'hidden@domain.com';
        document.querySelectorAll(
            '.info__email .js-hd, .js-user-email, .user-email'
        ).forEach(el => {
            if (el.textContent.trim() !== alias) el.textContent = alias;
        });
    }
}, 50);

// ── Notification helper ───────────────────────────────────────────────
function showPageNotif(opts) {}   // your full version has this

function buildPopoutWidget() {
    // stub — implement popout UI here if needed
}

function startEditor() {
    // stub — implement editor here if needed
}

function showUpdateBanner() {}    // your full version has this

chrome.runtime.onMessage.addListener(function(msg) {
    if (!msg) return;
    if (msg.type === 'PO_NOTIFY')          showPageNotif({ title: msg.title, desc: msg.desc, isError: !!msg.isError });
    if (msg.type === 'PO_POPOUT')          buildPopoutWidget();
    if (msg.type === 'PO_EDIT_START')      startEditor();
    if (msg.type === 'PO_UPDATE_AVAILABLE') showUpdateBanner(msg.current, msg.latest);
    if (msg.type === 'PO_FORCE_UPDATE')    showUpdateBanner('current', msg.latest || 'latest');
});

// ═════════════════════════════════════════════════════════════════════
// ── SIGNALTRACK EXTENSION BRIDGE ─────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════
(function initSTBridge() {

  if (window.location.hostname.includes('pocketoption.com')) {

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('ws-hook.js');
    script.onload = function() { script.remove(); };
    (document.head || document.documentElement).appendChild(script);

    let lastCapturedToken = null;
    window.addEventListener('__st_token_captured', function(e) {
      lastCapturedToken = e.detail.token;
      chrome.storage.local.set({ st_session_token: lastCapturedToken, st_token_ts: Date.now() });
      chrome.runtime.sendMessage({ type: 'ST_TOKEN_READY', token: lastCapturedToken });
    });

    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
      if (msg.type === 'ST_GET_TOKEN') {
        const live = window.__st_last_token || lastCapturedToken;
        if (live) { sendResponse({ token: live }); return; }
        chrome.storage.local.get('st_session_token', function(d) {
          sendResponse({ token: d.st_session_token || null });
        });
        return true;
      }
    });
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {

    function signalReady() {
      window.__st_extension_present = true;
      window.dispatchEvent(new CustomEvent('__st_extension_ready'));
    }
    signalReady();
    let ticks = 0;
    const iv = setInterval(function() {
      signalReady();
      if (++ticks > 8) clearInterval(iv);
    }, 400);

    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
      if (msg.type !== 'ST_AUTO_LOGIN' || !msg.token) return;

      const ssidInput = document.getElementById('ssidInput');
      if (!ssidInput) { sendResponse({ ok: false, reason: 'no input' }); return; }

      ssidInput.value = msg.token;
      ssidInput.dispatchEvent(new Event('input',  { bubbles: true }));
      ssidInput.dispatchEvent(new Event('change', { bubbles: true }));

      setTimeout(function() {
        const btn = document.querySelector('button.btn.pri');
        if (btn) { btn.click(); sendResponse({ ok: true }); }
        else if (typeof window.doConnect === 'function') { window.doConnect(); sendResponse({ ok: true }); }
        else { sendResponse({ ok: false, reason: 'no connect btn' }); }
      }, 300);

      return true;
    });
  }

})();