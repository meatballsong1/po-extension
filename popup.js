// -- NOTIFICATION SYSTEM ----------------------------------------------
const NOTIF_DURATION = 4000;

function showNotif({ title = 'pocket option config', desc = '', isError = false } = {}) {
    const stack = document.getElementById('po-notif-stack');
    if (!stack) return;
    const notif = document.createElement('div');
    notif.className = 'po-notif' + (isError ? ' error' : '');
    const checkIcon = `<svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 5L4.2 7.5L8 3" stroke="${isError ? '#ff4444' : '#00b0ff'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const errorIcon = `<svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V5.5M5 7.5V8" stroke="#ff4444" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    notif.innerHTML = `
        <div class="po-notif-icon">${isError ? errorIcon : checkIcon}</div>
        <div class="po-notif-body">
            <div class="po-notif-title">${title}</div>
            <div class="po-notif-desc">${desc}</div>
        </div>
        <button class="po-notif-close" aria-label="close">
            <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2L8 8M8 2L2 8" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </button>
        <div class="po-notif-progress"><div class="po-notif-progress-bar"></div></div>
    `;
    stack.appendChild(notif);
    requestAnimationFrame(() => { requestAnimationFrame(() => notif.classList.add('show')); });
    const timer = setTimeout(() => dismissNotif(notif), NOTIF_DURATION);
    notif.querySelector('.po-notif-close').addEventListener('click', () => { clearTimeout(timer); dismissNotif(notif); });
}

function dismissNotif(notif) {
    notif.classList.remove('show');
    notif.classList.add('hide');
    notif.addEventListener('transitionend', () => notif.remove(), { once: true });
}

// -- BUILD CHANGE LOG -------------------------------------------------
function buildChangeLog(oldData, newData) {
    const lines = [];
    const label = (key) => ({
        isEnabled:           'swap script',
        isGuruEnabled:       'guru title',
        isSpoofEnabled:      'stat spoof',
        isVerifiedEnabled:   'spoof verified',
        isStreamModeEnabled: 'stream mode',
        streamMaskBalance:   'mask balance',
        streamMaskId:        'mask account id',
        streamMaskIp:        'mask ip',
        streamMaskEmail:     'mask email',
        customName:          'display alias',
        streamEmailAlias:    'email alias',
        spBranch:            'branch level',
        spLevel:             'disp level',
        spExp:               'current xp',
        spTrades:            'total trades',
        spTurnover:          'turnover',
        spProfit:            'profit',
    }[key] || key);
    const boolKeys = ['isEnabled','isGuruEnabled','isSpoofEnabled','isVerifiedEnabled','isStreamModeEnabled',
                      'streamMaskBalance','streamMaskId','streamMaskIp','streamMaskEmail'];
    const valKeys  = ['customName','streamEmailAlias','spBranch','spLevel','spExp','spTrades','spTurnover','spProfit'];
    boolKeys.forEach(k => { if (oldData[k] !== newData[k]) lines.push(`${label(k)} -> ${newData[k] ? 'on' : 'off'}`); });
    valKeys.forEach(k =>  { if (oldData[k] !== newData[k]) lines.push(`${label(k)} updated`); });
    return lines;
}

// -- MAIN POPUP LOGIC -------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    // Tab Logic
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            var tabId = tab.getAttribute('data-tab');
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            updateSaveBtn(tabId);
            if (tabId === 'about') populateAbout();
        });
    });
    updateSaveBtn('main');

    function updateSaveBtn(tabId) {
        var btn = document.getElementById('saveBtn');
        if (!btn) return;
        btn.style.display = (tabId === 'about' || tabId === 'customize') ? 'none' : 'block';
    }

    function set(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function populateAbout() {
        try {
            var m = chrome.runtime.getManifest();
            set('ab-name',    m.name || 'pocket option config');
            set('ab-version', m.version || '-');
            set('ab-mv',      'MV' + (m.manifest_version || '3'));
        } catch(e) {
            set('ab-name', 'pocket option config');
            set('ab-version', '-');
            set('ab-mv', 'MV3');
        }
        var ua = navigator.userAgent;
        var browser = 'Chrome';
        if (ua.indexOf('Edg') !== -1)      browser = 'Edge';
        else if (ua.indexOf('OPR') !== -1)  browser = 'Opera';
        else if (ua.indexOf('Brave') !== -1) browser = 'Brave';
        set('ab-browser', browser);
        try {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (chrome.runtime.lastError) { set('ab-url', 'n/a'); return; }
                if (tabs && tabs[0]) {
                    if (tabs[0].url) {
                        try { set('ab-url', new URL(tabs[0].url).hostname); }
                        catch(e) { set('ab-url', tabs[0].url.slice(0, 30)); }
                    } else if (tabs[0].title) {
                        set('ab-url', tabs[0].title.slice(0, 25));
                    } else {
                        set('ab-url', 'active tab');
                    }
                }
            });
        } catch(e) { set('ab-url', 'n/a'); }
        chrome.storage.local.get({ isEnabled: true, isStreamModeEnabled: false }, function(data) {
            if (chrome.runtime.lastError) return;
            set('ab-stream', data.isStreamModeEnabled ? 'on' : 'off');
            set('ab-swap',   data.isEnabled ? 'on' : 'off');
        });
    }

    populateAbout();

    // -- CHECK FOR UPDATES --
    function checkUpdate() {
        var btn    = document.getElementById('update-btn');
        var result = document.getElementById('update-result');
        var verEl  = document.getElementById('update-result-ver');
        var msgEl  = document.getElementById('update-result-msg');
        var dlBtn  = document.getElementById('download-btn');
        var steps  = document.getElementById('install-steps');
        var link   = document.getElementById('refresh-link');

        btn.disabled = true;
        btn.textContent = 'Checking...';
        result.style.display = 'none';
        if (dlBtn)  dlBtn.style.display  = 'none';
        if (steps)  steps.style.display  = 'none';
        if (link)   link.style.display   = 'none';

        var m = chrome.runtime.getManifest();
        var current = m.version;

        fetch('https://raw.githubusercontent.com/meatballsong1/po-extension/main/version.json?t=' + Date.now())
            .then(function(r) {
                if (!r.ok) throw new Error('Could not reach GitHub');
                return r.json();
            })
            .then(function(data) {
                var latest = data.version;
                result.style.display = 'block';

                if (latest === current) {
                    result.className = 'update-result up-to-date';
                    verEl.style.display = 'none';
                    msgEl.textContent = "you're on v" + current + ", that's the latest. you're good.";
                } else {
                    result.className = 'update-result has-update';
                    verEl.style.display = 'block';
                    verEl.textContent = 'v' + latest + ' available';
                    msgEl.textContent = "you're on v" + current + " but there's a newer version v" + latest + ". updating you now would be sick.";
                    if (link) { link.style.display = 'inline-block'; link.textContent = 'how to update'; }


                }
            })
            .catch(function(e) {
                result.style.display = 'block';
                result.className = 'update-result update-error';
                verEl.style.display = 'none';
                msgEl.textContent = 'could not check: ' + e.message;
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Check for Updates';
            });
    }

    // Detect browser and return extensions page URL + name
    function getBrowserInfo() {
        var ua = navigator.userAgent;
        if (ua.indexOf('Edg/') !== -1)     return { name: 'Edge',    url: 'edge://extensions',    label: 'edge://extensions' };
        if (ua.indexOf('OPR/') !== -1)     return { name: 'Opera',   url: 'opera://extensions',   label: 'opera://extensions' };
        if (ua.indexOf('Brave') !== -1)    return { name: 'Brave',   url: 'brave://extensions',   label: 'brave://extensions' };
        if (ua.indexOf('Vivaldi') !== -1)  return { name: 'Vivaldi', url: 'vivaldi://extensions', label: 'vivaldi://extensions' };
        return { name: 'Chrome', url: 'chrome://extensions', label: 'chrome://extensions' };
    }

    function openExtPage() {
        var browser = getBrowserInfo();
        chrome.tabs.create({ url: browser.url }, function() {
            if (chrome.runtime.lastError) {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(browser.url).then(function() {
                    var openBtn = document.getElementById('open-ext-page-btn');
                    if (openBtn) {
                        openBtn.textContent = 'Copied ' + browser.url + ' — paste in address bar';
                        openBtn.style.color = '#24b15b';
                        openBtn.style.borderColor = 'rgba(36,177,91,0.4)';
                    }
                });
            }
        });
    }

    function showDownloadOption() {
        var dlBtn = document.getElementById('download-btn');
        var steps = document.getElementById('install-steps');
        var link  = document.getElementById('refresh-link');
        if (dlBtn)  dlBtn.style.display  = 'block';
        if (steps)  steps.style.display  = 'block';
        if (link)   link.style.display   = 'none';

        var browser = getBrowserInfo();

        // Update instruction text to show the right browser URL
        var extPageName = document.getElementById('ext-page-name');
        if (extPageName) extPageName.textContent = browser.label;

        // Wire open extensions button
        var openBtn = document.getElementById('open-ext-page-btn');
        if (openBtn) {
            openBtn.textContent = 'Open ' + browser.name + ' Extensions Page';
            openBtn.onclick = openExtPage;
        }

        // Wire download button — fetch latest release asset URL dynamically
        if (dlBtn && !dlBtn._wired) {
            dlBtn._wired = true;
            dlBtn.addEventListener('click', function(e) {
                e.preventDefault();
                var origText = dlBtn.textContent;
                dlBtn.textContent = 'Fetching...';
                fetch('https://api.github.com/repos/meatballsong1/po-extension/releases/latest')
                    .then(function(r) { return r.json(); })
                    .then(function(data) {
                        var asset = data.assets && data.assets.find(function(a) { return a.name.endsWith('.zip'); });
                        var url = asset ? asset.browser_download_url : data.zipball_url;
                        dlBtn.textContent = origText;
                        chrome.tabs.create({ url: url });
                        setTimeout(function() { openExtPage(); }, 2000);
                    })
                    .catch(function() {
                        dlBtn.textContent = origText;
                        chrome.tabs.create({ url: 'https://github.com/meatballsong1/po-extension/releases/latest' });
                    });
            });
        }
    }

    var updateBtn = document.getElementById('update-btn');
    if (updateBtn) updateBtn.addEventListener('click', checkUpdate);

    var refreshLink = document.getElementById('refresh-link');
    if (refreshLink) refreshLink.addEventListener('click', showDownloadOption);

    // Popout button
    document.getElementById('popoutBtn').addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'PO_POPOUT' });
                window.close();
            }
        });
    });

    // Enable Editing Mode
    document.getElementById('enableEditingBtn').addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'PO_EDIT_START' });
                window.close();
            }
        });
    });

    // Stream mode toggle
    const streamToggle  = document.getElementById('streamModeToggle');
    const streamOptions = document.getElementById('streamOptions');

    function setStreamPanel(active) {
        if (active) {
            streamOptions.style.maxHeight    = streamOptions.scrollHeight + 'px';
            streamOptions.style.opacity      = '1';
            streamOptions.style.transform    = 'translateY(0)';
            streamOptions.style.pointerEvents = 'all';
            streamOptions.classList.add('stream-active');
        } else {
            streamOptions.style.maxHeight    = '0';
            streamOptions.style.opacity      = '0';
            streamOptions.style.transform    = 'translateY(-6px)';
            streamOptions.style.pointerEvents = 'none';
            streamOptions.classList.remove('stream-active');
        }
    }

    streamToggle.addEventListener('change', function() { setStreamPanel(streamToggle.checked); });

    // Defaults
    const DEFAULTS = {
        isEnabled: true,
        isGuruEnabled: false,
        isSpoofEnabled: false,
        isVerifiedEnabled: false,
        isStreamModeEnabled: false,
        streamMaskBalance: true,
        streamMaskId: true,
        streamMaskIp: true,
        streamMaskEmail: true,
        streamEmailAlias: 'hidden@domain.com',
        customName: 'QT Real',
        spBranch: '13',
        spLevel: '87',
        spExp: '14,530',
        spTrades: '113',
        spTurnover: '$21,300.00',
        spProfit: '$4,225.00'
    };

    // Load saved data
    chrome.storage.local.get(DEFAULTS, (data) => {
        document.getElementById('masterToggle').checked      = data.isEnabled;
        document.getElementById('guruToggle').checked        = data.isGuruEnabled;
        document.getElementById('spoofToggle').checked       = data.isSpoofEnabled;
        document.getElementById('verifiedToggle').checked    = data.isVerifiedEnabled;
        document.getElementById('streamModeToggle').checked  = data.isStreamModeEnabled;
        document.getElementById('streamMaskBalance').checked = data.streamMaskBalance;
        document.getElementById('streamMaskId').checked      = data.streamMaskId;
        document.getElementById('streamMaskIp').checked      = data.streamMaskIp;
        document.getElementById('streamMaskEmail').checked   = data.streamMaskEmail;
        document.getElementById('streamEmailAlias').value    = data.streamEmailAlias;
        document.getElementById('customName').value          = data.customName;
        if (data.isStreamModeEnabled) {
            streamOptions.style.transition    = 'none';
            streamOptions.style.maxHeight     = '999px';
            streamOptions.style.opacity       = '1';
            streamOptions.style.transform     = 'translateY(0)';
            streamOptions.style.pointerEvents = 'all';
            streamOptions.classList.add('stream-active');
            requestAnimationFrame(() => requestAnimationFrame(() => { streamOptions.style.transition = ''; }));
        }
        document.getElementById('spBranch').value   = data.spBranch;
        document.getElementById('spLevel').value    = data.spLevel;
        document.getElementById('spExp').value      = data.spExp;
        document.getElementById('spTrades').value   = data.spTrades;
        document.getElementById('spTurnover').value = data.spTurnover;
        document.getElementById('spProfit').value   = data.spProfit;
    });

    // Save
    document.getElementById('saveBtn').addEventListener('click', () => {
        chrome.storage.local.get(DEFAULTS, (oldData) => {
            const newData = {
                isEnabled:           document.getElementById('masterToggle').checked,
                isGuruEnabled:       document.getElementById('guruToggle').checked,
                isSpoofEnabled:      document.getElementById('spoofToggle').checked,
                isVerifiedEnabled:   document.getElementById('verifiedToggle').checked,
                isStreamModeEnabled: document.getElementById('streamModeToggle').checked,
                streamMaskBalance:   document.getElementById('streamMaskBalance').checked,
                streamMaskId:        document.getElementById('streamMaskId').checked,
                streamMaskIp:        document.getElementById('streamMaskIp').checked,
                streamMaskEmail:     document.getElementById('streamMaskEmail').checked,
                streamEmailAlias:    document.getElementById('streamEmailAlias').value.trim(),
                customName:          document.getElementById('customName').value.trim(),
                spBranch:            document.getElementById('spBranch').value,
                spLevel:             document.getElementById('spLevel').value,
                spExp:               document.getElementById('spExp').value,
                spTrades:            document.getElementById('spTrades').value,
                spTurnover:          document.getElementById('spTurnover').value,
                spProfit:            document.getElementById('spProfit').value,
            };

            const errors = [];
            if (!newData.customName) errors.push('display alias is empty');
            if (newData.isStreamModeEnabled && !newData.streamEmailAlias) errors.push('email alias is empty');

            if (errors.length) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs && tabs[0] && tabs[0].id) {
                        errors.forEach(err => chrome.tabs.sendMessage(tabs[0].id, {
                            type: 'PO_NOTIFY', title: 'pocket option config', desc: err, isError: true
                        }));
                    }
                });
                return;
            }

            chrome.storage.local.set(newData, () => {
                const changes = buildChangeLog(oldData, newData);
                const desc = changes.length === 0 ? 'settings applied!' : 'settings applied! - ' + changes.join(', ');
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs && tabs[0] && tabs[0].id) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: 'PO_NOTIFY', title: 'pocket option config', desc: desc, isError: false
                        });
                    }
                });
                const btn = document.getElementById('saveBtn');
                btn.innerText = 'Saved!';
                btn.style.background = '#24B15B';
                setTimeout(() => { btn.innerText = 'Apply Settings'; btn.style.background = 'var(--accent)'; }, 1000);
            });
        });
    });
});